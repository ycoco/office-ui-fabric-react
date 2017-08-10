// OneDrive:IgnoreCodeCoverage

import * as React from 'react';
import { autobind, BaseComponent, IBaseProps } from 'office-ui-fabric-react/lib/Utilities';
import { DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { IContextualMenuItem } from 'office-ui-fabric-react/lib/ContextualMenu';
import './FilterSectionHeader.scss';

export interface IFilterSectionHeaderProps extends IBaseProps {
  rootElementId?: string;
  text?: string;
  showEditButton?: boolean;
  commandItems?: IContextualMenuItem[];
}

export default class FilterSectionHeader extends BaseComponent<IFilterSectionHeaderProps, {}> {
  public render() {
    let { text, rootElementId, showEditButton, commandItems } = this.props;

    return (
      <div className='od-FilterSectionHeader' id={ rootElementId } >
        { text }
        { showEditButton && commandItems &&
          <div className='od-FilterSectionHeader-sideCommands'>
            {
              commandItems.map((commandItem: IContextualMenuItem) => this._onRenderCommand(commandItem))
            }
          </div>
        }
      </div >
    );
  }

  @autobind
  private _onRenderCommand(command: IContextualMenuItem) {
    return (
      <DefaultButton
        data-automationtype='FilterSectionHeaderButton'
        key={ command.key }
        className='od-FilterSectionHeader-button'
        iconProps={ { iconName: command.iconProps ? command.iconProps.iconName : '' } }
        menuProps={ command.subMenuProps }
        onRenderMenuIcon={ this._onRenderMenuIcon }
        onClick={ !command.subMenuProps && command.onClick ?
          (ev: any) => { command.onClick(ev, command); } : undefined
        }
      />
    );
  }

  private _onRenderMenuIcon() {
    return (null);
  }
}
