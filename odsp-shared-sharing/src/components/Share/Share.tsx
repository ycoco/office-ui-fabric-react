import './Share.scss';
import { autobind } from 'office-ui-fabric-react/lib/Utilities';
import { CopyLink } from '../CopyLink/CopyLink';
import { Header } from '../Header/Header';
import { ISharingInformation, ISharingLinkSettings, IShareStrings, ISharingLink, ISharingStore, ClientId, ShareType, SharingAudience } from '../../interfaces/SharingInterfaces';
import { ModifyPermissions } from '../ModifyPermissions/ModifyPermissions';
import { PermissionsList } from '../PermissionsList/PermissionsList';
import { ShareMain } from '../ShareMain/ShareMain';
import { ShareNotification } from '../ShareNotification/ShareNotification';
import { SharePolicyDetails } from '../SharePolicyDetails/SharePolicyDetails';
import { Spinner, SpinnerType } from 'office-ui-fabric-react/lib/Spinner';
import * as React from 'react';
import * as StringHelper from '@ms/odsp-utilities/lib/string/StringHelper';

export interface IShareProps {
    clientId?: ClientId; // Identifier of which partner is hosting.
    copyLinkShortcut?: boolean; // If true, bypass share UI and create the default sharing link.
    showExistingAccessOption?: boolean;
    onManageAccessClicked?: () => void; // Callback for when user clicks on "Manage Access".
}

export interface IShareState {
    companyName: string;
    currentSettings: ISharingLinkSettings; // Defines the currently selected link settings.
    shareType: ShareType;
    sharingInformation: ISharingInformation; // Object that has all of the relevant sharing information to render UI.
    sharingLinkCreated: ISharingLink; // The link that is created from the UI.
    viewState: ShareViewState;
    readyToCopy: boolean;
}

export const enum ShareViewState {
    default,
    modifyPermissions,
    linkSuccess,
    permissionsList,
    grantPermissions,
    policyDetails,
    error
}

export class Share extends React.Component<IShareProps, IShareState> {
    private _dismiss: () => void;
    private _resize: () => void;
    private _store: ISharingStore;
    private _strings: IShareStrings;
    private _viewStates: Array<number> = [];

    static contextTypes = {
        resize: React.PropTypes.func.isRequired,
        onDismiss: React.PropTypes.func.isRequired,
        sharingStore: React.PropTypes.object.isRequired,
        strings: React.PropTypes.object.isRequired
    };

    constructor(props: IShareProps, context: any) {
        super(props);

        this._dismiss = context.onDismiss;
        this._resize = context.resize;
        this._store = context.sharingStore;
        this._strings = context.strings;

        this.state = {
            companyName: null,
            currentSettings: null,
            sharingInformation: null,
            sharingLinkCreated: null,
            viewState: ShareViewState.default,
            readyToCopy: false,
            shareType: ShareType.share
        };

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
        this._onSelectedPeopleChange = this._onSelectedPeopleChange.bind(this);
        this._copyLinkOnApplyClicked = this._copyLinkOnApplyClicked.bind(this);
        this._copyLinkOnCancelClicked = this._copyLinkOnCancelClicked.bind(this);
    }

    public componentDidMount() {
        const store = this._store;

        // Make a call to get sharing information when component mounts.
        store.fetchCompanyName();
        store.fetchSharingInformation();

        // Subscribe to store change events.
        store.addListener(() => {
            // Get new information from store.
            const sharingInformation = store.getSharingInformation();
            const sharingLinkCreated = store.getSharingLinkCreated();
            const companyName = store.getCompanyName();

            // If currentSettings haven't been initialized, initialize it
            // with sharingInformation.
            if (this.state.currentSettings === null && !sharingInformation.error) {
                this._initializeCurrentSettings(sharingInformation.defaultSharingLink, sharingInformation);
            }

            // If a link was created, render ShareNotification view.
            if (sharingLinkCreated) {
                const shareType = this.state.shareType;

                if (shareType === ShareType.outlook) {
                    // Open OWA compose.
                    this._store.navigateToOwa();

                    // Dismis share UI since Outlook is taking over.
                    this._dismiss();
                } else {
                    this.setState({
                        ...this.state,
                        viewState: ShareViewState.linkSuccess,
                        sharingLinkCreated
                    });
                }
            } else {
                if (this.props.copyLinkShortcut) {
                    this._onCopyLinkClicked(true);
                }

                this.setState({
                    ...this.state,
                    sharingInformation,
                    companyName
                });
            }
        });
    }

