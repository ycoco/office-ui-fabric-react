import './SharePrincipal.scss';
import { ContextualMenu } from 'office-ui-fabric-react/lib/ContextualMenu';
import { DirectionalHint } from 'office-ui-fabric-react/lib/Callout';
import { Persona, PersonaInitialsColor, PersonaSize } from 'office-ui-fabric-react/lib/Persona';
import { SharingLinkKind, IShareStrings, ISharingPrincipal, SharingRole, ISharingStore } from '../../../interfaces/SharingInterfaces';
import * as React from 'react';

export interface ISharingEntityDetailProps {
    principal: ISharingPrincipal;
}

export interface ISharingEntityDetailState {
    showContextualMenu?: boolean;
    target?: HTMLDivElement;
}

export class SharePrincipal extends React.Component<ISharingEntityDetailProps, ISharingEntityDetailState> {
    private _store: ISharingStore;
    private _strings: IShareStrings;

    static contextTypes = {
        sharingStore: React.PropTypes.object.isRequired,
        strings: React.PropTypes.object.isRequired
    };

    constructor(props: ISharingEntityDetailProps, context: any) {
        super(props);

        this.state = {
            showContextualMenu: false
        };

        this._store = context.sharingStore;
        this._strings = context.strings;

        this._onEditableClick = this._onEditableClick.bind(this);
        this._onPermissionsClick = this._onPermissionsClick.bind(this);
    }

    public render(): React.ReactElement<{}> {
        const props = this.props;
        const principal = props.principal;
        const roleText = this._computeRoleText(principal);
        const role = props.principal.role === SharingRole.none ? SharingRole.view : props.principal.role;

        return (
            <div className='od-SharePrincipal'>
                <Persona
                    className='od-SharePrincipal-persona'
                    hidePersonaDetails={ true }
                    initialsColor={ PersonaInitialsColor.blue }
                    primaryText={ principal.primaryText }
                    size={ PersonaSize.regular }
                />
                <div className='od-SharePrincipal-details'>
                    <div className='od-SharePrincipal-details-primaryText'>{ principal.primaryText }</div>
                    <div
                        className='od-SharePrincipal-permissions'
                        onClick={ this._onPermissionsClick }>
                        <div className='od-SharePrincipal-permissions-role'>{ roleText }</div>
                        { this._renderChevron(role) }
                        { this._renderContextualMenu(role) }
                    </div>
                </div>
            </div>
        );
    }

    private _computeRoleText(principal: ISharingPrincipal) {
        const strings = this._strings;
        const props = this.props;
        const role = props.principal.role === SharingRole.none ? SharingRole.view : props.principal.role;

        if (typeof role === 'number') {
            switch (role) {
                case SharingRole.edit:
                    return strings.canEditLabel;
                case SharingRole.view:
                    return strings.canViewLabel;
                case SharingRole.owner:
                    return strings.ownerLabel;
                default:
                    return '';
            }
        } else if (principal.sharingLinkKind) {
            return strings.accessViaSharingLink;
        } else {
            return '';
        }
    }

    private _renderChevron(role: SharingRole) {
        if (role !== SharingRole.owner) {
            return (
                <div className='od-SharePrincipal-permissions-icon'>
                    <i className='ms-Icon ms-Icon--ChevronDown'></i>
                </div>
            );
        }
    }

    private _renderContextualMenu(role: SharingRole): JSX.Element {
        const strings = this._strings;

        if (this.state.showContextualMenu) {
            return (
                <ContextualMenu
                    items={
                        [
                            {
                                key: 'editable',
                                name: role === SharingRole.edit ? strings.changeToViewOnly : strings.allowEdit,
                                onClick: this._onEditableClick.bind(this, role)
                            },
                            {
                                key: 'stopSharing',
                                name: `${strings.stopSharing}`,
                                onClick: this._onStopSharingClick.bind(this)
                            }
                        ]
                    }
                    onDismiss={ () => { this.setState({ showContextualMenu: false }) } }
                    directionalHint={ DirectionalHint.bottomLeftEdge }
                    isBeakVisible={ true }
                    target={ this.state.target }
                />
            );
        }
    }

    private _onEditableClick(role: SharingRole): void {
        const newRole = role === SharingRole.edit ? SharingRole.view : SharingRole.edit;
        this._store.updatePermissions(this.props.principal, newRole);
    }

    private _onStopSharingClick(ev: React.MouseEvent<{}>): void {
        this._store.updatePermissions(this.props.principal, SharingRole.none);
    }

    private _onPermissionsClick(ev: React.MouseEvent<any>): void {
        const props = this.props;
        const role = props.principal.role === SharingRole.none ? SharingRole.view : props.principal.role;

        if (role) {
            this.setState({
                showContextualMenu: true,
                target: ev.nativeEvent.target as HTMLDivElement
            });
        }
    }
}
