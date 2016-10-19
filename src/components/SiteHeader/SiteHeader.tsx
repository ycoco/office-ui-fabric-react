import * as React from 'react';
import './SiteHeader.scss';
import { ISiteHeaderProps } from './SiteHeader.Props';
import { Facepile } from 'office-ui-fabric-react/lib/components/Facepile/index';
import { Callout, DirectionalHint } from 'office-ui-fabric-react/lib/components/Callout/index';
import { SiteLogo } from '../SiteLogo/SiteLogo';
import { MemberCount } from '../MemberCount/MemberCount';
import { ISiteLogo } from '../SiteLogo/SiteLogo.Props';
import { GroupCard } from '../GroupCard/GroupCard';
import { IGroupCardProps } from '../GroupCard/GroupCard.Props';
import { assign } from 'office-ui-fabric-react/lib/utilities/object';
import { autobind } from 'office-ui-fabric-react/lib/utilities/autobind';

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
    let { siteTitle, siteLogo, disableSiteLogoFallback, logoOnClick, logoHref, groupInfoString, groupLinks, facepile, showGroupCard, membersText, __goToMembers } = this.props;
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
      membersText: membersText,
      goToMembersAction: __goToMembers ? __goToMembers.goToMembersAction : undefined
    };

    const { isCalloutVisible } = this.state;
    return (
      <div
        className={ 'ms-siteHeader ' + (this.props.className ? this.props.className : '') }
        role='banner'>
        <div className='ms-siteHeader-siteLogo'>
          <SiteLogo { ...siteLogoProps} />
        </div>
        <div className='ms-siteHeaderSiteInfo'>
          <span className='ms-siteHeaderSiteName'>{
            showGroupCard ? (
              <a
                className='ms-siteHeaderTitleLink ms-font-xxl'
                href='javascript:'
                onClick={ this._handleOnClickTitle }
                ref={ (menuButton) => this._menuButtonElement = menuButton }>
                { siteTitle }
              </a>
            ) : <span className='ms-font-xxl'>{ siteTitle }</span>
          }</span>
          <span className='ms-siteHeaderGroupInfo'>{ groupInfoString }</span>
        </div>
        { facepile && (
          <div className='ms-siteHeaderFacepile'>
            <Facepile { ...facepile } />
          </div>) }
        { this.props.membersText && (
          <div className='ms-siteHeaderMembersInfo '>
            <MemberCount
              membersText = { membersText }
              goToMembersAction = { __goToMembers ? __goToMembers.goToMembersAction : undefined }
            />
          </div>) }
        { isCalloutVisible && showGroupCard && (<Callout
          gapSpace={ 20 }
          isBeakVisible={ false }
          directionalHint={ DirectionalHint.bottomLeftEdge }
          targetElement={ this._menuButtonElement }
          onDismiss= { (ev: any) => { this._onDismissCallout(ev); } }
          >
          <GroupCard {...groupCardProps} />
        </Callout>
        ) }

      </div>
    );
  }

  private _onDismissCallout(ev?: React.MouseEvent) {
    this.setState({
      isCalloutVisible: false
    });
  }

  @autobind
  private _handleOnClickTitle(ev?: React.MouseEvent) {
    if (this.props.showGroupCard) {
      this.setState({
        isCalloutVisible: !this.state.isCalloutVisible
      });
    }
  }

}
