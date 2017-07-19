import './ModifyPermissions.scss';
import { autobind } from 'office-ui-fabric-react/lib/Utilities';
import { Header } from '../Header/Header';
import { IPerson } from '@ms/odsp-datasources/lib/PeoplePicker';
import { ISharingInformation, ISharingLink, ISharingLinkSettings, SharingAudience, SharingLinkKind, IShareStrings, ClientId } from '../../interfaces/SharingInterfaces';
import { PermissionsSettings } from './PermissionsSettings/PermissionsSettings';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { ShareViewState } from '../Share/Share';
import * as PeoplePickerHelper from '../../utilities/PeoplePickerHelper';
import * as React from 'react';
import { ActivityIndicator } from '../ActivityIndicator/ActivityIndicator';

export interface IModifyPermissionsProps {
    clientId: ClientId;
    companyName: string;
    currentSettings: ISharingLinkSettings;
    doesCreate: boolean; // "Copy link" flow creates link on apply, "Share flow" does not.
    onCancel: () => void;
    onSelectedPermissionsChange: (currentSettings: ISharingLinkSettings) => void;
    sharingInformation: ISharingInformation;
    showExistingAccessOption: boolean;
    groupsMemberCount: number;
    onViewPolicyTipClicked: () => void;
}

export interface IModifyPermissionsState {
    expirationErrorCode: ExpirationErrorCode;
    peoplePickerError: JSX.Element;
    selectedPermissions: ISharingLinkSettings;
    showActivityIndicator: boolean;
}

export enum ExpirationErrorCode {
    NONE,
    PAST_DATE,
    ADMIN_POLICY,
    OVER_MAX
}

export class ModifyPermissions extends React.Component<IModifyPermissionsProps, IModifyPermissionsState> {
    private _strings: IShareStrings;

    static contextTypes = {
        strings: React.PropTypes.object.isRequired
    };

    constructor(props: IModifyPermissionsProps, context: any) {
        super(props);

        this.state = this._initializeState();

        this._strings = context.strings;

        this._initializeState = this._initializeState.bind(this);
        this._onApplyClicked = this._onApplyClicked.bind(this);
        this._onCancel = this._onCancel.bind(this);
        this._onPeoplePickerChange = this._onPeoplePickerChange.bind(this);
        this._updateExpirationErrorCode = this._updateExpirationErrorCode.bind(this);
        this.onAudienceChange = this.onAudienceChange.bind(this);
        this.onEditChange = this.onEditChange.bind(this);
        this.onExpirationChange = this.onExpirationChange.bind(this);
    }

    public render(): React.ReactElement<{}> {
        const blockerClass: string = this.state.showActivityIndicator ? ' blocker' : '';

        return (
            <div className={ 'od-ModifyPermissions' + blockerClass }>
                <Header
                    clientId={ this.props.clientId }
                    item={ this.props.sharingInformation.item }
                    viewState={ ShareViewState.modifyPermissions }
                />
                <div className='od-ModifyPermissions-section'>
                    <PermissionsSettings
                        companyName={ this.props.companyName }
                        currentSettings={ this.props.currentSettings }
                        onAudienceChange={ this.onAudienceChange }
                        onEditChange={ this.onEditChange }
                        onExpirationChange={ this.onExpirationChange }
                        onPeoplePickerChange={ this._onPeoplePickerChange }
                        peoplePickerError={ this.state.peoplePickerError }
                        selectedPermissions={ this.state.selectedPermissions }
                        sharingInformation={ this.props.sharingInformation }
                        showExistingAccessOption={ this.props.showExistingAccessOption }
                        updateExpirationErrorCode={ this._updateExpirationErrorCode }
                        groupsMemberCount={ this.props.groupsMemberCount }
                    />
                </div>
                <div className='od-ModifyPermissions-actions'>
                    <PrimaryButton
                        className='od-ModifyPermissions-apply'
                        disabled={ this._computeIsApplyButtonDisabled() }
                        onClick={ this._onApplyClicked }
                    >{ this._strings.applyButtonText }</PrimaryButton>
                    <DefaultButton onClick={ this._onCancel }>{ this._strings.cancelButtonText }</DefaultButton>
                </div>
                { this._renderActivityIndicator() }
            </div>
        );
    }

