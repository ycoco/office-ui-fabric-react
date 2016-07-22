import * as React from 'react';
import './GroupCard.scss';
import { IGroupCardProps } from './GroupCard.Props';
import {SiteLogo} from '../SiteLogo/SiteLogo';
import { CommandBar } from 'office-ui-fabric-react/lib/components/CommandBar/index';
import { IContextualMenuItem } from 'office-ui-fabric-react/lib/components/ContextualMenu/index';
import { Facepile } from 'office-ui-fabric-react/lib/components/Facepile/index';

/**
 * GroupCard displays properties of an O365 Group
 */
export class GroupCard extends React.Component<IGroupCardProps, {}> {

  constructor(props: IGroupCardProps, context?: any) {
    super(props, context);
  }

  public render() {
    let linkItems: IContextualMenuItem[] = [];
    const { title, facepile, infoText, links, siteLogo } = this.props;
    if (links) {
      for (let i = 0; i < links.length; i++) {
        let linkProps = links[i];
        linkItems.push({
          key: i.toString(),
          name: linkProps.title,
          icon: linkProps.icon,
          onClick: (itm: IContextualMenuItem, ev?: React.MouseEvent) => {
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
          { infoText && <div>{ infoText }</div> }
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