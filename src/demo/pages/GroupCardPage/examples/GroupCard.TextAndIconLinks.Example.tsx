import * as React from 'react';
import { GroupCard, IGroupCardProps } from '../../../../components/index';

export class GroupCardTextAndIconExample extends React.Component<React.Props<GroupCardTextAndIconExample>, {}> {
  constructor() {
    super();
  }

  public render() {
    let sampleProps: IGroupCardProps = {
      title: `Clint Eastwood`,
      siteLogo: {
        siteTitle: `Clint Eastwood`,
        logoHref: '#',
        logoOnClick: () => { alert('You clicked on logo'); },
        siteAcronym: 'CE',
        siteLogoBgColor: '#7E3877'
      },
      links: [
        { title: 'Mail', icon: 'Mail', href: 'http://www.cnn.com' },
        { title: 'Calendar', icon: 'Calendar', href: 'http://www.foxnews.com' },
        { title: 'Files', icon: 'Documentation', href: 'http://www.usatoday.com' },
        { title: 'Notebook', icon: 'DietPlanNotebook', href: 'http://news.bbc.co.uk' },
        { title: 'Site', icon: 'Website', href: 'http://www.usatoday.com' }
      ]
    };

    return (
      <GroupCard {...sampleProps} />
    );
  }
}