    public onAudienceChange(audience: SharingAudience) {
        const links: Array<ISharingLink> = this.props.sharingInformation.sharingLinks;
        const isEdit = this.state.selectedPermissions.isEdit;

        // SharingAudience.EXISTING shares the same sharing links as SharingAudience.SPECIFIC_PEOPLE.
        const audienceMatcher = audience === SharingAudience.existing ? SharingAudience.specificPeople : audience;

        // Get all links that are relevant to the audience selected.
        const audienceLinks = links.filter((link) => {
            return audienceMatcher === link.audience;
        });

        // If there are no "edit" links relevant to the audience, then we'll
        // disable the "Allow editing" checkbox and set the value to false.
        let allowEditing = false;
        for (const link of audienceLinks) {
            if (this._computeIsEditLink(link.sharingLinkKind)) {
                allowEditing = true;
            }
        }

        // Determine which link entry we'll use to initialize "Other settings" section
        // in UI.
        const role = allowEditing && isEdit;
        const linkKind = this._getLinkKind(audience, role);

        // Find the link entry that matches the current state of the dialog.
        const targetLink = links.filter((link: ISharingLink) => {
            return link.sharingLinkKind === linkKind;
        })[0];

        // Get the expiration from the link (if it exists).
        const linkExpiration = targetLink && targetLink.expiration;
        const expiration = linkExpiration ? new Date(linkExpiration) : this._getDefaultExpirationDateValue();

        const newSettings: ISharingLinkSettings = {
            allowEditing: allowEditing,
            audience: audience,
            expiration: expiration,
            isEdit: role,
            sharingLinkKind: linkKind,
            specificPeople: []
        };

        this.setState({
            ...this.state,
            peoplePickerError: null,
            selectedPermissions: newSettings
        });
    };

    public onEditChange(value) {
        const selectedPermissions = this.state.selectedPermissions;
        const links = this.props.sharingInformation.sharingLinks;
        const sharingLinkKind = this._getLinkKind(selectedPermissions.audience, value);

        // Find the link entry that matches the current state of the dialog.
        const targetLink = links.filter((link: ISharingLink) => {
            return link.sharingLinkKind === sharingLinkKind;
        })[0];

        // If the link has been created, update the settings to reflect the properties
        // of that link. Otherwise, just change edit value.
        const linkExpiration = targetLink && targetLink.expiration;
        const expiration = linkExpiration ? new Date(linkExpiration) : this._getDefaultExpirationDateValue();

        this.setState({
            ...this.state,
            selectedPermissions: {
                ...selectedPermissions,
                isEdit: value,
                expiration: expiration,
                sharingLinkKind: sharingLinkKind
            }
        });
    }

    /**
     * Sets selected date as the expiration. If no expiration is passed (i.e. null),
     * we'll determine the default expiration value depending on tenant settings.
     */
    public onExpirationChange(expiration: Date) {
        if (!expiration) {
            expiration = this._getDefaultExpirationDateValue();
        }

        this.setState({
            ...this.state,
            selectedPermissions: {
                ...this.state.selectedPermissions,
                expiration: expiration
            }
        });
    }

    private _renderActivityIndicator(): React.ReactElement<{}> {
        if (this.state.showActivityIndicator) {
            return (
                <ActivityIndicator message={ this._strings.activityMessageCreatingLink } />
            );
        }
    }

