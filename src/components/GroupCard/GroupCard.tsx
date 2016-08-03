import * as React from 'react';
import './GroupCard.scss';
import { IGroupCardProps } from './GroupCard.Props';
import {SiteLogo} from '../SiteLogo/SiteLogo';
import { CommandBar } from 'office-ui-fabric-react/lib/components/CommandBar/index';
import { IContextualMenuItem } from 'office-ui-fabric-react/lib/components/ContextualMenu/index';
import { Facepile } from 'office-ui-fabric-react/lib/components/Facepile/index';
import { MemberCount } from '../MemberCount/MemberCount';
import { Engagement } from '@ms/odsp-utilities/lib/logging/events/Engagement.event';

/**
 * GroupCard displays properties of an O365 Group
 */
export class GroupCard extends React.Component<IGroupCardProps, {}> {

  constructor(props: IGroupCardProps, context?: any) {
    super(props, context);
  }

  public render() {
    let linkItems: IContextualMenuItem[] = [];
    const { title, facepile, infoText, links, siteLogo, membersText, goToMembersAction } = this.props;
    if (links) {
      for (let i = 0; i < links.length; i++) {
        let linkProps = links[i];
        linkItems.push({
          key: i.toString(),
          name: linkProps.title,
          icon: linkProps.icon,
          onClick: (itm: IContextualMenuItem, ev?: React.MouseEvent) => {
            let engagementID = linkProps.engagementId || 'GroupCard.Unknown.Click';
            Engagement.logData({ name: engagementID });
            window.open(linkProps.href, '_blank');
          }
        });
      }
    }

    return (
      <div className='ms-groupCard'>
        <div className='ms-groupCard-top'>
          <div className='ms-groupCard-logo'>
            <SiteLogo { ...siteLogo }/>
          </div>
          <div className='ms-groupCard-body'>
            <div className='ms-groupCard-title'>
              { title }
            </div>
            { infoText && <span className='ms-groupCard-infoText'>{ infoText }</span> }
            { membersText && (
                <MemberCount
                  membersText={ membersText }
                  goToMembersAction={ goToMembersAction } />)
            }
            { facepile && (
              <div className='ms-groupCard-facepile'>
                <Facepile { ...facepile } />
              </div>) }
          </div>
        </div>
        <div className='ms-groupCard-iconGroup'>
          <CommandBar items= { linkItems } className= 'ms-groupCard-CmdBar' />
        </div>
      </div>);
  }

}