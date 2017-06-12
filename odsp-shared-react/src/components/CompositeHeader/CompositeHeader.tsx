import * as React from 'react';
import './CompositeHeader.scss';
import { ICompositeHeader, ICompositeHeaderProps } from './CompositeHeader.Props';
import { IHorizontalNav, HorizontalNav } from '../HorizontalNav/index';
import { withResponsiveMode } from 'office-ui-fabric-react/lib/utilities/decorators/withResponsiveMode';
import { autobind } from 'office-ui-fabric-react/lib/Utilities';
import { HeaderLayoutType } from '@ms/odsp-datasources/lib/ChromeOptions';
import {
  ReadOnlyBar,
  HeaderMessageBar,
  OutlookButton,
  ShareDialog
} from './subComponents/index';
import { HeaderForLeftNavSite, HeaderFullBleed } from './layouts/index';
import { Killswitch } from '@ms/odsp-utilities/lib/killswitch/Killswitch';
// the following imports can be deleted after the HeaderLayoutKillSwitch is removed
import { FollowState, IExtendedMessageBarProps } from './CompositeHeader.Props';
import { SiteHeader } from '../SiteHeader/index';
import { CommandButton } from 'office-ui-fabric-react/lib/Button';
import { ResponsiveMode } from 'office-ui-fabric-react/lib/utilities/decorators/withResponsiveMode';
import { css } from 'office-ui-fabric-react/lib/Utilities';
import { ShareIFrame } from './ShareIFrame';
import { MessageBar, MessageBarType } from 'office-ui-fabric-react/lib/MessageBar';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { ICompositeHeaderLayoutProps } from './layouts/ICompositeHeaderLayoutProps';
import { SiteReadOnlyState } from '@ms/odsp-datasources/lib/dataSources/site/SiteDataSource';
// end of imports that can be deleted after the HeaderLayoutKillSwitch is removed

/**
 * Composite Header control that composites a set of sub components such as Header and Horizontal Nav
 */
@withResponsiveMode
export class CompositeHeader extends React.Component<ICompositeHeaderProps, { shareVisible: boolean }> implements ICompositeHeader {
  private static HeaderLayoutKillSwitchId = 'CE84DDCD-4FC5-4631-A0FB-5BBD521FA2DB';
  private _horizontalNavInstance: IHorizontalNav;

  constructor(props: ICompositeHeaderProps) {
    super(props);
    this.state = {
      shareVisible: false
    };
  }

