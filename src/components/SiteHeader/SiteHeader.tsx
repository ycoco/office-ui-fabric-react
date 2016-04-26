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
      } else if (this.props.siteLogo.siteLogoBgColor && this.props.siteLogo.siteAcronym) {
        img = <div className='ms-siteHeaderAcronym ms-font-xxl' style={ { 'backgroundColor': this.props.siteLogo.siteLogoBgColor } }>
            { this.props.siteLogo.siteAcronym }
          </div>;
      }
    }

    return (
      <div className='ms-siteHeaderLogoContainer'>
        <div className='ms-siteHeaderLogoContainerInner'>
          <a className='ms-Icon ms-Icon--group ms-siteHeader-defaultLogo' onClick={ this._handleOnClick.bind(this) } href={ this.props.logoHref }>
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
        <span className='ms-siteHeaderNumMembersText ms-font-s'>{ this.props.membersText }</span>
        </span>
    ) : null;
  }

  public render(): React.ReactElement<ISiteHeaderProps> {
    return (
      <div className='ms-siteHeader' style={ { 'borderBottomColor': this.props.siteBannerThemeClassName } }>
        { this.siteLogo() }
        <div className='ms-siteHeaderSiteInfo'>
          <span className='siteName ms-font-xxl'>{ this.props.siteTitle }</span>
          <span className='siteName'>{ this.props.groupInfoString }</span>
          </div>
        <div className='ms-siteHeaderMembersInfo'>
          { this.numMembers() }
          </div>
        </div>
    );
  }

  private _handleOnClick(ev?: React.MouseEvent) {
    if (this.props.logoOnClick) {
      this.props.logoOnClick(ev);
      ev.stopPropagation();
      ev.preventDefault();
    }
  }
}
