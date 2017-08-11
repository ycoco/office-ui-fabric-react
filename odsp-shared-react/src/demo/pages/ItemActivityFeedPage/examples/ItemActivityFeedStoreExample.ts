import IItemActivityFeedStore, { IItemActivitiesOptions, IListener } from '../../../../components/ItemActivityFeed/IItemActivityFeedStore';
import IItemActivities from '@ms/odsp-graph/lib/services/itemActivities/IItemActivities';
import ItemActivityType from '@ms/odsp-graph/lib/services/itemActivities/ItemActivityType';

export default class ItemActivityFeedStoreExample implements IItemActivityFeedStore {
    private readonly _dictListener: { [id: string]: (() => void)[] } = {};
    private readonly _dictItemActivities: { [id: string]: IItemActivities } = {};

    /**
     * Adds a callback to be executed when the store updates.
     */
    public addListener(listener: () => void, item: IItemActivitiesOptions): IListener {
        const listeners: Array<() => void> = this._dictListener[item.itemUrl] ? this._dictListener[item.itemUrl] : [];
        listeners.push(listener);

        this._dictListener[item.itemUrl] = listeners;

        return {
            key: JSON.stringify({
                itemId: item.itemUrl,
                index: listeners.length - 1
            })
        };
    };

    public fetchItemActivities(item: IItemActivitiesOptions): void {
        setTimeout(() => {
            this._dictItemActivities[item.itemUrl] = {
                activities: [
                    {
                        id: 'activity2',
                        type: ItemActivityType.edit,
                        user: {
                            displayName: 'Sebastian Ottl',
                            email: 't-seoett@microsoft.com'
                        },
                        fileName: 'DocumentName.docx',
                        time: new Date()
                    },
                    {
                        id: 'activity1',
                        type: ItemActivityType.edit,
                        user: {
                            displayName: 'Edgar Banguero',
                            email: 'ebang@microsoft.com'
                        },
                        fileName: 'DocumentName2.docx',
                        time: new Date()
                    }
                ]
            };

            this._emitChange(item);
        }, (Math.random() * 2000) + 500);
    };

    public getItemActivities(item: IItemActivitiesOptions): IItemActivities {
        return this._dictItemActivities[item.itemUrl];
    }

    public removeListener(listener: IListener) {
        const { itemId, index } = JSON.parse(listener.key);

        this._dictListener[itemId].splice(index, 1);
    }

    /**
     * Let listeners of an item know that the store has new data.
     */
    private _emitChange(item: IItemActivitiesOptions): void {
        const _listeners = this._dictListener[item.itemUrl];

        for (const listener of _listeners) {
            listener();
        }
    }
}