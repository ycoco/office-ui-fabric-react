import './Header.scss';
import { ContextualMenu } from 'office-ui-fabric-react/lib/ContextualMenu';
import { DirectionalHint } from 'office-ui-fabric-react/lib/Callout';
import { IShareStrings, ISharingItemInformation } from '../../interfaces/SharingInterfaces';
import { ShareViewState } from '../Share/Share';
import * as React from 'react';
import * as StringHelper from '@ms/odsp-utilities/lib/string/StringHelper';

export interface IHeaderProps {
    item: ISharingItemInformation;
    onManageExistingAccessClick?: () => void; // Not applicable to Headers that don't show the more button.
    showItemName: boolean; // Office clients don't want to show item name.
    viewState: ShareViewState;
}

export interface IHeaderState {
    showContextualMenu: boolean;
    target: HTMLDivElement;
}

export class Header extends React.Component<IHeaderProps, IHeaderState> {
    private _strings: IShareStrings;
    private _onDismiss: () => void;

    static contextTypes = {
        strings: React.PropTypes.object.isRequired,
        onDismiss: React.PropTypes.func
    };

    constructor(props: IHeaderProps, context: any) {
        super(props);

        this.state = {
            showContextualMenu: false,
            target: null
        };

        this._strings = context.strings;
        this._onDismiss = context.onDismiss;

        this._onDismissMoreContextualMenu = this._onDismissMoreContextualMenu.bind(this);
        this._onManageExistingAccessClick = this._onManageExistingAccessClick.bind(this);
        this._onMoreClick = this._onMoreClick.bind(this);
    }

    render(): React.ReactElement<{}> {
        const props = this.props;

        return (
            <div>
                <div className='od-ShareHeader'>
                    <div className='od-ShareHeader-title'>
                        <div className='od-ShareHeader-viewName'>{ this._getViewName() }</div>
                        { this._renderItemName() }
                    </div>
                    <div className='od-ShareHeader-buttons'>
                        { this._renderMoreButton() }
                        { this._renderCloseButton() }
                    </div>
                </div>
                { this._renderContextualMenu() }
            </div>
        );
    }

    private _renderMoreButton() {
        if (this.props.viewState === ShareViewState.DEFAULT) {
            return (
                <button className='od-ShareHeader-button' onClick={ this._onMoreClick }>
                    <i className='ms-Icon ms-Icon--More'></i>
                </button>
            );
        }
    }

    private _renderCloseButton() {
        if (this._onDismiss) {
            return (
                <button className='od-ShareHeader-button' onClick={ this._onDismiss }>
                    <i className='ms-Icon ms-Icon--Cancel'></i>
                </button>
            );
        }
    }

    private _renderItemName() {
        const props = this.props;
        const item = props.item;
        const folderInfo = item.childCount > 1 ? ` (${StringHelper.format(this._strings.folderHeader, item.childCount)})` : '';

        if (props.showItemName) {
            return (
                <div className='od-ShareHeader-itemName'>{ item.name }{ folderInfo }</div>
            );
        } else {
            return;
        }
    }

    private _renderContextualMenu() {
        const strings = this._strings;

        if (this.state.showContextualMenu) {
            return (
                <ContextualMenu
                    items={
                        [
                            {
                                key: 'editable',
                                name: strings.manageExistingAccessLabel,
                                onClick: this._onManageExistingAccessClick
                            }
                        ]
                    }
                    onDismiss={ this._onDismissMoreContextualMenu }
                    target={ this.state.target }
                    isBeakVisible={ true }
                />
            );
        }
    }

    private _onMoreClick(ev: React.MouseEvent<any>) {
        this.setState({
            showContextualMenu: !this.state.showContextualMenu,
            target: ev.nativeEvent.target as HTMLDivElement
        });
    }

    private _onDismissMoreContextualMenu() {
        this.setState({
            ...this.state,
            showContextualMenu: false
        });
    }

    private _onManageExistingAccessClick() {
        this.props.onManageExistingAccessClick();
    }

    private _getViewName() {
        const strings = this._strings;

        switch (this.props.viewState) {
            case ShareViewState.DEFAULT:
                return strings.shareLinkHeader;
            case ShareViewState.MODIFY_PERMISSIONS:
                return strings.modifyPermissionsHeader;
            case ShareViewState.PERMISSIONS_LIST:
                return strings.permissionsLabel;
            default:
                return strings.shareLinkHeader;
        }
    }
}