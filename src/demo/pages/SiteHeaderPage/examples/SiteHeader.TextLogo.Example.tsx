import * as React from 'react';
import { SiteHeader, ISiteHeaderProps } from '../../../../components/index';

const siteHeaderProps: ISiteHeaderProps = {
  siteTitle: 'Computer Science Rocks',
  siteBannerThemeClassName: '#B4009E',
  groupInfoString: 'Private group',
  siteLogo: { siteAcronym: 'CS', siteBgColor: '#7E3877' },
  membersText: '4 members'
};

export class SiteHeaderTextLogoExample extends React.Component<any, any> {
  public render() {
    return (
      <SiteHeader {...siteHeaderProps} />
    );
  }
}
