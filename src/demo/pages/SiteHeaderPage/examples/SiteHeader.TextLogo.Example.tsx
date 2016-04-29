import * as React from 'react';
import { SiteHeader, ISiteHeaderProps } from '../../../../components/index';
import './SiteHeader.TextLogo.Example.scss';

const siteHeaderProps: ISiteHeaderProps = {
  siteTitle: 'Computer Science Rocks',
  groupInfoString: 'Private group',
  logoHref: '#',
  logoOnClick: () => { alert('You clicked on logo'); },
  siteLogo: { siteAcronym: 'CS', siteLogoBgColor: '#7E3877' },
  membersText: '4 members',
  className: 'ThemeOverride'
};

export class SiteHeaderTextLogoExample extends React.Component<any, any> {
  public render() {
    return (
      <SiteHeader {...siteHeaderProps} />
    );
  }
}
