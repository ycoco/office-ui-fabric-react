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
  className: 'ThemeOverride',
  showGroupCard: true,
  groupLinks: [
    { title: 'Mail', icon: 'mail', href: 'http://www.cnn.com' },
    { title: 'Calendar', icon: 'calendar', href: 'http://www.foxnews.com' },
    { title: 'Files', icon: 'documents', href: 'http://www.usatoday.com' },
    { title: 'Notebook', icon: 'notebook', href: 'http://news.bbc.co.uk' },
    { title: 'Site', icon: 'sites', href: 'http://www.usatoday.com' }
  ]
};

export class SiteHeaderTextLogoExample extends React.Component<any, any> {
  public render() {
    return (
      <SiteHeader {...siteHeaderProps} />
    );
  }
}