    /**
     * This will cleanup the default link that was created if we're in the
     * copy link flow and the user created a different type of link (indicating
     * that they did want the default link type created).
     */
    public componentWillUnmount() {
        // Straight return if no link was created.
        const sharingLinkCreated = this.state.sharingLinkCreated;
        if (!sharingLinkCreated) {
            return;
        }

        // Cleanup link if the link kind matches the default kind and the store
        // tells us cleanup is required.
        const defaultLink = this.state.sharingInformation.defaultSharingLink;
        if (defaultLink.sharingLinkKind !== this.state.sharingLinkCreated.sharingLinkKind
            && this._store.isCleanupRequired()) {
            this._store.unshareLink(defaultLink.sharingLinkKind, defaultLink.shareId);
        }
    }

    public componentDidUpdate(prevProps: IShareProps, prevState: IShareState) {
        this._resize();
    }

    public render(): React.ReactElement<{}> {
        if (this.state.sharingInformation && this.state.sharingInformation.error) {
            return (
                <div className='od-Share'>
                    <Header viewState={ ShareViewState.error } />
                    <div className='od-Share-error'>{ this._strings.getSharingInformationError }</div>
                </div>
            );
        } else if (this.state.sharingInformation && this.state.currentSettings && !this.props.copyLinkShortcut) {
            // Attempt to notify host that UI is really ready.
            try {
                const externalJavaScript: any = window.external;
                externalJavaScript.PageFinishedLoading();
            } catch (error) {
                // Nothing.
            }

            return (
                <div
                    className='od-Share'
                    onClick={ (ev) => {
                        // Prevents list deselection.
                        ev.nativeEvent.stopImmediatePropagation();
                    }
                    }>
                    { this._renderViews() }
                    { this._renderBackButton() }
                </div>
            );
        } else if (this.state.sharingInformation && this.state.currentSettings && this.props.copyLinkShortcut) {
            const state = this.state;
            return (
                <div className='od-Share'>
                    <CopyLink
                        clientId={ this.props.clientId }
                        companyName={ state.companyName }
                        currentSettings={ state.currentSettings }
                        item={ state.sharingInformation.item }
                        onLinkPermissionsApplyClicked={ this._copyLinkOnApplyClicked }
                        onLinkPermissionsCancelClicked={ this._copyLinkOnCancelClicked }
                        onSelectedPeopleChange={ this._onSelectedPeopleChange }
                        onShareHintClicked={ this._getNotificationHintClickHandler(state.sharingLinkCreated.createdViaCopyLinkCommand) }
                        sharingInformation={ state.sharingInformation }
                        sharingLinkCreated={ state.sharingLinkCreated }
                        showExistingAccessOption={ this.props.showExistingAccessOption }
                        viewState={ state.viewState }
                    />
                </div>
            );
        } else {
            return (
                <div className='od-Share-spinnerHolder'>
                    <Spinner
                        className='od-Share-spinner'
                        label={ this._strings.componentLoading }
                        type={ SpinnerType.large }
                    />
                </div>
            );
        }
    }

    private _copyLinkOnCancelClicked() {
        this.setState({
            ...this.state,
            viewState: ShareViewState.linkSuccess
        });
    }

    private _copyLinkOnApplyClicked(settings: ISharingLinkSettings) {
        this.setState({
            ...this.state,
            currentSettings: settings
        }, () => {
            this._onCopyLinkClicked(true);
        });
    }

