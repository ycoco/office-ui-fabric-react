import * as React from 'react';
import './SiteHeader.scss';
import { ISiteHeaderProps } from './SiteHeader.Props';
import { Callout, DirectionalHint } from 'office-ui-fabric-react/lib/components/Callout/index';
import { ResponsiveMode } from 'office-ui-fabric-react/lib/utilities/decorators/withResponsiveMode';
import { SiteLogo } from '../SiteLogo/SiteLogo';
import { ISiteLogo } from '../SiteLogo/SiteLogo.Props';
import { IGroupCardProps } from '../GroupCard/GroupCard.Props';
import { assign, autobind, css } from 'office-ui-fabric-react/lib/Utilities';
import { ReactDeferredComponent, IReactDeferredComponentProps } from '../ReactDeferredComponent/index';

export interface ISiteHeaderState {
  hideFallbackLogo?: boolean;
  isCalloutVisible?: boolean;
}

/**
 * SP shared Site Header control used in Doclibs, SP home page, SP Singleton page, etc.
 */
export class SiteHeader extends React.Component<ISiteHeaderProps, ISiteHeaderState> {
  public refs: {
    [key: string]: React.ReactInstance
  };

  private _menuButtonElement: HTMLElement;

  constructor(props: ISiteHeaderProps, state?: ISiteHeaderState) {
    super(props, state);
    this.state = { hideFallbackLogo: false, isCalloutVisible: false };
  }

  public render(): React.ReactElement<ISiteHeaderProps> {
    let { siteTitle, siteLogo, disableSiteLogoFallback, logoOnClick, logoHref, groupInfoString, groupLinks, facepile, showGroupCard, membersInfoProps, enableJoinLeaveGroup } = this.props;
    const siteLogoProps: ISiteLogo = {
      siteTitle: siteTitle,
      siteLogoUrl: siteLogo.siteLogoUrl,
      siteAcronym: siteLogo.siteAcronym,
      siteLogoBgColor: siteLogo.siteLogoBgColor,
      disableSiteLogoFallback: disableSiteLogoFallback,
      logoOnClick: logoOnClick,
      logoHref: logoHref,
      groupInfoString: groupInfoString,
      size: this.props.compact && 64
    };

    // make a copy of siteLogoProps and modify the size property
    let siteLogoForGroupCard: ISiteLogo = assign({}, siteLogoProps);
    siteLogoForGroupCard.roundedCorners = true;

    let groupCardProps: IGroupCardProps = {
      title: siteTitle,
      links: groupLinks,
      siteLogo: siteLogoForGroupCard,
      facepile: facepile,
      infoText: groupInfoString,
      membersInfoProps: membersInfoProps,
      enableJoinLeaveGroup: enableJoinLeaveGroup
    };
    const groupCardPath = '@ms/odsp-shared-react/lib/components/GroupCard/GroupCard';
    if (this.props.moduleLoader) {
      this.props.moduleLoader.parse = (module: { path: { GroupCard: typeof React.Component } }) => {
        return module[groupCardPath] && module[groupCardPath].GroupCard;
      };
    }
    let deferredgroupCardProps: IReactDeferredComponentProps = {
      modulePath: groupCardPath,
      moduleLoader: this.props.moduleLoader,
      waitPLT: false, // because group card starts loading when user clicks site title when is guaranteed after PLT
      props: groupCardProps
    };
    let deferredgroupCard = <ReactDeferredComponent { ...deferredgroupCardProps } />;
    const groupInfo = this._renderGroupInfo();
    const siteName = this._renderSiteName();

    const { isCalloutVisible } = this.state;

    return (
      <div
        className={ css('ms-siteHeader',
          this.props.className ? this.props.className : '',
          this.props.compact ? 'compact' : '') }
        role='banner'
        data-automationid='SiteHeader'>

        { (!this.props.compact || this.props.responsiveMode > ResponsiveMode.medium) && (
          <div className='ms-siteHeader-siteLogo'>
            <SiteLogo { ...siteLogoProps} />
          </div>) }

        <div className={
          css(
            'ms-siteHeader-siteInfo',
            { 'renderHorizontally': !!this.props.compact && this.props.responsiveMode > ResponsiveMode.large })
        }>
          { siteName }
          { groupInfo }
        </div>

        { isCalloutVisible && showGroupCard && (<Callout
          gapSpace={ 20 }
          isBeakVisible={ false }
          directionalHint={ DirectionalHint.bottomLeftEdge }
          targetElement={ this._menuButtonElement }
          onDismiss={ (ev: any) => { this._onDismissCallout(ev); } }
        >
          { deferredgroupCard }
        </Callout>
        ) }

      </div>
    );
  }

  private _onDismissCallout(ev?: React.MouseEvent<HTMLElement>) {
    this.setState({
      isCalloutVisible: false
    });
  }

  private _renderSiteName(): JSX.Element {
    let siteNameFontClass;
    if (!this.props.compact || this.props.responsiveMode > ResponsiveMode.large) {
      siteNameFontClass = 'ms-font-xxl';
    } else if (this.props.responsiveMode <= ResponsiveMode.small) {
      siteNameFontClass = 'ms-font-l';
    } else {
      siteNameFontClass = 'ms-font-xl';
    }

    return (
      <span className={ css('ms-siteHeader-siteName', siteNameFontClass) } data-automationid='SiteHeaderTitle'>
        { this.props.showGroupCard ?
          (<a className={ 'ms-siteHeader-titleLink' }
            href='javascript:'
            data-logging-id='SiteHeader.Title' // This will automatically log clicks on this element as <Scenario>.SiteHeader.Title.Click
            onClick={ this._handleOnClickTitle }
            ref={ (menuButton) => this._menuButtonElement = menuButton }
            data-automationid='SiteHeaderGroupCardLink'>
            { this.props.siteTitle }
          </a>
          ) : <span>{ this.props.siteTitle }</span>
        }</span>);
  }

  private _renderGroupInfo(): JSX.Element {
    if (this.props.usageGuidelineUrl) {
      return (
        <span className='ms-siteHeader-groupInfo' data-automationid='SiteHeaderGroupInfo' dangerouslySetInnerHTML={ { __html: this.props.groupInfoString } }></span>);
    } else {
      return (
        <span className='ms-siteHeader-groupInfo' data-automationid='SiteHeaderGroupInfo'>{ this.props.groupInfoString }</span>);
    }
  }

  @autobind
  private _handleOnClickTitle(ev?: React.MouseEvent<HTMLElement>) {
    if (this.props.showGroupCard) {
      this.setState({
        isCalloutVisible: !this.state.isCalloutVisible
      });
    }
  }

}
