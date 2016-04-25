import * as React from 'react';
import { SiteHeader, ISiteHeaderProps } from '../../../../components/index';

const siteHeaderProps: ISiteHeaderProps = {
  siteTitle: 'Computer Science Rocks',
  siteBannerThemeClassName: '#B4009E',
  groupInfoString: 'Private group',
  siteLogo: { siteAcronym: 'CS', siteLogoBgColor: '#7E3877' },
  membersText: '4 members',
  gotoGroupText: 'Go to group',
  gotoGroupOnClick: () => { alert('Go to group clicked.'); }
};

export class SiteHeaderTextLogoExample extends React.Component<any, any> {
  public render() {
    return (
      <SiteHeader {...siteHeaderProps} />
    );
  }
}
