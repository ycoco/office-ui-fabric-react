/**
 * The ItemProvider
 *  1. Uses the SPListItemDataSource to fetch list data for given getItemContext and listContext
 *  2. Incorporates the fetched data correctly into the appropriate ItemSet and updates cache.
 *
 *  Note that this object is essentially a static API collection and has no memory.
 */

import {
    SPListItemDataSource,
    ISPListProcessedData,
    ISPGetItemContext,
    ISPListContext,
    ISPListItem
} from '../../ListItem';
import { SPItemStore } from './SPItemStore';
import { ISPItemSet } from './ISPItemSet';
import * as ProviderHelpers from './SPListItemProviderHelpers';
import ISpPageContext from '../../interfaces/ISpPageContext';
import Promise from '@ms/odsp-utilities/lib/async/Promise';

const TOKEN_BASED_EXTRA_ITEMS: number = 5;
const DEFAULT_PAGE_SIZE: number = 100;

export interface ISPListItemProviderParams {
    hostSettings: ISpPageContext;
    itemStore: SPItemStore;
}

export class SPListItemProvider {
    private _hostSettings: ISpPageContext;
    private _dataSource: SPListItemDataSource;
    private _itemStore: SPItemStore;

    constructor(params: ISPListItemProviderParams) {
        this._hostSettings = params.hostSettings;
        this._itemStore = params.itemStore;
        this._dataSource = new SPListItemDataSource({
            hostSettings: this._hostSettings,
            itemStore: this._itemStore
        });
    }

    public getItemSetFromStore(context: ISPGetItemContext): ISPItemSet {
        const setKey: string = ProviderHelpers.getKey(context);
        const itemSet: ISPItemSet = this._itemStore.getItemSet(setKey);
        return itemSet;
    }

    public getItemSet(context: ISPGetItemContext, listContext: ISPListContext): Promise<ISPItemSet> {
        const setKey: string = ProviderHelpers.getKey(context);
        const cachedItemSet: ISPItemSet = this._itemStore.getItemSet(setKey);

        const hasResultSet: boolean = cachedItemSet &&
            !cachedItemSet.isExpired &&
            ProviderHelpers.resultSetHasData(cachedItemSet.itemKeys, context.startIndex, context.endIndex) &&
            !listContext.isPlaceholder; // if the listContext is not fully populated, re-get the data from server

        if (hasResultSet) {
            return Promise.wrap(cachedItemSet);
        } else {
            const fetchNextPage: boolean = cachedItemSet &&
                !cachedItemSet.isExpired &&
                cachedItemSet.nextRequestToken &&
                !listContext.group;
            listContext.requestToken = fetchNextPage ? cachedItemSet.nextRequestToken : undefined;

            context.pageSize = DEFAULT_PAGE_SIZE;

            const returnPromise = this._dataSource.getItem(context, listContext).then((result: ISPListProcessedData) => {
                // merge new items with existing
                const itemSet: ISPItemSet = cachedItemSet && !cachedItemSet.isExpired ?
                    ProviderHelpers.mergeItemSets(cachedItemSet, result, context.needSchema) :
                    this._createItemSet(result, setKey);

                // handle pagination
                if (result.nextRequestToken) { // there are more items in this itemset
                    // add extra items to enable paging
                    itemSet.itemKeys.length = Math.max(itemSet.itemKeys.length, result.totalCount) + TOKEN_BASED_EXTRA_ITEMS;
                    if (itemSet.groups) { // add placeholder group to enable paging
                        ProviderHelpers.addNextGroup(itemSet.groups, itemSet.isAllGroupsCollapsed);
                    }
                } else { // there are no more items
                    // clip items array to totalCount, which is the true number of items
                    itemSet.itemKeys.length = itemSet.totalCount;
                    if (itemSet.groups) { // strip off placeholder group, if present
                        ProviderHelpers.removeNextGroup(itemSet.groups);
                    }
                }

                this._itemStore.setItemSet(setKey, itemSet);
                return itemSet;
            });

            return returnPromise;
        }
    }

    public getItemFromStore(key: string): ISPListItem {
        return this._itemStore.getItem(key);
    }

    private _createItemSet(result: ISPListProcessedData, setKey: string): ISPItemSet {
        let itemKeys = result.items.map((item: ISPListItem) => item.key);
        return {
            key: setKey,
            rootKey: result.root.key,
            itemKeys: itemKeys,
            groups: result.groups,
            totalCount: result.totalCount,
            columns: result.columns,
            contentTypes: result.contentTypes,
            isAllGroupsCollapsed: result.isAllGroupsCollapsed,
            nextRequestToken: result.nextRequestToken
        };
    }
}

export default SPListItemProvider;