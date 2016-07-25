import * as React from 'react';
import './SiteLogo.scss';
import { ISiteLogo } from './SiteLogo.Props';
import { css } from 'office-ui-fabric-react/lib/utilities/css';

export interface ISiteLogoState {
  hideFallbackLogo?: boolean;
}

export class SiteLogo extends React.Component<ISiteLogo, ISiteLogoState> {
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

  constructor(props: ISiteLogo, context?: any) {
    super(props, context);
    this.state = { hideFallbackLogo: false };
    this._handleOnClick = this._handleOnClick.bind(this);
  }

  public render(): React.ReactElement<ISiteLogo> {
    return (
      <div>
        {this.renderSiteLogo() }
      </div>
    );
  }

  public renderSiteLogo() {
    let img, logoActualAddnStyle;

    if (this.props) {
      if (this.props.siteLogoUrl) {
        img = <img
          role='presentation'
          aria-hidden='true'
          ref='siteLogoImg'
          src={ this.props.siteLogoUrl }
          onLoad={ this._imgLoadHandler } />;
      }

      // If this.props.siteLogoBgColor is undefined, no style attribute will be emitted.
      // This will allow the color to be set via CSS (e.g. by theming).
      if (this.props.siteAcronym) {
        img =
          <div>
            <div
              role='presentation'
              aria-hidden='true'
              className='ms-siteHeaderAcronym ms-font-xxl'
              style={ { 'backgroundColor': this.props.siteLogoBgColor } }
              ref='siteHeaderAcronym'>
              { this.props.siteAcronym }
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
      <div className='ms-siteLogoContainerOuter'>
        <div className='ms-siteLogoContainerInner'>
          { logoWrapper }
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