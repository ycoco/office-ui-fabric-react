/**
 * @copyright Microsoft Corporation. All rights reserved.
 *
 * @file Analytics Activity List component
 */

import * as React from 'react';
import { List } from 'office-ui-fabric-react/lib/List';
import { IItemAnalytics } from '@ms/odsp-graph/lib/services/itemAnalytics/IItemAnalytics';
import { AnalyticsActivity, IAnalyticsActivityProps, IAnalyticsActivityStrings } from '../AnalyticsActivity/AnalyticsActivity';
import { AnalyticsStats } from '../AnalyticsStats/AnalyticsStats';
import './AnalyticsActivityList.scss';

export interface IAnalyticsActivityListProps {
  itemAnalytics: IItemAnalytics;
  locStrings: IAnalyticsActivityListStrings;
}

export interface IAnalyticsActivityListStrings extends IAnalyticsActivityStrings {
  views: string;
  viewers: string;
}

export const AnalyticsActivityList: React.StatelessComponent<IAnalyticsActivityListProps> = (props: IAnalyticsActivityListProps, context) => {

  const { itemAnalytics, locStrings } = props;
  const activities: IAnalyticsActivityProps[] = itemAnalytics.activities.map((activity) => {
    return { activity: activity, locStrings: locStrings }
  });

  return (
    <div>
      <AnalyticsStats
        itemAnalytics={ itemAnalytics }
        locStrings={ locStrings }
      />
      <List
        items={ activities }
        onRenderCell={ _onRenderCell }
      />
    </div>
  );
}

const _onRenderCell = (item: IAnalyticsActivityProps) => {
  return (
    <div className='ms-AnalyticsActivityList--activity'>
      <AnalyticsActivity
        activity={ item.activity }
        locStrings={ item.locStrings }
      />
    </div>
  );
};