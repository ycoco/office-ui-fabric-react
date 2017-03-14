import './PermissionsSettings.scss';
import { AudienceChoice } from '../AudienceChoiceGroup/AudienceChoiceGroup';
import { AudienceChoiceGroup } from '../AudienceChoiceGroup/AudienceChoiceGroup';
import { Checkbox } from 'office-ui-fabric-react/lib/Checkbox';
import { ExpirationDatePicker } from '../ExpirationDatePicker/ExpirationDatePicker';
import { ExpirationErrorCode } from '../ModifyPermissions';
import { FileShareIconMap } from '../../../data/Icons/FileShareIconMap';
import * as React from 'react';
import * as StringHelper from '@ms/odsp-utilities/lib/string/StringHelper';
import PeoplePicker from '../../PeoplePicker/PeoplePicker';
import { ISharingInformation, ISharingLink, ISharingLinkSettings, SharingAudience, SharingLinkKind, IShareStrings, FileShareType } from '../../../interfaces/SharingInterfaces';

export interface IPermissionsSettingsState {
    expirationErrorCode: ExpirationErrorCode;
}

export interface IPermissionsSettingsProps {
    currentSettings: ISharingLinkSettings;
    onAudienceChange: (audience: SharingAudience) => void;
    onEditChange: (value: boolean) => void;
    onExpirationChange: (expiration: Date) => void;
    onPeoplePickerChange: (items: any[]) => void;
    selectedPermissions: ISharingLinkSettings;
    sharingInformation: ISharingInformation;
    updateExpirationErrorCode: (code: ExpirationErrorCode) => void;
}

const MAX_DAYS_FOR_EXPIRING_LINK = 300; // TODO (joem): Figure out what this value actually is.

export class PermissionsSettings extends React.Component<IPermissionsSettingsProps, IPermissionsSettingsState> {
    private _permissionsOptions: Array<AudienceChoice>;
    private _strings: IShareStrings;

    static contextTypes = {
        strings: React.PropTypes.object.isRequired
    };

    constructor(props: IPermissionsSettingsProps, context: any) {
        super(props);

        this.state = {
            expirationErrorCode: ExpirationErrorCode.NONE
        };

        this._strings = context.strings;

        this._getAudienceChoiceGroupOptions = this._getAudienceChoiceGroupOptions.bind(this);
        this._getAudienceOptions = this._getAudienceOptions.bind(this);
        this._onAllowEditChange = this._onAllowEditChange.bind(this);
        this._onChoiceGroupChange = this._onChoiceGroupChange.bind(this);
        this._onDeleteExpiration = this._onDeleteExpiration.bind(this);
        this._onSelectDate = this._onSelectDate.bind(this);
        this._renderExpirationDatePicker = this._renderExpirationDatePicker.bind(this);
        this._renderExpirationDatePickerErrorMessage = this._renderExpirationDatePickerErrorMessage.bind(this);
        this._renderPeoplePicker = this._renderPeoplePicker.bind(this);

        // Initialize permissions options.
        this._permissionsOptions = this._getAudienceChoiceGroupOptions();
    }

    public render(): React.ReactElement<{}> {
        const props = this.props;
        const strings = this._strings;

        return (
            <div className="od-PermissionsSettings">
                <div className="od-PermissionsSettings-section">
                    <div className="od-PermissionsSettings-description od-ModifyPermissions-margins">{strings.permissionsSettingsHeader}</div>
                    <div className="od-PermissionsSettings-bottomBorder" />
                    <AudienceChoiceGroup
                        items={this._getAudienceOptions()}
                        onChange={this._onChoiceGroupChange}
                        onAudienceChange={props.onAudienceChange}
                    />
                    {this._renderPeoplePicker()}
                </div>
                {this._renderOtherSettings()}
            </div>
        );
    }

    public componentWillReceiveProps(nextProps: IPermissionsSettingsProps) {
        this.setState({
            ...this.state,
            expirationErrorCode: this._getExpirationErrorCode(nextProps.selectedPermissions.expiration)
        }, () => {
            this.props.updateExpirationErrorCode(this.state.expirationErrorCode);
        });
    }