  public render() {
    if (!Killswitch.isActivated(CompositeHeader.HeaderLayoutKillSwitchId)) {
      const renderHorizontalNav = this.props.horizontalNavProps &&
        this.props.horizontalNavProps.items &&
        this.props.horizontalNavProps.items.length;
      const horizontalNav = renderHorizontalNav &&
        <HorizontalNav { ...this.props.horizontalNavProps } ref={ this._updateHorizontalNavReference } />;

      const readOnlyBar = this.props.siteReadOnlyProps &&
        this.props.siteReadOnlyProps.isSiteReadOnly &&
        <ReadOnlyBar siteReadOnlyProps={ this.props.siteReadOnlyProps } />;

      const messageBar = this.props.messageBarProps && <HeaderMessageBar messageBarProps={ this.props.messageBarProps } />;

      const policyBar = this.props.policyBarProps && <HeaderMessageBar messageBarProps={ this.props.policyBarProps } />;

      const goToOutlookButton = this.props.goToOutlook && <OutlookButton {...this.props.goToOutlook} />;

      const shareDialog = this.props.shareButton && this.state.shareVisible &&
        <ShareDialog title={ this.props.siteHeaderProps.siteTitle }
          shareButton={ this.props.shareButton }
          onCloseCallback={ this._onShareDialogClose }
        />;

      if (this.props.shareButton &&
        !this.props.shareButton.onShare
      ) {
        this.props.shareButton.onShare = this._showShare
      }

      const share = this.props.shareButton;

      const headerLayoutProps: ICompositeHeaderLayoutProps = {
        siteHeaderProps: { ...{ ...this.props.siteHeaderProps, responsiveMode: this.props.responsiveMode } },
        horizontalNav: horizontalNav,
        readOnlyBar: readOnlyBar,
        messageBar: messageBar,
        policyBar: policyBar,
        follow: this.props.follow,
        share: share,
        goToOutlookButton: goToOutlookButton,
        shareDialog: shareDialog,
        searchBox: this.props.searchBox,
        responsiveMode: this.props.responsiveMode
      }

      return (
        this.props.layout === HeaderLayoutType.FULLBLEED ?
          <HeaderFullBleed {...headerLayoutProps} /> : <HeaderForLeftNavSite {...headerLayoutProps} />
      );
    } else {
      // keep exactly the same old CompositeHeader code
      const share = this.props.shareButton ? (
        <CommandButton
          iconProps={{ iconName: 'Share' }}
          className='ms-CompositeHeader-collapsible'
          onClick={ this._showShare }
          text={ this.props.responsiveMode >= ResponsiveMode.small && this.props.shareButton.shareLabel }>
        </CommandButton>
      ) : undefined;

      const followProps = this.props.follow;
      const follow = followProps ? (
        <CommandButton
          text={
            this.props.responsiveMode >= ResponsiveMode.small &&
            (followProps.notFollowedLabel && followProps.followState !== FollowState.followed ?
              followProps.notFollowedLabel :
              followProps.followLabel)
          }
          iconProps={{ iconName: followProps.followState === FollowState.notFollowing ? 'FavoriteStar' : 'FavoriteStarFill' }}
          className={ css(
            'ms-CompositeHeader-collapsible',
            {
              'follow-animation-card': followProps.followState === FollowState.transitioning
            }
          ) }
          disabled={ followProps.followState === FollowState.transitioning }
          ariaLabel={ followProps.followState === FollowState.followed ? followProps.followedAriaLabel : followProps.notFollowedAriaLabel }
          onClick={ this._onFollowClick }
          aria-pressed={ followProps.followState === FollowState.followed }
          aria-busy={ followProps.followState === FollowState.transitioning }
          title={ followProps.followState === FollowState.followed ? followProps.followedHoverText : followProps.notFollowedHoverText }
        >
        </CommandButton>
      ) : undefined;

      const renderHorizontalNav = this.props.horizontalNavProps && this.props.horizontalNavProps.items && this.props.horizontalNavProps.items.length;
      let shareDialog = this.props.shareButton ? this._renderShareDialog() : undefined;
      let readOnlyBar = this._renderReadOnlyBar();
      let statusBar = this._renderStatusBar();
      let policyBar = this._renderPolicyBar();

      return (
        <div className={ css(
          'ms-compositeHeader',
          { 'ms-compositeHeader-lgDown': this.props.responsiveMode <= ResponsiveMode.large }
        ) }>
          { readOnlyBar }
          { statusBar }
          { policyBar }
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
          <div className="ms-compositeHeader-siteAndActionsContainer">
            <SiteHeader { ...this.props.siteHeaderProps } />
            { this.props.searchBox ?
              <div className="ms-compositeHeader-searchBoxContainer">
                { this.props.searchBox }
              </div>
              : null
            }
          </div>
        </div>);
    }
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

  @autobind
  private _updateHorizontalNavReference(component: IHorizontalNav) {
    this._horizontalNavInstance = component;
  }

  @autobind
  private _onShareDialogClose() {
    this.setState({ shareVisible: false });
  }

  @autobind
  private _showShare(ev: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) {
    this.setState({ shareVisible: true });
    ev.stopPropagation();
    ev.preventDefault();
  }

  // the following functions can be deleted after the HeaderLayoutKillSwitch is removed
  private _renderBackToOutlook() {
    return this.props.goToOutlook ? (
      <span className='ms-compositeHeader-goToOutlook'>
        <button className='ms-compositeHeaderButton' onClick={ this._onGoToOutlookClick }>
          <span className='ms-compositeHeader-goToOutlookText'>{ this.props.goToOutlook.goToOutlookString }</span>
          <i className='ms-compositeHeader-goToOutlookIcon ms-Icon ms-Icon--ArrowUpRight8'></i>
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
        frameClass={ 'ShareFrame' }
      />);
    }

    return shareFrame;
  }

  private _renderReadOnlyBar(): JSX.Element {
    if (this.props.siteReadOnlyProps && this.props.siteReadOnlyProps.isSiteReadOnly) {
      // default to the generic read only string
      let readOnlyString: string = this.props.siteReadOnlyProps.siteReadOnlyString;
      let readOnlyState: SiteReadOnlyState = this.props.siteReadOnlyProps.siteReadOnlyState;

      if (readOnlyState !== undefined && readOnlyState !== null && readOnlyState !== SiteReadOnlyState.unknown) {
        // the siteIsMovingString and siteMoveCompletedString are optional and may not be set
        if (readOnlyState === SiteReadOnlyState.siteMoveInProgress && this.props.siteReadOnlyProps.siteIsMovingString) {
          readOnlyString = this.props.siteReadOnlyProps.siteIsMovingString;
        } else if (readOnlyState === SiteReadOnlyState.siteMoveComplete && this.props.siteReadOnlyProps.siteMoveCompletedString) {
          readOnlyString = this.props.siteReadOnlyProps.siteMoveCompletedString;
        }
      }

      return (
        <MessageBar messageBarType={ MessageBarType.warning } >
          { readOnlyString }
        </MessageBar>
      );
    } else {
      return undefined;
    }
  }

  private _renderStatusBar(): JSX.Element {
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

  private _renderPolicyBar(): JSX.Element {
    if (this.props.policyBarProps) {
      let link: JSX.Element = this._renderMessageBarLink(this.props.policyBarProps);

      return (
        <MessageBar messageBarType={ MessageBarType.warning }
          ariaLabel={ this.props.policyBarProps.ariaLabel } >
          { this.props.policyBarProps.message }
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

  @autobind
  private _onGoToOutlookClick(ev: React.MouseEvent<HTMLElement>) {
    if (this.props.goToOutlook.goToOutlookAction) {
      this.props.goToOutlook.goToOutlookAction(ev);
      ev.stopPropagation();
      ev.preventDefault();
    }
  }

  @autobind
  private _onFollowClick(ev: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) {
    const { followAction, followState } = this.props.follow;
    if (followAction && followState !== FollowState.transitioning) {
      followAction(ev);
      ev.stopPropagation();
      ev.preventDefault();
    }
  }
  // end of functions that can be deleted after the HeaderLayoutKillSwitch is removed
}
