import { ISPGetItemResponse, ISPListSchema, ISPListData, ISPListRow } from '../spListItemRetriever/interfaces/ISPGetItemResponse';
import { ListItemBuilderHelpers } from './ListItemBuilderHelpers';
import { SchemaBuilder } from './SchemaBuilder';
import { ListItemBuilder } from './ListItemBuilder';
import { GroupBuilder } from './GroupBuilder';
import { ISPListContext, IGroupSchemaMap } from '../spListItemRetriever/interfaces/ISPListContext';
import { ISPListColumn, ISPListProcessedData } from './ISPListItemData';
import ListTemplateType from '../../../dataSources/listCollection/ListTemplateType';

export interface ISPListItemProcessorParams {
    listContext: ISPListContext;
}

export class SPListItemProcessor {
    private _listContext: ISPListContext;

    constructor(params: ISPListItemProcessorParams) {
        this._listContext = params.listContext;
    }

    public processData(parentKey: string, spdata: ISPGetItemResponse): ISPListProcessedData {
        ListItemBuilderHelpers.updateListContext(spdata, this._listContext);

        let schema = this._processSchema(spdata.ListSchema);
        let contentTypes = spdata.ListContenTypes;

        let listData: ISPListData = spdata.ListData || spdata;
        let { items, groups, totalCount } = this._processItems(listData);
        let startIndex = this._getStartIndex(listData);
        let nextRequestToken = this._getNextRequestToken(listData);
        let root = ListItemBuilder.buildRootItem(parentKey, listData, this._listContext);

        return {
            root: root,
            items: items,
            groups: groups,
            totalCount: totalCount,
            startIndex: startIndex,
            columns: schema,
            contentTypes: contentTypes,
            nextRequestToken: nextRequestToken
        };
    }

    private _processSchema(listSchema: ISPListSchema): ISPListColumn[] {
        if (listSchema) {
            let groupSchemaMap: IGroupSchemaMap = {};
            let schemaOptions = {
                hasFixedSchema: this._listContext.listTemplateType === ListTemplateType.mySiteDocumentLibrary
            };
            this._listContext.listSchema = SchemaBuilder.buildSchema(listSchema, this._listContext, schemaOptions, groupSchemaMap);
            let isGrouped = Object.keys(groupSchemaMap).length;
            if (isGrouped) {
                this._listContext.groupSchema = groupSchemaMap;
            }
        }
        return this._listContext.listSchema;
    }

    private _processItems(listData: ISPListData): ListItemBuilder.IProcessedItems {
        let rows: ISPListRow[] = listData.Row;
        let isAllGroupsCollapsed = this._listContext.rawListSchema && this._listContext.rawListSchema.Collapse === 'TRUE';

        let result;
        if (isAllGroupsCollapsed) {
            // rows contain group data and there are no items
            result = GroupBuilder.buildCollapsedGroups(rows, this._listContext);
        } else {
            // rows contain item data
            result = ListItemBuilder.buildItems(rows, this._listContext);
        }

        return {
            items: result ? result.items : undefined,
            groups: result ? result.groups : undefined,
            totalCount: result ? result.totalCount : 0
        };
    }

    private _getStartIndex(listData: ISPListData): number {
        let startIndex = 0;
        if (this._listContext.group) {
            startIndex = this._listContext.group.startIndex;
        } else if (listData.FirstRow) {
            startIndex = listData.FirstRow - 1;
        }
        return startIndex;
    }

    private _getNextRequestToken(listData: ISPListData): string {
        let nextRequestToken = '';
        if (listData.NextHref) {
            nextRequestToken = listData.NextHref;
            // Without this replacement, we end up retriving items from the root folder each time
            nextRequestToken = nextRequestToken.replace('&View=00000000-0000-0000-0000-000000000000', '');
        }
        return nextRequestToken;
    }
}