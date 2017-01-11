/**
 * The DataManager is a Singleton object shared between multiple UI controls to fetch list data.
 *    1. Keeps track of which UI control subscribes to which itemset.
 *    2. Owns creating and updating the context needed for data fetch.
 *    2. Listens to the GETITEMCONTEXT_CHANGE event (triggered by UI): updates the context and fetches new data
 *    3. Raises the ITEMSET_CHANGE event on all the relevant subscribers after itemset is updated with new data.
 */

import {
    ISPGetItemContext,
    ISPListContext,
    ISPListGroup,
    ISPListItem
} from '../../ListItem';
import { ISPItemSet, ISPItemSetClientState, ISPItemSetClientStateChange } from './ISPItemSet';
import ISpPageContext from '../../interfaces/ISpPageContext';
import EventGroup from '@ms/odsp-utilities/lib/events/EventGroup';
import { SPListItemProvider } from './SPListItemProvider';
import * as ProviderHelpers from './SPListItemProviderHelpers';
import UriEncoding from '@ms/odsp-utilities/lib/encoding/UriEncoding';
import ListFilterUtilities from '../../utilities/list/ListFilterUtilities';
import AddressParser from '@ms/odsp-utilities/lib/navigation/AddressParser';
import { SPItemStore } from './SPItemStore';

export const GETITEMCONTEXT_CHANGE: string = 'item_context_change';
export const ITEMSET_CHANGE: string = 'itemset_change';

export interface IGetItemContextChange {
    parentKey?: string;
    startIndex?: number;
    endIndex?: number;
    group?: ISPListGroup;
    expandAllGroups?: boolean;
    filterFields?: string[];
    filterValues?: string[];
}

export interface IDataManagerParams {
    hostSettings: ISpPageContext;
    listId: string;
    fullListUrl: string;
    serverRelativeListUrl: string;
    viewId?: string;
    eventContainer?: any;
}

export class DataManager {
    private _events: EventGroup;

    // We have the following two context variables to completely determine the data fetch parameters.
    private _getItemContext: ISPGetItemContext; // current data fetch context
    private _listContext: ISPListContext; // stores current list information and state

    private _itemProvider: SPListItemProvider;
    private _itemStore: SPItemStore;
    private _eventContainer: any;

    constructor(params: IDataManagerParams) {
        this._initializeContext(params);

        this._itemStore = new SPItemStore();
        this._itemProvider = new SPListItemProvider({
            hostSettings: params.hostSettings,
            itemStore: this._itemStore
        });

        this._eventContainer = params.eventContainer;
        this._events = new EventGroup(this);
        this._events.on(this._eventContainer, GETITEMCONTEXT_CHANGE, this._onContextChanged);

        // trigger data fetch
        EventGroup.raise(this._eventContainer, GETITEMCONTEXT_CHANGE, {}, true);
    }

    public updateListContext(params: IDataManagerParams) {
        this._initializeContext(params);

        // trigger data fetch
        EventGroup.raise(this._eventContainer, GETITEMCONTEXT_CHANGE, {}, true);
    }

    public updateClientState(itemSet: ISPItemSet, newState: ISPItemSetClientStateChange, triggerChangeEvent: boolean = true) {
        let defaultClientState: ISPItemSetClientState = {
            groupCollapsedMap: {},
            exceptionCount: 0
        };
        let state = itemSet.clientState || defaultClientState;

        if (newState.group) {
            state.groupCollapsedMap[newState.group.groupingId] = newState.isCollapsed;

            if (itemSet.isAllGroupsCollapsed === newState.isCollapsed) {
                state.exceptionCount--;
            } else {
                state.exceptionCount++;
            }
            // flip the allCollapsed state if all groups have changed
            if (state.exceptionCount === itemSet.groups.length) {
                state.isAllGroupsCollapsed = state.isAllGroupsCollapsed !== undefined ? !state.isAllGroupsCollapsed : newState.isCollapsed;
            }
        }

        if (newState.isAllGroupsCollapsed !== undefined) {
            state.isAllGroupsCollapsed = newState.isAllGroupsCollapsed;
            itemSet.groups.forEach((group: ISPListGroup) => {
                state.groupCollapsedMap[group.groupingId] = state.isAllGroupsCollapsed;
            });
            if (itemSet.isAllGroupsCollapsed !== state.isAllGroupsCollapsed) {
                state.exceptionCount = itemSet.groups.length;
            }
        }

        itemSet.clientState = state;

        if (triggerChangeEvent) {
            EventGroup.raise(this._eventContainer, ITEMSET_CHANGE, itemSet, true);
        }
    }

