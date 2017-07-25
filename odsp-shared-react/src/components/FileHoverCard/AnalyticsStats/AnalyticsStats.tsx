/**
 * @copyright Microsoft Corporation. All rights reserved.
 *
 * @file Analytics Stats component
 */

import * as React from 'react';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { ActivityItem } from 'office-ui-fabric-react/lib/Components/ActivityItem';
import { IItemAnalytics } from '@ms/odsp-graph/lib/services/itemAnalytics/IItemAnalytics';
import './AnalyticsStats.scss';

export interface IAnalyticsStatsProps {
  itemAnalytics: IItemAnalytics;
  locStrings: IAnalyticsStatsStrings;
  withFacePile?: boolean;
  onClick?: (ev?: any) => void;
}

export interface IAnalyticsStatsStrings {
  views: string;
  viewers: string;
}

export const AnalyticsStats: React.StatelessComponent<IAnalyticsStatsProps> = (props: IAnalyticsStatsProps) => {
  const { itemAnalytics, locStrings, onClick, withFacePile } = props;

  if (!itemAnalytics) {
    return (
      <ActivityItem
        className={ 'ms-AnalyticsStats--stats' }
        activityDescriptionText={ `-- ${locStrings.views}` }
        isCompact={ true }
      />
    );
  }
  const { viewCount, viewerCount, activities } = itemAnalytics;
  const statsElem =
    withFacePile
      ?
      <Link
        className={ 'ms-AnalyticsStats--stats' }
        onClick={ onClick }
      >
        <ActivityItem
          activityPersonas={
            activities.slice(0, 3).map((activity) => {
              return {
                imageUrl: activity.actor.user.image
              }
            })
          }
          activityDescriptionText={ `${viewCount} ${locStrings.views}` }
          isCompact={ true }
        />
      </Link>
      :
      <div className='ms-AnalyticsStats--views'>
        { `${viewCount} ${locStrings.views}` }
        <span className='ms-AnalyticsStats--viewsDivider'> { ` | ` } </span>
        { `${viewerCount} ${locStrings.viewers}` }
      </div>;

  return statsElem;
}

AnalyticsStats.defaultProps = {
  withFacePile: false
}