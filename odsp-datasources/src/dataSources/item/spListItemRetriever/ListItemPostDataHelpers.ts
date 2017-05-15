// OneDrive:IgnoreCodeCoverage

import { ISPGetItemPostDataContext } from './interfaces/ISPGetItemContext';
import { ISPListContext } from './interfaces/ISPListContext';
import { ItemTypeFilter, IItemTypeFilter } from './interfaces/IItemTypeFilter';
import ISpPageContext from '../../../interfaces/ISpPageContext';
import { ISPListGroup } from '../spListItemProcessor/ISPListItemData';

const enum RenderOptions {
    none = 0x00,
    /** Include list context info */
    contextInfo = 0x01,
    /** Include list items */
    listData = 0x02,
    /** Include information about the list schema (really the current view's schema) */
    listSchema = 0x04,
    menuView = 0x08,
    /** Include list content types */
    listContentType = 0x10,
    /** Include FileSystemItemId for each item if possible */
    fileSystemItemId = 0x20,
    /** Include the client form schema to add and edit items */
    clientFormSchema = 0x40,
    /** Include quick launch (left nav) navigation nodes */
    quickLaunch = 0x80,
    /** Include Spotlight rendering information */
    spotlight = 0x100,
    /** Include visualization rendering information */
    visualization = 0x200,
    /** Include view XML and other information about the current view */
    viewMetadata = 0x400,
    /** Prevent auto-hyperlink from being run on text fields in this query */
    disableAutoHyperlink = 0x800,
    /** Include media url information on the returned items */
    mediaInfo = 0x1000,
    /** Include Parent folder information */
    parentFolderInfo = 0x2000,
    /** Include  Page context info for the current list being rendered */
    pageContextInfo = 0x4000,
    /** Include client-side component manifest information */
    clientSideComponentManifest = 0x8000
}

interface IRenderListDataParameters {
    __metadata: { type: string; };
    RenderOptions?: number;
    DatesInUtc?: boolean;
    ViewXml?: string;
    OverrideViewXml?: string;
    FirstGroupOnly?: boolean;
    ExpandGroups?: boolean;
    AllowMultipleValueFilterForTaxonomyFields?: boolean;
    ReplaceGroup?: boolean;
}

export interface IGetViewXmlParams {
    sortField?: string;
    itemIds?: string[];
    isAscending?: string;
    pageSize: number;
    fetchNextGroup?: boolean;
    lastGroup?: ISPListGroup;
    recurseInFolders?: boolean;
    typeFilter?: IItemTypeFilter;
    fieldNames?: string[];
    groupBy?: string[];
    userIsAnonymous?: boolean;
    requestMetaInfo?: boolean;
}

/* tslint:disable: no-bitwise */
const DEFAULT_RENDER_OPTIONS = RenderOptions.contextInfo | RenderOptions.listData | RenderOptions.listSchema;
/* tslint:enable: no-bitwise */
const PAGE_RENDER_OPTIONS = RenderOptions.listData;

const PERSONAL_SITE_WEB_TEMPLATE = '21';

declare const _spPageContextInfo: ISpPageContext;

export function getAdditionalPostData(params: ISPGetItemPostDataContext, listContext?: ISPListContext): string {
    'use strict';
    let {
        viewXml,
        firstGroupOnly,
        expandGroups,
        allowMultipleValueFilterForTaxonomyFields,
        groupByOverride,
        requestDatesInUtc,
        groupReplace,
        additionalFiltersXml
    } = params;

    let renderOption = getRenderOption(params);
    let overrideViewXml = groupByOverride || additionalFiltersXml ? getOverrideViewXml(groupByOverride, additionalFiltersXml) : undefined;

    // This object will be serialized using JSON.stringify below.
    // Any parameters set to undefined will not be included, and any quotes will automatically be escaped.
    let renderParams: IRenderListDataParameters = {
        __metadata: { type: 'SP.RenderListDataParameters' },
        RenderOptions: renderOption > 0 ? renderOption : undefined,
        ViewXml: viewXml || undefined,
        OverrideViewXml: overrideViewXml || undefined,
        AllowMultipleValueFilterForTaxonomyFields: allowMultipleValueFilterForTaxonomyFields || undefined
    };

    if (requestDatesInUtc) {
        renderParams.DatesInUtc = true;
    }
    if (groupReplace) {
        renderParams.ReplaceGroup = true;
    }
    if (expandGroups) {
        renderParams.ExpandGroups = true;
    }
    if (firstGroupOnly) {
        renderParams.FirstGroupOnly = true;
    }
    return JSON.stringify({ parameters: renderParams });
}

