/**
 * @copyright Microsoft Corporation. All rights reserved.
 *
 * @file Analytics ActionBar component
 */

import * as React from 'react';
import { CommandBar } from 'office-ui-fabric-react/lib/CommandBar';
import { IContextualMenuItem } from 'office-ui-fabric-react/lib/ContextualMenu';
import { AnalyticsStats, IAnalyticsStatsProps } from '../AnalyticsStats/AnalyticsStats';
import './AnalyticsActionBar.scss';

export interface IAnalyticsActionBarProps {
  items: IContextualMenuItem[];
  farItems: IContextualMenuItem[];
  analyticsStats: IAnalyticsStatsProps;
}

export const AnalyticsActionBar: React.StatelessComponent<IAnalyticsActionBarProps> = (props: IAnalyticsActionBarProps) => {

  const { items, farItems, analyticsStats } = props;

  return (
    <div>
      <AnalyticsStats
        withFacePile={ true }
        {...analyticsStats}
      />
      <CommandBar
        className={ 'ms-AnalyticsActionBar--bar' }
        items={ items }
        farItems={ farItems }
      />
    </div>
  );
}