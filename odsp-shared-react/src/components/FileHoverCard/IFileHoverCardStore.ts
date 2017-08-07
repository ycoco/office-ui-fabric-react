import { IItemAnalytics, IItem } from '@ms/odsp-graph/lib/services/itemAnalytics/IItemAnalytics';

export interface IFileHoverCardStore {
  /* Add a callback to be executed when the store updates. */
  addListener(listener: () => void, item: IItem): IListener;

  /* Tell store to make an API call to get new analytics information of an item. */
  fetchItemAnalytics(item: IItem): void;

  /* Get analytics information about an item. */
  getItemAnalytics(item: IItem): IAnalyticsResult;

  /* Remove the callback to be executed when the store updates. */
  removeListener(listener: IListener): void;
}

export interface IListener {
  /* Any unique identifier for the listener. */
  key: string;
}

export interface IAnalyticsResult {
  status: AnalyticsResultStatus;
  data: IItemAnalytics;
}

export enum AnalyticsResultStatus {
  succeed,
  unsupport,
  failed
}