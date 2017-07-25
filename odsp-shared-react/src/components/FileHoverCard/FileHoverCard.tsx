/**
 * @copyright Microsoft Corporation. All rights reserved.
 *
 * @file File Hover Card component
 */

import * as React from 'react';
import {
  HoverCard,
  IExpandingCardProps
} from 'office-ui-fabric-react/lib/HoverCard';
import { BaseComponent, autobind } from 'office-ui-fabric-react/lib/Utilities';
import { Spinner, SpinnerSize } from 'office-ui-fabric-react/lib/Spinner';
import { IFileHoverCardProps } from './FileHoverCard.Props';
import { IFileHoverCardStore, IListener } from './IFileHoverCardStore';
import { IItemAnalytics } from '@ms/odsp-graph/lib/services/itemAnalytics/IItemAnalytics';
import { AnalyticsActivity } from './AnalyticsActivity/AnalyticsActivity';
import { AnalyticsActivityList } from './AnalyticsActivityList/AnalyticsActivityList';
import { AnalyticsActionBar } from './AnalyticsActionBar/AnalyticsActionBar';
import './FileHoverCard.scss';

export interface IFileHoverCardState {
  itemAnalytics: IItemAnalytics;
}

export interface IFileHoverCardContext {
  fileHoverCardStore: IFileHoverCardStore;
}

export class FileHoverCard extends BaseComponent<IFileHoverCardProps, IFileHoverCardState> {
  private _store: IFileHoverCardStore;
  private _storeListener: IListener;
  private _fetchCalledOnce: boolean;

  public static contextTypes = {
    fileHoverCardStore: React.PropTypes.object.isRequired,
  };

  constructor(props: IFileHoverCardProps, context: IFileHoverCardContext) {
    super(props, context);

    this._store = context.fileHoverCardStore;
    this._fetchCalledOnce = false;

    this.state = {
      itemAnalytics: this._store.getItemAnalytics(this.props.item)
    };
  }

  public componentWillReceiveProps(nextProps: IFileHoverCardProps) {
    if (nextProps.item !== this.props.item) {
      this.setState({
        itemAnalytics: this._store.getItemAnalytics(nextProps.item)
      });
    }
  }

  public componentDidMount() {
    const { item } = this.props;
    const store = this._store;

    // Listen to store change events.
    this._storeListener = store.addListener(() => {
      this.setState({
        itemAnalytics: store.getItemAnalytics(item)
      });
    }, item);
  }

  public componentDidUpdate() {
    if (!this.state.itemAnalytics) {
      this._store.fetchItemAnalytics(this.props.item);
    }
  }

  public componentWillUnmount() {
    this._store.removeListener(this._storeListener);
  }

  public render(): JSX.Element {
    const { children } = this.props;

    const expandingCardProps: IExpandingCardProps = {
      onRenderCompactCard: this._onRenderCompactContent,
      onRenderExpandedCard: this._onRenderExpandedContent,
      compactCardHeight: 176,
      expandedCardHeight: 340
    };

    return (
      <HoverCard
        expandingCardProps={ expandingCardProps }
        expandedCardOpenDelay={ 1500 }
      >
        { children }
      </HoverCard>
    );
  }

  @autobind
  private _onRenderCompactContent(): JSX.Element {
    const { itemTitle, currentUserActivity, actionBarItems, locStrings } = this.props;
    const { itemAnalytics } = this.state;

    return (
      <div ref={ this._onCompactCardRef } className='ms-FileHoverCard-compactCard'>
        <div className='ms-FileHoverCard-compactCard--title'>
          { itemTitle }
        </div>
        <div className='ms-FileHoverCard-compactCard--activity'>
          <AnalyticsActivity
            activity={ currentUserActivity }
            locStrings={ locStrings }
          />
        </div>
        <div className='ms-FileHoverCard-compactCard--actionBar'>
          <AnalyticsActionBar
            analyticsStats={
              {
                itemAnalytics: itemAnalytics,
                onClick: this._onView,
                locStrings: locStrings
              }
            }
            items={ actionBarItems }
            farItems={
              [
                {
                  key: 'details',
                  name: locStrings.details,
                  onClick: this._onDetails
                }
              ]
            }
          />
        </div>
      </div>
    );
  }

  @autobind
  private _onRenderExpandedContent(item: any): JSX.Element {
    const { locStrings } = this.props;
    const { itemAnalytics } = this.state;

    if (!itemAnalytics) {
      return (
        <div className='ms-FileHoverCard-expandedCard'>
          <Spinner size={ SpinnerSize.large } />
        </div>
      );
    }

    return (
      <div className='ms-FileHoverCard-expandedCard'>
        <AnalyticsActivityList
          itemAnalytics={ itemAnalytics }
          locStrings={ locStrings }
        />
      </div>
    );
  }

  @autobind
  private _onCompactCardRef() {
    if (!this._fetchCalledOnce) {
      this._fetchCalledOnce = true;
      this._store.fetchItemAnalytics(this.props.item);
    }
  }

  @autobind
  private _onView(ev: React.MouseEvent<HTMLElement>) {
    this.props.onView(ev, this.props);

    ev.stopPropagation();
    ev.preventDefault();
  }

  @autobind
  private _onDetails(ev: React.MouseEvent<HTMLElement>) {
    this.props.onDetails(ev, this.props);

    ev.stopPropagation();
    ev.preventDefault();
  }
}