import * as React from 'react';
import './SiteHeader.scss';
import { ISiteHeaderProps } from './SiteHeader.Props';

export interface ISiteHeaderState {

}

export default class SiteHeader extends React.Component<ISiteHeaderProps, ISiteHeaderState> {
  public refs: {
    [key: string]: React.ReactInstance,
    siteLogoImg: HTMLImageElement
  };

  public componentDidMount() {
    if (this.refs.siteLogoImg) {
      let img = this.refs.siteLogoImg as HTMLImageElement;
      img.addEventListener('load', () => img.style.display = 'block');
      img.src = this.props.siteLogo.siteLogoUrl;
    }
  }

  public siteLogo() {
    let img;

    if (this.props.siteLogo) {
      if (this.props.siteLogo.siteLogoUrl) {
        img = <img ref='siteLogoImg' />;
      } else if (this.props.siteLogo.siteBgColor && this.props.siteLogo.siteAcronym) {
        img = <div className='ms-siteHeaderAcronym' style={ { 'backgroundColor': this.props.siteLogo.siteBgColor } }>
            { this.props.siteLogo.siteAcronym }
          </div>;
      }
    }

    return (
      <div className='ms-siteHeaderLogoContainer' style={ { 'borderColor': this.props.siteBannerThemeClassName } }>
        <div className='ms-siteHeaderLogoContainerInner'>
          <a className='ms-Icon ms-Icon--group ms-GroupHeader-defaultLogo'>
            <div className='ms-siteHeaderLogoActual'>{ img }</div>
            </a>
          </div>
        </div>
    );
  }

  public numMembers() {
    return this.props.membersText ? (
      <span>
        <i className='ms-Icon ms-Icon--person'></i>
        <span className='ms-siteHeaderNumMembersText'>{ this.props.membersText }</span>
        </span>
    ) : null;
  }

  public render(): React.ReactElement<ISiteHeaderProps> {
    return (
      <div className='ms-siteHeader' style={ { backgroundColor: this.props.siteBannerThemeClassName } }>
        { this.siteLogo() }
        <div className='ms-siteHeaderSiteInfo'>
          <span className='siteName ms-font-xxl ms-fontColor-white'>{ this.props.siteTitle }</span>
          <span className='siteName ms-font-xs ms-fontColor-white'>{ this.props.groupInfoString }</span>
          </div>
        <div className='ms-siteHeaderMembersInfo ms-fontColor-white'>
          { this.numMembers() }
          </div>
        </div>
    );
  }
}
