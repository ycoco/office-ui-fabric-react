/**
 * @copyright Microsoft Corporation. All rights reserved.
 *
 * @file Analytics Activity component
 */

import * as React from 'react';
import { ActivityItem } from 'office-ui-fabric-react/lib/Components/ActivityItem';
import { IActivity } from '@ms/odsp-graph/lib/services/itemAnalytics/IItemAnalytics';
import './AnalyticsActivity.scss';

export interface IAnalyticsActivityProps {
  activity: IActivity;
  locStrings: IAnalyticsActivityStrings;
}

export interface IAnalyticsActivityStrings {
  accessActivity: string;
}

export const AnalyticsActivity: React.StatelessComponent<IAnalyticsActivityProps> = (props: IAnalyticsActivityProps, context) => {

  const { activity, locStrings } = props;

  return (
    <ActivityItem
      activityPersonas={ [{ imageUrl: activity.actor.user.image }] }
      onRenderActivityDescription={ () => {
        return (
          <div>
            <span className='ms-AnalyticsActivity--name'>
              { activity.actor.user.displayName }
            </span>
            { ` ${activity.activityType === 'Access' ? locStrings.accessActivity : ''}` }
          </div>
        );
      } }
      timeStamp={ activity.activityDateTime }
    />
  );
}