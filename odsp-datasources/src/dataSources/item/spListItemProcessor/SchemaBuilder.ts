import { ISPListSchema, ISPListField } from '../spListItemRetriever/interfaces/ISPGetItemResponse';
import { ISPListColumn } from './ISPListItemData';
import { ColumnFieldType, ColumnWidth, MappedColumnType, ShowInFiltersPaneStatus } from './SPListItemEnums';
import { ISPListContext, IGroupSchemaMap } from '../spListItemRetriever/interfaces/ISPListContext';
import ListFilterUtilities from '../../../utilities/list/ListFilterUtilities';
import * as HashtagUtilities from '@ms/odsp-utilities/lib/list/HashtagUtilities';

interface IMappedColumnDefinition {
    index: number; // column index in the list view
    key: string;
    isVisibleMobile: boolean;
    isCollapsable: boolean;
    isRowHeader?: boolean;
    minWidth?: number;
    width?: number;
    type: ColumnFieldType;
    sortDescFirst?: boolean;
}

// The following field categories from listSchema always map to the given column definitions.
// (See ColumnsHelper._getMappedColumnType for how field names map to field categories.)
// The exception is that if multiple fields map to the same column index (this will happen if
// a view includes both a name field and a title field), the first one will use the mapped
// definition/index and subsequent ones will be ordered with the rest of the fields.
const SCHEMA_MAP: { [key: number]: IMappedColumnDefinition } = {
    [MappedColumnType.icon]: { key: 'type', index: 0, isVisibleMobile: true, isCollapsable: false, type: ColumnFieldType.FileIcon }, // width will be set below
    [MappedColumnType.name]: { key: 'name', index: 1, isRowHeader: true, isVisibleMobile: true, isCollapsable: false, minWidth: ColumnWidth.nameMin, width: ColumnWidth.nameODB, type: ColumnFieldType.Name },
    [MappedColumnType.title]: { key: 'Title', index: 1, isVisibleMobile: true, isCollapsable: false, minWidth: ColumnWidth.nameMin, width: ColumnWidth.nameODB, type: ColumnFieldType.Title },
    [MappedColumnType.calloutInvoker]: { key: '_calloutInvoker', index: 2, isVisibleMobile: false, isCollapsable: true, minWidth: 16, width: 18, type: ColumnFieldType.DotDotDot },
    [MappedColumnType.modified]: { key: 'dateModified', index: 3, isVisibleMobile: true, isCollapsable: false, minWidth: ColumnWidth.regularMin, width: ColumnWidth.regular, type: ColumnFieldType.DateTime, sortDescFirst: true }
};
// number of columns we will usually fill up from the schemaMap; must be kept in sync with schemaMap
// (value = max index in schemaMap + 1)
const numSchemaMappedColumns = 4;

// fields to exclude from returned list schema
export const EXCLUDED_FIELDS = [
    '_ip_UnifiedCompliancePolicyUIAction',
    'Edit', // icon with link to edit item (deprecated)
    'FolderChildCount',
    'ItemChildCount',
    'MediaServiceFastMetadata',
    'name.FileSystemItemId',
    'SMTotalFileCount',
    'SMTotalSize'
];

// For now only single line text type columns can be autoResized, since for columns such as note that
// might render multiple lines, we cannot easily determine the longest line based on the field value
const CAN_AUTO_RESIZE_TYPES = [
    ColumnFieldType.Text,
    ColumnFieldType.Name,
    ColumnFieldType.Title,
    ColumnFieldType.DateTime,
    ColumnFieldType.Number
];

export namespace SchemaBuilder {
    export interface ISchemaBuilderOptions {
        disableCalloutInvoker?: boolean;
        hasFixedSchema?: boolean;
        serverSupportsAutoHyperLink?: boolean;
        useCustomColumn?: boolean;
    }

