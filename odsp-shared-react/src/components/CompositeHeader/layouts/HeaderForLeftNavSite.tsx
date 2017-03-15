import * as React from 'react';
import { css } from 'office-ui-fabric-react/lib/Utilities';
import { ResponsiveMode } from 'office-ui-fabric-react/lib/utilities/decorators/withResponsiveMode';
import { ICompositeHeaderLayoutProps } from './ICompositeHeaderLayoutProps';
import { SiteHeader } from '../../SiteHeader/index';
import '../CompositeHeader.scss';
import './HeaderForLeftNavSite.scss';

export class HeaderForLeftNavSite extends React.Component<ICompositeHeaderLayoutProps, {}> {
  public render() {
    const renderHorizontalNav = !!this.props.horizontalNav;

    return (
      <div className={ css(
        'ms-compositeHeader',
        { 'ms-compositeHeader-lgDown': this.props.responsiveMode <= ResponsiveMode.large }
      ) }>
        { this.props.readOnlyBar }
        { this.props.messageBar }
        { this.props.policyBar }

        <div className={ css('ms-compositeHeader-topWrapper', { 'noNav': !(renderHorizontalNav) }) }>
          { this.props.responsiveMode > ResponsiveMode.medium && renderHorizontalNav ?
            (<div className='ms-compositeHeader-horizontalNav'>
              { this.props.horizontalNav }
            </div>) :
            (<div className='ms-compositeHeader-placeHolderMargin'> </div>) }
          <div className={ css('ms-compositeHeader-addnCommands') }>
            <div>
              { this.props.followButton }
              { this.props.shareButton }
              { this.props.goToOutlookButton }
            </div>
          </div>
        </div>
        { this.props.shareDialog }
        <SiteHeader { ...this.props.siteHeaderProps } />
      </div>);
  }
}