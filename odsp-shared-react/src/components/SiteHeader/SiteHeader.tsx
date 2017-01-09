import * as React from 'react';
import './SiteHeader.scss';
import { ISiteHeaderProps } from './SiteHeader.Props';
import { Facepile } from 'office-ui-fabric-react/lib/components/Facepile/index';
import { Callout, DirectionalHint } from 'office-ui-fabric-react/lib/components/Callout/index';
import { SiteLogo } from '../SiteLogo/SiteLogo';
import { MembersInfo } from '../MembersInfo/MembersInfo';
import { ISiteLogo } from '../SiteLogo/SiteLogo.Props';
import { IGroupCardProps } from '../GroupCard/GroupCard.Props';
import { assign } from 'office-ui-fabric-react/lib/utilities/object';
import { autobind } from 'office-ui-fabric-react/lib/utilities/autobind';
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
    let { siteTitle, siteLogo, disableSiteLogoFallback, logoOnClick, logoHref, groupInfoString, groupLinks, facepile, showGroupCard, membersInfoProps, enableJoinLeaveGroup, usageGuidelineUrl } = this.props;
    const siteLogoProps: ISiteLogo = {
      siteTitle: siteTitle,
      siteLogoUrl: siteLogo.siteLogoUrl,
      siteAcronym: siteLogo.siteAcronym,
      siteLogoBgColor: siteLogo.siteLogoBgColor,
      disableSiteLogoFallback: disableSiteLogoFallback,
      logoOnClick: logoOnClick,
      logoHref: logoHref,
      groupInfoString: groupInfoString
    };

    // make a copy of siteLogoProps and modify the size property
    let siteLogoForGroupCard: ISiteLogo = assign({}, siteLogoProps);
    siteLogoForGroupCard.size = 50;
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

    const { isCalloutVisible } = this.state;
    return (
      <div
        className={ 'ms-siteHeader ' + (this.props.className ? this.props.className : '') }
        role='banner'
        data-automationid='SiteHeader'>
        <div className='ms-siteHeader-siteLogo'>
          <SiteLogo { ...siteLogoProps} />
        </div>
        <div className='ms-siteHeaderSiteInfo'>
          <span className='ms-siteHeaderSiteName' data-automationid='SiteHeaderTitle'>{
            showGroupCard ? (
              <a
                className='ms-siteHeaderTitleLink ms-font-xxl'
                href='javascript:'
                data-logging-id='SiteHeader.Title' // This will automatically log clicks on this element as <Scenario>.SiteHeader.Title.Click
                onClick={ this._handleOnClickTitle }
                ref={ (menuButton) => this._menuButtonElement = menuButton }
                data-automationid='SiteHeaderGroupCardLink'>
                { siteTitle }
              </a>
            ) : <span className='ms-font-xxl'>{ siteTitle }</span>
          }</span>
          <span className='ms-siteHeaderGroupInfo' data-automationid='SiteHeaderGroupInfo'>{ 
            usageGuidelineUrl ? 
              <a
                className='ms-siteHeaderGroupInfoUsageGuidelineLink'
                href={ usageGuidelineUrl }
                target='_blank'
                data-logging-id='SiteHeader.GroupInfoUsageGuideline' // This will automatically log clicks on this element as <Scenario>.SiteHeader.GroupInfoUsageGuidelines.Click
                data-automationid='siteHeaderGroupInfoUsageGuidelineLink'>
                { groupInfoString }
              </a> : 
              groupInfoString }
          </span>
        </div>
        { facepile && (
          <div className='ms-siteHeaderFacepile'>
            <Facepile { ...facepile } />
          </div>) }
        { membersInfoProps && membersInfoProps.membersText && (
          <div className='ms-siteHeaderMembersInfo'>
            <MembersInfo {...membersInfoProps}/>
          </div>) }
        { isCalloutVisible && showGroupCard && (<Callout
          gapSpace={ 20 }
          isBeakVisible={ false }
          directionalHint={ DirectionalHint.bottomLeftEdge }
          targetElement={ this._menuButtonElement }
          onDismiss= { (ev: any) => { this._onDismissCallout(ev); } }
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

  @autobind
  private _handleOnClickTitle(ev?: React.MouseEvent<HTMLElement>) {
    if (this.props.showGroupCard) {
      this.setState({
        isCalloutVisible: !this.state.isCalloutVisible
      });
    }
  }

}
