/*
 * This class binds the SPListItemRetriever and SPListItemProcessor
 */

import ISpPageContext from '../../../interfaces/ISpPageContext';
import { SPListItemRetriever, GROUPINGID_NEXT } from '../spListItemRetriever/SPListItemRetriever';
import * as ListItemPostDataHelpers from '../spListItemRetriever/ListItemPostDataHelpers';
import { ISPGetItemContext } from '../spListItemRetriever/interfaces/ISPGetItemContext';
import { ISPListContext } from '../spListItemRetriever/interfaces/ISPListContext';
import { ISPGetItemResponse } from '../spListItemRetriever/interfaces/ISPGetItemResponse';
import { SPListItemProcessor } from '../spListItemProcessor/SPListItemProcessor';
import { ISPListProcessedData } from '../spListItemProcessor/ISPListItemData';
import { SPItemStore } from '../../../providers/item/SPItemStore';
import View from '../../../models/view/View';
import Promise from '@ms/odsp-utilities/lib/async/Promise';
import { Qos as QosEvent } from '@ms/odsp-utilities/lib/logging/events/Qos.event';

export interface ISPListItemDataSourceParams {
    hostSettings: ISpPageContext;
    itemStore?: SPItemStore;
}

export class SPListItemDataSource {
    private _hostSettings: ISpPageContext;
    private _retriever: SPListItemRetriever;
    private _itemStore: SPItemStore;

    constructor(params: ISPListItemDataSourceParams) {
        this._hostSettings = params.hostSettings;
        this._retriever = new SPListItemRetriever({
            hostSettings: this._hostSettings
        });
        this._itemStore = params.itemStore;
    }

    /**
     * API to get list data.
     * Uses SPListItemRetriever to fetch data and SPListItemProcessor to process the JSON.
     */
    public getItem(context: ISPGetItemContext, listContext: ISPListContext): Promise<ISPListProcessedData> {
        let qosInfo = {
            qosEvent: new QosEvent({ name: "GetListViewData" }),
            qosName: 'GetListViewData'
        };

        updatePostDataContext(context, listContext);

        let returnPromise = this._retriever.getItem(context, listContext, qosInfo).then((response: ISPGetItemResponse) => {
            const processor: SPListItemProcessor = new SPListItemProcessor({ listContext: listContext, itemStore: this._itemStore });
            const result: ISPListProcessedData = processor.processData(context.parentKey, response);

            return result;
        });

        return returnPromise;
    }
}

/**
 * Generate postDataContext that is used to construct the POST body in the server request.
 * Note: This is currently incomplete and only caters to the basic ListWebPart scenario.
 * Need to follow the corresponding odsp-next code and make it more robust.
 */
function updatePostDataContext(context: ISPGetItemContext, listContext: ISPListContext) {
    let fetchNextGroup = listContext.group && listContext.group.groupingId === GROUPINGID_NEXT;
    let needSchema = !!context.needSchema || // context explicitly asking for schema
        !listContext.listSchema ||           // we don't have the schema
        fetchNextGroup;
    let needsViewMetadata = !listContext.viewResult;

    let needsViewXml = fetchNextGroup;
    let viewXml = undefined;
    if (needsViewXml) {
        viewXml = ListItemPostDataHelpers.getViewXml({
            sortField: listContext.sortField,
            itemIds: undefined,
            isAscending: listContext.isAscending,
            pageSize: context.pageSize || 100,
            fetchNextGroup: fetchNextGroup,
            lastGroup: listContext.lastGroup,
            recurseInFolders: false,
            fieldNames: undefined,
            typeFilter: undefined,
            groupBy: listContext.groupByOverride ? [ listContext.groupByOverride ] : listContext.groupBy,
            userIsAnonymous: false,
            requestMetaInfo: false
        });
    } else if (context.viewXml) { // @todo: refactor and reuse code from odsp-next _getViewXml() function
        viewXml = context.viewXml;
        if (listContext.sortField || listContext.groupByOverride) {
            let view = new View(viewXml);
            if (listContext.sortField) {
                view.updateSort(null, { overwriteAll: true });
            }
            if (listContext.groupByOverride) {
                view.updateGroupBy({ isCollapsed: false, group1: { fieldName: listContext.groupByOverride } });
            }
            viewXml = view.getEffectiveViewXml();
        }
    }

    context.postDataContext = {
        needsSchema: needSchema,
        needsForms: false,
        needsQuickLaunch: false,
        needsSpotlight: false,
        needsViewMetadata: needsViewMetadata,
        needsParentInfo: false,
        viewXml: viewXml,
        firstGroupOnly: false,
        expandGroups: context.expandGroup,
        allowMultipleValueFilterForTaxonomyFields: false,
        requestToken: context.requestToken,
        fieldNames: undefined,
        isListDataRenderOptionChangeFeatureEnabled: false,
        isSpotlightFeatureEnabled: false,
        groupByOverride: context.groupBy,
        requestDatesInUtc: false,
        needClientSideComponentManifest: false
    };
}

export default SPListItemDataSource;