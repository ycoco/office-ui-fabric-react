/**
 * @copyright Microsoft Corporation. All rights reserved.
 *
 * @file Analytics Activity List component
 */

import * as React from 'react';
import { List } from 'office-ui-fabric-react/lib/List';
import { Spinner, SpinnerSize } from 'office-ui-fabric-react/lib/Spinner';
import { autobind } from 'office-ui-fabric-react/lib/Utilities';
import { IItemAnalytics } from '@ms/odsp-graph/lib/services/itemAnalytics/IItemAnalytics';
import { AnalyticsActivity, IAnalyticsActivityProps, IAnalyticsActivityStrings } from '../AnalyticsActivity/AnalyticsActivity';
import { AnalyticsStats } from '../AnalyticsStats/AnalyticsStats';
import './AnalyticsActivityList.scss';

export interface IAnalyticsActivityListProps {
  itemAnalytics: IItemAnalytics;
  locStrings: IAnalyticsActivityListStrings;
  moreActivities?: boolean;
  onLoadMoreActivities?: () => void;
}

export interface IAnalyticsActivityListStrings extends IAnalyticsActivityStrings {
  views: string;
  viewers: string;
}

export class AnalyticsActivityList extends React.Component<IAnalyticsActivityListProps, {}> {
  private _activities: IAnalyticsActivityProps[];

  public componentWillUpdate() {
    const { itemAnalytics, locStrings } = this.props;

    this._activities = itemAnalytics && itemAnalytics.activities.map((activity) => {
      return { activity: activity, locStrings: locStrings }
    });
  }

  public render(): JSX.Element {
    const { itemAnalytics, locStrings } = this.props;

    if (!!itemAnalytics) {
      return (
        <div>
          <AnalyticsStats
            itemAnalytics={ itemAnalytics }
            locStrings={ locStrings }
          />
          <List
            items={ this._activities }
            onRenderCell={ this._onRenderCell }
          />
        </div>
      );
    } else {
      return (
        <ContentLoader />
      );
    }
  }

  @autobind
  private _onRenderCell(item: IAnalyticsActivityProps, index: number): JSX.Element {
    return (
      <div className='ms-AnalyticsActivityList--activity'>
        <AnalyticsActivity
          activity={ item.activity }
          locStrings={ item.locStrings }
        />
        {
          this.props.moreActivities && (index === (this._activities.length - 1))
            ? <ContentLoader onLoaded={ this.props.onLoadMoreActivities } />
            : undefined
        }
      </div>
    );
  }
}

interface IContentLoaderProps {
  onLoaded?: () => void;
}

class ContentLoader extends React.Component<IContentLoaderProps, {}> {
  constructor(props) {
    super(props);
  }

  public componentDidMount() {
    if (this.props.onLoaded) {
      this.props.onLoaded();
    }
  }

  public render() {
    return <Spinner size={ SpinnerSize.large } />
  }
}