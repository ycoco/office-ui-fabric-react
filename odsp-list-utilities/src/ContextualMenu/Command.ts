import * as React from 'react';
import { ICommand } from './ICommand';
import { IAction, IActionDependencies } from '../Actions/IAction';
import { IContextualMenuItem, IIconProps } from 'office-ui-fabric-react';
import ColumnMenuHelper from './ColumnMenuHelper';

export interface ICommandParams {
    key: string;
    name: string;
    isCommandVisible?: () => boolean;
    icon?: string;
    iconProps?: IIconProps;
    children?: ICommand[];
    action?: IAction;
    onRender?: (item: any) => React.ReactNode;
}

export class Command implements ICommand {
    private _key: string;
    private _name: string;
    private _isCommandVisible: () => boolean;
    private _icon: string;
    private _iconProps: IIconProps;
    private _children: ICommand[];
    private _action: IAction;
    private _onRender: (item: any) => React.ReactNode;

    constructor(params: ICommandParams) {
        this._key = params.key;
        this._name = params.name;
        this._isCommandVisible = params.isCommandVisible || undefined;
        this._icon = params.icon || undefined;
        this._iconProps = params.iconProps || undefined;
        this._children = params.children || undefined;
        this._action = params.action || undefined;
        this._onRender = params.onRender || undefined;
    }

    public isVisible(): boolean {
        // Make sure command is not explicitly hidden
        if (this._isCommandVisible && !this._isCommandVisible()) {
            return false;
        }

        // If this command has an action, make sure the action is available
        if (this._action) {
            return this._action.isAvailable();
        }

        return true;
    }

    public getContextualMenuItem(): IContextualMenuItem {
        let visibleChildren: IContextualMenuItem[] = undefined;
        if (this._children) {
            visibleChildren = this._children.filter((command: ICommand) => {
                return command.isVisible();
            }).map((command: ICommand) => {
                return command.getContextualMenuItem();
            });
        }
        return {
            key: this._key,
            name: this._name,
            icon: this._icon,
            iconProps: this._iconProps,
            items: visibleChildren,
            data: {
                action: this._action
            },
            onRender: this._onRender,
            onClick: this._action ? ColumnMenuHelper.onCommandClick : undefined
        } as IContextualMenuItem;
    }
}