    public getFilters(): { [key: string]: string } {
        return this._getItemContext.filters;
    }

    public getListContext(): ISPListContext {
        return this._listContext;
    }

    public getItemFromStore(key: string): ISPListItem {
        return this._itemStore.getItem(key);
    }

    private _initializeContext(params: IDataManagerParams) {
        // TODO: bring over the code to generate urlParts
        this._listContext = {
            listId: params.listId,
            urlParts: {
                fullItemUrl: params.fullListUrl,
                fullListUrl: params.fullListUrl,
                isCrossDomain: false,
                isCrossList: false,
                isCrossSite: 0,
                listRelativeItemUrl: '',
                normalizedItemUrl: params.serverRelativeListUrl,
                normalizedListUrl: undefined,
                serverRelativeItemUrl: params.serverRelativeListUrl,
                serverRelativeListUrl: params.serverRelativeListUrl
            },
            viewIdForRequest: params.viewId
        };

        this._getItemContext = {
            parentKey: params.serverRelativeListUrl || 'root',
            baseViewId: params.viewId
        };
    }

    private _onContextChanged(contextChange: IGetItemContextChange): void {
        let isIncrementalFetch: boolean = true; // distinguishes incremental datafetch for same itemset vs. fresh itemset.

        // parentKey
        if (contextChange.parentKey) {
            this._getItemContext.parentKey = contextChange.parentKey;
            this._listContext.folderPath = getFolderPath(this._getItemContext.parentKey, this._listContext);
            isIncrementalFetch = false;
        }

        // filter
        let filters: { [key: string]: string } = isIncrementalFetch ? this._getItemContext.filters : {};
        if (contextChange.filterFields) {
            let newFilterString = ListFilterUtilities.addMultipleFilterInfo(serializeQuery(filters), contextChange.filterFields, contextChange.filterValues);
            filters = AddressParser.deserializeQuery(newFilterString);
        }
        this._getItemContext.filters = filters;
        this._listContext.filterParams = Object.keys(filters || {})
            .map((key: string) => '&' + key + '=' + UriEncoding.encodeURIComponent(filters[key]))
            .join('');

        // group
        let group = undefined;
        if (contextChange.group) {
            group = contextChange.group;
        } else if (contextChange.startIndex === ProviderHelpers.NEXT_GROUP_START_INDEX) {
            const startIndex = this._listContext.lastGroup.startIndex + this._listContext.lastGroup.count;
            group = {
                groupingId: ProviderHelpers.NEXT_GROUP_ID,
                startIndex: startIndex
            };
        }
        this._getItemContext.group = this._listContext.group = group;
        if (contextChange.expandAllGroups) {
            this._getItemContext.expandGroup = true;
        }

        // start-end indices
        this._getItemContext.startIndex = group ? group.startIndex : ( contextChange.startIndex || 0 );
        this._getItemContext.endIndex = contextChange.endIndex || this._getItemContext.startIndex + 1;

        // needSchema
        let itemSetForRequest = this._itemProvider.getItemSetFromStore(this._getItemContext);
        this._getItemContext.needSchema = !itemSetForRequest || itemSetForRequest.isExpired || !itemSetForRequest.columns.length;

        // reset context if not fetching incremental data
        if (!isIncrementalFetch) {
            this._getItemContext.startIndex = 0;
            this._getItemContext.endIndex = 0;
            this._getItemContext.expandGroup = false;
        }

        // get data and trigger change event
        this._itemProvider.getItemSet(this._getItemContext, this._listContext).then((result: ISPItemSet) => {
            EventGroup.raise(this._eventContainer, ITEMSET_CHANGE, result, true);
        });
    }
}

function getFolderPath(parentKey: string, listContext: ISPListContext): string {
    let folderPath: string = parentKey;
    if (folderPath === listContext.urlParts.fullListUrl) {
        folderPath = undefined;
    }
    return folderPath;
}

function serializeQuery(filters: { [key: string]: string }): string {
    return Object.keys(filters || {})
            .map((key: string) => '&' + key + '=' + UriEncoding.encodeURIComponent(filters[key]))
            .join('');
}

export default DataManager;