import './PeoplePicker.scss';
import { MessageBar, MessageBarType } from 'office-ui-fabric-react/lib/MessageBar';
import { PeoplePicker as SharedPeoplePicker, PeoplePickerType } from '@ms/odsp-shared-react/lib/PeoplePicker';
import { SharingLinkKind, IShareStrings, PrincipalType } from '../../interfaces/SharingInterfaces';
import * as React from 'react';
import ResolvedItem from './ResolvedItem/ResolvedItem';

export interface IPeoplePickerProps {
    defaultSelectedItems: any[];
    error?: string;
    onChange: (items: any[]) => void;
    oversharingExternalsWarning?: string;
    oversharingGroupsWarning?: string;
    pickerSettings: any;
    sharingLinkKind?: SharingLinkKind;
}

export default class PeoplePicker extends React.Component<IPeoplePickerProps, null> {
    private _peoplePickerProvider: any;
    private _strings: IShareStrings;

    static contextTypes = {
        peoplePickerProvider: React.PropTypes.object.isRequired,
        strings: React.PropTypes.object.isRequired
    };

    constructor(props: IPeoplePickerProps, context: any) {
        super(props);

        // Extract from context.
        this._strings = context.strings;
        this._peoplePickerProvider = context.peoplePickerProvider;

        this._computeAllowEmailAddresses = this._computeAllowEmailAddresses.bind(this);
        this._computePlaceholderText = this._computePlaceholderText.bind(this);
    }

    render() {
        const strings = this._strings;

        const inputProps: any = {
            placeholder: this._computePlaceholderText()
        };

        // IPeoplePickerQueryParams
        const pickerSettings = this.props.pickerSettings;
        const allowEmailAddresses = this._computeAllowEmailAddresses(pickerSettings.AllowEmailAddresses);
        const peoplePickerQueryParams: any = {
            principalSource: pickerSettings.PrincipalSource,
            principalType: this._convertPrincipalType(pickerSettings.PrincipalAccountType),
            querySettings: pickerSettings.QuerySettings,
            allowEmailAddresses: allowEmailAddresses,
            filterExternalUsers: !allowEmailAddresses, // Property used to filter cached external user results.
            maximumEntitySuggestions: 30
        };

        const classes = this.props.error ? 'od-Share-PeoplePicker ms-Share-PeoplePicker--error' : 'od-Share-PeoplePicker';

        return (
            <div>
            <SharedPeoplePicker
                className={ classes }
                dataProvider={ this._peoplePickerProvider }
                defaultSelectedItems={ this.props.defaultSelectedItems }
                inputProps={ inputProps }
                loadingText={ strings.loadingLabel }
                noResultsFoundText={ strings.noResultsLabel }
                onSelectedPersonasChange={ this.props.onChange }
                peoplePickerQueryParams={ peoplePickerQueryParams }
                suggestionsClassName={ 'od-Share-PeoplePicker-Suggestions' }
            />
            { this._renderError() }
            { this._renderWarnings() }
            </div>
        );
    }

    private _computePlaceholderText(): string {
        const strings = this._strings;

        if (this.props.defaultSelectedItems.length === 0) {
            return strings.peoplePickerPlaceholder;
        } else {
            return strings.peoplePickerPlaceholderWithSelection;
        }
    }

    // Converts comma-separated account selection text to SPPrincipalType.
    // TODO (joem): Convert to use enums/PrincipalType if this stays.
    private _convertPrincipalType(principalTypes: string): number {
        if (!principalTypes) {
            return PrincipalType.none;
        }

        let result: PrincipalType = PrincipalType.none;
        const types: Array<string> = principalTypes.split(',');
        for (const type of types) {
            if (type === 'User') {
                result |= PrincipalType.user;
            }
            if (type === 'DL') {
                result |= PrincipalType.distributionList;
            }
            if (type === 'SecGroup') {
                result |= PrincipalType.securityGroup;
            }
            if (type === 'SPGroup') {
                result |= PrincipalType.sharepointGroup;
            }
        }

        return result;
    }

    private _computeAllowEmailAddresses(allowEmailAddressesSetting: boolean): boolean {
        const linkKind = this.props.sharingLinkKind;

        // - If tenant doesn't allow email addresses, then return the setting.
        // - If no linkKind was passed in, return the setting.
        // - If tenant allows email addresses and a linkKind is passed in, then
        //   determine value based on linkKind (don't allow if CSL).
        if (!allowEmailAddressesSetting || !linkKind) {
            return allowEmailAddressesSetting;
        } else {
            return linkKind !== SharingLinkKind.organizationView && linkKind !== SharingLinkKind.organizationEdit;
        }
    }

    private _renderError() {
        const error = this.props.error;

        if (error) {
            return (
                <span className='od-Share-PeoplePicker-error'>
                    { error }
                </span>
            );
        }
    }

    private _renderWarnings() {
        const oversharingExternalsWarning = this.props.oversharingExternalsWarning;
        const oversharingGroupsWarning = this.props.oversharingGroupsWarning;
        const warnings = [];

        if (oversharingExternalsWarning) {
            warnings.push(
                <MessageBar>{ oversharingExternalsWarning }</MessageBar>
            );
        }

        if (oversharingGroupsWarning) {
            warnings.push(
                <MessageBar>{ oversharingGroupsWarning }</MessageBar>
            );
        }

        if (warnings.length > 0) {
            return (
                <div className='od-Share-PeoplePicker-warning'>
                    { warnings }
                </div>
            );
        }
    }
}