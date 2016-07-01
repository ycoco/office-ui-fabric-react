import * as React from 'react';
import './CompositeHeader.Example.scss';
import {
  CompositeHeader,
  ICompositeHeaderProps,
  IHorizontalNavItem,
  FollowState
} from '../../../../components/index';
import { PersonaInitialsColor } from '../../../index';

export interface ICompositeHeaderExampleState {
  numberOfNavItems: Number;
}

export class CompositeHeaderExample extends React.Component<React.Props<CompositeHeaderExample>, ICompositeHeaderExampleState> {
  constructor() {
    super();
    this.state = { numberOfNavItems: 15 };
  }

  public render() {
    let { numberOfNavItems } = this.state;
    let arrayOfItems: IHorizontalNavItem[] = [];
    for (let i = 0; i < numberOfNavItems; i++) {
      arrayOfItems.push({
        text: `Navigation Item ${i + 1}`,
        onClick: (item: IHorizontalNavItem) => {
          alert(`You clicked on ${item.text}`);
        }
      });
    }

    let compositeHeaderProps: ICompositeHeaderProps = {
      siteHeaderProps: {
        siteTitle: 'OneDrive and SharePoint',
        siteLogo: {
          siteAcronym: 'OS',
          siteLogoBgColor: '#088272',
          siteLogoUrl: 'http://placekitten.com/96/130'
        },
        groupInfoString: 'Public group (MBI)',
        membersText: '23 members',
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
      },
      horizontalNavProps: {
        items: arrayOfItems
      },
      goToOutlook: {
        goToOutlookString: 'Back to Outlook',
        goToOutlookAction: () => alert('You hit go to outlook')
      },
      follow: {
        followLabel: 'Follow',
        followState: FollowState.followed
      },
      showShareButton: true
    };

    let compositeHeaderProps2: ICompositeHeaderProps = {
      siteHeaderProps: {
        siteTitle: 'فكرة من الخيال فيها خلاص الأجيال',
        siteLogo: {
          siteAcronym: 'ي',
          siteLogoBgColor: '#0078d7'
        },
        groupInfoString: 'موقع الفريق',
        membersText: '32 عضوا'
      },
      horizontalNavProps: null,
      goToOutlook: {
        goToOutlookString: 'العودة إلى المحادثات',
        goToOutlookAction: () => alert('You hit go to outlook')
      }
    };

    let compositeHeaderProps3: ICompositeHeaderProps = {
      siteHeaderProps: {
        siteTitle: 'People from Boston',
        siteLogo: {
          siteAcronym: 'PB',
          siteLogoBgColor: '#e81123'
        },
        groupInfoString: 'Public Group (LBI)',
        membersText: '1',
        facepile: {
          personas: [
            {
              personaName: 'Duane Garnet',
              imageInitials: 'DG',
              initialsColor: PersonaInitialsColor.purple
            }
          ]
        }
      },
      horizontalNavProps: {
        items: arrayOfItems
      },
      follow: {
        followLabel: 'Follow',
        followState: FollowState.notFollowing
      },
      goToOutlook: null
    };

    return (
      <div className='eg'>
        <p>Note: The actual header does not have a dashed border</p>
        <div className='eg-header'>
          <CompositeHeader {...compositeHeaderProps} />
        </div>

        <div className='eg-header'>
          <CompositeHeader {...compositeHeaderProps2} />
        </div>

        <div className='eg-header'>
          <CompositeHeader {...compositeHeaderProps3} />
        </div>
      </div>
    );
  }
}
