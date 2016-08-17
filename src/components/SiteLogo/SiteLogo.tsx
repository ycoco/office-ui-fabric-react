import * as React from 'react';
import './SiteLogo.scss';
import { ISiteLogo } from './SiteLogo.Props';
import { css } from 'office-ui-fabric-react/lib/utilities/css';

export interface ISiteLogoState {
  hideFallbackLogo?: boolean;
}

interface IDictionary {
   [index: string]: string;
}

export class SiteLogo extends React.Component<ISiteLogo, ISiteLogoState> {
  public refs: {
    [key: string]: React.ReactInstance,
    siteLogoImg: HTMLImageElement,
    siteLogoAcronym: HTMLDivElement
  };

  private _imgLoadHandler = (() => {
    let img = this.refs.siteLogoImg as HTMLImageElement;
    let siteLogoAcronym = this.refs.siteLogoAcronym;
    if (img) {
      img.style.display = 'inline';
      if (siteLogoAcronym) {
        siteLogoAcronym.style.visibility = 'hidden';
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
              className='ms-siteLogoAcronym ms-font-xxl'
              style={ this._addOverrideStyle({ 'backgroundColor': this.props.siteLogoBgColor }) }
              ref='siteLogoAcronym'>
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
        'className': css('ms-siteLogo-defaultLogo', { ' ms-Icon--group': (renderDoughboy), 'ms-Icon': (renderDoughboy) }),
        'onClick': this._handleOnClick,
        'href': logoHref,
        'style': this._addOverrideStyle(undefined, true),
        'aria-label': (groupInfoString ? groupInfoString + ', ' : '') + siteTitle
      },
      <div className='ms-siteLogo-actual' style={ this._addOverrideStyle(logoActualAddnStyle) }>{ img }</div>
    );

    return (
      <div
        className='ms-siteLogoContainerOuter'
        style={ this._addOverrideStyle() }>
        <div
          className='ms-siteLogoContainerInner'
          style={ this._addOverrideStyle() }>
          { logoWrapper }
        </div>
      </div>
    );
  }

  /**
   * Returns an object with "height" and "width" properties populated if
   * sizeWidthHeight is specified on the object. If styleObj is specified,
   * then that will be augmented to have width and height. If not, a new obj will
   * be created.
   * if fAddFontSize is specified, it will also add the "font-size" property with
   * value equal to this.props.sizeWidthHeight;
   */
  private _addOverrideStyle(styleObj?: IDictionary, fAddFontSize?: boolean): IDictionary {
    let { size, roundedCorners } = this.props;
    if (size) {
      let sizePx = size.toString() + 'px';
      styleObj = this._addPropToStyleObj(styleObj, 'width', sizePx);
      styleObj = this._addPropToStyleObj(styleObj, 'height', sizePx);
      if (fAddFontSize) {
        styleObj = this._addPropToStyleObj(styleObj, 'fontSize', sizePx);
      }
    }
    if (roundedCorners) {
      let radius: string = size ? (size / 2).toString() + 'px' : '15px';
      styleObj = this._addPropToStyleObj(styleObj, 'borderRadius', radius);
    }
    return styleObj;
  }

  /**
   * Given an object styleObj, adds the property name with value to the object
   * If styleObj is not specified
   */
  private _addPropToStyleObj(styleObj: IDictionary, name: string, value: string) {
    styleObj = styleObj || {};
    styleObj[name] = value;
    return styleObj;
  }

  private _handleOnClick(ev?: React.MouseEvent) {
    if (this.props.logoOnClick) {
      this.props.logoOnClick(ev);
      ev.stopPropagation();
      ev.preventDefault();
    }
  }
}