import * as React from 'react';
import './CompositeHeader.scss';
import { ICompositeHeader, ICompositeHeaderProps } from './CompositeHeader.Props';
import { IHorizontalNav } from '../HorizontalNav/index';
import { withResponsiveMode } from 'office-ui-fabric-react/lib/utilities/decorators/withResponsiveMode';
import { autobind } from 'office-ui-fabric-react/lib/Utilities';
import { HeaderLayoutType } from '@ms/odsp-datasources/lib/ChromeOptions';
import {
  ReadOnlyBar,
  HeaderMessageBar,
  OutlookButton,
  ShareDialog
} from './subComponents/index';
import { HeaderForLeftNavSite, HeaderFullBleed } from './layouts/index';
import { ICompositeHeaderLayoutProps } from './layouts/ICompositeHeaderLayoutProps';

/**
 * Composite Header control that composites a set of sub components such as Header and Horizontal Nav
 */
@withResponsiveMode
export class CompositeHeader extends React.Component<ICompositeHeaderProps, { shareVisible: boolean }> implements ICompositeHeader {
  private _horizontalNavInstance: IHorizontalNav;

  constructor(props: ICompositeHeaderProps) {
    super(props);
    this.state = {
      shareVisible: false
    };
  }

  public render() {
    const renderHorizontalNav = this.props.horizontalNavProps &&
      this.props.horizontalNavProps.items &&
      this.props.horizontalNavProps.items.length;

    const {
      onRenderHorizontalNav
    } = this.props;

    const horizontalNav = renderHorizontalNav &&
      onRenderHorizontalNav({ ...this.props.horizontalNavProps, ref: this._updateHorizontalNavReference });

    const readOnlyBar = this.props.siteReadOnlyProps &&
      this.props.siteReadOnlyProps.isSiteReadOnly &&
      <ReadOnlyBar siteReadOnlyProps={this.props.siteReadOnlyProps} />;

    const messageBar = this.props.messageBarProps && <HeaderMessageBar messageBarProps={this.props.messageBarProps} />;

    const policyBar = this.props.policyBarProps && <HeaderMessageBar messageBarProps={this.props.policyBarProps} />;

    const goToOutlookButton = this.props.goToOutlook && <OutlookButton {...this.props.goToOutlook} />;

    const shareDialog = this.props.shareButton && this.state.shareVisible &&
      <ShareDialog title={this.props.siteHeaderProps.siteTitle}
        shareButton={this.props.shareButton}
        onCloseCallback={this._onShareDialogClose}
      />;

    if (this.props.shareButton &&
      !this.props.shareButton.onShare
    ) {
      this.props.shareButton.onShare = this._showShare
    }

    const share = this.props.shareButton;

    const headerLayoutProps: ICompositeHeaderLayoutProps = {
      siteHeaderProps: { ...{ ...this.props.siteHeaderProps, responsiveMode: this.props.responsiveMode } },
      horizontalNav: horizontalNav,
      readOnlyBar: readOnlyBar,
      messageBar: messageBar,
      policyBar: policyBar,
      follow: this.props.follow,
      share: share,
      goToOutlookButton: goToOutlookButton,
      shareDialog: shareDialog,
      searchBox: this.props.searchBox,
      responsiveMode: this.props.responsiveMode
    }

    return (
      this.props.layout === HeaderLayoutType.FULLBLEED ?
        <HeaderFullBleed {...headerLayoutProps} /> : <HeaderForLeftNavSite {...headerLayoutProps} />
    );
  }

  /**
   * @inheritDoc
   * @see ICompositeHeader.measureNavLayout()
   */
  public measureNavLayout() {
    if (this._horizontalNavInstance) {
      this._horizontalNavInstance.measureLayout();
    }
  }

  @autobind
  private _updateHorizontalNavReference(component: IHorizontalNav) {
    this._horizontalNavInstance = component;
  }

  @autobind
  private _onShareDialogClose() {
    this.setState({ shareVisible: false });
  }

  @autobind
  private _showShare(ev: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) {
    this.setState({ shareVisible: true });
    ev.stopPropagation();
    ev.preventDefault();
  }
}