export function getViewXml(params: IGetViewXmlParams): string {
    'use strict';
    let {
        sortField,
        itemIds,
        isAscending,
        pageSize,
        fetchNextGroup,
        lastGroup,
        recurseInFolders,
        typeFilter = {
            filters: []
        },
        fieldNames = [],
        groupBy = [],
        userIsAnonymous = false,
        requestMetaInfo = false
    } = params;
    let groupByStr = '';
    let where = '';
    let orderBy = '';
    let viewParams = '';
    let includeFields = false;
    if (!pageSize) {
        pageSize = 1;
    }

    if (fetchNextGroup) {
        let field = lastGroup.fieldSchema.Name;
        let value = lastGroup.groupingId;
        let type = lastGroup.fieldSchema.Type;
        if (type === 'DateTime') {
            try {
                // convert DateTime to UTC format for GT operation. regular datetime value will fail CAML query.
                let dateTime = new Date(value);
                value = `${dateTime.getUTCFullYear()}-${dateTime.getUTCMonth() + 1}-${dateTime.getUTCDate()}T00:00:00Z`;
            } catch (e) {
                // Ignore exceptions
                // exceptions could happen when the value is not standard dateimte value from server for whatever reasons.
            }
        } else if (type === 'Boolean' && value === '') { // treat unassigned boolean value as -1, so that we get both No and Yes back
            value = '-1';
        }
        let groupByFields = groupBy.map((groupByField: string) => `<FieldRef Name="${groupByField}"/>`).join('');
        groupByStr = '<GroupBy Collapse="FALSE">' +
            groupByFields +
            '</GroupBy>';
        where = '<Where>' +
            '<Gt>' +
            `<FieldRef Name="${field}" />` +
            `<Value Type="${type}">${value}</Value>` +
            '</Gt>' +
            '</Where>';
    } else if (itemIds && itemIds.length === 1) {
        let singleItemId = itemIds[0];
        if (isNaN(Number(singleItemId))) {
            where = `<Where><Eq><FieldRef Name="UniqueId" /><Value Type="Guid">${singleItemId}</Value></Eq></Where>`;
        } else {
            where = `<Where><Eq><FieldRef Name="ID" /><Value Type="Number">${singleItemId}</Value></Eq></Where>`;
        }
        if (recurseInFolders) {
            viewParams = 'Scope="RecursiveAll"';
        }
    } else if (itemIds && itemIds.length > 0) {
        let guidIds = [];
        let numberIds = [];
        for (let itemId of itemIds) {
            if (isNaN(Number(itemId))) {
                guidIds.push(itemId);
            } else {
                numberIds.push(itemId);
            }
        }
        let numberIdValues = numberIds.map((numberId: string) => `<Value Type="Counter">${numberId}</Value>`).join('');
        let guidIdValues = guidIds.map((guidId: string) => `<Value Type="Guid">${guidId}</Value>`).join('');
        let condition = '';
        if (numberIdValues) {
            condition += `<In><FieldRef Name="ID" /><Values>${numberIdValues}</Values></In>`;
        }
        if (guidIdValues) {
            condition += `<In><FieldRef Name="UniqueId" /><Values>${guidIdValues}</Values></In>`;
        }
        if (numberIdValues && guidIdValues) {
            condition = `<Or>${condition}</Or>`;
        }
        where = `<Where>${condition}</Where>`;
        if (recurseInFolders) {
            viewParams = 'Scope="RecursiveAll"';
        }
    } else {
        orderBy = sortField ? `<OrderBy><FieldRef Name="${sortField}" Ascending="${isAscending}"></FieldRef></OrderBy>` : '';
        includeFields = true;
    }

    if (typeFilter.filters.length) {
        let caml = getTypeFilterViewXml(typeFilter);

        if (caml) {
            where = `<Where>${caml}</Where>`;
        }
    }

    return getViewXmlCore({
        viewParams: viewParams,
        query: orderBy + groupByStr + where,
        pageSize: pageSize,
        includeFields: includeFields,
        fieldNames: fieldNames,
        userIsAnonymous: userIsAnonymous,
        requestMetaInfo: requestMetaInfo
    });
}

export function getTypeFilterViewXml(typeFilter: IItemTypeFilter) {
    'use strict';
    let orClauses: string[] = [];
    let inValues: string[] = [];

    for (let filter of typeFilter.filters) {
        if (typeof filter === 'string') {
            inValues.push(`<Value Type="Text">${filter.slice(1)}</Value>`);
        } else {
            switch (filter) {
                case ItemTypeFilter.folder:
                    orClauses.push('<And><Eq><FieldRef Name="FSObjType" /><Value Type="Text">1</Value></Eq><Eq><FieldRef Name="SortBehavior" /><Value Type="Text">1</Value></Eq></And>');
                    break;
                // TODO add handlers for photo, document, etc. here.
            }
        }
    }

    if (inValues.length) {
        orClauses.push(`<In><FieldRef Name="File_x0020_Type" /><Values>${inValues.join('')}</Values></In>`);
    }

    let caml = orClauses.reduce((previous: string, current: string) => {
        return previous ?
            `<Or>${previous}${current}</Or>` :
            current;
    });

    return caml;
}

