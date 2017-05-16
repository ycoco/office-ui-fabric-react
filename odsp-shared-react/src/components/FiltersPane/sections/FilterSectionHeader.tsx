// OneDrive:IgnoreCodeCoverage

import * as React from 'react';
import { autobind, BaseComponent } from 'office-ui-fabric-react/lib/Utilities';
import { DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { IContextualMenuItem } from 'office-ui-fabric-react/lib/ContextualMenu';
import './FilterSectionHeader.scss';

export interface IFilterSectionHeaderProps {
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
                icon={ command.iconProps ? command.iconProps.iconName : '' }
                menuProps={ command.subMenuProps }
                onRenderMenuIcon={ this._onRenderMenuIcon }
                onClick={ (ev: any) => {
                    if (command.onClick) {
                        command.onClick(ev, command);
                    }
                } }
            />
        );
    }

    private _onRenderMenuIcon() {
        return (null);
    }
}