    export function buildSchema(listSchema: ISPListSchema,
        listContext: ISPListContext,
        options: ISchemaBuilderOptions,
        groupSchemaMap: IGroupSchemaMap): ISPListColumn[] {
        if (!listSchema || !listSchema.Field) {
            return undefined;
        }

        // If any of the fields in the schema indicate that a ... (callout invoker) should be present,
        // add a definition for it unless it has been explicitly disabled.
        let titleFieldIndex = -1;
        let count = 0;
        for (let listField of listSchema.Field) {
            if (listField.listItemMenu === 'TRUE') {
                titleFieldIndex = count;
                break;
            }
            count++;
        }

        if (!options.disableCalloutInvoker && titleFieldIndex >= 0) {
            listSchema.Field.splice(titleFieldIndex + 1, 0, {
                DisplayName: '',
                Name: '_calloutInvoker',
                Sortable: 'FALSE',
                Type: 'Computed'
            });
        }

        // Initialize an array of columns with empty spaces for the potential schema mapped columns
        let schema = new Array(options.hasFixedSchema ? numSchemaMappedColumns : 0);

        let iconColumn;
        let nameColumn;
        let modifiedColumn;
        for (let listField of listSchema.Field) {
            let fieldName = listField.Name;
            if (EXCLUDED_FIELDS.indexOf(fieldName) !== -1) {
                continue; // skip field if it's one of the excluded fields
            }

            if (listField.GroupField === 'TRUE' && groupSchemaMap) {
                // Any fields used for grouping will occur twice in the list schema (only the second occurrence will have
                // GroupField='TRUE'). Add the field to the group schema but not the list of fields the second time.
                groupSchemaMap[fieldName] = listField as any;
                continue;
            }

            // Get the field mapping if applicable
            let mappedType = getMappedColumnType(fieldName);
            let mappedDef = SCHEMA_MAP[mappedType];
            // Get the column definition based on a combination of the base field definition and mapping (if present)
            let columnDef = _getFieldFromListData(listField, mappedDef, listContext, options, listSchema);
            // Mapped fields go at the index specified in the mapping (unless another field is already in that spot).
            // Other fields are appended to the end of the schema.
            let columnIdx = options.hasFixedSchema && mappedDef && !schema[mappedDef.index] ? mappedDef.index : schema.length;
            schema[columnIdx] = columnDef;

            switch (mappedType) {
                case MappedColumnType.icon:
                    iconColumn = columnDef;
                    break;
                case MappedColumnType.name:
                    nameColumn = columnDef;
                    break;
                case MappedColumnType.modified:
                    modifiedColumn = columnDef;
                    break;
            }
        }

        // The group by view normally uses the file type icon field to display the expand/collapse group icon.
        // If we're in a grouped view but this is not a doclib (or if the filename column has been removed
        // for some reason), there won't be a file type icon field.
        // Add a placeholder field instead.
        let isGroupedView = listContext.groupBy || listSchema.group1 || listSchema.group2;
        if (isGroupedView && (!iconColumn || iconColumn !== schema[0])) {
            let placeholderField = _getDefaultColumn('other', '');
            placeholderField.minWidth = _getIconColumnMinWidth(options.useCustomColumn);
            placeholderField.width = _getIconColumnWidth(options.useCustomColumn);
            placeholderField.fieldType = ColumnFieldType.Computed;
            schema.unshift(placeholderField);
        }

        if (options.useCustomColumn) {
            return getCustomColumns(iconColumn, [[nameColumn], [modifiedColumn]], [nameColumn, modifiedColumn]);
        } else {
            // Remove empty entries and return the resulting schema.
            return schema.filter((def: ISPListColumn) => !!def);
        }
    }

    export function getMappedColumnType(fieldName: string): MappedColumnType {
        switch (fieldName) {
            case 'FSObjType':
            case 'DocIcon':
                return MappedColumnType.icon;
            case 'LinkFilename':
            case 'LinkFilenameNoMenu':
            case 'FileLeafRef':
                return MappedColumnType.name;
            case 'LinkTitle':
            case 'LinkTitleNoMenu':
            case 'Title':
                return MappedColumnType.title;
            case '_calloutInvoker':
                return MappedColumnType.calloutInvoker;
            case 'Modified':
                return MappedColumnType.modified;
            default:
                return MappedColumnType.none;
        }
    }

    export function getCustomColumns(itemTypeColumn: ISPListColumn, columnRows: ISPListColumn[][], sorts: ISPListColumn[]): ISPListColumn[] {
        'use strict';

        let customColumn = _getCustomColumn();
        for (let row = 0; row < columnRows.length; row++) {
            let fields = columnRows[row];
            for (let field of fields) {
                field.customRowNumber = row;
                customColumn.customFields.push(field);
            }
        }
        let columns = [itemTypeColumn, customColumn];

        // Let's add fields that we should be able to sort by to the schema, but make sure they are not
        // visible since the customColumn is already showing its data
        for (let sort of sorts) {
            sort.isVisible = false;
            sort.isVisibleMobile = false;
            columns.push(sort);
        }

        return columns;
    }

