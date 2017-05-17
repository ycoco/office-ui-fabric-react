import './PermissionsSettings.scss';
import { AudienceChoiceGroup } from '../AudienceChoiceGroup/AudienceChoiceGroup';
import { autobind } from 'office-ui-fabric-react/lib/Utilities';
import { Checkbox } from 'office-ui-fabric-react/lib/Checkbox';
import { ExpirationDatePicker } from '../ExpirationDatePicker/ExpirationDatePicker';
import { ExpirationErrorCode } from '../ModifyPermissions';
import { FileShareIconMap } from '../../../data/Icons/FileShareIconMap';
import { IAudienceChoice } from '../AudienceChoiceGroup/AudienceChoiceGroup';
import { IPerson } from '@ms/odsp-datasources/lib/PeoplePicker';
import { ISharingInformation, ISharingLink, ISharingLinkSettings, SharingAudience, SharingLinkKind, IShareStrings, FileShareType } from '../../../interfaces/SharingInterfaces';
import * as PeoplePickerHelper from '../../../utilities/PeoplePickerHelper';
import * as React from 'react';
import * as StringHelper from '@ms/odsp-utilities/lib/string/StringHelper';
import PeoplePicker from '../../PeoplePicker/PeoplePicker';

export interface IPermissionsSettingsState {
    expirationErrorCode: ExpirationErrorCode;
    externalRecipientWarning: string;
    groupRecipientWarning: string;
}

export interface IPermissionsSettingsProps {
    companyName: string;
    currentSettings: ISharingLinkSettings;
    peoplePickerError: JSX.Element;
    onAudienceChange: (audience: SharingAudience) => void;
    onEditChange: (value: boolean) => void;
    onExpirationChange: (expiration: Date) => void;
    onPeoplePickerChange: (items: Array<IPerson>) => void;
    selectedPermissions: ISharingLinkSettings;
    sharingInformation: ISharingInformation;
    showExistingAccessOption: boolean;
    updateExpirationErrorCode: (code: ExpirationErrorCode) => void;
    groupsMemberCount: number;
}

const MAX_DAYS_FOR_EXPIRING_LINK = 300; // TODO (joem): Figure out what this value actually is.

export class PermissionsSettings extends React.Component<IPermissionsSettingsProps, IPermissionsSettingsState> {
    private _permissionsOptions: Array<IAudienceChoice>;
    private _resize: () => void;
    private _strings: IShareStrings;

    static contextTypes = {
        strings: React.PropTypes.object.isRequired,
        resize: React.PropTypes.func.isRequired
    };

