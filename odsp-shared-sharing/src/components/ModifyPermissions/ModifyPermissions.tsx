import './ModifyPermissions.scss';
import { Button, ButtonType } from 'office-ui-fabric-react/lib/Button';
import { ISharingInformation, ISharingLink, ISharingLinkSettings, SharingAudience, SharingLinkKind, IShareStrings } from '../../interfaces/SharingInterfaces';
import { PermissionsSettings } from './PermissionsSettings/PermissionsSettings';
import * as React from 'react';

export interface IModifyPermissionsProps {
    currentSettings: ISharingLinkSettings;
    onCancel: () => void;
    onSelectedPermissionsChange: (currentSettings: ISharingLinkSettings) => void;
    sharingInformation: ISharingInformation;
}

export interface IModifyPermissionsState {
    expirationErrorCode: ExpirationErrorCode;
    selectedPermissions: ISharingLinkSettings;
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
        return (
            <div className='od-ModifyPermissions'>
                <div className='od-Share-header od-Share-header--multiline'>
                    <div className='od-Share-title ms-font-l ms-fontWeight-regular'>{this._strings.modifyPermissionsHeader}</div>
                    <div className='od-Share-fileName ms-font-xs'>{this.props.sharingInformation.item.name}</div>
                </div>
                <div className='od-ModifyPermissions-section'>
                    <PermissionsSettings
                        currentSettings={this.props.currentSettings}
                        onAudienceChange={this.onAudienceChange}
                        onEditChange={this.onEditChange}
                        onExpirationChange={this.onExpirationChange}
                        onPeoplePickerChange={this._onPeoplePickerChange}
                        selectedPermissions={this.state.selectedPermissions}
                        sharingInformation={this.props.sharingInformation}
                        updateExpirationErrorCode={this._updateExpirationErrorCode}
                    />
                </div>
                <div className='od-ModifyPermissions-actions'>
                    <Button
                        buttonType={ButtonType.primary}
                        disabled={this._computeIsApplyButtonDisabled()}
                        onClick={this._onApplyClicked}
                    >Apply</Button>
                    <Button onClick={this._onCancel}>Cancel</Button>
                </div>
            </div>
        );
    }

    public onAudienceChange(audience: SharingAudience) {
        const links: Array<ISharingLink> = this.props.sharingInformation.sharingLinks;
        const isEdit = this.state.selectedPermissions.isEdit;

        // SharingAudience.EXISTING shares the same sharing links as SharingAudience.SPECIFIC_PEOPLE.
        const audienceMatcher = audience === SharingAudience.EXISTING ? SharingAudience.SPECIFIC_PEOPLE : audience;

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
            }
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

        // Clear expiration if link type doesn't support it.
        if (selectedPermissions.audience !== SharingAudience.ANYONE) {
            this.setState({
                ...state,
                selectedPermissions: {
                    ...selectedPermissions,
                    expiration: null
                }
            }, () => {
                this.props.onSelectedPermissionsChange(this.state.selectedPermissions);
            });
        } else {
            this.props.onSelectedPermissionsChange(this.state.selectedPermissions);
        }
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
        if (audience === SharingAudience.ANYONE) {
            return isEdit ? SharingLinkKind.ANONYMOUS_EDIT : SharingLinkKind.ANONYMOUS_VIEW;
        } else if (audience === SharingAudience.ORGANIZATION) {
            return isEdit ? SharingLinkKind.ORGANIZATION_EDIT : SharingLinkKind.ORGANIZATION_VIEW;
        } else {
            return SharingLinkKind.DIRECT;
        }
    }

    /**
     * If kind is AnonymousEdit, OrganizationEdit, or Direct,
     * then the link is an edit link.
     */
    private _computeIsEditLink(linkKind: SharingLinkKind): boolean {
        return linkKind === SharingLinkKind.ANONYMOUS_EDIT ||
            linkKind === SharingLinkKind.ORGANIZATION_EDIT ||
            linkKind === SharingLinkKind.DIRECT;
    }
}
