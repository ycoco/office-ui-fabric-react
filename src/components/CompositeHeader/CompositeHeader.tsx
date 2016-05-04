import * as React from 'react';
import './CompositeHeader.scss';
import { ICompositeHeaderProps } from './CompositeHeader.Props';
import { default as SiteHeader } from '../SiteHeader/index';
import { default as HorizontalNav } from '../HorizontalNav/index';
import { ResponsiveMode, withResponsiveMode } from '@ms/office-ui-fabric-react/lib/utilities/decorators/withResponsiveMode';
import { default as Button, ButtonType } from '@ms/office-ui-fabric-react/lib/components/Button/index';
import { css } from '@ms/office-ui-fabric-react/lib/utilities/css';

/**
 * Composite Header control that composites the Header and Horizontal Nav
 */
@withResponsiveMode
export default class CompositeHeader extends React.Component<ICompositeHeaderProps, {}> {
  public render() {
    return (
      <div className={css(
        'ms-compositeHeader',
        { 'ms-compositeHeader-lgDown': this.props.responsiveMode <= ResponsiveMode.large },
        { 'ms-compositeHeader-sm': this.props.responsiveMode === ResponsiveMode.small }
      ) }>
        { this.props.goToOutlook && this._renderBackToOutlook() }
        { this.props.horizontalNavProps && this.props.horizontalNavProps.items ?
          (<HorizontalNav {...this.props.horizontalNavProps } />) : (<div className='ms-compositeHeaderMargin'> </div>) }
        <SiteHeader { ...this.props.siteHeaderProps } />
      </div>);
  }

  private _renderBackToOutlook() {
    return this.props.goToOutlook ? (
      <div className='ms-compositeHeader-goToOutlook'>
        <Button buttonType={ ButtonType.icon } icon='arrowUpRight' onClick = { this._onGoToOutlookClick.bind(this) }>
           { this.props.goToOutlook.goToOutlookString }
        </Button>
      </div>) : null;
  }

  private _onGoToOutlookClick(ev: React.MouseEvent) {
    if (this.props.goToOutlook.goToOutlookAction) {
      this.props.goToOutlook.goToOutlookAction(ev);
      ev.stopPropagation();
      ev.preventDefault();
    }
  }
}
