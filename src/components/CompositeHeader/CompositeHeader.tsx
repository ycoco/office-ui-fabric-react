import * as React from 'react';
import './CompositeHeader.scss';
import { FollowState, ICompositeHeader, ICompositeHeaderProps, IExtendedMessageBarProps } from './CompositeHeader.Props';
import { SiteHeader } from '../SiteHeader/index';
import { Button, ButtonType } from 'office-ui-fabric-react/lib/Button';
import { HorizontalNav, IHorizontalNav } from '../HorizontalNav/index';
import { ResponsiveMode, withResponsiveMode } from 'office-ui-fabric-react/lib/utilities/decorators/withResponsiveMode';
import { css } from 'office-ui-fabric-react/lib/utilities/css';
import { ShareIFrame } from './ShareIFrame';
import { MessageBar, MessageBarType } from 'office-ui-fabric-react/lib/MessageBar';
import { Link } from 'office-ui-fabric-react/lib/Link';

/**
 * Composite Header control that composites the Header and Horizontal Nav
 */
@withResponsiveMode
export class CompositeHeader extends React.Component<ICompositeHeaderProps, { shareVisible: boolean }> implements ICompositeHeader {
  private _horizontalNavInstance: IHorizontalNav;

  constructor(props: ICompositeHeaderProps) {
    super(props);
    this.state = {
      shareVisible: false
    };

    this._onFollowClick = this._onFollowClick.bind(this);
    this._onGoToOutlookClick = this._onGoToOutlookClick.bind(this);
    this._updateHorizontalNavReference = this._updateHorizontalNavReference.bind(this);
  }

  public render() {
    const share = this.props.shareButton ? (
      <Button buttonType={ ButtonType.command }
        icon='share'
        className='ms-CompositeHeader-collapsible'
        onClick={ this._showShare.bind(this) }>
        <span>{ this.props.responsiveMode >= ResponsiveMode.small && this.props.shareButton.shareLabel }</span>
      </Button>
    ) : undefined;

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
        ariaLabel={ followProps.followState === FollowState.followed ? followProps.followedAriaLabel : followProps.notFollowedAriaLabel }
        onClick={ this._onFollowClick }
        rootProps={ {
          'aria-pressed': followProps.followState === FollowState.followed,
          'aria-busy': followProps.followState === FollowState.transitioning
        } }>
        <span>{ this.props.responsiveMode >= ResponsiveMode.small && this.props.follow.followLabel }</span>
      </Button>
    ) : undefined;

    const renderHorizontalNav = this.props.horizontalNavProps && this.props.horizontalNavProps.items && this.props.horizontalNavProps.items.length;
    let shareDialog = this.props.shareButton ? this._renderShareDialog() : undefined;
    let readOnlyBar = this._renderReadOnlyBar();
    let messageBar = this._renderMessageBar();

    return (
      <div className={ css(
        'ms-compositeHeader',
        { 'ms-compositeHeader-lgDown': this.props.responsiveMode <= ResponsiveMode.large }
      ) }>
        { readOnlyBar}
        { messageBar }
        <div className={ css('ms-compositeHeader-topWrapper', { 'noNav': !(renderHorizontalNav) }) }>
          { this.props.responsiveMode > ResponsiveMode.medium && renderHorizontalNav ?
            (<div className='ms-compositeHeader-horizontalNav'>
              <HorizontalNav {...this.props.horizontalNavProps } ref={ this._updateHorizontalNavReference } />
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

  /**
   * @inheritDoc
   * @see ICompositeHeader.measureNavLayout()
   */
  public measureNavLayout() {
    if (this._horizontalNavInstance) {
      this._horizontalNavInstance.measureLayout();
    }
  }

  private _updateHorizontalNavReference(component: IHorizontalNav) {
    this._horizontalNavInstance = component;
  }

  private _renderBackToOutlook() {
    return this.props.goToOutlook ? (
      <span className='ms-compositeHeader-goToOutlook'>
        <button className='ms-compositeHeaderButton' onClick={ this._onGoToOutlookClick }>
          <span className='ms-compositeHeader-goToOutlookText'>{ this.props.goToOutlook.goToOutlookString }</span>
          <i className='ms-Icon ms-Icon--arrowUpRight'></i>
        </button>
      </span>) : undefined;
  }

  private _renderShareDialog(): JSX.Element {
    let shareFrame: JSX.Element = undefined;
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

  private _renderReadOnlyBar(): JSX.Element {
    if (this.props.siteReadOnlyProps && this.props.siteReadOnlyProps.isSiteReadOnly) {
      return (
        <MessageBar messageBarType={ MessageBarType.warning } >
          { this.props.siteReadOnlyProps.siteReadOnlyString }
        </MessageBar>
      );
    } else {
      return undefined;
    }
  }

  private _renderMessageBar(): JSX.Element {
    if (this.props.messageBarProps) {
      let link: JSX.Element = this._renderMessageBarLink(this.props.messageBarProps);

      return (
        <MessageBar messageBarType={ MessageBarType.warning }
                    ariaLabel={ this.props.messageBarProps.ariaLabel } >
          { this.props.messageBarProps.message }
          { link }
        </MessageBar>
      );
    } else {
      return undefined;
    }
  }

  private _renderMessageBarLink(messageBarProps: IExtendedMessageBarProps): JSX.Element {
    let target: string = messageBarProps.linkTarget;
    let text: string = messageBarProps.linkText || messageBarProps.linkTarget;

    if (text && target) {
      return (
        <Link href={ target } className='ms-MessageBar-link'>{ text }</Link>
      );
    } else {
      return undefined;
    }
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
