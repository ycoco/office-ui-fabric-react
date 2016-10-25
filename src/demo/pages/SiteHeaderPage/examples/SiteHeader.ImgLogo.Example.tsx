import * as React from 'react';
import { SiteHeader, ISiteHeaderProps } from '../../../../components/index';
import { PersonaInitialsColor } from '../../../index';

const siteHeaderProps: ISiteHeaderProps = {
  siteTitle: 'SPOREL Support Group',
  logoHref: '#',
  logoOnClick: () => { alert('You clicked on logo'); },
  groupInfoString: 'Public group',
  siteLogo: { siteLogoUrl: 'http://placeimg.com/96/96/tech/sepia' },
  membersInfoProps: {
    membersText: '23 members',
    onJoin: {
      onJoinString: 'Join',
      onJoiningString: 'Joining',
      onJoinAction: () => { alert('You clicked on Join'); }
    }
  },
  disableSiteLogoFallback: false,
  facepile: {
    personas: [
      {
        personaName: 'Bill Murray',
        imageUrl: '//www.fillmurray.com/200/200',
        onClick: (ev: React.MouseEvent<HTMLElement>, persona: any) => alert(`Clicked on ` + persona.personaName),
        onMouseMove: (ev: React.MouseEvent<HTMLElement>, persona: any) => console.log(`Mouse moved over ` + persona.personaName),
        onMouseOut: (ev: React.MouseEvent<HTMLElement>, persona: any) => console.log(`Mouse moved out of ` + persona.personaName)
      },
      {
        personaName: 'Douglas Field',
        imageInitials: 'DF',
        initialsColor: PersonaInitialsColor.green,
        onClick: (ev: React.MouseEvent<HTMLElement>, persona: any) => alert(`Clicked on ` + persona.personaName),
        onMouseMove: (ev: React.MouseEvent<HTMLElement>, persona: any) => console.log(`Mouse moved over ` + persona.personaName),
        onMouseOut: (ev: React.MouseEvent<HTMLElement>, persona: any) => console.log(`Mouse moved out of ` + persona.personaName)
      },
      {
        personaName: 'Marcus Laue',
        imageInitials: 'ML',
        initialsColor: PersonaInitialsColor.purple,
        onClick: (ev: React.MouseEvent<HTMLElement>, persona: any) => alert(`Clicked on ` + persona.personaName),
        onMouseMove: (ev: React.MouseEvent<HTMLElement>, persona: any) => console.log(`Mouse moved over ` + persona.personaName),
        onMouseOut: (ev: React.MouseEvent<HTMLElement>, persona: any) => console.log(`Mouse moved out of ` + persona.personaName)
      }
    ]
  },
  showGroupCard: true,
  groupLinks: [
    { title: '', icon: 'Mail', href: 'http://www.cnn.com' },
    { title: '', icon: 'Calendar', href: 'http://www.foxnews.com' },
    { title: '', icon: 'Documentation', href: 'http://www.usatoday.com' },
    { title: '', icon: 'DietPlanNotebook', href: 'http://news.bbc.co.uk' },
    { title: '', icon: 'Website', href: 'http://www.usatoday.com' }
  ]

};

export class SiteHeaderImgLogoExample extends React.Component<any, any> {
  public render() {
    return (
      <SiteHeader {...siteHeaderProps} />
    );
  }
}
