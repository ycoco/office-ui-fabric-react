import './Share.scss';
import { ISharingInformation, ISharingLinkSettings, IShareStrings, ISharingLink, ISharingStore } from '../../interfaces/SharingInterfaces';
import { ModifyPermissions } from '../ModifyPermissions/ModifyPermissions';
import { PermissionsList } from '../PermissionsList/PermissionsList';
import { ShareMain } from '../ShareMain/ShareMain';
import { ShareNotification } from '../ShareNotification/ShareNotification';
import { SharePolicyDetails } from '../SharePolicyDetails/SharePolicyDetails';
import * as React from 'react';

export interface IShareProps {
    checkNotification: () => void; // TODO (joem): Investigate more how this is used...
    onDismiss: () => void; // Callback from caller to get notified that sharing is done.
}

export interface IShareState {
    currentSettings: ISharingLinkSettings; // Defines the currently selected link settings.
    isCopy: boolean; // TODO (joem): Make this more robust. Basically used to render ShareNotification properly.
    sharingInformation: ISharingInformation; // Object that has all of the relevant sharing information to render UI.
    sharingLinkCreated: ISharingLink; // The link that is created from the UI.
    viewState: ShareViewState;
}

export const enum ShareViewState {
    DEFAULT,
    MODIFY_PERMISSIONS,
    LINK_SUCCESS,
    PERMISSIONS_LIST,
    GRANT_PERMISSIONS,
    POLICY_DETAILS,
}

export class Share extends React.Component<IShareProps, IShareState> {
    private _store: ISharingStore;
    private _strings: IShareStrings;
    private _viewStates: Array<number> = [];

    static contextTypes = {
        sharingStore: React.PropTypes.object.isRequired,
        strings: React.PropTypes.object.isRequired
    };

    constructor(props: IShareProps, context: any) {
        super(props);

        this.state = {
            currentSettings: null,
            isCopy: false,
            sharingInformation: null,
            sharingLinkCreated: null,
            viewState: ShareViewState.DEFAULT
        };

        this._store = context.sharingStore;
        this._strings = context.strings;

        this._checkNotification = this._checkNotification.bind(this);
        this._onCopyLinkClicked = this._onCopyLinkClicked.bind(this);
        this._onLinkPermissionsApplyClicked = this._onLinkPermissionsApplyClicked.bind(this);
        this._onLinkPermissionsCancelClicked = this._onLinkPermissionsCancelClicked.bind(this);
        this._onSelectedPermissionsChange = this._onSelectedPermissionsChange.bind(this);
        this._onSendLinkClicked = this._onSendLinkClicked.bind(this);
        this._renderModifyPermissions = this._renderModifyPermissions.bind(this);
        this._renderNotification = this._renderNotification.bind(this);
        this._renderShareMain = this._renderShareMain.bind(this);
        this._renderPermissionsList = this._renderPermissionsList.bind(this);
        this._renderViews = this._renderViews.bind(this);
        this._showModifyPermissions = this._showModifyPermissions.bind(this);
        this._showPermissionsList = this._showPermissionsList.bind(this);
        this._showPolicy = this._showPolicy.bind(this);
    }

    public componentDidMount() {
        const store = this._store;

        // Make a call to get sharing information when component mounts.
        store.fetchSharingInformation();

        // Subscribe to store change events.
        store.addListener(() => {
            // Get new information from store.
            const sharingInformation = store.getSharingInformation();
            const sharingLinkCreated = store.getSharingLinkCreated();

            // If currentSettings haven't been initialized, initialize it
            // with sharingInformation.
            if (this.state.currentSettings === null) {
                this._initializeCurrentSettings(sharingInformation.defaultSharingLink);
            }

            // If a link was created, render ShareNotification view.
            if (sharingLinkCreated) {
                this.setState({
                    ...this.state,
                    viewState: ShareViewState.LINK_SUCCESS,
                    sharingLinkCreated
                });
            } else {
                this.setState({
                    ...this.state,
                    sharingInformation
                });
            }
        });
    }

    public render(): React.ReactElement<{}> {
        if (this.state.sharingInformation && this.state.currentSettings) {
            return (
                <div
                    className='od-Share'
                    onClick={(ev) => {
                        // Prevents list deselection.
                        ev.nativeEvent.stopImmediatePropagation();
                    }
                }>
                    {this._renderViews()}
                    <div
                        className='od-Share-close'
                        onClick={this.props.onDismiss} >
                        <i className='ms-Icon ms-Icon--Cancel'></i>
                    </div>
                    {this._renderBackButton()}
                </div>
            );
        } else {
            return <div>{this._strings.componentLoading}</div>;
        }
    }

    private _calculateDays(expiry: Date) {
        const ONE_DAY = 24 * 60 * 60 * 1000;

        return Math.round((expiry.getTime() - Date.now()) / (ONE_DAY));
    }

    private _checkNotification() {
        if (this.props.checkNotification) {
            this.props.checkNotification();
        } else {
            console.log('TODO (joem): Figure out what this is.');
        }
    }

    /**
     * Compares new expiration date value to existing expiration on a link,
     * and either returns the original date (if the new expiration would result
     * in the same link expiry) or the new date (if the new expiraiton would
     * result in a new link expiry).
     */
    private _computeExpiration(expiration: Date, link: ISharingLink) {
        // Abort if there's no link to compare against.
        if (!link || !link.expiration || !expiration) {
            return expiration;
        }

        const existingExpiration = link.expiration;

        // Get number of days for each expiration value.
        const expirationInDays = this._calculateDays(expiration);
        const existingExpirationInDays = this._calculateDays(existingExpiration);

        // Return expiration already on the link if the number of days is the same, otherwise,
        // return the new expiration value that will change the number of days.
        return expirationInDays === existingExpirationInDays ? existingExpiration : expiration;
    }

