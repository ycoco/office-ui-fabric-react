import * as React from 'react';
import { SiteHeader, ISiteHeaderProps } from '../../../../components/index';

const siteHeaderProps: ISiteHeaderProps = {
  siteTitle: 'SPOREL Support Group',
  siteBannerThemeClassName: '#2488d8',
  logoHref: '#',
  logoOnClick: () => { alert('You clicked on logo'); },
  groupInfoString: 'Public group',
  siteLogo: { siteLogoUrl: 'http://placeimg.com/96/96/tech/sepia' },
  membersText: '23 members',
  disableSiteLogoFallback: true
};

export class SiteHeaderImgLogoExample extends React.Component<any, any> {
  public render() {
    return (
      <SiteHeader {...siteHeaderProps} />
    );
  }
}
