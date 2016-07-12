import * as React from 'react';
import './GroupCard.scss';
import { IGroupCardProps } from './GroupCard.Props';
import {SiteLogo} from '../SiteLogo/SiteLogo';
import { CommandBar } from '@ms/office-ui-fabric-react/lib/components/CommandBar/index';
import { IContextualMenuItem } from '@ms/office-ui-fabric-react/lib/components/ContextualMenu/index';
import { Facepile } from '@ms/office-ui-fabric-react/lib/components/Facepile/index';

/**
 * GroupCard displays properties of an O365 Group
 */
export class GroupCard extends React.Component<IGroupCardProps, {}> {

  constructor(props: IGroupCardProps, context?: any) {
    super(props, context);
  }

  public render() {
    let linkItems: IContextualMenuItem[] = [];
    if (this.props.links) {
      for (let i = 0; i < this.props.links.length; i++) {
        let linkProps = this.props.links[i];
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
          <SiteLogo { ...this.props.siteLogo }/>
        </div>
        <div className='ms-groupCard-body'>
          <div className='ms-groupCard-title'>
            { this.props.title }
          </div>

          { this.props.facepile && (
            <div className='ms-groupCard-facepile'>
              <Facepile { ...this.props.facepile } />
            </div>) }

        </div>
      </div>
      <div className='ms-groupCard-iconGroup'>
        <CommandBar items= { linkItems } />
      </div>
    </div>);
  }

}