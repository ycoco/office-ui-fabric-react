import * as React from 'react';
import './SiteLogo.scss';
import { ISiteLogo } from './SiteLogo.Props';
import { autobind, css } from 'office-ui-fabric-react/lib/Utilities';
import Features from '@ms/odsp-utilities/lib/features/Features';

export interface ISiteLogoState {
  imageLoaded?: boolean;
  imageError?: boolean;
}

interface IDictionary {
  [index: string]: string;
}

export class SiteLogo extends React.Component<ISiteLogo, ISiteLogoState> {
  constructor(props: ISiteLogo, context?: any) {
    super(props, context);
    this.state = { imageLoaded: false };
  }

  public componentWillReceiveProps(props: ISiteLogo) {
    let {
      siteLogoUrl
    } = props;

    let {
      siteLogoUrl: previousSiteLogoUrl
    } = this.props;

    if (siteLogoUrl !== previousSiteLogoUrl) {
      this.setState({
        imageLoaded: false
      });
    }
  }

  public render(): React.ReactElement<ISiteLogo> {
    return (
      <div>
        { this.renderSiteLogo() }
      </div>
    );
  }

  public renderSiteLogo() {
    let img: React.ReactNode;

    let logoActualAddnStyle: {
      [name: string]: string;
    };

    if (this.props) {
      if (this.props.siteLogoUrl && !this.state.imageError) {
        img = <img
          role='presentation'
          aria-hidden='true'
          style={ this.state.imageLoaded ? this._addPropToStyleObj({}, 'display', 'inline') : {} }
          src={ this.props.siteLogoUrl }
          onLoad={ this._imgLoadHandler }
          onError={ this._imgLoadErrorHandler }
        />;
      }

      // Once GroupImageEnhancement is enabled we should not show the acronym unless
      // there is no siteLogoUrl or the image failed to load with an error
      if (this.props.siteAcronym &&
        (!Features.isFeatureEnabled({ ODB: 151 /* GroupImageEnhancement */ }) ||
          !this.props.siteLogoUrl ||
          this.state.imageError)) {
        // If this.props.siteLogoBgColor is undefined, no style attribute will be emitted.
        // This will allow the color to   set via CSS (e.g. by theming).
        img =
          <div>
            <div
              role='presentation'
              aria-hidden='true'
              className='ms-siteLogoAcronym ms-font-xxl'
              style={
                this._addOverrideStyle({
                  'backgroundColor': this.props.siteLogoBgColor,
                  'visibility': this.state.imageLoaded ? 'hidden' : undefined
                }, true, true)
              }
            >
              { this.props.siteAcronym }
            </div>
            { img }
          </div>;
      }
    }

    const renderDoughboy = !this.state.imageLoaded && !this.props.disableSiteLogoFallback;
    if (!renderDoughboy) {
      // If not rendering doughboy, logo actual gets a white background to cover
      logoActualAddnStyle = {
        backgroundColor: 'white'
      };
    }

    const { logoHref, siteTitle } = this.props;
    const logoWrapper = React.createElement(
      logoHref ? 'a' : 'div',
      {
        'className': css('ms-siteLogo-defaultLogo', { ' ms-Icon--Group': (renderDoughboy), 'ms-Icon': (renderDoughboy) }),
        'onClick': this._handleOnClick,
        'href': logoHref,
        'style': this._addOverrideStyle(undefined, true),
        'aria-label': siteTitle
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
   * sizeWidthHeight is specified on the object.
   * @param stylObj If styleObj is specified, then that will be augmented . If not, a new obj will be created.
   * @param fAddFontSize if fAddFontSize is specified, it will also add the "font-size" property with value equal to this.props.size;
   * @param fReducedFontSize if fReducedFontSize is true, it will add font-size, but with size = this.props.size/3;
   */
  private _addOverrideStyle(styleObj?: IDictionary, fAddFontSize?: boolean, fReducedFontSize?: boolean): IDictionary {
    let { size, roundedCorners } = this.props;
    if (size) {
      let sizePx = size.toString() + 'px';
      styleObj = this._addPropToStyleObj(styleObj, 'width', sizePx);
      styleObj = this._addPropToStyleObj(styleObj, 'height', sizePx);
      if (fAddFontSize) {
        let sizeFont = fReducedFontSize ? Math.round(size / 3) : size;
        styleObj = this._addPropToStyleObj(styleObj, 'fontSize', sizeFont.toString() + 'px');
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

  @autobind
  private _handleOnClick(ev?: React.MouseEvent<HTMLElement>) {
    if (this.props.logoOnClick) {
      this.props.logoOnClick(ev);
      ev.stopPropagation();
      ev.preventDefault();
    }
  }

  @autobind
  private _imgLoadHandler() {
    this.setState({
      imageLoaded: true
    });
  }

  @autobind
  private _imgLoadErrorHandler() {
    this.setState({
      imageError: true
    });
  }
}