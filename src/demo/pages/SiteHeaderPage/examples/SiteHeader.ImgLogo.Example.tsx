import * as React from 'react';
import { SiteHeader, ISiteHeaderProps } from '../../../../components/index';
import { PersonaInitialsColor } from '../../../index';

const siteHeaderProps: ISiteHeaderProps = {
  siteTitle: 'SPOREL Support Group',
  logoHref: '#',
  logoOnClick: () => { alert('You clicked on logo'); },
  groupInfoString: 'Public group',
  siteLogo: { siteLogoUrl: 'http://placeimg.com/96/96/tech/sepia' },
  membersText: '23 members',
  disableSiteLogoFallback: false,
  facepile: {
    personas: [
      {
        personaName: 'Bill Murray',
        imageUrl: '//www.fillmurray.com/200/200'
      },
      {
        personaName: 'Douglas Field',
        imageInitials: 'DF',
        initialsColor: PersonaInitialsColor.green
      },
      {
        personaName: 'Marcus Laue',
        imageInitials: 'ML',
        initialsColor: PersonaInitialsColor.purple
      }
    ]
  },
  showGroupCard: true,
  groupLinks: [
    { title: '', icon: 'mail', href: 'http://www.cnn.com' },
    { title: '', icon: 'calendar', href: 'http://www.foxnews.com' },
    { title: '', icon: 'documents', href: 'http://www.usatoday.com' },
    { title: '', icon: 'notebook', href: 'http://news.bbc.co.uk' },
    { title: '', icon: 'sites', href: 'http://www.usatoday.com' }
  ]

};

export class SiteHeaderImgLogoExample extends React.Component<any, any> {
  public render() {
    return (
      <SiteHeader {...siteHeaderProps} />
    );
  }
}
