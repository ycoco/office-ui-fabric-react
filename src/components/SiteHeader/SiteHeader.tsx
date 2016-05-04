import * as React from 'react';
import './SiteHeader.scss';
import { ISiteHeaderProps } from './SiteHeader.Props';
import { css } from '@ms/office-ui-fabric-react/lib/utilities/css';

export interface ISiteHeaderState {
  hideFallbackLogo?: boolean;
}

export default class SiteHeader extends React.Component<ISiteHeaderProps, ISiteHeaderState> {
  public refs: {
    [key: string]: React.ReactInstance,
    siteLogoImg: HTMLImageElement
  };

  private _imgLoadHandler = (() => {
    let img = this.refs.siteLogoImg as HTMLImageElement;
    if (img) {
      img.style.display = 'inline';
      this.setState({ hideFallbackLogo: true });
    }
  }).bind(this);

  constructor(props: ISiteHeaderProps, state?: ISiteHeaderState) {
    super(props, state);
    this.state = { hideFallbackLogo: false };
  }

  public render(): React.ReactElement<ISiteHeaderProps> {
    return (
      <div className={ 'ms-siteHeader ' + (this.props.className ? this.props.className : '') }>
        { this.renderSiteLogo() }
        <div className='ms-siteHeaderSiteInfo'>
          <span className='ms-siteHeaderSiteName ms-font-xxl'>{ this.props.siteTitle }</span>
          <span className='ms-siteHeaderGroupInfo'>{ this.props.groupInfoString }</span>
          </div>
        <div className='ms-siteHeaderMembersInfo'>
          { this.renderNumMembers() }
          </div>
        </div>
    );
  }

  public renderSiteLogo() {
    let img, logoActualAddnStyle;

    if (this.props.siteLogo) {
      if (this.props.siteLogo.siteLogoUrl) {
        img = <img ref='siteLogoImg' src={ this.props.siteLogo.siteLogoUrl } onLoad={ this._imgLoadHandler } />;
      }

      if (this.props.siteLogo.siteLogoBgColor && this.props.siteLogo.siteAcronym) {
        img =
          <div>
            <div className='ms-siteHeaderAcronym ms-font-xxl' style={ { 'backgroundColor': this.props.siteLogo.siteLogoBgColor } }>
              { this.props.siteLogo.siteAcronym }
            </div>
            { img }
          </div>;
      }
    }

    let renderDoughboy = !this.state.hideFallbackLogo && !this.props.disableSiteLogoFallback;
    if (!renderDoughboy) {
        // If not rendering doughboy, logo actual gets a white background to cover
        logoActualAddnStyle = { backgroundColor: 'white' };
    }

    return (
      <div className='ms-siteHeaderLogoContainer'>
        <div className='ms-siteHeaderLogoContainerInner'>
          <a className={ css('ms-siteHeader-defaultLogo', { ' ms-Icon--group': (renderDoughboy), 'ms-Icon': (renderDoughboy) }) } onClick={ this._handleOnClick.bind(this) } href={ this.props.logoHref }>
            <div className='ms-siteHeaderLogoActual' style={ logoActualAddnStyle }>{ img }</div>
            </a>
          </div>
        </div>
    );
  }

  public renderNumMembers() {
    return this.props.membersText ? (
      <span>
        <i className='ms-Icon ms-Icon--person'></i>
        <span className='ms-siteHeaderNumMembersText ms-font-s'>{ this.props.membersText }</span>
        </span>
    ) : null;
  }

  private _handleOnClick(ev?: React.MouseEvent) {
    if (this.props.logoOnClick) {
      this.props.logoOnClick(ev);
      ev.stopPropagation();
      ev.preventDefault();
    }
  }
}
