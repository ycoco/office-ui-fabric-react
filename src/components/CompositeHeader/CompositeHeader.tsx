import * as React from 'react';
import './CompositeHeader.scss';
import { ICompositeHeaderProps, FollowState } from './CompositeHeader.Props';
import { SiteHeader } from '../SiteHeader/index';
import { Button, ButtonType } from 'office-ui-fabric-react/lib/Button';
import { HorizontalNav } from '../HorizontalNav/index';
import { ResponsiveMode, withResponsiveMode } from 'office-ui-fabric-react/lib/utilities/decorators/withResponsiveMode';
import { css } from 'office-ui-fabric-react/lib/utilities/css';
import { ShareIFrame } from './ShareIFrame';
import { MessageBar, MessageBarType } from 'office-ui-fabric-react/lib/MessageBar';

/**
 * Composite Header control that composites the Header and Horizontal Nav
 */
@withResponsiveMode
export class CompositeHeader extends React.Component<ICompositeHeaderProps, { shareVisible: boolean }> {

  constructor(props: ICompositeHeaderProps) {
    super(props);
    this.state = {
      shareVisible: false
    };
    this._onFollowClick = this._onFollowClick.bind(this);
    this._onGoToOutlookClick = this._onGoToOutlookClick.bind(this);
  }

  public render() {
    const share = this.props.shareButton ? (
      <Button buttonType={ ButtonType.command }
        icon='share'
        className='ms-CompositeHeader-collapsible'
        onClick={ this._showShare.bind(this) }>
        <span>{ this.props.responsiveMode >= ResponsiveMode.small && this.props.shareButton.shareLabel }</span>
      </Button>
    ) : null;

    const followProps = this.props.follow;
    const follow = followProps ? (
      <Button buttonType={ ButtonType.command }
        icon={ followProps.followState === FollowState.notFollowing ? 'starEmpty' : 'star' }
        className={ css(
          'ms-CompositeHeader-collapsible',
          {
            'follow-animation-card': followProps.followState === FollowState.transitioning
          }
        ) }
        disabled={ followProps.followState === FollowState.transitioning }
        onClick={ this._onFollowClick }>
        <span>{ this.props.responsiveMode >= ResponsiveMode.small && this.props.follow.followLabel }</span>
      </Button>
    ) : null;

    const renderHorizontalNav = this.props.horizontalNavProps && this.props.horizontalNavProps.items && this.props.horizontalNavProps.items.length;
    let shareDialog = this.props.shareButton ? this._renderShareDialog() : null;
    let messageBar = this._renderMessageBar();

    return (
      <div className={ css(
        'ms-compositeHeader',
        { 'ms-compositeHeader-lgDown': this.props.responsiveMode <= ResponsiveMode.large }
      ) }>
        { messageBar }
        <div className={ css('ms-compositeHeader-topWrapper', { 'noNav': !(renderHorizontalNav) }) }>
          { this.props.responsiveMode > ResponsiveMode.medium && renderHorizontalNav ?
            (<div className='ms-compositeHeader-horizontalNav'>
              <HorizontalNav {...this.props.horizontalNavProps } />
            </div>) :
            (<div className='ms-compositeHeader-placeHolderMargin'> </div>) }
          <div className={ css('ms-compositeHeader-addnCommands') }>
            <div>
              { follow }
              { share }
              { this._renderBackToOutlook() }
            </div>
          </div>
        </div>
        { (shareDialog) }
        <SiteHeader { ...this.props.siteHeaderProps } />

      </div>);
  }

  private _renderBackToOutlook() {
    return this.props.goToOutlook ? (
      <span className='ms-compositeHeader-goToOutlook'>
        <button className='ms-compositeHeaderButton' onClick={ this._onGoToOutlookClick }>
          <span className='ms-compositeHeader-goToOutlookText'>{ this.props.goToOutlook.goToOutlookString }</span>
          <i className='ms-Icon ms-Icon--arrowUpRight'></i>
        </button>
      </span>) : null;
  }

  private _renderShareDialog(): JSX.Element {
    let shareFrame: JSX.Element = null;
    let { shareButton } = this.props;
    let { shareVisible } = this.state;

    if (shareButton && shareVisible) {
      shareFrame = (<ShareIFrame url={ shareButton.url }
        title={ this.props.siteHeaderProps.siteTitle }
        shareLabel={ shareButton.shareLabel }
        shareVisible={ shareVisible }
        onClose={ () => this.setState({ shareVisible: false }) }
        frameClass={'ShareFrame'}
        />);
    }

    return shareFrame;
  }

  private _renderMessageBar() {
    return this.props.messageBarProps ? (
      <MessageBar messageBarType={MessageBarType.warning}
                  actions={this.props.messageBarProps.actions}
                  ariaLabel={this.props.messageBarProps.ariaLabel} >
        {this.props.messageBarProps.message}
      </MessageBar>
    ) : null;
  }

  private _onGoToOutlookClick(ev: React.MouseEvent) {
    if (this.props.goToOutlook.goToOutlookAction) {
      this.props.goToOutlook.goToOutlookAction(ev);
      ev.stopPropagation();
      ev.preventDefault();
    }
  }

  private _showShare(ev: React.MouseEvent) {
    this.setState({ shareVisible: true });
    ev.stopPropagation();
    ev.preventDefault();
  }

  private _onFollowClick(ev: React.MouseEvent) {
    const { followAction, followState } = this.props.follow;
    if (followAction && followState !== FollowState.transitioning) {
      this.props.follow.followAction(ev);
      ev.stopPropagation();
      ev.preventDefault();
    }
  }
}
