import * as React from 'react';
import { SiteHeader, ISiteHeaderProps } from '../../../../components/index';
import './SiteHeader.TextLogo.Example.scss';

const siteHeaderProps: ISiteHeaderProps = {
  siteTitle: 'Computer Science Rocks',
  groupInfoString: 'Private group',
  logoHref: '#',
  logoOnClick: () => { alert('You clicked on logo'); },
  siteLogo: { siteAcronym: 'CS', siteLogoBgColor: '#7E3877' },
  membersInfoProps: {
    membersText: '4 members',
    onJoined: {
      onJoinedString: 'Joined'
    },
    onLeaveGroup: {
      onLeaveGroupString: 'Leave group',
      onLeaveGroupAction: () => alert('You clicked Leave group')
    },
    onJoin: {
      onJoinString: 'Join',
      onJoiningString: 'Joining',
      onJoinAction: () => { alert('You clicked on Join'); }
    },
    isMemberOfCurrentGroup: true
  },
  className: 'ThemeOverride',
  showGroupCard: true,
  groupLinks: [
    { title: 'Home', href: 'http://www.cnn.com' },
    { title: 'Conversations', href: 'http://www.cnn.com' },
    { title: 'Calendar', href: 'http://www.foxnews.com' },
    { title: 'Files', href: 'http://www.usatoday.com' },
    { title: 'Notebook', href: 'http://news.bbc.co.uk' },
    { title: 'Site', href: 'http://www.usatoday.com' }
  ]
};

export class SiteHeaderTextLogoExample extends React.Component<any, any> {
  public render() {
    return (
      <SiteHeader {...siteHeaderProps} />
    );
  }
}
