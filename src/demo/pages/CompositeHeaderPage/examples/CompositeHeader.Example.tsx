import * as React from 'react';
import { autobind } from 'office-ui-fabric-react/lib/utilities/autobind';
import './CompositeHeader.Example.scss';
import {
  CompositeHeader,
  ICompositeHeaderProps,
  IHorizontalNavItem,
  FollowState
} from '../../../../components/index';
import { PersonaInitialsColor, Checkbox } from '../../../index';

export interface ICompositeHeaderExampleState {
  numberOfNavItems?: Number;
  renderMessageBar: boolean;
}

export class CompositeHeaderExample extends React.Component<React.Props<CompositeHeaderExample>, ICompositeHeaderExampleState> {
  constructor() {
    super();
    this.state = { numberOfNavItems: 15, renderMessageBar: false };
  }

  public render() {
    let { numberOfNavItems, renderMessageBar } = this.state;
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
        membersInfoProps: {
            membersText: '23 members',
          isMemberOfCurrentGroup: true,
          onJoined: {
            onJoinedString: 'Joined'
          },
          onLeaveGroup: {
            onLeaveGroupString: 'Leave group',
            onLeaveGroupAction: () => alert('You clicked Leave group')
          },
          goToMembersAction: () => alert('You hit go to members')
        },
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
      shareButton: { url: '/src/demo/pages/CompositeHeaderPage/SampleSharePage.html', loadingLabel: 'Loading', shareLabel: 'Share' }
    };

    let compositeHeaderProps2: ICompositeHeaderProps = {
      siteHeaderProps: {
        siteTitle: 'فكرة من الخيال فيها خلاص الأجيال',
        siteLogo: {
          siteAcronym: 'ي',
          siteLogoBgColor: '#0078d7'
        },
        groupInfoString: 'موقع الفريق',
        membersInfoProps: {
          membersText: '32 عضوا',
          goToMembersAction: () => alert('You hit go to members')
        },
        showGroupCard: true,
        groupLinks: [
          { title: 'البريد', icon: 'Mail', href: 'http://www.cnn.com' },
          { title: 'التقويم', icon: 'Calendar', href: 'http://www.foxnews.com' },
          { title: 'الملفات', icon: 'Documentation', href: 'http://www.usatoday.com' },
          { title: 'وتلاحظ', icon: 'DietPlanNotebook', href: 'http://news.bbc.co.uk' },
          { title: 'الموقع', icon: 'Website', href: 'http://www.usatoday.com' }
        ]
      },
      messageBarProps: renderMessageBar && {
        message: 'The site is in Arabic.',
        linkTarget: 'https://www.bing.com/translator',
        linkText: 'Click here to translate'
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
        membersInfoProps: {
          membersText: '1 member'
        },
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
      messageBarProps: renderMessageBar && {
        message: 'Amherst is not Boston'
      },
      horizontalNavProps: {
        items: arrayOfItems
      },
      follow: {
        followLabel: 'Follow',
        followState: FollowState.notFollowing
      },
      goToOutlook: null,
      siteReadOnlyProps: renderMessageBar && {
        isSiteReadOnly: true,
        siteReadOnlyString: 'We apologize for the inconvenience, but we\'ve made OneDrive and sites read-only while we do some maintenance.'
      }
    };

    let compositeHeaderProps4: ICompositeHeaderProps = {
      siteHeaderProps: {
        siteTitle: 'Authentication Policy',
        siteLogo: {
          siteAcronym: 'AP',
          siteLogoBgColor: '#0078d7'
        },
        groupInfoString: 'Authentication Policy Group',
         membersInfoProps: {
          membersText: '32 member'
        }
      },
      policyBarProps: renderMessageBar && {
        message: 'Policy message bar.',
        linkTarget: 'https://www.bing.com/translator',
        linkText: 'More info'
      },
      horizontalNavProps: {
          items: arrayOfItems
      },
      goToOutlook: {
        goToOutlookString: 'Got to Outlook',
        goToOutlookAction: () => alert('You hit go to outlook')
      }
    };

    return (
      <div className='eg' style={ { height: !renderMessageBar ? '660px' : '796px' } }>
        <p><b>Note</b>: The actual header does not have a dashed border.</p>
        <div><Checkbox label={ 'Render message bar' } onChange={ this._onRenderMessageBarChange } /></div>

        <div className='eg-header'>
          <CompositeHeader {...compositeHeaderProps} />
        </div>

        <div className='eg-header'>
          <CompositeHeader {...compositeHeaderProps2} />
        </div>

        <div className='eg-header'>
          <CompositeHeader {...compositeHeaderProps3} />
        </div>

        <div className='eg-header'>
          <CompositeHeader {...compositeHeaderProps4} />
        </div>

      </div>
    );
  }

  @autobind
  private _onRenderMessageBarChange(ev: React.FormEvent, isChecked: boolean) {
    this.setState({ renderMessageBar: isChecked });
  }
}
