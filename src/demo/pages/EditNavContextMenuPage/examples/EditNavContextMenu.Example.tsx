import * as React from 'react';
import { EditNavContextMenu } from '../../../../components/index';
import './EditNavContextMenu.Example.scss';

export interface IEditNavContextMenuExampleState {
  isContextualMenuVisible: boolean;
}

export class EditNavContextMenuExample extends React.Component<any, any> {
  private myLink: HTMLElement;

  public constructor() {
    super();

    this._onShowMenuClicked = this._onShowMenuClicked.bind(this);
    this.state = {
      isContextualMenuVisible: false
    };

    this._onDismissMenu = this._onDismissMenu.bind(this);
  }
  public render() {
    return (
      <div className='ms-EditNavContextMenuExample' >
        <div className='ms-EditNavContextMenuExample-buttonArea' ref={(ref) => this.myLink = ref} >
          <span className='ms-EditNavContextMenuExample-linkText' onClick={ this._onShowMenuClicked }>{ this.state.isContextualMenuVisible ? 'Hide context menu' : 'Show context menu'}</span>
        </div>
            { this.state.isContextualMenuVisible ? (
                <EditNavContextMenu
                  targetElement={ this.myLink }
                  menuItems={[ {name: 'Move up', key: 'idMoveup'}, { name: 'Move down', key: 'idMoveDown' }, { name: 'Remove', key: 'idRemove' }]}
                  onDismiss={ this._onDismissMenu }
                />
                ) : (null) }
              </div>
      );
  }

  private _onShowMenuClicked() {
    this.setState({
      isContextualMenuVisible: !this.state.isContextualMenuVisible
    });
  }

  private _onDismissMenu(ev) {
   this.setState({
      isContextualMenuVisible: false
   });
   ev.stopPropagation();
   ev.preventDefault();
  }
}