/* tslint:disable: no-bitwise */
function getRenderOption(params: ISPGetItemPostDataContext): number {
    'use strict';
    let {
        fieldNames = [],
        needsSchema,
        needsContentTypes,
        needsForms,
        needsQuickLaunch,
        needsSpotlight,
        needsViewMetadata,
        needsParentInfo,
        requestToken,
        isListDataRenderOptionChangeFeatureEnabled,
        isSpotlightFeatureEnabled,
        needUpdatePageContext,
        needClientSideComponentManifest
    } = params;

    let renderOption: number = 0;
    if (needsSchema || requestToken) {
        if (needsSchema) {
            renderOption |= DEFAULT_RENDER_OPTIONS;
            if (isListDataRenderOptionChangeFeatureEnabled) {
                renderOption |= RenderOptions.mediaInfo;
            }
        } else {
            renderOption |= PAGE_RENDER_OPTIONS;
        }

        if (fieldNames.indexOf('name.FileSystemItemId') > -1) {
            renderOption |= RenderOptions.fileSystemItemId;
        }
    }

    if (needsContentTypes) {
        renderOption |= RenderOptions.listContentType;
    }

    if (isSpotlightFeatureEnabled && needsSpotlight && _spPageContextInfo && _spPageContextInfo.webTemplate && _spPageContextInfo.webTemplate !== PERSONAL_SITE_WEB_TEMPLATE) {
        renderOption |= (RenderOptions.spotlight | RenderOptions.listData);
    }

    if (needsForms) {
        renderOption |= RenderOptions.clientFormSchema;
    } else if (isListDataRenderOptionChangeFeatureEnabled) {
        renderOption |= RenderOptions.listData | RenderOptions.mediaInfo;
    }

    if (needsQuickLaunch) {
        renderOption |= RenderOptions.quickLaunch;
    }

    if (needsViewMetadata) {
        renderOption |= RenderOptions.viewMetadata | RenderOptions.visualization;
    }

    if (needsParentInfo) {
        renderOption |= RenderOptions.parentFolderInfo;
    }

    if (!!needUpdatePageContext) {
        renderOption |= RenderOptions.pageContextInfo;
    }

    if (!!needClientSideComponentManifest) {
        renderOption |= RenderOptions.clientSideComponentManifest;
    }

    return renderOption;
}
/* tslint:enable: no-bitwise */

function getOverrideViewXml(groupBy: string, additionalFiltersXml: string): string {
    'use strict';
    let overrideViewXml = '';
    if (groupBy) {
        overrideViewXml = '<GroupBy Collapse="FALSE">' +
            '<FieldRef Name="' + groupBy + '"/>' +
            '</GroupBy>';
    }

    if (additionalFiltersXml) {
        overrideViewXml = '<Query>' + overrideViewXml + '<Where>' + additionalFiltersXml + '</Where></Query>';
    }

    return overrideViewXml;
}

function getViewXmlCore({
    viewParams,
    query,
    pageSize = 30,
    includeFields,
    fieldNames = [],
    userIsAnonymous = false,
    requestMetaInfo = false
}: {
        viewParams: string;
        query: string;
        pageSize: number;
        includeFields: boolean;
        fieldNames: string[];
        userIsAnonymous?: boolean;
        requestMetaInfo?: boolean;
    }): string {
    'use strict';
    if (includeFields) {
        fieldNames = [
            '_ip_UnifiedCompliancePolicyUIAction',
            'ItemChildCount',
            'FolderChildCount',
            'SMTotalFileCount',
            'SMTotalSize', // For folders, this is the only property that returns size of the item
            ...fieldNames
        ];

        if (requestMetaInfo) {
            fieldNames = [
                'MediaServiceFastMetadata',
                ...fieldNames
            ];
        }

        if (!userIsAnonymous) {
            fieldNames = [
                'SharedWith',
                ...fieldNames
            ];
        }
        fieldNames = [
            'FSObjType',
            'LinkFilename',
            'Modified',
            'Editor',
            'FileSizeDisplay',
            ...fieldNames
        ];
    }

    fieldNames = removeDuplicates(fieldNames);

    let fieldXml: string = '';

    if (fieldNames.length) {
        fieldXml = `<ViewFields>${fieldNames.map((fieldName: string) => `<FieldRef Name="${fieldName}"/>`).join('')}</ViewFields>`;
    }
    let viewXml =
        `<View ${viewParams}>` +
        `<Query>${query}</Query>` +
        fieldXml +
        `<RowLimit Paged="TRUE">${pageSize}</RowLimit>` +
        '</View>';

    return viewXml;
}

function removeDuplicates(tokens: string[]): string[] {
    'use strict';

    let finalTokens: string[];

    if (tokens) {
        finalTokens = [];

        let set: {
            [token: string]: boolean;
        };

        set = {};

        for (let token of tokens) {
            if (!set[token]) {
                set[token] = true;
                finalTokens.push(token);
            }
        }
    }

    return finalTokens;
}