    private _getDefaultExpirationDateValue() {
        const requiredExpirationDays = this.props.sharingInformation.anonymousLinkExpirationRestrictionDays;
        if (requiredExpirationDays === -1) {
            return null;
        } else {
            // Get "tomorrow" and at the "end of the day".
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + requiredExpirationDays);
            return tomorrow;
        }
    }

    private _initializeState() {
        const props = this.props;
        const currentSettings = props.currentSettings;
        const sharingInformation = props.sharingInformation;

        const peoplePickerError = PeoplePickerHelper.renderPickerError({
            selectedItems: currentSettings.specificPeople,
            sharingLinkKind: SharingLinkKind.direct,
            canAddExternalPrincipal: sharingInformation.canAddExternalPrincipal,
            hasDlpPolicyTip: sharingInformation.item.hasDlpPolicy,
            viewPolicyTipCallback: props.onViewPolicyTipClicked,
            strings: this._strings
        });

        return {
            expirationErrorCode: ExpirationErrorCode.NONE,
            peoplePickerError: peoplePickerError,
            selectedPermissions: {
                allowEditing: currentSettings.allowEditing,
                audience: currentSettings.audience,
                isEdit: currentSettings.isEdit,
                expiration: currentSettings.expiration || this._getDefaultExpirationDateValue(),
                sharingLinkKind: currentSettings.sharingLinkKind,
                specificPeople: currentSettings.specificPeople
            },
            showActivityIndicator: false
        };
    }

    /**
     * Disables "Apply" button if there are any errors.
     */
    private _computeIsApplyButtonDisabled(): boolean {
        return this.state.expirationErrorCode !== ExpirationErrorCode.NONE ||
            !!this.state.peoplePickerError;
    }

    private _updateExpirationErrorCode(code: ExpirationErrorCode) {
        if (code !== this.state.expirationErrorCode) {
            this.setState({
                ...this.state,
                expirationErrorCode: code
            });
        }
    }

    private _onCancel(): void {
        this.props.onCancel();
    }

    private _onApplyClicked(): void {
        const state = this.state;

        // Check if there's any unresolved text in the PeoplePicker.
        const peoplePickerInput = document.querySelector('.od-Share-PeoplePicker .ms-BasePicker-input') as HTMLInputElement;
        if (peoplePickerInput && peoplePickerInput.value) {
            this.setState({
                ...this.state,
                peoplePickerError: <span>{ this._strings.unresolvedTextError }</span>
            });
            return;
        }

        const selectedPermissions = state.selectedPermissions;

        // Show activity indicator if view creates links.
        const showActivityIndicatorState = this.props.doesCreate;

        // Clear expiration if link type doesn't support it.
        const expirationState = selectedPermissions.audience !== SharingAudience.anyone ? null : selectedPermissions.expiration;

        this.setState({
            ...state,
            selectedPermissions: {
                ...selectedPermissions,
                expiration: expirationState
            },
            showActivityIndicator: showActivityIndicatorState
        }, () => {
            this.props.onSelectedPermissionsChange(this.state.selectedPermissions);
        })
    }

    private _onPeoplePickerChange(items: Array<IPerson>) {
        const peoplePickerError = PeoplePickerHelper.renderPickerError({
            selectedItems: items,
            sharingLinkKind: SharingLinkKind.direct,
            canAddExternalPrincipal: this.props.sharingInformation.canAddExternalPrincipal,
            hasDlpPolicyTip: this.props.sharingInformation.item.hasDlpPolicy,
            viewPolicyTipCallback: this.props.onViewPolicyTipClicked,
            strings: this._strings
        });

        this.setState({
            ...this.state,
            peoplePickerError: peoplePickerError,
            selectedPermissions: {
                ...this.state.selectedPermissions,
                specificPeople: items
            }
        });
    }

    private _getLinkKind(audience: SharingAudience, isEdit: boolean): SharingLinkKind {
        if (audience === SharingAudience.anyone) {
            return isEdit ? SharingLinkKind.anonymousEdit : SharingLinkKind.anonymousView;
        } else if (audience === SharingAudience.organization) {
            return isEdit ? SharingLinkKind.organizationEdit : SharingLinkKind.organizationView;
        } else {
            return SharingLinkKind.direct;
        }
    }

    /**
     * If kind is AnonymousEdit, OrganizationEdit, or Direct,
     * then the link is an edit link.
     */
    private _computeIsEditLink(linkKind: SharingLinkKind): boolean {
        return linkKind === SharingLinkKind.anonymousEdit ||
            linkKind === SharingLinkKind.organizationEdit ||
            linkKind === SharingLinkKind.direct;
    }
}
