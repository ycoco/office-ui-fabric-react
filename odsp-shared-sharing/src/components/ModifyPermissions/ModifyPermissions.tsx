import './ModifyPermissions.scss';
import { Button, ButtonType } from 'office-ui-fabric-react/lib/Button';
import { Header } from '../Header/Header';
import { ISharingInformation, ISharingLink, ISharingLinkSettings, SharingAudience, SharingLinkKind, IShareStrings } from '../../interfaces/SharingInterfaces';
import { Label } from 'office-ui-fabric-react/lib/Label';
import { PermissionsSettings } from './PermissionsSettings/PermissionsSettings';
import { ShareViewState } from '../Share/Share';
import { Spinner, SpinnerType } from 'office-ui-fabric-react/lib/Spinner';
import * as React from 'react';

export interface IModifyPermissionsProps {
    currentSettings: ISharingLinkSettings;
    onCancel: () => void;
    onSelectedPermissionsChange: (currentSettings: ISharingLinkSettings) => void;
    sharingInformation: ISharingInformation;
    doesCreate: boolean; // "Copy link" flow creates link on apply, "Share flow" does not.
}

export interface IModifyPermissionsState {
    expirationErrorCode: ExpirationErrorCode;
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
                    item={ this.props.sharingInformation.item }
                    viewState={ ShareViewState.MODIFY_PERMISSIONS }
                    showItemName={ true }
                />
                <div className='od-ModifyPermissions-section'>
                    <PermissionsSettings
                        currentSettings={ this.props.currentSettings }
                        onAudienceChange={ this.onAudienceChange }
                        onEditChange={ this.onEditChange }
                        onExpirationChange={ this.onExpirationChange }
                        onPeoplePickerChange={ this._onPeoplePickerChange }
                        selectedPermissions={ this.state.selectedPermissions }
                        sharingInformation={ this.props.sharingInformation }
                        updateExpirationErrorCode={ this._updateExpirationErrorCode }
                    />
                </div>
                <div className='od-ModifyPermissions-actions'>
                    <Button
                        buttonType={ ButtonType.primary }
                        disabled={ this._computeIsApplyButtonDisabled() }
                        onClick={ this._onApplyClicked }
                    >Apply</Button>
                    <Button onClick={ this._onCancel }>Cancel</Button>
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
                <div className='od-ModifyPermissions-activityIndicator'>
                    <Spinner type={ SpinnerType.large } />
                    <Label>{ this._strings.activityMessageCreatingLink }</Label>
                </div>
            );
        }
    }

    private _getDefaultExpirationDateValue() {
        if (this.props.sharingInformation.anonymousLinkExpirationRestrictionDays === -1) {
            return null;
        } else {
            // Get "tomorrow" and at the "end of the day".
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(23, 59, 59, 999);
            return tomorrow;
        }
    }

    private _initializeState() {
        const currentSettings = this.props.currentSettings;

        return {
            expirationErrorCode: ExpirationErrorCode.NONE,
            selectedPermissions: {
                allowEditing: true,
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
        return this.state.expirationErrorCode !== ExpirationErrorCode.NONE;
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

    // TODO (joem): Determine what interface entities will use.
    private _onPeoplePickerChange(items: Array<any>) {
        this.setState({
            ...this.state,
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
