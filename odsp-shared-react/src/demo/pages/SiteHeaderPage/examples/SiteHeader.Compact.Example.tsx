import * as React from 'react';
import { SiteHeader, ISiteHeaderProps } from '../../../../components/index';

const siteHeaderProps: ISiteHeaderProps = {
  siteTitle: 'Hello Kitty',
  logoHref: '#',
  logoOnClick: () => { alert('You clicked on logo'); },
  groupInfoString: 'Public group',
  siteLogo: { siteLogoUrl: 'http://placekitten.com/240/96', siteAcronym: 'CS', siteLogoBgColor: '#7E3877' },
  compact: true
};

export class SiteHeaderCompactModeExample extends React.Component<any, any> {
  public render() {
    return (
      <SiteHeader {...siteHeaderProps} />
    );
  }
}