    private _renderOtherSettings() {
        const props = this.props;
        const strings = this._strings;

        if (this.props.selectedPermissions.audience !== SharingAudience.EXISTING) {
            return (
                <div className="od-PermissionsSettings-section od-ModifyPermissions-margins">
                    <div className="od-PermissionsSettings-description">{strings.otherSettings}</div>
                    <div className="od-PermissionsSettings-setting">
                        <Checkbox
                            label={strings.allowEditLabel}
                            onChange={this._onAllowEditChange}
                            checked={props.selectedPermissions.isEdit}
                            disabled={!props.selectedPermissions.allowEditing}
                        />
                    </div>
                    {this._renderExpirationDatePicker()}
                </div>
            );
        }
    }

    private _getAudienceChoiceGroupOptions(): Array<AudienceChoice> {
        const strings = this._strings;

        return [
            {
                key: SharingAudience.ANYONE,
                icon: FileShareIconMap[FileShareType.ANYONE],
                label: strings.permissionsAnyoneString,
                permissionsType: FileShareType.ANYONE,
                linkKinds: [SharingLinkKind.ANONYMOUS_VIEW, SharingLinkKind.ANONYMOUS_EDIT],
                isChecked: false
            },
            {
                key: SharingAudience.ORGANIZATION,
                icon: FileShareIconMap[FileShareType.WORK_GROUP],
                label: StringHelper.format(strings.permissionsCompanyString, this.props.sharingInformation.companyName),
                permissionsType: FileShareType.WORK_GROUP,
                linkKinds: [SharingLinkKind.ORGANIZATION_VIEW, SharingLinkKind.ORGANIZATION_EDIT],
                isChecked: false
            },
            {
                key: SharingAudience.EXISTING,
                icon: FileShareIconMap[FileShareType.EXISTING_PEOPLE],
                label: strings.permissionsExistingPeopleString,
                permissionsType: FileShareType.EXISTING_PEOPLE,
                linkKinds: [SharingLinkKind.DIRECT],
                isChecked: false
            },
            {
                key: SharingAudience.SPECIFIC_PEOPLE,
                icon: FileShareIconMap[FileShareType.SPECIFIC_PEOPLE],
                label: strings.permissionsSpecificPeopleString,
                permissionsType: FileShareType.SPECIFIC_PEOPLE,
                linkKinds: [SharingLinkKind.DIRECT],
                isChecked: false
            }
        ];
    }

    private _renderPeoplePicker() {
        const props = this.props;

        if (props.selectedPermissions.audience === SharingAudience.SPECIFIC_PEOPLE) {
            return (
                <div className="od-ModifyPermissions-margins od-PermissionsSettings-PeoplePicker">
                    <PeoplePicker
                        defaultSelectedItems={props.currentSettings.specificPeople}
                        onChange={props.onPeoplePickerChange}
                        pickerSettings={props.sharingInformation.peoplePickerSettings}
                    />
                </div>
            );
        } else {
            return;
        }
    }

    /**
     * Render ExpirationDatePicker component if audience is "Anonymous",
     * otherwise don't render anything.
     */
    private _renderExpirationDatePicker() {
        const props = this.props;
        const selectedPermissions = props.selectedPermissions;

        if (selectedPermissions.audience === SharingAudience.ANYONE) {
            return (
                <div className="od-PermissionsSettings-setting">
                    <ExpirationDatePicker
                        onSelectDate={this._onSelectDate}
                        value={selectedPermissions.expiration}
                        expiryRestriction={props.sharingInformation.anonymousLinkExpirationRestrictionDays}
                    />
                    <div
                        className="od-PermissionsSettings-delete"
                        onClick={this._onDeleteExpiration}>
                        <i className="ms-Icon ms-Icon--Cancel"></i>
                    </div>
                    <span className="od-PermissionsSettings-expirationError">
                        {this._renderExpirationDatePickerErrorMessage()}
                    </span>
                </div>
            );
        } else {
            return;
        }
    }