    function _getFieldFromListData(
        listField: ISPListField,
        mappedDef: IMappedColumnDefinition,
        listContext: ISPListContext,
        options: ISchemaBuilderOptions,
        listSchema: ISPListSchema
    ): ISPListColumn {
        let fieldName = listField.Name;
        let fieldType = mappedDef ? mappedDef.type : _getColumnFieldType(listField);
        let isIconField = mappedDef ? mappedDef.key === 'type' : false;

        let canAutoResize = CAN_AUTO_RESIZE_TYPES.indexOf(fieldType) > -1;
        let filterParams = listContext.filterParams || '';
        let isFiltered = !!ListFilterUtilities.getFilterFieldByName(filterParams, fieldName);

        let columnDef: ISPListColumn = {
            key: mappedDef ? mappedDef.key : fieldName,
            name: isIconField ? '' : listField.DisplayName, // icon field shouldn't have a name
            internalName: fieldName,
            fieldType: fieldType,
            width: ColumnWidth.regular, // width and minWidth could be reset later in some cases
            minWidth: ColumnWidth.regularMin,
            isVisible: true,
            isVisibleMobile: mappedDef ? mappedDef.isVisibleMobile : true,
            isCollapsable: mappedDef ? mappedDef.isCollapsable : true,
            canAutoResize: canAutoResize,
            isIcon: isIconField,
            resizable: true,
            isRowHeader: mappedDef ? mappedDef.isRowHeader : false,
            sortable: listField.Sortable !== 'FALSE',
            filterable: !(listField.Filterable === 'FALSE' || listField.FilterDisable === 'TRUE' ||
                listField.FieldType === 'Note' || listField.FieldType === 'URL' ||
                fieldName === 'FileSizeDisplay' || fieldName === '_IsRecord'),
            groupable: (listField.Groupable !== 'FALSE' && listField.Sortable !== 'FALSE'
                && _isGroupableColumn(fieldName, fieldType)),
            isGrouped: listContext.groupByOverride === fieldName || listSchema.group1 === fieldName || listSchema.group2 === fieldName,
            isSorted: listContext.sortField === fieldName,
            isAscending: listContext.sortField === fieldName ? listContext.isAscending === 'true' : true,
            sortDescFirst: mappedDef ? !!mappedDef.sortDescFirst : false,
            isFiltered: isFiltered,
            filterValues: ListFilterUtilities.getFilterValueByName(filterParams, fieldName),
            isRequired: !!listField.Required,
            isAutoHyperLink: mappedDef ? options.serverSupportsAutoHyperLink : (!!listField.AutoHyperLink && options.serverSupportsAutoHyperLink) ||
                (fieldType === ColumnFieldType.Note && listField.RichText !== 'FALSE'),
            isAppendOnly: listField.AppendOnly && listField.AppendOnly === 'TRUE',
            dispFormUrl: listField.DispFormUrl,
            pinnedToFiltersPane: listField.PinnedToFiltersPane && listField.PinnedToFiltersPane === 'TRUE',
            showInFiltersPane: listField.ShowInFiltersPane && ShowInFiltersPaneStatus[listField.ShowInFiltersPane],
            clientSideComponentId: listField.ClientSideComponentId,
            clientSideComponentProperties: listField.ClientSideComponentProperties,
            customFormatter: listField.CustomFormatter,
            serverFieldType: listField.Type,
            isCalculated: listField.role === "Calculated",
            isNote: fieldType === ColumnFieldType.Note && listField.RichText === 'FALSE',
            clientSideColumnAdapter: listField.ClientSideColumnAdapter,
            sspId: listField.SspId,
            termSetId: listField.TermSetId,
            anchorId: listField.AnchorId
        };
        if (listField.ID) {
            // in SharePoint, the ID field is a guid, and is used by the REST API instead of internal name
            // for schema operations like rename a field or modify a field's definition
            columnDef.id = listField.ID;
        }
        // Reset width and minWidth for some field types
        if (mappedDef) {
            columnDef.minWidth = isIconField ? _getIconColumnMinWidth(options.useCustomColumn) : mappedDef.minWidth;
            columnDef.width = isIconField ? _getIconColumnWidth(options.useCustomColumn) : mappedDef.width;
        }
        if (fieldType === ColumnFieldType.SharedWith) {
            columnDef.width = ColumnWidth.sharedWith; // for sharing hints and other computed fields.
        } else if (fieldType === ColumnFieldType.Note) {
            columnDef.width = ColumnWidth.note;
        } else if (fieldType === ColumnFieldType.AverageRating) {
            columnDef.minWidth = ColumnWidth.ratingsMin;
        }

        return columnDef;
    }

