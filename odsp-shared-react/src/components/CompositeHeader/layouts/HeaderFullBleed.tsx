import * as React from 'react';
import { css, autobind } from 'office-ui-fabric-react/lib/Utilities';
import { ResponsiveMode } from 'office-ui-fabric-react/lib/utilities/decorators/withResponsiveMode';
import { FocusZone, FocusZoneDirection } from 'office-ui-fabric-react/lib/FocusZone';
import { ContextualMenu, DirectionalHint, IContextualMenuItem } from 'office-ui-fabric-react/lib/ContextualMenu';
import { ICompositeHeaderLayoutProps } from './ICompositeHeaderLayoutProps';
import { SiteHeader } from '../../SiteHeader/index';
import { ShareButton, FollowButton } from '../subComponents/index';
import { FollowState } from '../CompositeHeader.Props';
import '../CompositeHeader.scss';
import './HeaderFullBleed.scss';

export interface IHeaderFullBleedStates {
  showActionMenu?: boolean
}

/**
 * Composite header layout that takes the full width of the page, used in sites with top nav only.
 * This is currently used by communication site.
 */
export class HeaderFullBleed extends React.Component<ICompositeHeaderLayoutProps, IHeaderFullBleedStates> {
  private _actionMenuElement;

  constructor() {
    super();
    this.state = { showActionMenu: false };
  }

  public render() {
    const siteHeaderProps = this.props.siteHeaderProps;
    siteHeaderProps.compact = true;

    return (
      <div className={ css(
        'ms-compositeHeader',
        { 'ms-compositeHeader-lgDown': this.props.responsiveMode <= ResponsiveMode.large },
        { 'ms-compositeHeader-mobile': this.props.responsiveMode <= ResponsiveMode.small }
      ) }>
        { this.props.readOnlyBar }
        { this.props.messageBar }
        { this.props.policyBar }

        { this.props.shareDialog }
        <div className='ms-compositeHeader-siteAndActionsContainer'>
          <div className='ms-compositeHeader-headerAndNavContainer'>
            <SiteHeader { ...this.props.siteHeaderProps } />
            { this.props.responsiveMode > ResponsiveMode.large &&
              !!this.props.horizontalNav &&
              this.props.horizontalNav }
          </div>
          <div className='ms-compositeHeader-actionsContainer'>
            <div className='ms-compositeHeader-addnCommands'>
              { this._renderShareFollow() }
            </div>
            { this.props.searchBox ?
              <div className="ms-compositeHeader-searchBoxContainer">
                { this.props.searchBox }
              </div>
              : null
            }
          </div>
        </div>
      </div>);
  }

  private _renderShareFollow(): JSX.Element {
    if (this.props.responsiveMode > ResponsiveMode.medium) {
      const shareButton = this.props.share &&
        <ShareButton { ...{ ...this.props.share, responsiveMode: this.props.responsiveMode } } />;

      const followButton = this.props.follow &&
        <FollowButton { ...{ ...this.props.follow, responsiveMode: this.props.responsiveMode } } />;

      return (
        <div>
          { followButton }
          { shareButton }
        </div>);
    } else {
      return this._renderActionButton();
    }
  }

  private _renderActionButton(): JSX.Element {
    const actionItems = [];
    const followProps = this.props.follow;
    if (followProps) {
      const followMenuItem: IContextualMenuItem = {
        name: (followProps.notFollowedLabel && followProps.followState !== FollowState.followed ?
          followProps.notFollowedLabel :
          followProps.followLabel),
        key: 'follow',
        icon: followProps.followState === FollowState.notFollowing ? 'FavoriteStar' : 'FavoriteStarFill',
        onClick: followProps.followState !== FollowState.transitioning ? followProps.followAction : undefined
      }
      actionItems.push(followMenuItem);
    }

    if (this.props.share) {
      const shareMenuItem: IContextualMenuItem = {
        name: this.props.share.shareLabel,
        key: 'share',
        icon: 'Share',
        onClick: this.props.share.onShare
      }
      actionItems.push(shareMenuItem);
    }

    return (
      actionItems.length > 0 ?
        <div>
          <i className={ 'ms-compositeHeader-mobileActionButton ms-Icon ms-Icon--More' }
            role={ 'button' }
            onClick={ this._ShowMenu }
            ref={ (d) => { this._actionMenuElement = d; } }></i>
          { this.state.showActionMenu &&
            <FocusZone direction={ FocusZoneDirection.vertical }>
              <ContextualMenu
                targetElement={ this._actionMenuElement }
                directionalHint={ DirectionalHint.bottomLeftEdge }
                items={ actionItems }
                isBeakVisible={ false }
                gapSpace={ 0 }
                onDismiss={ this._hideMenu }
                className='ms-EditNav_contextMenu'
                />
            </FocusZone>
          }
        </div>
        : undefined
    );
  }

  @autobind
  private _ShowMenu(): void {
    this.setState({ showActionMenu: true });
  }

  @autobind
  private _hideMenu(): void {
    this.setState({ showActionMenu: false });
  }
}