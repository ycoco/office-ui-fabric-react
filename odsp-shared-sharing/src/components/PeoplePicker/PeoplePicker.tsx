import './PeoplePicker.scss';
import { SharingLinkKind, IShareStrings } from '../../interfaces/SharingInterfaces';
import * as React from 'react';
import ResolvedItem from './ResolvedItem/ResolvedItem';

import { PeoplePicker as SharedPeoplePicker, PeoplePickerType } from '@ms/odsp-shared-react/lib/PeoplePicker';

export interface IPeoplePickerProps {
    defaultSelectedItems: any[];
    onChange: (items: any[]) => void;
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

        // IBasePickerSuggestionsProps
        const suggestionProps: any = {
            noResultsFoundText: strings.noResultsLabel,
            loadingText: strings.loadingLabel
        };

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

        return (
            <SharedPeoplePicker
                className={'od-Share-PeoplePicker'}
                dataProvider={this._peoplePickerProvider}
                defaultSelectedItems={this.props.defaultSelectedItems}
                inputProps={inputProps}
                loadingText={strings.loadingLabel}
                noResultsFoundText={strings.noResultsLabel}
                onSelectedPersonasChange={this.props.onChange}
                peoplePickerQueryParams={peoplePickerQueryParams}
            />
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
        const enum PrincipalType {
            NONE = 0,
            USER = 1,
            DISTRIBUTION_LIST = 2,
            SECURITY_GROUP = 4,
            SHAREPOINT_GROUP = 8
        }

        if (!principalTypes) {
            return PrincipalType.NONE;
        }

        let result: PrincipalType = PrincipalType.NONE;
        const types: Array<string> = principalTypes.split(',');
        for (const idx of types) {
            if (types[idx] === 'User') {
                result |= PrincipalType.USER;
            }
            if (types[idx] === 'DL') {
                result |= PrincipalType.DISTRIBUTION_LIST;
            }
            if (types[idx] === 'SecGroup') {
                result |= PrincipalType.SECURITY_GROUP;
            }
            if (types[idx] === 'SPGroup') {
                result |= PrincipalType.SHAREPOINT_GROUP;
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
            return linkKind !== SharingLinkKind.ORGANIZATION_VIEW && linkKind !== SharingLinkKind.ORGANIZATION_EDIT;
        }
    }
}