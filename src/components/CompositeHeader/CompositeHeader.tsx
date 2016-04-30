import * as React from 'react';
import './CompositeHeader.scss';
import { ICompositeHeaderProps } from './CompositeHeader.Props';
import {
default as SiteHeader } from '../SiteHeader/index';
import {
default as HorizontalNav } from '../HorizontalNav/index';

import { default as Button, ButtonType } from '@ms/office-ui-fabric-react/lib/components/Button/index';

/**
 * Composite Header control that composites the Header and Horizontal Nav
 */
export default class CompositeHeader extends React.Component<ICompositeHeaderProps, {}> {
  public render() {
    return (
      <div className='ms-files-siteHeader'>
        { this.props.goToOutlook && this._renderBackToOutlook() }
        { this.props.horizontalNavProps && this.props.horizontalNavProps.items ?
          (<HorizontalNav {...this.props.horizontalNavProps } />) : (<div className='ms-files-siteHeaderMargin'> </div>) }
        <SiteHeader { ...this.props.siteHeaderProps } />
      </div>);
  }

  private _renderBackToOutlook() {
    return this.props.goToOutlook ? (
      <div className='ms-files-siteHeader-goToOutlook'>
        <Button buttonType={ ButtonType.icon } icon='arrowUpRight' onClick = { this._onGoToOutlookClick.bind(this) }>
           { this.props.goToOutlook.goToOutlookString }
        </Button>
      </div>) : null;
  }

  private _onGoToOutlookClick(ev: React.MouseEvent) {
    ev.stopPropagation();
    ev.preventDefault();
  }
}
