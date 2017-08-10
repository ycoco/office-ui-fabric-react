import { ISPGetItemResponse, ISPListSchema, ISPListData } from '../spListItemRetriever/interfaces/ISPGetItemResponse';
import { ListItemBuilderHelpers } from './ListItemBuilderHelpers';
import { SchemaBuilder } from './SchemaBuilder';
import { ListItemBuilder } from './ListItemBuilder';
import { GroupBuilder } from './GroupBuilder';
import { ISPListContext, IGroupSchemaMap } from '../spListItemRetriever/interfaces/ISPListContext';
import { ISPListColumn, ISPListProcessedData, ISPListItem } from './ISPListItemData';
import ListTemplateType from '../../../dataSources/listCollection/ListTemplateType';
import { SPItemStore } from '../../../providers/item/SPItemStore';

export interface ISPListItemProcessorParams {
    listContext: ISPListContext;
    itemStore?: SPItemStore;
}

export class SPListItemProcessor {
    private _listContext: ISPListContext;
    private _itemStore: SPItemStore;

    constructor(params: ISPListItemProcessorParams) {
        this._listContext = params.listContext;
        this._itemStore = params.itemStore;
    }

    public processData(parentKey: string, spdata: ISPGetItemResponse): ISPListProcessedData {
        ListItemBuilderHelpers.updateListContext(spdata, this._listContext);
        ListItemBuilderHelpers.updateListContextGroupInfo(this._listContext);

        let isAllGroupsCollapsed = spdata.ListSchema && spdata.ListSchema.Collapse === 'TRUE';
        let schema = this._processSchema(spdata.ListSchema);
        let contentTypes = spdata.ListContenTypes;

        let listData: ISPListData = spdata.ListData || spdata as ISPListData;
        let root = ListItemBuilder.buildRootItem(parentKey, spdata, this._listContext, this._itemStore);
        let { items, groups, totalCount } = this._processItems(listData, isAllGroupsCollapsed, root);
        let startIndex = this._getStartIndex(listData);
        let nextRequestToken = this._getNextRequestToken(listData);

        return {
            root: root,
            items: items,
            groups: groups,
            totalCount: totalCount,
            startIndex: startIndex,
            columns: schema,
            contentTypes: contentTypes,
            nextRequestToken: nextRequestToken,
            isAllGroupsCollapsed: isAllGroupsCollapsed
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

    private _processItems(listData: ISPListData, isAllGroupsCollapsed: boolean, rootItem: ISPListItem): ListItemBuilder.IProcessedItems {
        let result;
        if (isAllGroupsCollapsed) {
            // rows contain group data and there are no items
            result = GroupBuilder.buildCollapsedGroups(listData.Row, this._listContext);
        } else {
            // rows contain item data
            result = ListItemBuilder.buildItems(listData, this._listContext, rootItem, this._itemStore);
        }

        if (result.groups && result.groups.length > 0) {
            this._listContext.lastGroup = result.groups[result.groups.length - 1];
        }

        return {
            items: result.items ? result.items : [],
            groups: result.groups,
            totalCount: result.totalCount
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