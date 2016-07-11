import * as React from 'react';
import './SiteHeader.scss';
import { ISiteHeaderProps } from './SiteHeader.Props';
import { Button, ButtonType } from '@ms/office-ui-fabric-react/lib/Button';
import { css } from '@ms/office-ui-fabric-react/lib/utilities/css';
import { Facepile } from '@ms/office-ui-fabric-react/lib/components/Facepile/index';

export interface ISiteHeaderState {
  hideFallbackLogo?: boolean;
}

/**
 * SP shared Site Header control used in Doclibs, SP home page, SP Singleton page, etc.
 */
export class SiteHeader extends React.Component<ISiteHeaderProps, ISiteHeaderState> {
  public refs: {
    [key: string]: React.ReactInstance,
    siteLogoImg: HTMLImageElement,
    siteHeaderAcronym: HTMLDivElement
  };

  private _imgLoadHandler = (() => {
    let img = this.refs.siteLogoImg as HTMLImageElement;
    let siteHeaderAcronym = this.refs.siteHeaderAcronym;
    if (img) {
      img.style.display = 'inline';
      if (siteHeaderAcronym) {
        siteHeaderAcronym.style.visibility = 'hidden';
      }

      this.setState({ hideFallbackLogo: true });
    }
  }).bind(this);

  constructor(props: ISiteHeaderProps, state?: ISiteHeaderState) {
    super(props, state);
    this.state = { hideFallbackLogo: false };
    this._onGoToMembersClick = this._onGoToMembersClick.bind(this);
    this._handleOnClick = this._handleOnClick.bind(this);
  }

  public render(): React.ReactElement<ISiteHeaderProps> {
    return (
      <div className={ 'ms-siteHeader ' + (this.props.className ? this.props.className : '') }>
        { this.renderSiteLogo() }
        <div className='ms-siteHeaderSiteInfo'>
          <span className='ms-siteHeaderSiteName ms-font-xxl'>{ this.props.siteTitle }</span>
          <span className='ms-siteHeaderGroupInfo'>{ this.props.groupInfoString }</span>
        </div>
        { this.props.facepile && (
          <div className='ms-siteHeaderFacepile'>
            <Facepile { ...this.props.facepile } />
          </div>) }
        { this.props.membersText && (
          <div className='ms-siteHeaderMembersInfo'>
            { this.renderNumMembers() }
          </div>) }

      </div>
    );
  }

  public renderSiteLogo() {
    let img, logoActualAddnStyle;

    if (this.props.siteLogo) {
      if (this.props.siteLogo.siteLogoUrl) {
        img = <img
          role='presentation'
          aria-hidden='true'
          ref='siteLogoImg'
          src={ this.props.siteLogo.siteLogoUrl }
          onLoad={ this._imgLoadHandler } />;
      }

      if (this.props.siteLogo.siteLogoBgColor && this.props.siteLogo.siteAcronym) {
        img =
          <div>
            <div
              role='presentation'
              aria-hidden='true'
              className='ms-siteHeaderAcronym ms-font-xxl'
              style={ { 'backgroundColor': this.props.siteLogo.siteLogoBgColor } }
              ref='siteHeaderAcronym'>
              { this.props.siteLogo.siteAcronym }
            </div>
            { img }
          </div>;
      }
    }

    const renderDoughboy = !this.state.hideFallbackLogo && !this.props.disableSiteLogoFallback;
    if (!renderDoughboy) {
      // If not rendering doughboy, logo actual gets a white background to cover
      logoActualAddnStyle = { backgroundColor: 'white' };
    }

    const { logoHref, siteTitle, groupInfoString } = this.props;

    const logoWrapper = React.createElement(
      logoHref ? 'a' : 'div',
      {
        'className': css('ms-siteHeader-defaultLogo', { ' ms-Icon--group': (renderDoughboy), 'ms-Icon': (renderDoughboy) }),
        'onClick': this._handleOnClick,
        'href': logoHref,
        'aria-label': (groupInfoString ? groupInfoString + ', ' : '') + siteTitle
      },
      <div className='ms-siteHeaderLogoActual' style={ logoActualAddnStyle }>{ img }</div>
    );

    return (
      <div className='ms-siteHeaderLogoContainer'>
        <div className='ms-siteHeaderLogoContainerInner'>
          { logoWrapper }
        </div>
      </div>
    );
  }

  public renderNumMembers() {
    const personIcon = (<i className='ms-Icon ms-Icon--person'></i>);
    const membersCount = (<span className='ms-siteHeaderNumMembersText ms-font-s-plus'>{ this.props.membersText }</span>);

    // This is temporary member number render, which link to OWA membership experience until we build our own.
    return this.props.__goToMembers ? (
      <span>
        <Button buttonType={ ButtonType.command } onClick={ this._onGoToMembersClick }>
          { personIcon }
          { membersCount }
        </Button>
      </span>
    ) : (
      <span>
          { personIcon }
          { membersCount }
      </span>
    );
  }

  private _handleOnClick(ev?: React.MouseEvent) {
    if (this.props.logoOnClick) {
      this.props.logoOnClick(ev);
      ev.stopPropagation();
      ev.preventDefault();
    }
  }

  private _onGoToMembersClick(ev: React.MouseEvent) {
    if (this.props.__goToMembers.goToMembersAction) {
      this.props.__goToMembers.goToMembersAction(ev);
      ev.stopPropagation();
      ev.preventDefault();
    }
  }
}
