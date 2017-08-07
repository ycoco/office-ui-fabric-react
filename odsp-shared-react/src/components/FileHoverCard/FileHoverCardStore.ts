import { IItemAnalytics } from '@ms/odsp-graph/lib/services/itemAnalytics/IItemAnalytics';
import { IItemAnalyticsService } from '@ms/odsp-graph/lib/Services';
import { IItem } from '@ms/odsp-graph/lib/Services';
import { IFileHoverCardStore, IAnalyticsResult, AnalyticsResultStatus } from './index';
import { IListener } from './IFileHoverCardStore';

export interface IFileHoverCardStoreParams {
    item: IItem;
}

export interface IFileHoverCardStoreDependencies {
    itemAnalyticsDataSource: IItemAnalyticsService;
}

interface IAnalyticsDict<IAnalyticsResult> { [key: string]: IAnalyticsResult; }

export class FileHoverCardStore implements IFileHoverCardStore {
    private _dictItemAnalytics: IAnalyticsDict<IAnalyticsResult>;
    private _dictListener: Object = {};
    private _item: IItem;
    private _itemAnalyticsDataSource: IItemAnalyticsService;

    constructor(params: IFileHoverCardStoreParams, dependencies: IFileHoverCardStoreDependencies) {
        this._itemAnalyticsDataSource = dependencies.itemAnalyticsDataSource;
        this._item = params.item;
        this._dictItemAnalytics = {};
    }
    /* Add a callback to be executed when the store updates. */
    public addListener(listener: () => void, item: IItem): IListener {
        let _listeners: Array<() => void> = this._dictListener[item.itemId] ? this._dictListener[item.itemId] : [];
        _listeners.push(listener);
        this._dictListener[item.itemId] = _listeners;

        return { key: JSON.stringify({ itemId: item.itemId, index: _listeners.length - 1 }) };
    };

    /* Tell store to make an API call to get new analytics information of an item. */
    public fetchItemAnalytics(item: IItem): void {
        this._itemAnalyticsDataSource.getItemAnalytics(item).then((response: IItemAnalytics) => {
            this._dictItemAnalytics[item.itemId] = {
                status: AnalyticsResultStatus.succeed,
                data: response
            }
            this._emitChange(item);
        }, (error) => {
            let status;
            // Add error parse later
            if (error) {
                status = AnalyticsResultStatus.unsupport
            } else {
                status = AnalyticsResultStatus.failed
            }
            this._dictItemAnalytics[item.itemId] = {
                status: status,
                data: null
            }
        });
    };

    /* Get analytics information about an item. */
    public getItemAnalytics(item: IItem): IAnalyticsResult {
        return this._dictItemAnalytics[item.itemId] ? this._dictItemAnalytics[item.itemId] : null;
    }

    /* Remove the callback to be executed when the store updates. */
    public removeListener(listener: IListener): void {
        const { itemId, index } = JSON.parse(listener.key);
        this._dictListener[itemId].splice(index, 1);
    }

    /**
     * Let listeners of an item know that the store has new data.
     */
    private _emitChange(item: IItem): void {
        let _listeners = this._dictListener[item.itemId];

        for (const listener of _listeners) {
            listener();
        }
    }
}