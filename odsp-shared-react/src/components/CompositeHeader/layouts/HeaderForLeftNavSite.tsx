import * as React from 'react';
import { css } from 'office-ui-fabric-react/lib/Utilities';
import { ResponsiveMode } from 'office-ui-fabric-react/lib/utilities/decorators/withResponsiveMode';
import { ICompositeHeaderLayoutProps } from './ICompositeHeaderLayoutProps';
import { SiteHeader } from '../../SiteHeader/index';
import { Facepile } from 'office-ui-fabric-react/lib/components/Facepile/index';
import { MembersInfo } from '../../MembersInfo/MembersInfo';
import { ShareButton, FollowButton } from '../subComponents/index';
import '../CompositeHeader.scss';
import './HeaderForLeftNavSite.scss';

/**
 * Composite header layout for sites with left nav. This is currently used by team site.
 */
export class HeaderForLeftNavSite extends React.Component<ICompositeHeaderLayoutProps, {}> {
  public render() {
    const renderHorizontalNav = !!this.props.horizontalNav;
    let { facepile, membersInfoProps } = this.props.siteHeaderProps;

    const shareButton = this.props.share &&
      <ShareButton { ...{ ...this.props.share, responsiveMode: this.props.responsiveMode } } />;

    const followButton = this.props.follow &&
      <FollowButton { ...{ ...this.props.follow, responsiveMode: this.props.responsiveMode } } />;

    return (
      <div className={ css(
        'ms-compositeHeader',
        { 'ms-compositeHeader-lgDown': this.props.responsiveMode <= ResponsiveMode.large }
      ) }>
        { this.props.readOnlyBar }
        { this.props.messageBar }
        { this.props.policyBar }

        <div className={ css('ms-compositeHeader-topWrapper', { 'noNav': !(renderHorizontalNav) }) }>
          { (this.props.responsiveMode > ResponsiveMode.medium && renderHorizontalNav) &&
            (<div className='ms-compositeHeader-horizontalNav'>
              { this.props.horizontalNav }
            </div>) }
        </div>
        { this.props.shareDialog }
        <div className='ms-compositeHeader-mainLayout'>
          <SiteHeader { ...this.props.siteHeaderProps } />
          <div className='ms-compositeHeader-rightControls'>

            <div className={ css('ms-compositeHeader-addnCommands') }>
              { followButton }
              { shareButton }
              { this.props.goToOutlookButton }
            </div>

            <div className='ms-compositeHeader-peopleInfo'>
              { facepile && (
                <div className='ms-siteHeader-facepile'>
                  <Facepile { ...facepile } />
                </div>) }

              { membersInfoProps && membersInfoProps.membersText && (
                <div className='ms-siteHeader-membersInfo'>
                  <MembersInfo {...membersInfoProps} />
                </div>) }
            </div>

          </div>
        </div>
      </div>);
  }
}