import './Header.scss';
import { autobind } from 'office-ui-fabric-react/lib/Utilities';
import { ContextualMenu } from 'office-ui-fabric-react/lib/ContextualMenu';
import { DirectionalHint } from 'office-ui-fabric-react/lib/Callout';
import { IShareStrings, ISharingItemInformation, ClientId } from '../../interfaces/SharingInterfaces';
import { ShareViewState } from '../Share/Share';
import * as React from 'react';
import * as StringHelper from '@ms/odsp-utilities/lib/string/StringHelper';
import AttachAsCopyHelper from '../../utilities/AttachAsCopyHelper';
import ClientIdHelper from '../../utilities/ClientIdHelper';
import * as ShareHelper from '../../utilities/ShareHelper';

export interface IHeaderProps {
    clientId?: ClientId;
    item?: ISharingItemInformation;
    onManageExistingAccessClick?: () => void; // Not applicable to Headers that don't show the more button.
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

        const isTitleHidden = props.viewState === ShareViewState.linkSuccess || props.viewState === ShareViewState.error;
        const backgroundColorClass = !isTitleHidden ? ' od-ShareHeader-backgroundColor' : '';
        const title = !isTitleHidden ?
            (
                <div className='od-ShareHeader-title'>
                    <div className='od-ShareHeader-viewName'>{ this._getViewName() }</div>
                    { this._renderItemName() }
                </div>
            ) : '';

        return (
            <div>
                <div className={ 'od-ShareHeader' + backgroundColorClass }>
                    { title }
                </div>
                <div className='od-ShareHeader-buttons'>
                    { this._renderMoreButton() }
                    { this._renderCloseButton() }
                </div>
                { this._renderContextualMenu() }
            </div>
        );
    }

    private _renderMoreButton() {
        if (this.props.viewState === ShareViewState.default) {
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
                <button className='od-ShareHeader-button' onClick={ this._dismissComponent }>
                    <i className='ms-Icon ms-Icon--Cancel'></i>
                </button>
            );
        }
    }

    @autobind
    private _dismissComponent(ev: React.MouseEvent<any>) {
        ev.stopPropagation();
        ev.preventDefault();
        this._onDismiss();
    }

    private _renderItemName() {
        const props = this.props;
        const item = props.item;
        const folderInfo = item.childCount > 1 ? ` (${StringHelper.format(this._strings.folderHeader, item.childCount)})` : '';

        if (ClientIdHelper.isOfficeProduct(props.clientId)) {
            return;
        } else {
            return (
                <div className='od-ShareHeader-itemName'>{ ShareHelper.truncateItemNameForHeader(`${item.name} ${folderInfo}`) }</div>
            );
        }
    }

    private _renderContextualMenu() {
        const clientId = this.props.clientId;
        const strings = this._strings;
        const items = [];

        // Options are only available in Office clients.
        if (ClientIdHelper.isOfficeProduct(clientId)) {
            const attachmentOptions = AttachAsCopyHelper.getAttachAsCopyOptions(clientId, strings);

            // Add "Attach a Copy" command if we can attach a copy.
            if (attachmentOptions.length > 0) {
                items.push({
                    key: 'copy',
                        subMenuProps: {
                        items: attachmentOptions,
                    },
                    name: strings.attachACopy
                });
            }
        }

        // Option is available in all cases.
        items.push({
            key: 'editable',
            name: strings.manageExistingAccessLabel,
            onClick: this._onManageExistingAccessClick
        });

        if (this.state.showContextualMenu) {
            return (
                <ContextualMenu
                    className='od-ShareHeader-moreContextualMenu'
                    items={ items }
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
            case ShareViewState.default:
                return strings.shareLinkHeader;
            case ShareViewState.modifyPermissions:
                return strings.modifyPermissionsHeader;
            case ShareViewState.permissionsList:
                return strings.permissionsLabel;
            default:
                return strings.shareLinkHeader;
        }
    }
}