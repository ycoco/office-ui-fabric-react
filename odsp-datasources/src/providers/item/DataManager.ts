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
import * as AddressParser from '@ms/odsp-utilities/lib/navigation/AddressParser';
import { SPItemStore } from './SPItemStore';
import Guid from '@ms/odsp-utilities/lib/guid/Guid';
import View from '../../models/view/View';
import * as ViewHelpers from '../../models/view/ViewHelpers';
import { IFilter } from '../../interfaces/view/IViewArrangeInfo';
import { getFolderPath } from '../../utilities/list/DataSourceUtilities';
import { ItemUrlHelper } from '../../utilities/url/ItemUrlHelper';

export const GETITEMCONTEXT_CHANGE: string = 'item_context_change';
export const ITEMSET_CHANGE: string = 'itemset_change';

export interface IGetItemContextChange {
    parentKey?: string;
    startIndex?: number;
    endIndex?: number;
    groupBy?: string;       // runtime group by a column
    group?: ISPListGroup;   // fetch items from a known group (e.g., group expand)
    expandAllGroups?: boolean;
    filterFields?: string[];
    filterValues?: string[];
    key?: string;
    sortField?: string;
    isAscending?: boolean;
    viewXml?: string;
}

export interface IDataManagerParams {
    hostSettings: ISpPageContext;
}

export interface IDataManagerRegistrationParams {
    listId: string;
    fullListUrl: string;
    serverRelativeListUrl: string;
    viewId?: string;
    eventContainer?: any;
}

interface IDataManagerContext {
    key: string;                       // GUID to identify this context
    // The following two context variables completely determine the data fetch parameters.
    listContext: ISPListContext;       // current data fetch context
    getItemContext: ISPGetItemContext; // stores current list information and state
    isDataFetchComplete: boolean;      // boolean indicating whether the items have been fetched for the first time; helps determine PLT.
    eventContainer?: any;              // UI container rendering data from this context
    itemSetKey?: string;               // key for the ItemSet rendered by this context
}

export class DataManager {
    private static _instance: DataManager;

    private _registeredContexts: { [key: string]: IDataManagerContext } = {};
    private _itemSetToContextMap: { [itemSetKey: string]: string[] } = {};
    private _events: EventGroup;
    private _itemProvider: SPListItemProvider;
    private _itemStore: SPItemStore;
    private _itemUrlHelper: ItemUrlHelper;

    static getInstance(params: IDataManagerParams): DataManager {
        if (!DataManager._instance) {
            DataManager._instance = new DataManager(params);
        }
        return DataManager._instance;
    }

    constructor(params: IDataManagerParams) {
        this._itemStore = new SPItemStore();
        this._itemProvider = new SPListItemProvider({
            hostSettings: params.hostSettings,
            itemStore: this._itemStore
        });
        this._events = new EventGroup(this);
        this._itemUrlHelper = new ItemUrlHelper({}, { pageContext: params.hostSettings });
    }

    public registerContext(params: IDataManagerRegistrationParams): string {
        let context = this._initializeContext(params);
        let key = Guid.generate();
        let eventContainer = params.eventContainer;

        // register context
        this._registeredContexts[key] = {
            key: key,
            listContext: context.listContext,
            getItemContext: context.getItemContext,
            eventContainer: eventContainer,
            isDataFetchComplete: false
        }

        // register change event
        this._events.on(eventContainer, GETITEMCONTEXT_CHANGE, this._onContextChanged);

        // trigger data fetch for this context
        EventGroup.raise(eventContainer, GETITEMCONTEXT_CHANGE, { key: key }, true);

        return key;
    }

    public unregisterContext(key: string) {
        let context = this._registeredContexts[key];
        if (context) {
            this._events.off(context.eventContainer, GETITEMCONTEXT_CHANGE)
        }
        delete this._registeredContexts[key];
    }

