import * as React from 'react';
import { SiteHeader, ISiteHeaderProps } from '../../../../components/index';

const siteHeaderProps: ISiteHeaderProps = {
  siteTitle: 'My sample site',
  siteBannerThemeClassName: '#2488d8',
  groupInfoString: 'Public group',
  siteLogo: { siteLogoUrl: 'http://placeimg.com/96/96/tech/sepia' },
  membersText: '23 members'
};

export class SiteHeaderImgLogoExample extends React.Component<any, any> {
  public render() {
    return (
      <SiteHeader {...siteHeaderProps} />
    );
  }
}
