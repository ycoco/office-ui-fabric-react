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
import { IFileHoverCardProps } from './FileHoverCard.Props';
import { IFileHoverCardStore, IListener, IAnalyticsResult, AnalyticsResultStatus } from './IFileHoverCardStore';
import { AnalyticsActivity } from './AnalyticsActivity/AnalyticsActivity';
import { AnalyticsActivityList } from './AnalyticsActivityList/AnalyticsActivityList';
import { AnalyticsActionBar } from './AnalyticsActionBar/AnalyticsActionBar';
import './FileHoverCard.scss';

const EXPANDED_CARD_HEIGHT = 340;

export interface IFileHoverCardState {
  itemAnalyticsResult: IAnalyticsResult;
  expandedCardHeight?: number;
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
      itemAnalyticsResult: this._store.getItemAnalytics(this.props.item)
    };
  }

  public componentWillReceiveProps(nextProps: IFileHoverCardProps) {
    if (nextProps.item !== this.props.item) {
      this.setState({
        itemAnalyticsResult: this._store.getItemAnalytics(nextProps.item)
      });
    }
  }

  public componentDidMount() {
    const { item } = this.props;
    const store = this._store;

    // Listen to store change events.
    this._storeListener = store.addListener(() => {
      this.setState({
        itemAnalyticsResult: store.getItemAnalytics(item)
      });
    }, item);
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
      expandedCardHeight: EXPANDED_CARD_HEIGHT
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
    const { itemAnalyticsResult } = this.state;

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
                itemAnalytics: (itemAnalyticsResult && itemAnalyticsResult.data),
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
    const { data, skipToken } = this.state.itemAnalyticsResult;

    if (this._shouldHideExpandCard()) {
      return undefined;
    }

    return (
      <div className='ms-FileHoverCard-expandedCard'>
        <AnalyticsActivityList
          itemAnalytics={ data }
          locStrings={ locStrings }
          moreActivities={ !!skipToken }
          onLoadMoreActivities={ () => this._store.fetchItemAnalytics(this.props.item, skipToken) }
        />
      </div>
    );
  }

  @autobind
  private _shouldHideExpandCard(): boolean {
    if (this.state.itemAnalyticsResult &&
      (this.state.itemAnalyticsResult.status === AnalyticsResultStatus.failed ||
        (this.state.itemAnalyticsResult.data && this.state.itemAnalyticsResult.data.activities.length === 0)
      )
    ) {
      return true;
    }
    return false;
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