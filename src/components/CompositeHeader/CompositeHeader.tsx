import * as React from 'react';
import './CompositeHeader.scss';
import { ICompositeHeaderProps } from './CompositeHeader.Props';
import { SiteHeader } from '../SiteHeader/index';
import { Button, ButtonType } from '@ms/office-ui-fabric-react/lib/Button';
import { HorizontalNav } from '../HorizontalNav/index';
import { ResponsiveMode, withResponsiveMode } from '@ms/office-ui-fabric-react/lib/utilities/decorators/withResponsiveMode';
import { css } from '@ms/office-ui-fabric-react/lib/utilities/css';

/**
 * Composite Header control that composites the Header and Horizontal Nav
 */
@withResponsiveMode
export class CompositeHeader extends React.Component<ICompositeHeaderProps, {}> {

  public render() {
    let share = this.props.showShareButton ? (
      <Button buttonType={ ButtonType.command } icon='share' className='ms-CompositeHeader-collapsible'>
        <span>{ this.props.responsiveMode >= ResponsiveMode.small && 'Share' }</span>
      </Button>
    ) : null;

    let follow = this.props.showFollowButton ? (
      <Button buttonType={ ButtonType.command } icon='starEmpty' className='ms-CompositeHeader-collapsible'>
        <span>{ this.props.responsiveMode >= ResponsiveMode.small && 'Follow' }</span>
      </Button>
    ) : null;

    let renderHorizontalNav = this.props.horizontalNavProps && this.props.horizontalNavProps.items && this.props.horizontalNavProps.items.length;

    return (
      <div className={css(
        'ms-compositeHeader',
        { 'ms-compositeHeader-lgDown': this.props.responsiveMode <= ResponsiveMode.large }
      ) }>
        <div className={ css('ms-compositeHeader-topWrapper', {'noNav': !(renderHorizontalNav) })}>
            { this.props.responsiveMode > ResponsiveMode.medium && renderHorizontalNav ?
              (<div className='ms-compositeHeader-horizontalNav'>
                <HorizontalNav {...this.props.horizontalNavProps } />
                </div>) :
              (<div className='ms-compositeHeader-placeHolderMargin'> </div>) }
            <div className={ css('ms-compositeHeader-addnCommands') }>
              <div>
                { follow }
                { share }
                { this._renderBackToOutlook() }
              </div>
            </div>
        </div>
        <SiteHeader { ...this.props.siteHeaderProps } />
        </div>);
  }

  private _renderBackToOutlook() {
    return this.props.goToOutlook ? (
      <span className='ms-compositeHeader-goToOutlook'>
        <button className='ms-compositeHeaderButton' onClick = { this._onGoToOutlookClick.bind(this) }>
           <span className='ms-compositeHeader-goToOutlookText'>{ this.props.goToOutlook.goToOutlookString }</span>
           <i className='ms-Icon ms-Icon--arrowUpRight'></i>
          </button>
        </span>) : null;
  }

  private _onGoToOutlookClick(ev: React.MouseEvent) {
    if (this.props.goToOutlook.goToOutlookAction) {
      this.props.goToOutlook.goToOutlookAction(ev);
      ev.stopPropagation();
      ev.preventDefault();
    }
  }
}
