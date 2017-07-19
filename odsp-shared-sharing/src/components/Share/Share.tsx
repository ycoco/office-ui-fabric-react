import './Share.scss';
import { autobind } from 'office-ui-fabric-react/lib/Utilities';
import { CopyLink } from '../CopyLink/CopyLink';
import { Header } from '../Header/Header';
import {
    ISharingInformation, ISharingLinkSettings, IShareStrings, ISharingLink, ISharingStore,
    ClientId, ShareType, SharingAudience, Mode, IEngagementExtraData, SharingLinkKind, IPolicyTipInformation,
    AccessStatus, Category
} from '../../interfaces/SharingInterfaces';
import { ModifyPermissions } from '../ModifyPermissions/ModifyPermissions';
import { PermissionsList } from '../PermissionsList/PermissionsList';
import { ShareMain } from '../ShareMain/ShareMain';
import { ShareNotification } from '../ShareNotification/ShareNotification';
import { SharePolicyDetails } from '../SharePolicyDetails/SharePolicyDetails';
import { Spinner, SpinnerType } from 'office-ui-fabric-react/lib/Spinner';
import * as EngagementHelper from '../../utilities/EngagementHelper';
import * as React from 'react';
import * as StringHelper from '@ms/odsp-utilities/lib/string/StringHelper';
import * as PeoplePickerHelper from '../../utilities/PeoplePickerHelper';
import { IPerson } from '@ms/odsp-datasources/lib/PeoplePicker';
import { Label } from 'office-ui-fabric-react/lib/Label';
import * as ClientIdHelper from '../../utilities/ClientIdHelper';
import { Fabric } from 'office-ui-fabric-react/lib/Fabric';
import { ActivityIndicator } from '../ActivityIndicator/ActivityIndicator';
import { IconButton, IButtonProps } from 'office-ui-fabric-react/lib/Button';

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
    recipientsCount?: number; // Used for telemetry only.
    hasMessage?: boolean; // Used for telemetry only.
    externalRecipientsCount?: number; // Used for telemetry only.
    groupsMemberCount: number;
    policyTipInformation: IPolicyTipInformation;
    linkRecipients: Array<IPerson>; // List of recipients that'll receive email with link (not necessarily permissioned).
    shareTargetClicked: boolean;
    showActivityIndicator: boolean;
    permissionsMap: { [index: string]: AccessStatus };
    messageText: string; // The text currently in the message field.
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
    private _engagementExtraData: IEngagementExtraData;
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
            shareType: ShareType.share,
            groupsMemberCount: 0,
            policyTipInformation: null,
            linkRecipients: [],
            shareTargetClicked: false,
            showActivityIndicator: false,
            permissionsMap: {},
            messageText: ''
        };

        this._engagementExtraData = {
            clientId: props.clientId,
            mode: props.copyLinkShortcut ? Mode.copy : Mode.share
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
        EngagementHelper.opened(this._engagementExtraData);
        const store = this._store;

        // Subscribe to store change events.
        store.addListener(() => {
            // Get new information from store.
            const sharingInformation = store.getSharingInformation();
            const sharingLinkCreated = store.getSharingLinkCreated();
            const companyName = store.getCompanyName();
            const groupsMemberCount = store.getGroupsMemberCount();
            const policyTipInformation = store.getPolicyTipInformation();
            const permissionsMap = store.getPermissionsMap();

            // If sharingInformation hasn't been set in the store, don't progress.
            if (!sharingInformation) {
                return;
            }

            // If currentSettings haven't been initialized, initialize it
            // with sharingInformation.
            let settings = this.state.currentSettings;
            if (!settings && (sharingInformation && !sharingInformation.error)) {
                settings = this._initializeCurrentSettings(sharingInformation.defaultSharingLink, sharingInformation);
            }

            /**
             * Cleanup link if the link kind matches the default kind and the store tells us
             * cleanup is required.
             */
            if (sharingLinkCreated) {
                const defaultLink = sharingInformation.defaultSharingLink;
                if (defaultLink.sharingLinkKind !== sharingLinkCreated.sharingLinkKind
                    && this._store.isCleanupRequired()) {
                    this._store.unshareLink(defaultLink.sharingLinkKind, defaultLink.shareId);
                }
            }

            // If a link was created, render ShareNotification view.
            if (sharingLinkCreated && (this.state.shareTargetClicked || this.props.copyLinkShortcut)) {
                const shareType = this.state.shareType;

                const currentSettings = this.state.currentSettings;
                const isEdit = currentSettings ? currentSettings.isEdit : settings.isEdit;

                const extraData: IEngagementExtraData = {
                    ...this._engagementExtraData,
                    shareType: shareType,
                    audience: sharingLinkCreated.audience,
                    isEdit: isEdit,
                    recipientsCount: this.state.recipientsCount,
                    externalRecipientsCount: this.state.externalRecipientsCount,
                    hasMessage: this.state.hasMessage,
                    daysUntilExpiry: this._getNumberOfDaysUntilExpiry(sharingLinkCreated),
                    isDefaultLink: sharingInformation.defaultSharingLink.sharingLinkKind === sharingLinkCreated.sharingLinkKind
                };
                EngagementHelper.shareCompleted(extraData);

                if (shareType === ShareType.outlook || shareType === ShareType.nonOutlook) {
                    if (ClientIdHelper.isODSP(this.props.clientId) || this.props.clientId === ClientId.officecom) {
                        // Open OWA compose.
                        this._store.navigateToOwa(this._getRecipientEmails(this.state.linkRecipients));

                        // Dismiss share UI since Outlook is taking over.
                        this._dismiss();
                    } else {
                        try {
                            const externalJavaScript: any = window.external;
                            externalJavaScript.SendViaOutlookWithContext(this._getRecipientEmails(this.state.linkRecipients), this.state.linkRecipients.length, this.state.messageText, sharingLinkCreated.url);
                        } catch (error) {
                            // Nothing.
                        }
                    }
                } else if (shareType === ShareType.moreApps) {
                    try {
                        const externalJavaScript: any = window.external;
                        externalJavaScript.SendLinkViaMoreApps(sharingLinkCreated.url);
                    } catch (error) {
                        // Nothing.
                    }
                } else {
                    this.setState({
                        ...this.state,
                        viewState: ShareViewState.linkSuccess,
                        sharingLinkCreated,
                        showActivityIndicator: false
                    });
                }
            } else {
                if (this.props.copyLinkShortcut && sharingInformation && !sharingInformation.error) {
                    this._onCopyLinkClicked(true, settings);
                }

                this.setState({
                    ...this.state,
                    sharingInformation,
                    companyName,
                    groupsMemberCount,
                    currentSettings: settings,
                    policyTipInformation,
                    showActivityIndicator: false,
                    permissionsMap
                });
            }
        });

        // Make a call to get sharing information when component mounts.
        store.fetchCompanyName();
        store.fetchSharingInformation();
        store.fetchPolicyTipInformation();
    }

    public componentDidUpdate(prevProps: IShareProps, prevState: IShareState) {
        this._resize();
    }

    public render(): React.ReactElement<{}> {
        const strings = this._strings;
        let visibleContent;

        if (this.state.sharingInformation && this.state.sharingInformation.error) {
            // Attempt to notify host that there was an error loading the UI.
            try {
                const externalJavaScript: any = window.external;
                externalJavaScript.PageError(this.state.sharingInformation.error, Category.getSharingInformation, '');
            } catch (error) {
                // Nothing.
            }

            visibleContent = (
                <div className='od-Share'>
                    <Header viewState={ ShareViewState.error } />
                    <div className='od-Share-error'>{ strings.getSharingInformationError }</div>
                </div>
            );
        } else if (this.state.sharingInformation && this.state.currentSettings && !this.props.copyLinkShortcut) {
            const hasActivityClass: string = this.state.showActivityIndicator ? ' od-Share--hasActivity' : '';

            // Attempt to notify host that UI is really ready.
            try {
                const externalJavaScript: any = window.external;
                externalJavaScript.PageFinishedLoading();
            } catch (error) {
                const readyData = {
                    name: 'share_ready'
                };
                window.top.postMessage(JSON.stringify(readyData), '*');
            }

            visibleContent = (
                <div className={ 'od-Share' + hasActivityClass }>
                    { this._renderViews() }
                    { this._renderBackButton() }
                    { this._renderActivityIndicator() }
                </div>
            );
        } else if (this.state.sharingInformation && this.state.currentSettings && this.props.copyLinkShortcut) {
            const state = this.state;
            visibleContent = (
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
                        groupsMemberCount={ state.groupsMemberCount }
                        onViewPolicyTipClicked={ this._onViewPolicyTipClicked }
                    />
                </div>
            );
        } else {
            visibleContent = (
                <div className='od-Share-spinnerHolder'>
                    <Spinner
                        className='od-Share-spinner'
                        label={ strings.componentLoading }
                        type={ SpinnerType.large }
                    />
                </div>
            );
        }

        let currentPageLabel = '';
        switch (this.state.viewState) {
            case ShareViewState.modifyPermissions:
                currentPageLabel = strings.pageLabelLinkSettings;
                break;
            case ShareViewState.linkSuccess:
                currentPageLabel = strings.pageLabelLinkCreated;
                break;
            case ShareViewState.permissionsList:
                currentPageLabel = strings.pageLabelManageAccess;
                break;
            case ShareViewState.policyDetails:
                currentPageLabel = strings.pageLabelPolicyTipDetails;
                break;
            case ShareViewState.default:
                currentPageLabel = strings.pageLabelSendLink;
                break;
            default:
                currentPageLabel = '';
        }

        if (this.state.showActivityIndicator) {
            currentPageLabel = strings.applyingLinkSettings + currentPageLabel;
        }

        return (
            <Fabric aria-live='assertive'>
                <span role='alert' className='od-Share-screenReaderOnly'>{ currentPageLabel }</span>
                { visibleContent }
            </Fabric>
        );
    }

    private _getRecipientEmails(recipients: Array<IPerson>): Array<string> {
        const recipientEmails = [];

        for (const recipient of recipients) {
            const email = recipient.email;
            if (email) {
                recipientEmails.push(email);
            }
        }

        return recipientEmails;
    }

    private _getNumberOfDaysUntilExpiry(sharingLink: ISharingLink) {
        const ONE_DAY_IN_MS = 86400000;
        const expiration = sharingLink.expiration && new Date(sharingLink.expiration);
        const today = new Date();

        if (!expiration) {
            return undefined;
        }

        const numberOfDays = (expiration.getTime() - today.getTime()) / ONE_DAY_IN_MS;
        return Math.floor(numberOfDays);
    }

    private _copyLinkOnCancelClicked() {
        this.setState({
            ...this.state,
            viewState: ShareViewState.linkSuccess
        }, () => {
            EngagementHelper.linkSettingsCancelClicked(this._engagementExtraData);
        });
    }

    private _copyLinkOnApplyClicked(settings: ISharingLinkSettings) {
        this.setState({
            ...this.state,
            currentSettings: settings
        }, () => {
            EngagementHelper.linkSettingsApplyClicked(this._engagementExtraData);
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

    private _initializeCurrentSettings(link: ISharingLink, sharingInformation: ISharingInformation): ISharingLinkSettings {
        if (link.audience === SharingAudience.specificPeople) {
            if (!sharingInformation.canManagePermissions || sharingInformation.blockPeoplePickerAndSharing) {
                link.audience = SharingAudience.existing;
            }
        }

        const sharingLinkKind = link.sharingLinkKind;
        const allowEditing = sharingLinkKind === SharingLinkKind.anonymousEdit || sharingLinkKind === SharingLinkKind.organizationEdit || sharingLinkKind === SharingLinkKind.direct;

        return {
            allowEditing: allowEditing,
            audience: link.audience,
            expiration: link.expiration || null,
            isEdit: link.isEdit,
            sharingLinkKind: link.sharingLinkKind,
            specificPeople: []
        };
    }

    @autobind
    private _onShareTargetClicked(shareType: ShareType): void {
        if (shareType === ShareType.copy) {
            const shareTargetClickedData = {
                name: 'share_copyLinkClicked'
            };
            window.top.postMessage(JSON.stringify(shareTargetClickedData), '*');

            this._onCopyLinkClicked();
        } else if (shareType === ShareType.outlook) {
            const shareTargetClickedData = {
                name: 'share_outlookClicked'
            };
            window.top.postMessage(JSON.stringify(shareTargetClickedData), '*');

            this._onOutlookClicked();
        } else if (shareType === ShareType.nonOutlook) {
            this._onNonOutlookClicked();
        } else if (shareType === ShareType.moreApps) {
            this._onMoreAppsClicked();
        }
    }

    /**
     * Creates a link to copy.
     * @param initializedSettings Only used in the initial click of the "Copy link" command.
     */
    private _onCopyLinkClicked(copyLinkShortcut?: boolean, initializedSettings?: ISharingLinkSettings): void {
        const settings = {
            ...initializedSettings,
            ...this.state.currentSettings
        };

        // "Copy Link" share target doesn't care about people.
        if (!copyLinkShortcut) {
            settings.specificPeople = [];
        }

        this.setState({
            ...this.state,
            shareType: ShareType.copy,
            shareTargetClicked: true
        }, () => {
            this._store.shareLink(settings, null /* recipients */, undefined /* emailData */, copyLinkShortcut);
        });
    }

    @autobind
    private _onOutlookClicked(): void {
        this.setState({
            ...this.state,
            shareType: ShareType.outlook,
            shareTargetClicked: true
        }, () => {
            this._store.shareLink(this.state.currentSettings, null /* recipients */, undefined /* emailData */, false);
        });
    }

    @autobind
    private _onNonOutlookClicked(): void {
        this.setState({
            ...this.state,
            shareType: ShareType.nonOutlook,
            shareTargetClicked: true
        }, () => {
            this._store.shareLink(this.state.currentSettings, null /* recipients */, undefined /* emailData */, false);
        });
    }

    @autobind
    private _onMoreAppsClicked(): void {
        this.setState({
            ...this.state,
            shareType: ShareType.moreApps,
            shareTargetClicked: true
        }, () => {
            this._store.shareLink(this.state.currentSettings, null /* recipients */, undefined /* emailData */, false);
        });
    }

    private _onLinkPermissionsApplyClicked(newSettings: ISharingLinkSettings): void {
        EngagementHelper.linkSettingsApplyClicked(this._engagementExtraData);

        this._onSelectedPermissionsChange(newSettings);
    }

    private _onLinkPermissionsCancelClicked(): void {
        this.setState({
            ...this.state,
            viewState: ShareViewState.default
        }, () => {
            EngagementHelper.linkSettingsCancelClicked(this._engagementExtraData);
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
            },
            linkRecipients: permissions.specificPeople,
            showActivityIndicator: true
        }, () => {
            this._store.shareLink(this.state.currentSettings);
        });
    }

    private _onSelectedPeopleChange(items: Array<IPerson>) {
        const permissionsMap = this.state.permissionsMap;
        if (this.state.currentSettings.sharingLinkKind === SharingLinkKind.direct) {
            // Get new permissions map from the store.
            this._store.checkPermissions(items);
        }

        this.setState({
            ...this.state,
            linkRecipients: items,
            permissionsMap
        }, () => {
            this._store.fetchGroupsMemberCount(items);
        });
    }

    private _onSendLinkClicked(message: string): void {
        const recipients = this.state.linkRecipients;

        this.setState({
            ...this.state,
            shareType: ShareType.share,
            recipientsCount: recipients.length,
            externalRecipientsCount: PeoplePickerHelper.getExternalPeopleCount(recipients),
            hasMessage: !!message,
            shareTargetClicked: true
        }, () => {
            const sendClickedData = {
                name: 'share_sendClicked'
            };
            window.top.postMessage(JSON.stringify(sendClickedData), '*');

            this._store.shareLink(this.state.currentSettings, recipients, message);
        });
    }

    @autobind
    private _onViewPolicyTipClicked(): void {
        this.setState({
            ...this.state,
            viewState: ShareViewState.policyDetails
        });
    }

    @autobind
    private _onSendLinkMessageChange(messageText: string): void {
        this.setState({
            ...this.state,
            messageText
        });
    }

    @autobind _onShareTargetsRendered(shareTargets: Array<ShareType>): void {
        const extraData: IEngagementExtraData = {
            ...this._engagementExtraData,
            shareTargets
        };

        EngagementHelper.shareTargets(extraData);
    }

    private _renderBackButton(): JSX.Element {
        const viewState = this.state.viewState;

        if (viewState === ShareViewState.permissionsList ||
            viewState === ShareViewState.policyDetails) {
            return (
                <IconButton
                    className='od-Share-backButton'
                    onClick={ () => { this.setState({ ...this.state, viewState: this._viewStates.pop() }) } }
                    iconProps={ { iconName: 'Back' } }
                    ariaLabel={ this._strings.backButtonLabel }
                ></IconButton>
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
        this._viewStates.push(ShareViewState.default);

        return (
            <ShareMain
                clientId={ this.props.clientId }
                companyName={ this.state.companyName }
                currentSettings={ this.state.currentSettings }
                item={ this.state.sharingInformation.item }
                onPolicyClick={ this._showPolicy }
                onSelectedPeopleChange={ this._onSelectedPeopleChange }
                onSendLinkClicked={ this._onSendLinkClicked }
                onShareHintClicked={ this._showModifyPermissions }
                onShowPermissionsListClicked={ this._showPermissionsList }
                sharingInformation={ this.state.sharingInformation }
                groupsMemberCount={ this.state.groupsMemberCount }
                onViewPolicyTipClicked={ this._onViewPolicyTipClicked }
                linkRecipients={ this.state.linkRecipients }
                permissionsMap={ this.state.permissionsMap }
                messageText={ this.state.messageText }
                onSendLinkMessageChange={ this._onSendLinkMessageChange }
                onShareTargetClicked={ this._onShareTargetClicked }
                onShareTargetsRendered={ this._onShareTargetsRendered }
            />
        );
    }

    private _renderPolicyDetails(): JSX.Element {
        return (
            <SharePolicyDetails
                clientId={ this.props.clientId }
                sharingInformation={ this.state.sharingInformation }
                policyTipInformation={ this.state.policyTipInformation }
            />
        );
    }

    private _renderModifyPermissions(): JSX.Element {
        this._viewStates.push(ShareViewState.modifyPermissions);

        return (
            <ModifyPermissions
                clientId={ this.props.clientId }
                companyName={ this.state.companyName }
                currentSettings={ this.state.currentSettings }
                doesCreate={ true }
                onCancel={ this._onLinkPermissionsCancelClicked }
                onSelectedPermissionsChange={ this._onLinkPermissionsApplyClicked }
                sharingInformation={ this.state.sharingInformation }
                showExistingAccessOption={ this.props.showExistingAccessOption }
                groupsMemberCount={ this.state.groupsMemberCount }
                onViewPolicyTipClicked={ this._onViewPolicyTipClicked }
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
                clientId={ this.props.clientId }
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
        }, () => {
            EngagementHelper.linkSettingsOpened(this._engagementExtraData);
        });
    }

    private _showPermissionsList(): void {
        EngagementHelper.manageAccessOpened(this._engagementExtraData);

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

    private _renderActivityIndicator(): React.ReactElement<{}> {
        if (this.state.showActivityIndicator) {
            return (
                <ActivityIndicator message={ this._strings.applyingLinkSettings } />
            );
        }
    }
}