    private _calculateDays(expiry: Date) {
        const ONE_DAY = 24 * 60 * 60 * 1000;

        return Math.round((expiry.getTime() - Date.now()) / (ONE_DAY));
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

    private _initializeCurrentSettings(link: ISharingLink, sharingInformation: ISharingInformation) {
        if (link.audience === SharingAudience.specificPeople) {
            if (!sharingInformation.canManagePermissions) {
                link.audience = SharingAudience.existing;
            }
        }

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

    private _onCopyLinkClicked(copyLinkShortcut?: boolean): void {
        this.setState({
            ...this.state,
            shareType: ShareType.copy
        }, () => {
            this._store.shareLink(this.state.currentSettings, null /* recipients */, undefined /* emailData */, copyLinkShortcut);
        });
    }

    @autobind
    private _onOutlookClicked(): void {
        this.setState({
            ...this.state,
            shareType: ShareType.outlook
        }, () => {
            this._store.shareLink(this.state.currentSettings, null /* recipients */, undefined /* emailData */, false);
        });
    }

    private _onLinkPermissionsApplyClicked(newSettings: ISharingLinkSettings): void {
        this._onSelectedPermissionsChange(newSettings);
    }

    private _onLinkPermissionsCancelClicked(): void {
        this.setState({
            ...this.state,
            viewState: ShareViewState.default
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
            viewState: ShareViewState.default,
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

    private _onSelectedPeopleChange(items: Array<any>) {
        this.setState({
            ...this.state,
            currentSettings: {
                ...this.state.currentSettings,
                specificPeople: items
            }
        });
    }

    private _onSendLinkClicked(recipients: any, message: string): void {
        this.setState({
            ...this.state,
            shareType: ShareType.share
        }, () => {
            this._store.shareLink(this.state.currentSettings, recipients, message);
        });
    }

    private _renderBackButton(): JSX.Element {
        const viewState = this.state.viewState;

        if (viewState === ShareViewState.permissionsList ||
            viewState === ShareViewState.policyDetails) {
            return (
                <button
                    className='od-Share-backButton'
                    onClick={ () => { this.setState({ ...this.state, viewState: this._viewStates.pop() }) } }>
                    <i className='ms-Icon ms-Icon--Back'></i>
                </button>
            );
        }
    }

    private _renderViews(): JSX.Element {
        switch (this.state.viewState) {
            case ShareViewState.modifyPermissions:
                return this._renderModifyPermissions();
            case ShareViewState.linkSuccess:
                return this._renderNotification();
            case ShareViewState.permissionsList:
                return this._renderPermissionsList();
            case ShareViewState.policyDetails:
                return this._renderPolicyDetails();
            default:
                return this._renderShareMain();
        }
    }

    private _renderShareMain(): React.ReactElement<{}> {
        return (
            <ShareMain
                clientId={ this.props.clientId }
                companyName={ this.state.companyName }
                currentSettings={ this.state.currentSettings }
                item={ this.state.sharingInformation.item }
                onCopyLinkClicked={ this._onCopyLinkClicked }
                onOutlookClicked={ this._onOutlookClicked }
                onPolicyClick={ this._showPolicy }
                onSelectedPeopleChange={ this._onSelectedPeopleChange }
                onSendLinkClicked={ this._onSendLinkClicked }
                onShareHintClicked={ this._showModifyPermissions }
                onShowPermissionsListClicked={ this._showPermissionsList }
                sharingInformation={ this.state.sharingInformation }
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
                clientId={ this.props.clientId }
                companyName={ this.state.companyName }
                currentSettings={ this.state.currentSettings }
                doesCreate={ false }
                onCancel={ this._onLinkPermissionsCancelClicked }
                onSelectedPermissionsChange={ this._onLinkPermissionsApplyClicked }
                sharingInformation={ this.state.sharingInformation }
                showExistingAccessOption={ this.props.showExistingAccessOption }
            />
        );
    }

    private _renderNotification(): JSX.Element {
        const state = this.state;
        const sharingInformation = state.sharingInformation;
        const sharingLinkCreated = state.sharingLinkCreated;

        return (
            <ShareNotification
                companyName={ state.companyName }
                currentSettings={ state.currentSettings }
                shareType={ state.shareType }
                sharingInformation={ sharingInformation }
                sharingLinkCreated={ sharingLinkCreated }
                onShareHintClicked={ this._getNotificationHintClickHandler(sharingLinkCreated.createdViaCopyLinkCommand) }
            />
        );
    }

    private _getNotificationHintClickHandler(createdViaCopyLink: boolean) {
        return createdViaCopyLink ? this._showModifyPermissions.bind(this, createdViaCopyLink) : null;
    }

    private _renderPermissionsList(): JSX.Element {
        return (
            <PermissionsList
                clientId={ this.props.clientId }
                companyName={ this.state.companyName }
                sharingInformation={ this.state.sharingInformation }
            />
        );
    }

    private _showModifyPermissions(createdViaCopyLink?: boolean): void {
        this.setState({
            ...this.state,
            viewState: ShareViewState.modifyPermissions
        });
    }

    private _showPermissionsList(): void {
        const onManageAccessClicked = this.props.onManageAccessClicked;

        if (onManageAccessClicked) {
            onManageAccessClicked();
        } else {
            this.setState({
                ...this.state,
                viewState: ShareViewState.permissionsList
            });
        }
    }

    private _showPolicy(): void {
        this.setState({
            ...this.state,
            viewState: ShareViewState.policyDetails
        });
    }
}