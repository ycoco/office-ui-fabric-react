import { IItem } from '@ms/odsp-graph/lib/services/itemAnalytics/IItemAnalytics';
import { IFileHoverCardStore, IListener, IAnalyticsResult, AnalyticsResultStatus } from '../../../../index';

const mockActivity = {
  activityDateTime: '10:02am',
  activityType: 'Access',
  actor: {
    user: {
      displayName: 'Alan Munger',
      id: '0',
      email: 'alan@microsoft.com',
      image: 'https://static2.sharepointonline.com/files/fabric/office-ui-fabric-react-assets/persona-male.png'
    }
  }
};

export class FileHoverCardStoreExample implements IFileHoverCardStore {

  private _dictListener: Object = {};
  private _dictItemAnalytics: Object = {};

  /* Add a callback to be executed when the store updates. */
  public addListener(listener: () => void, item: IItem): IListener {
    let _listeners: Array<() => void> = this._dictListener[item.itemId] ? this._dictListener[item.itemId] : [];
    _listeners.push(listener);
    this._dictListener[item.itemId] = _listeners;

    return { key: JSON.stringify({ itemId: item.itemId, index: _listeners.length - 1 }) };
  };

  /* Tell store to make an API call to get new analytics information of an item. */
  public fetchItemAnalytics(item: IItem): void {
    setTimeout(() => {
      this._dictItemAnalytics[item.itemId] = { activities: [mockActivity, mockActivity, mockActivity], viewCount: Math.floor(Math.random() * 20) + 3, viewerCount: 3 };

      this._emitChange(item);
    }, (Math.random() * 2000) + 500);
  };

  /* Get analytics information about an item. */
  public getItemAnalytics(item: IItem): IAnalyticsResult {
    return {
      status: AnalyticsResultStatus.succeed,
      data: this._dictItemAnalytics[item.itemId]
    }
  }

  public removeListener(listener: IListener) {
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