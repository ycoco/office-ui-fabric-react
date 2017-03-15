import * as React from 'react';
import { css } from 'office-ui-fabric-react/lib/Utilities';
import { ResponsiveMode } from 'office-ui-fabric-react/lib/utilities/decorators/withResponsiveMode';
import { ICompositeHeaderLayoutProps } from './ICompositeHeaderLayoutProps';
import { SiteHeader } from '../../SiteHeader/index';
import '../CompositeHeader.scss';
import './HeaderFullBleed.scss';

export class HeaderFullBleed extends React.Component<ICompositeHeaderLayoutProps, {}> {
  public render() {
    const siteHeaderProps = this.props.siteHeaderProps;
    siteHeaderProps.compact = true;

    return (
      <div className={ css(
        'ms-compositeHeader',
        { 'ms-compositeHeader-lgDown': this.props.responsiveMode <= ResponsiveMode.large }
      ) }>
        { this.props.readOnlyBar }
        { this.props.messageBar }
        { this.props.policyBar }

        { this.props.shareDialog }
        <div className='ms-compositeHeader-siteAndActionsContainer'>
          <div className='ms-compositeHeader-headerAndNavContainer'>
            <SiteHeader { ...this.props.siteHeaderProps } />
            { this.props.responsiveMode > ResponsiveMode.medium &&
              !!this.props.horizontalNav &&
              this.props.horizontalNav }
          </div>
          <div className='ms-compositeHeader-actionsContainer'>
            <div className='ms-compositeHeader-addnCommands'>
              <div>
                { this.props.followButton }
                { this.props.shareButton }
              </div>
            </div>
            { this.props.searchBox ?
              <div className="ms-compositeHeader-searchBoxContainer">
                { this.props.searchBox }
              </div>
              : null
            }
          </div>
        </div>
      </div>);
  }
}