    private _renderExpirationDatePickerErrorMessage() {
        const expirationErrorCode = this.state.expirationErrorCode;
        const strings = this._strings;

        switch (expirationErrorCode) {
            case ExpirationErrorCode.PAST_DATE:
                return strings.pastDateExpirationError;
            case ExpirationErrorCode.ADMIN_POLICY:
                return StringHelper.format(strings.adminExpirationError, this.props.sharingInformation.anonymousLinkExpirationRestrictionDays);
            case ExpirationErrorCode.OVER_MAX:
                return StringHelper.format(strings.maxExpirationError, MAX_DAYS_FOR_EXPIRING_LINK);
            default:
                return '';
        }
    }

    private _getAudienceOptions() {
        const audienceOptions = this._permissionsOptions;

        // Get link kinds that current user has permissions to manage.
        const sharingLinkKinds = this.props.sharingInformation.sharingLinks.map((link: ISharingLink) => {
            return link.sharingLinkKind;
        });

        // Determine audience choices based on available link kinds.
        const canUserCreateLinkForAudience = (optionLinkKind) => sharingLinkKinds.indexOf(optionLinkKind) > -1;
        const viableAudienceOptions = [];
        for (const option of audienceOptions) {
            const optionLinkKinds = option.linkKinds;
            if (optionLinkKinds.some(canUserCreateLinkForAudience)) {
                option.isChecked = option.key === this.props.currentSettings.audience;
                viableAudienceOptions.push(option);
            }
        }

        return viableAudienceOptions;
    }

    private _onChoiceGroupChange(key: SharingAudience) {
        for (const option of this._permissionsOptions) {
            option.isChecked = key === option.key;
        }
    }

    private _onSelectDate(date: Date): void {
        // Set date to "end of day".
        date.setHours(23, 59, 59, 999);
        const expirationErrorCode: ExpirationErrorCode = this._getExpirationErrorCode(date);

        this.setState({
            ...this.state,
            expirationErrorCode: expirationErrorCode
        }, () => {
            this.props.updateExpirationErrorCode(expirationErrorCode);
            this.props.onExpirationChange(date);
        });
    }

    private _onAllowEditChange(evt: React.SyntheticEvent<{}>, value: boolean): void {
        this.props.onEditChange(value);
    }

    private _onDeleteExpiration(): void {
        this.setState({
            ...this.state,
            expirationErrorCode: ExpirationErrorCode.NONE
        }, () => {
            this.props.onExpirationChange(null);
        });
    }

    private _getExpirationErrorCode(selectedDate: Date): ExpirationErrorCode {
        let expirationErrorCode = ExpirationErrorCode.NONE;
        const ONE_DAY_IN_MS = 86399001; // Can't use 86400000 because of ms only going 3 numbers deep (i.e. 999);
        const anonymousLinkExpirationRestrictionDays = this.props.sharingInformation.anonymousLinkExpirationRestrictionDays;

        // Return if no date is selected.
        if (!selectedDate || selectedDate.getTime() === (new Date(0)).getTime()) {
            return expirationErrorCode;
        }

        // Get "today", minus any time information.
        let today = new Date();
        today.setHours(23, 59, 59, 999);

        const numberOfDays = (selectedDate.getTime() - today.getTime()) / ONE_DAY_IN_MS;

        // Needs to be at least today + 1.
        // Can't be more than max days (if set).
        // Can't be more than system supports.
        if (numberOfDays < 1) {
            expirationErrorCode = ExpirationErrorCode.PAST_DATE;
        } else if (numberOfDays > MAX_DAYS_FOR_EXPIRING_LINK) {
            expirationErrorCode = ExpirationErrorCode.OVER_MAX;
        } else if (numberOfDays > anonymousLinkExpirationRestrictionDays && anonymousLinkExpirationRestrictionDays !== -1) {
            expirationErrorCode = ExpirationErrorCode.ADMIN_POLICY;
        }

        return expirationErrorCode;
    }
}