    constructor(props: IPermissionsSettingsProps, context: any) {
        super(props);

        this._resize = context.resize;
        this._strings = context.strings;

        const selectedItems = props.selectedPermissions.specificPeople;
        this.state = {
            expirationErrorCode: ExpirationErrorCode.NONE,
            externalRecipientWarning: PeoplePickerHelper.getOversharingExternalsWarning(selectedItems, this._strings),
            groupRecipientWarning: PeoplePickerHelper.getOversharingGroupsWarning(selectedItems, props.groupsMemberCount, this._strings)
        };

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

    public componentDidUpdate(prevProps: IPermissionsSettingsProps, prevState: IPermissionsSettingsState) {
        this._resize();
    }

    public render(): React.ReactElement<{}> {
        const props = this.props;
        const strings = this._strings;

        return (
            <div className='od-PermissionsSettings'>
                <div className='od-PermissionsSettings-section'>
                    <div className='od-PermissionsSettings-description od-ModifyPermissions-margins'>{ strings.permissionsSettingsHeader }</div>
                    <div className='od-PermissionsSettings-bottomBorder' />
                    <AudienceChoiceGroup
                        items={ this._getAudienceOptions() }
                        onChange={ this._onChoiceGroupChange }
                        onAudienceChange={ props.onAudienceChange }
                    />
                    { this._renderPeoplePicker() }
                </div>
                { this._renderOtherSettings() }
            </div>
        );
    }

    public componentWillReceiveProps(nextProps: IPermissionsSettingsProps) {
        const selectedPermissions = nextProps.selectedPermissions;
        const selectedItems = selectedPermissions.specificPeople;

        this.setState({
            ...this.state,
            expirationErrorCode: this._getExpirationErrorCode(selectedPermissions.expiration),
            externalRecipientWarning: PeoplePickerHelper.getOversharingExternalsWarning(selectedItems, this._strings),
            groupRecipientWarning: PeoplePickerHelper.getOversharingGroupsWarning(selectedItems, nextProps.groupsMemberCount, this._strings)
        }, () => {
            this.props.updateExpirationErrorCode(this.state.expirationErrorCode);
        });
    }

    private _renderOtherSettings() {
        const props = this.props;
        const strings = this._strings;

        if (this.props.selectedPermissions.audience !== SharingAudience.existing) {
            return (
                <div className='od-PermissionsSettings-section od-ModifyPermissions-margins'>
                    <div className='od-PermissionsSettings-description'>{ strings.otherSettings }</div>
                    <div className='od-PermissionsSettings-setting'>
                        <Checkbox
                            className='od-PermissionsSettings-allowEdit'
                            label={ strings.allowEditLabel }
                            onChange={ this._onAllowEditChange }
                            checked={ props.selectedPermissions.isEdit }
                            disabled={ !props.selectedPermissions.allowEditing }
                        />
                    </div>
                    { this._renderExpirationDatePicker() }
                </div>
            );
        }
    }

    private _getAudienceChoiceGroupOptions(): Array<IAudienceChoice> {
        const strings = this._strings;

        const options: Array<IAudienceChoice> = [
            {
                disabledText: strings.disabledAudienceChoiceLabel,
                icon: FileShareIconMap[FileShareType.anyone],
                isChecked: false,
                isDisabled: false,
                key: SharingAudience.anyone,
                label: strings.permissionsAnyoneString,
                linkKinds: [SharingLinkKind.anonymousView, SharingLinkKind.anonymousEdit],
                permissionsType: FileShareType.anyone
            },
            {
                disabledText: strings.disabledAudienceChoiceLabel,
                icon: FileShareIconMap[FileShareType.workGroup],
                isChecked: false,
                isDisabled: false,
                key: SharingAudience.organization,
                label: StringHelper.format(strings.permissionsCompanyString, this.props.companyName),
                linkKinds: [SharingLinkKind.organizationView, SharingLinkKind.organizationEdit],
                permissionsType: FileShareType.workGroup
            },
            {
                disabledText: strings.disabledAudienceChoiceLabel,
                icon: FileShareIconMap[FileShareType.specificPeople],
                isChecked: false,
                isDisabled: false,
                key: SharingAudience.specificPeople,
                label: strings.permissionsSpecificPeopleString,
                linkKinds: [SharingLinkKind.direct],
                permissionsType: FileShareType.specificPeople
            }
        ];

        /**
         * Show this additional option if the user has no permissions to add new users
         * to the permissions list or if we're in SharePoint team sites.
         */
        if (this.props.showExistingAccessOption || !this.props.sharingInformation.canManagePermissions) {
            const existingPeopleOption: IAudienceChoice = {
                icon: FileShareIconMap[FileShareType.workGroup],
                isChecked: false,
                isDisabled: false,
                key: SharingAudience.existing,
                label: strings.permissionsExistingPeopleString,
                linkKinds: [SharingLinkKind.direct],
                permissionsType: FileShareType.existing
            };

            options.splice(2, 0, existingPeopleOption);
        }

        return options;
    }

    @autobind
    private _onPeoplePickerChange(items: Array<IPerson>) {
        this.setState({
            ...this.state,
            externalRecipientWarning: PeoplePickerHelper.getOversharingExternalsWarning(items, this._strings),
            groupRecipientWarning: PeoplePickerHelper.getOversharingGroupsWarning(items, this.props.groupsMemberCount, this._strings)
        }, () => {
            this.props.onPeoplePickerChange(items);
        });
    }

    private _renderPeoplePicker() {
        const props = this.props;
        const state = this.state;

        if (props.selectedPermissions.audience === SharingAudience.specificPeople) {
            return (
                <div className='od-ModifyPermissions-margins od-PermissionsSettings-PeoplePicker'>
                    <PeoplePicker
                        defaultSelectedItems={ props.selectedPermissions.specificPeople }
                        onChange={ this._onPeoplePickerChange }
                        oversharingExternalsWarning={ state.externalRecipientWarning }
                        oversharingGroupsWarning={ state.groupRecipientWarning }
                        pickerSettings={ props.sharingInformation.peoplePickerSettings }
                        error={ props.peoplePickerError }
                        sharingInformation={ props.sharingInformation }
                    />
                </div>
            );
        } else {
            return;
        }
    }

    /**
     * Render ExpirationDatePicker component if audience is 'Anonymous',
     * otherwise don't render anything.
     */
    private _renderExpirationDatePicker() {
        const props = this.props;
        const selectedPermissions = props.selectedPermissions;

        if (selectedPermissions.audience === SharingAudience.anyone) {
            return (
                <div className='od-PermissionsSettings-setting'>
                    <div className='od-PermissionsSettings-datePicker'>
                        <ExpirationDatePicker
                            onSelectDate={ this._onSelectDate }
                            value={ selectedPermissions.expiration }
                            expiryRestriction={ props.sharingInformation.anonymousLinkExpirationRestrictionDays }
                        />
                        <button
                            className='od-PermissionsSettings-delete'
                            onClick={ this._onDeleteExpiration }
                            aria-label={ this._strings.removeExpirationLabel }
                        >
                            <i className='ms-Icon ms-Icon--Cancel'></i>
                        </button>
                    </div>
                    <span className='od-PermissionsSettings-expirationError'>
                        { this._renderExpirationDatePickerErrorMessage() }
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
        const sharingInformation = this.props.sharingInformation;

        // Get link kinds that current user has permissions to manage.
        const sharingLinkKinds = this.props.sharingInformation.sharingLinks.map((link: ISharingLink) => {
            return link.sharingLinkKind;
        });

        // Determine audience choices based on available link kinds.
        const canUserCreateLinkForAudience = (optionLinkKind) => sharingLinkKinds.indexOf(optionLinkKind) > -1;
        const viableAudienceOptions = [];
        for (const option of audienceOptions) {
            if (option.permissionsType === FileShareType.specificPeople) {
                if (sharingInformation.canManagePermissions) {
                    option.isChecked = option.key === this.props.currentSettings.audience;
                } else {
                    option.isDisabled = true;
                }
            } else {
                const optionLinkKinds = option.linkKinds;
                if (optionLinkKinds.some(canUserCreateLinkForAudience)) {
                    option.isChecked = option.key === this.props.currentSettings.audience;
                } else {
                    option.isDisabled = true;
                }
            }

            viableAudienceOptions.push(option);
        }

        return viableAudienceOptions;
    }

    private _onChoiceGroupChange(key: SharingAudience) {
        for (const option of this._permissionsOptions) {
            option.isChecked = key === option.key;
        }
    }

    private _onSelectDate(date: Date): void {
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
        const ONE_DAY_IN_MS = 86400000;
        const anonymousLinkExpirationRestrictionDays = this.props.sharingInformation.anonymousLinkExpirationRestrictionDays;

        // Return if no date is selected.
        if (!selectedDate || selectedDate.getTime() === (new Date(0)).getTime()) {
            return expirationErrorCode;
        }

        // Get 'today', minus any time information.
        let today = new Date();

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