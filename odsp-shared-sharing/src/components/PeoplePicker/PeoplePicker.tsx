import './PeoplePicker.scss';
import { autobind } from 'office-ui-fabric-react/lib/Utilities';
import { IPerson } from '@ms/odsp-datasources/lib/PeoplePicker';
import { IPickerItemProps } from 'office-ui-fabric-react/lib/Pickers';
import { MessageBar, MessageBarType } from 'office-ui-fabric-react/lib/MessageBar';
import { PeoplePicker as SharedPeoplePicker, PeoplePickerType, SelectedItemDefault } from '@ms/odsp-shared-react/lib/PeoplePicker';
import { SharingLinkKind, IShareStrings, PrincipalType, ISharingInformation } from '../../interfaces/SharingInterfaces';
import * as React from 'react';

export interface IPeoplePickerProps {
    defaultSelectedItems: any[];
    error?: JSX.Element;
    onChange: (items: any[]) => void;
    oversharingExternalsWarning?: string;
    oversharingGroupsWarning?: string;
    pickerSettings: any;
    sharingLinkKind?: SharingLinkKind;
    sharingInformation: ISharingInformation;
    permissionsMap?: { [index: string]: boolean };
}

export default class PeoplePicker extends React.Component<IPeoplePickerProps, {}> {
    private _peoplePickerProvider: any;
    private _strings: IShareStrings;
    private _externalUsersAllowed: boolean;

    static contextTypes = {
        peoplePickerProvider: React.PropTypes.object.isRequired,
        strings: React.PropTypes.object.isRequired
    };

    constructor(props: IPeoplePickerProps, context: any) {
        super(props);

        this._strings = context.strings;
        this._peoplePickerProvider = context.peoplePickerProvider;
        this._externalUsersAllowed = this._computeAllowExternalUsers();
    }

    render() {
        const strings = this._strings;

        const inputProps: any = {
            placeholder: this._computePlaceholderText()
        };

        // IPeoplePickerQueryParams
        const pickerSettings = this.props.pickerSettings;
        const peoplePickerQueryParams: any = {
            principalSource: pickerSettings.PrincipalSource,
            principalType: this._convertPrincipalType(pickerSettings.PrincipalAccountType),
            querySettings: pickerSettings.QuerySettings,
            allowEmailAddresses: true,
            filterExternalUsers: false, // Property used to filter cached external user results.
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
                    onRenderItem={ this._onRenderItem }
                />
                { this._renderError() }
                { this._renderWarnings() }
            </div>
        );
    }

    @autobind
    private _onRenderItem(props: IPickerItemProps<IPerson>): JSX.Element {
        const permissionsMap = this.props.permissionsMap;

        // Add resolved user to MRU cache.
        this._peoplePickerProvider.addToMruCache(props.item);

        /**
         * Checks 2 cases:
         *  - If external users are not allowed (policy or link type).
         *  - If direct link is being sent an user doesn't have permission to the item.
         */
        const isError = (props.item.isExternal && !this._externalUsersAllowed) ||
            (this.props.sharingLinkKind === SharingLinkKind.direct && permissionsMap && permissionsMap[props.item.email] !== undefined && !permissionsMap[props.item.email]);

        if (isError) {
            return (
                <div className='od-Share-PeoplePicker-selectedItem--error'>
                    <SelectedItemDefault { ...props } />
                </div>
            );
        } else {
            return <SelectedItemDefault { ...props } />;
        }
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

    private _computeAllowExternalUsers(): boolean {
        const linkKind = this.props.sharingLinkKind;

        const canAddExternalPrincipal = this.props.sharingInformation.canAddExternalPrincipal;
        return canAddExternalPrincipal && (linkKind !== SharingLinkKind.organizationView && linkKind !== SharingLinkKind.organizationEdit);
    }

    private _renderError() {
        const error = this.props.error;

        if (error) {
            return (
                <span
                    className='od-Share-PeoplePicker-error'
                    role='alert'
                    aria-live='assertive'
                >
                    { error }
                </span>
            );
        }
    }

    private _renderWarnings() {
        const oversharingExternalsWarning = this.props.oversharingExternalsWarning;
        const oversharingGroupsWarning = this.props.oversharingGroupsWarning;
        const warnings = [];

        // Don't show warnings if there is an error to resolve.
        if (this.props.error) {
            return;
        }

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