    function _getIconColumnWidth(useCustomColumn: boolean): number {
        const iconColumnWidth = useCustomColumn ? ColumnWidth.bigIcon : ColumnWidth.icon;
        return iconColumnWidth;
    }

    function _getIconColumnMinWidth(useCustomColumn: boolean): number {
        const iconColumnWidth = useCustomColumn ? ColumnWidth.bigIcon : ColumnWidth.iconMin;
        return iconColumnWidth;
    }

    function _getColumnFieldType(listField: ISPListField): ColumnFieldType {
        let fieldType: string = listField.FieldType;

        if (fieldType === 'Calculated') {
            fieldType = listField.ResultType;
        }

        // Check various special cases to determine whether this is a hashtag field
        if (HashtagUtilities.isHashtagField(fieldType, listField.ID)) { // field schema uses Id instead of ID
            return ColumnFieldType.Hashtag;
        }
        // Special logic for particular computed fields with known types
        if (fieldType === 'Computed') {
            switch (listField.Name) {
                case 'FileSizeDisplay':
                    return ColumnFieldType.FileSize;
                case 'SharedWith':
                    return ColumnFieldType.SharedWith;
                case '_IsRecord':
                    return ColumnFieldType.ComplianceRecordFlag;
                default:
                    return ColumnFieldType.Computed;
            }
        }

        // If the field type corresponds directly to an enum value's name, use that enum value
        let fieldTypeEnum = ColumnFieldType[fieldType];
        if (typeof fieldTypeEnum === 'number') {
            return fieldTypeEnum;
        }

        switch (fieldType) {
            case 'UserMulti':
                return ColumnFieldType.User;
            case 'URL':
                return listField.Format === 'Hyperlink' ? ColumnFieldType.Hyperlink : ColumnFieldType.Image;
            case 'LookupMulti':
                return ColumnFieldType.Lookup;
            case 'MultiChoice':
                return ColumnFieldType.Choice;
            case 'TaxonomyFieldType':
            case 'TaxonomyFieldTypeMulti':
                return ColumnFieldType.Taxonomy;
        }

        // text type is always the default.
        return ColumnFieldType.Text;
    }

    function _isGroupableColumn(fieldName: string, fieldType: ColumnFieldType): boolean {
        switch (fieldType) {
            case ColumnFieldType.Attachments:
            case ColumnFieldType.Hyperlink:
            case ColumnFieldType.Image:
            case ColumnFieldType.Note:
            case ColumnFieldType.FileSize:
            case ColumnFieldType.FileIcon:
                return false;
            default:
                // filename columns are not groupable
                let mappedType = getMappedColumnType(fieldName);
                return mappedType !== MappedColumnType.name && mappedType !== MappedColumnType.title;
        }
    }

    function _getDefaultColumn(key: string, name: string): ISPListColumn {
        return {
            key: key,
            name: name,
            minWidth: ColumnWidth.regularMin,
            width: ColumnWidth.regular,
            isVisible: true,
            isVisibleMobile: true,
            isCollapsable: true,
            sortable: false,
            isSorted: false,
            isIcon: false,
            isAscending: true,
            fieldType: ColumnFieldType.Text,
            filterable: false,
            groupable: false,
            resizable: false,
            isGrouped: false,
            isFiltered: false
        };
    }

    function _getCustomColumn(): ISPListColumn {
        return {
            key: 'custom',
            name: '',
            minWidth: ColumnWidth.regularMin,
            width: ColumnWidth.custom,
            isVisible: true,
            isVisibleMobile: true,
            isCollapsable: true,
            sortable: false,
            isSorted: false,
            isIcon: false,
            isHtml: false,
            isAscending: true,
            fieldType: ColumnFieldType.Text,
            filterable: false,
            groupable: false,
            customFields: []
        };
    }
}