    public updateClientState(itemSet: ISPItemSet, newState: ISPItemSetClientStateChange, contextKey: string, triggerChangeEvent: boolean = true) {
        let defaultClientState: ISPItemSetClientState = {
            groupCollapsedMap: {},
            exceptionCount: 0
        };

        if (!itemSet.clientState) {
            itemSet.clientState = {};
        }
        let state = itemSet.clientState[contextKey] || defaultClientState;

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

        itemSet.clientState[contextKey] = state;

        let context = this._registeredContexts[contextKey];
        if (triggerChangeEvent && context && context.eventContainer) {
            EventGroup.raise(context.eventContainer, ITEMSET_CHANGE, itemSet, true);
        }
    }

    public getFilters(contextKey: string, emptyFilterString?: string): IFilter[] {
        let context = this._registeredContexts[contextKey];
        let filters = [];

        if (context && context.listContext) {
            let listContext = context.listContext;

            // get filters from filterparams
            filters = ListFilterUtilities.getFilterList(listContext.filterParams,
                listContext && listContext.rawListSchema ? listContext.rawListSchema.Field : null,
                !emptyFilterString, false, emptyFilterString);

            // get filters from viewXmlForRequest
            if (context.listContext && context.listContext.viewXmlForRequest) {
                let view = new View(context.listContext.viewXmlForRequest);
                let filtersFromView = ViewHelpers.getAllSmartFilters(view);
                // @todo: we should technically de-dupe after the concat, but none of the
                // current scenarios need that so saving some cycles.
                filters = filters.concat(filtersFromView);
            }
        }

        return filters;
    }

    public getListContext(contextKey: string): ISPListContext {
        let context = this._registeredContexts[contextKey];
        return context && context.listContext;
    }

    public isDataFetchComplete(contextKey: string): boolean {
        let context = this._registeredContexts[contextKey];
        return context && context.isDataFetchComplete;
    }

    public getItemFromStore(key: string): ISPListItem {
        return this._itemStore.getItem(key);
    }

    public invalidateItem(key: string, {
        triggerFetch = false,
        emptyAllOtherSets = false,
        refreshSchema = false
    }: {
            triggerFetch?: boolean;
            emptyAllOtherSets?: boolean;
            refreshSchema?: boolean;
        } = {},
        contextKey?: string): void {
        if (refreshSchema) {
            const itemSet = this._itemStore.getItemSet(key);
            if (itemSet) {
                itemSet.columns = [];
            }
        }

        this._itemStore.invalidateItem(key);

        if (triggerFetch) {
            let context = this._registeredContexts[contextKey];
            if (context) {
                EventGroup.raise(context.eventContainer, GETITEMCONTEXT_CHANGE, {
                    key: contextKey,
                    startIndex: 0,
                    endIndex: 1
                }, true);
            }
        }
    }

    private _initializeContext(params: IDataManagerRegistrationParams) {
        let urlParts = this._itemUrlHelper.getUrlParts({
            path: params.serverRelativeListUrl
        });
        let listContext = {
            listId: params.listId,
            urlParts: urlParts,
            viewIdForRequest: params.viewId,
            isPlaceholder: true // this is pre-data-fetch; doesn't have all fields populated
        };

        let getItemContext = {
            parentKey: params.serverRelativeListUrl,
            baseViewId: params.viewId
        };

        return {
            listContext: listContext,
            getItemContext: getItemContext
        }
    }

