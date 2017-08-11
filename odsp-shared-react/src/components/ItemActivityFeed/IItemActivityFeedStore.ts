import IItemActivities from '@ms/odsp-graph/lib/services/itemActivities/IItemActivities';

export interface IItemActivitiesOptions {
    itemUrl: string;
}

export interface IItemActivityFeedStore {
    /**
     * Adds a callback to be executed when the store updates.
     */
    addListener(listener: () => void, options: IItemActivitiesOptions): IListener;

    fetchItemActivities(item: IItemActivitiesOptions): void;

    getItemActivities(item: IItemActivitiesOptions): IItemActivities;

    /**
     * Remove the callback to be executed when the store updates.
     */
    removeListener(listener: IListener): void;
}

export interface IListener {
    /**
     * Any unique identifier for the listener.
     */
    key: string;
}

export default IItemActivityFeedStore;