import * as React from 'react';
import { GroupCard, IGroupCardProps } from '../../../../components/index';
import { PersonaInitialsColor } from '../../../index';

export class GroupCardIconLinksExample extends React.Component<React.Props<GroupCardIconLinksExample>, {}> {
  constructor() {
    super();
  }

  public render() {
    let sampleProps: IGroupCardProps = {
      title: `Lorem Ipsum`,
      siteLogo: {
        siteTitle: `Lorem Ipsum`,
        logoHref: '#',
        logoOnClick: () => { alert('You clicked on logo'); },
        siteLogoUrl: 'http://placeimg.com/96/96/animals'
      },
      links: [
        { title: '', icon: 'Mail', href: 'http://www.cnn.com' },
        { title: '', icon: 'Calendar', href: 'http://www.foxnews.com' },
        { title: '', icon: 'Documentation', href: 'http://www.usatoday.com' },
        { title: '', icon: 'DietPlanNotebook', href: 'http://news.bbc.co.uk' },
        { title: '', icon: 'Website', href: 'http://www.usatoday.com' }
      ],
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
      }

    };

    return (
      <GroupCard {...sampleProps} />
    );
  }
}