    private _onContextChanged(contextChange: IGetItemContextChange): void {
        let isIncrementalFetch: boolean = true; // distinguishes incremental datafetch for same itemset vs. fresh itemset.
        let context = this._registeredContexts[contextChange.key];
        if (!context) {
            return;
        }
        let getItemContext = context.getItemContext;
        let listContext = context.listContext;

        // parentKey
        if (contextChange.parentKey) {
            getItemContext.parentKey = contextChange.parentKey;
            listContext.folderPath = getFolderPath(getItemContext.parentKey, listContext);
            isIncrementalFetch = false;
        }

        // sort
        if (contextChange.sortField) {
            listContext.sortField = getItemContext.sortField = contextChange.sortField;
            getItemContext.isAscending = contextChange.isAscending;
            listContext.isAscending = String(contextChange.isAscending);
        }

        // filter
        let filters: { [key: string]: string } = isIncrementalFetch ? getItemContext.filters : {};
        if (contextChange.filterFields) {
            let newFilterString = ListFilterUtilities.addMultipleFilterInfo(serializeQuery(filters), contextChange.filterFields, contextChange.filterValues);
            filters = AddressParser.deserializeQuery(newFilterString);
        }
        getItemContext.filters = filters;
        listContext.filterParams = serializeQuery(filters);

        // group
        if (contextChange.groupBy || contextChange.groupBy === '') {
            getItemContext.groupBy = listContext.groupByOverride = contextChange.groupBy;
        }
        let group = undefined;
        if (contextChange.group) {
            group = contextChange.group;
        } else if (contextChange.startIndex === ProviderHelpers.NEXT_GROUP_START_INDEX) {
            const startIndex = listContext.lastGroup.startIndex + listContext.lastGroup.count;
            group = {
                groupingId: ProviderHelpers.NEXT_GROUP_ID,
                startIndex: startIndex
            };
        }
        getItemContext.group = listContext.group = group;
        if (contextChange.expandAllGroups) {
            getItemContext.expandGroup = true;
        }

        // view XML
        if (contextChange.viewXml !== undefined) {
            getItemContext.viewXml = listContext.viewXmlForRequest = contextChange.viewXml;
        }

        // start-end indices
        getItemContext.startIndex = group ? group.startIndex : ( contextChange.startIndex || 0 );
        getItemContext.endIndex = contextChange.endIndex || getItemContext.startIndex + 1;

        // needSchema
        let itemSetForRequest = this._itemProvider.getItemSetFromStore(getItemContext);
        getItemContext.needSchema = !itemSetForRequest || itemSetForRequest.isExpired || !itemSetForRequest.columns.length;

        // reset context if not fetching incremental data
        if (!isIncrementalFetch) {
            getItemContext.startIndex = 0;
            getItemContext.endIndex = 0;
            getItemContext.expandGroup = false;
        }

        // get data and trigger change event
        this._itemProvider.getItemSet(getItemContext, listContext).then((result: ISPItemSet) => {
            let oldItemSetKey = context.itemSetKey;
            let newItemSetKey = result.key;

            if (oldItemSetKey !== newItemSetKey) {
                context.itemSetKey = newItemSetKey;

                // add new itemset key to map
                if (!this._itemSetToContextMap[newItemSetKey]) {
                    this._itemSetToContextMap[newItemSetKey] = [];
                }
                this._itemSetToContextMap[newItemSetKey].push(context.key);

                // remove old itemset key map
                if (oldItemSetKey && this._itemSetToContextMap[oldItemSetKey]) {
                    let index = this._itemSetToContextMap[oldItemSetKey].indexOf(context.key);
                    this._itemSetToContextMap[oldItemSetKey].splice(index, 1);
                }
            }

            // raise change event to all the UI contexts bound to this itemset key
            let boundContextKeys = this._itemSetToContextMap[newItemSetKey];
            boundContextKeys.forEach((contextKey: string) => {
                let context = this._registeredContexts[contextKey];
                if (context) {
                    context.isDataFetchComplete = true;
                    EventGroup.raise(context.eventContainer, ITEMSET_CHANGE, result, true);
                }
            });
        });
    }
}

function serializeQuery(filters: { [key: string]: string }): string {
    return Object.keys(filters || {})
            .map((key: string) => '&' + key + '=' + UriEncoding.encodeURIComponent(filters[key]))
            .join('');
}

export default DataManager;
