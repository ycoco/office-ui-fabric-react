import { IItem, IActivity } from '@ms/odsp-graph/lib/services/itemAnalytics/IItemAnalytics';
import { IFileHoverCardStore, IListener, IAnalyticsResult, AnalyticsResultStatus } from '../../../../index';

const mockActivity: IActivity = {
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
  public fetchItemAnalytics(item: IItem, skipToken: string): void {
    setTimeout(() => {
      const result = this._dictItemAnalytics[item.itemId];
      const returnAllviewerCount: boolean = result && result.skipToken === skipToken;
      const activities = [];
      const totalViewers = 80;

      for (let i = 0; i < (returnAllviewerCount ? totalViewers : totalViewers / 2); i++) {
        let activity = JSON.parse(JSON.stringify(mockActivity));
        activity.actor.user.displayName += ` (${i + 1})`;
        activities.push(activity);
      }

      this._dictItemAnalytics[item.itemId] = {
        activities: activities,
        viewCount: result ? result.viewCount : Math.floor(Math.random() * totalViewers * 2) + totalViewers,
        viewerCount: result ? result.viewerCount : totalViewers,
        skipToken: returnAllviewerCount ? undefined : 'someRandomValueForNextPage'
      };
      this._emitChange(item);
    }, (Math.random() * 2000) + 500);
  };

  /* Get analytics information about an item. */
  public getItemAnalytics(item: IItem): IAnalyticsResult {
    return {
      status: AnalyticsResultStatus.succeed,
      data: this._dictItemAnalytics[item.itemId],
      skipToken: this._dictItemAnalytics[item.itemId] && this._dictItemAnalytics[item.itemId].skipToken
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