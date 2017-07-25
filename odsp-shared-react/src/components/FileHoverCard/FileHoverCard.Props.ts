import * as React from 'react';
import { FileHoverCard } from './FileHoverCard';
import { IActivity, IItem } from '@ms/odsp-graph/lib/services/itemAnalytics/IItemAnalytics';
import { IContextualMenuItem } from 'office-ui-fabric-react/lib/ContextualMenu';
import { IAnalyticsActivityListStrings } from './AnalyticsActivityList/AnalyticsActivityList';
import { IAnalyticsActivityStrings } from './AnalyticsActivity/AnalyticsActivity';

export interface IFileHoverCardProps extends React.Props<FileHoverCard> {
  /**
   * Gets ref to component interface.
   */
  componentRef?: any;

  /**
   * Title of the item
   */
  itemTitle: string;

  /**
   * dateTime string of the item creation time
   */
  itemCreateDate?: string;

  /**
   * Item for which we need stats
   */
  item: IItem;

  /**
   * Activity on the item by current user. Shown in the top compact card.
   */
  currentUserActivity: IActivity;

  /**
   * onClick callbacks for View action on the compact card.
   */
  onView?: (event, data: any) => void;

  /**
   * onClick callbacks for Details action on the compact card.
   */
  onDetails?: (event, data: any) => void;

  /**
   * To add action items on the compact card. Example: Share, Like, etc.
   */
  actionBarItems?: IContextualMenuItem[];

  /**
   * Localized strings for the card, provided by the context.
   */
  locStrings?: IFileHoverCardStrings;

  /**
   * Custom data, to be returned with click handler callbacks
   */
  data?: any;
}

export interface IFileHoverCardStrings extends IAnalyticsActivityListStrings, IAnalyticsActivityStrings {
  /**
   * The string for the See Details action on the compact card
   */
  details?: string;
}