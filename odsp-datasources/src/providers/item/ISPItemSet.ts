import {
    ISPListGroup,
    ISPListColumn
} from '../../SPListItemProcessor';

export interface ISPItemSet {
    key: string; // key identifying this itemSet in the itemStore
    rootKey: string;
    itemKeys: string[];
    groups?: ISPListGroup[];
    totalCount: number;
    columns: ISPListColumn[];
    /* tslint:disable:no-any */
    contentTypes?: any[];
    /* tslint:enable:no-any */
    nextRequestToken?: string;
    isAllGroupsCollapsed?: boolean;
    isExpired?: boolean;
    /** client overrides on top of the server state */
    clientState?: { [contextKey: string]: ISPItemSetClientState };
}

export interface ISPItemSetClientState {
    isAllGroupsCollapsed?: boolean;
    groupCollapsedMap?: { [key: string]: boolean };
    exceptionCount?: number;
}

export interface ISPItemSetClientStateChange {
    group?: ISPListGroup;
    isCollapsed?: boolean;
    isAllGroupsCollapsed?: boolean;
}

export default ISPItemSet;
