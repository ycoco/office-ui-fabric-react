import * as React from 'react';
import { SiteHeader, ISiteHeaderProps } from '../../../../components/index';

const siteHeaderProps: ISiteHeaderProps = {
  siteTitle: 'Kitty Petting Club',
  logoHref: '#',
  logoOnClick: () => { alert('You clicked on logo'); },
  groupInfoString: 'Public group',
  siteLogo: { siteLogoUrl: 'http://placekitten.com/240/96', siteAcronym: 'CS', siteLogoBgColor: '#7E3877' },
  membersText: '1231 members'
};

export class SiteHeaderElongatedImgLogoExample extends React.Component<any, any> {
  public render() {
    return (
      <SiteHeader {...siteHeaderProps} />
    );
  }
}
