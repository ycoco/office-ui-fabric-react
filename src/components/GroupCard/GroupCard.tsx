import * as React from 'react';
import './GroupCard.scss';
import { IGroupCardProps } from './GroupCard.Props';
import {SiteLogo} from '../SiteLogo/SiteLogo';
import { CommandBar } from 'office-ui-fabric-react/lib/components/CommandBar/index';
import { IContextualMenuItem } from 'office-ui-fabric-react/lib/components/ContextualMenu/index';
import { MembersInfo } from '../MembersInfo/MembersInfo';
import { MembersInfoJoinButton } from '../MembersInfo/MembersInfo.JoinButton';
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
    const { title, links, siteLogo, membersInfoProps } = this.props;
    let hasJoinString: boolean = membersInfoProps && membersInfoProps.onJoin ? true : false;
    if (links) {
      for (let i = 0; i < links.length; i++) {
        let linkProps = links[i];
        linkItems.push({
          key: i.toString(),
          name: linkProps.title,
          icon: linkProps.icon,
          onClick: (ev?: React.MouseEvent, item?: IContextualMenuItem) => {
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
          <div className='ms-groupCard-body'>
            <div className='ms-groupCard-title'>
              { title }
            </div>
            { membersInfoProps && (
                <MembersInfo {...membersInfoProps} isInGroupCard={ true }/>)
            }
            { hasJoinString && (
              <div className='ms-groupCard-joinbutton'>
                <MembersInfoJoinButton {...membersInfoProps}/>
              </div>)
            }
          </div>
          <div className='ms-groupCard-logo'>
            <SiteLogo { ...siteLogo }/>
          </div>
        </div>
        <div className='ms-groupCard-iconGroup'>
          <CommandBar items= { linkItems } className= 'ms-groupCard-CmdBar' />
        </div>
      </div>);
  }

}