    private _initializeCurrentSettings(link: ISharingLink) {
        this.setState({
            ...this.state,
            currentSettings: {
                allowEditing: true,
                audience: link.audience,
                expiration: link.expiration || null,
                isEdit: link.isEdit,
                sharingLinkKind: link.sharingLinkKind,
                specificPeople: []
            }
        });
    }

    private _onCopyLinkClicked(): void {
        this.setState({
            ...this.state,
            isCopy: true
        }, () => {
            this.context.sharingStore.shareLink(this.state.currentSettings);
        });
    }

    private _onLinkPermissionsApplyClicked(newSettings: ISharingLinkSettings): void {
        this.setState({
            ...this.state,
            viewState: ShareViewState.DEFAULT
        }, () => {
            this._onSelectedPermissionsChange(newSettings);
        });
    }

    private _onLinkPermissionsCancelClicked(): void {
        this.setState({
            ...this.state,
            viewState: ShareViewState.DEFAULT
        });
    }

    private _onSelectedPermissionsChange(permissions: ISharingLinkSettings) {
        // Find the link entry that matches the current state of the dialog.
        const linkKind = permissions.sharingLinkKind;
        const targetLink = this.state.sharingInformation.sharingLinks.filter((link: ISharingLink) => {
            return link.sharingLinkKind === linkKind;
        })[0];

        // Get link of same kind and compare expirations. If expiration is supported
        // and exists on the link, only update the expiration if the new value will result in a
        // different number of days.
        const expiration = this._computeExpiration(permissions.expiration, targetLink);

        this.setState({
            ...this.state,
            currentSettings: {
                allowEditing: permissions.allowEditing,
                audience: permissions.audience,
                expiration: expiration,
                isEdit: permissions.isEdit,
                sharingLinkKind: permissions.sharingLinkKind,
                specificPeople: permissions.specificPeople
            }
        });
    }

    private _onSendLinkClicked(recipients: any, message: string): void {
        this.setState({
            ...this.state,
            isCopy: false
        }, () => {
            this.context.sharingStore.shareLink(this.state.currentSettings, recipients, message);
        });
    }

    private _renderBackButton(): JSX.Element {
        const viewState = this.state.viewState;

        if (viewState === ShareViewState.PERMISSIONS_LIST ||
            viewState === ShareViewState.MODIFY_PERMISSIONS ||
            viewState === ShareViewState.POLICY_DETAILS) {
            return (
                <div
                    className='od-Share-backButton'
                    onClick={() => { this.setState({ ...this.state, viewState: this._viewStates.pop() }) }}>
                    <i className='ms-Icon ms-Icon--ChevronLeft'></i>
                </div>
            );
        }
    }

    private _renderViews(): JSX.Element {
        switch (this.state.viewState) {
            case ShareViewState.MODIFY_PERMISSIONS:
                return this._renderModifyPermissions();
            case ShareViewState.LINK_SUCCESS:
                return this._renderNotification();
            case ShareViewState.PERMISSIONS_LIST:
                return this._renderPermissionsList();
            case ShareViewState.POLICY_DETAILS:
                return this._renderPolicyDetails();
            default:
                return this._renderShareMain();
        }
    }

    private _renderShareMain(): React.ReactElement<{}> {
        return (
            <ShareMain
                currentSettings={this.state.currentSettings}
                item={this.state.sharingInformation.item}
                linkStatusClick={this._showModifyPermissions}
                onCopyLinkClicked={this._onCopyLinkClicked}
                onSendLinkClicked={this._onSendLinkClicked}
                onShowPermissionsListClicked={this._showPermissionsList}
                onPolicyClick={this._showPolicy}
                sharingInformation={this.state.sharingInformation}
            />
        );
    }

    private _renderPolicyDetails(): JSX.Element {
        return (
            <SharePolicyDetails />
        );
    }

    private _renderModifyPermissions(): JSX.Element {
        return (
            <ModifyPermissions
                currentSettings={this.state.currentSettings}
                onCancel={this._onLinkPermissionsCancelClicked}
                onSelectedPermissionsChange={this._onLinkPermissionsApplyClicked}
                sharingInformation={this.state.sharingInformation}
            />
        );
    }

    private _renderNotification(): JSX.Element {
        const state = this.state;

        return (
            <ShareNotification
                companyName={state.sharingInformation.companyName}
                currentSettings={state.currentSettings}
                isCopy={state.isCopy}
                sharingLinkCreated={state.sharingLinkCreated}
            />
        );
    }

    private _renderPermissionsList(): JSX.Element {
        return (
            <PermissionsList
                sharingInformation={this.state.sharingInformation}
            />
        );
    }

    private _showModifyPermissions(): void {
        this._checkNotification();

        this.setState({
            ...this.state,
            viewState: ShareViewState.MODIFY_PERMISSIONS
        });
    }

    private _showPermissionsList(): void {
        this.setState({
            ...this.state,
            viewState: ShareViewState.PERMISSIONS_LIST
        });
    }

    private _showPolicy(): void {
        this.setState({
            ...this.state,
            viewState: ShareViewState.POLICY_DETAILS
        });
    }
}