import './PeoplePicker.scss';
import { IPersonaProps } from 'office-ui-fabric-react/lib/Persona';
import { NormalPeoplePicker } from 'office-ui-fabric-react/lib/Pickers';
import { Persona, PersonaSize } from 'office-ui-fabric-react/lib/Persona';
import { SharingLinkKind, IShareStrings } from '../../interfaces/SharingInterfaces';
import * as React from 'react';
import PromiseDebouncer from '@ms/odsp-utilities/lib/async/PromiseDebouncer';
import ResolvedItem from './ResolvedItem/ResolvedItem';

export interface IPeoplePickerProps {
    defaultSelectedItems: any[];
    onChange: (items: any[]) => void;
    pickerSettings: any;
    sharingLinkKind?: SharingLinkKind;
}

export default class PeoplePicker extends React.Component<IPeoplePickerProps, null> {
    private _debouncer: PromiseDebouncer;
    private _store: any;
    private _strings: IShareStrings;

    static contextTypes = {
        peoplePickerStore: React.PropTypes.object.isRequired,
        sharingStore: React.PropTypes.object.isRequired,
        strings: React.PropTypes.object.isRequired
    };

    public refs: {
        [key: string]: React.ReactInstance,
        peoplePicker: NormalPeoplePicker
    };

    constructor(props: IPeoplePickerProps, context: any) {
        super(props);

        this._debouncer = new PromiseDebouncer();
        this._store = context.peoplePickerStore;
        this._strings = context.strings;

        this._computeAllowEmailAddresses = this._computeAllowEmailAddresses.bind(this);
        this._computePlaceholderText = this._computePlaceholderText.bind(this);
        this._onResolveSuggestions = this._onResolveSuggestions.bind(this);
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

        return (
            <NormalPeoplePicker
                className={'ms-PeoplePicker'}
                defaultSelectedItems={this.props.defaultSelectedItems}
                getTextFromItem={this._getAutofillText}
                inputProps={inputProps}
                onChange={this.props.onChange}
                onRenderItem={this._onRenderItem}
                onRenderSuggestionsItem={this._onRenderSuggestionsItem}
                onResolveSuggestions={this._onResolveSuggestions}
                pickerSuggestionsProps={suggestionProps}
                ref="peoplePicker"
            />
        );
    }

    private _computePlaceholderText(): string {
        const peoplePicker = this.refs.peoplePicker;
        const strings = this._strings;

        if (!peoplePicker || peoplePicker.state.items.length === 0) {
            return strings.peoplePickerPlaceholder;
        } else {
            return strings.peoplePickerPlaceholderWithSelection;
        }
    }

    /**
     * Gets the text for the type-ahead suggestion.
     */
    private _getAutofillText(persona: any) {
        return persona.name;
    }

    /**
     * Callback that determines how an item is rendered when an item is selected.
     */
    private _onRenderItem(selectedItem: any) {
        const _window: any = window;
        const item = selectedItem.item;

        item.primaryText = item.name;
        item.imageUrl = item.imageUrl ? `${_window._spPageContextInfo.webAbsoluteUrl}${item.image}` : undefined;

        return <ResolvedItem selectedItem={selectedItem} />
    }

    /**
     * Callback that determines how items in autofill are rendered.
     */
    private _onRenderSuggestionsItem(item: any) {
        // TODO (joem): Determine if we should be showing error UI based on sharing settings + person type.
        // TODO (joem): Get web URL in a better way.
        const _window: any = window;

        if (item.image) {
            return (
                <Persona
                    primaryText={item.name}
                    secondaryText={item.job}
                    size={PersonaSize.small}
                    imageUrl={`${_window._spPageContextInfo.webAbsoluteUrl}${item.image}`}
                />
            );
        } else {
            return (
                <Persona
                    primaryText={item.name}
                    secondaryText={item.job}
                    size={PersonaSize.small}
                />
            );
        }
    }

    private _onResolveSuggestions(filterText: string, items: IPersonaProps[]) {
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

        // Check query for multiple searches and break them up. Will have to do a series of resolves.
        const searchTerms: string[] = filterText.split(';');

        // If there's only 1 search term, perform a search.
        // If there are more than 1 search term, perform a series of resolves.
        if (searchTerms.length === 1) {
            return this._debouncer.debounce(this._store.fetchAndGetPeoplePickerSearchResults(filterText, peoplePickerQueryParams).then((results) => {
                return results;
            }));
        } else {
            // TODO (joem): If there is more than 1 search term, perform a series of resolves.
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

        // TODO (joem): Remove. Bug in GetSharingInformation is returning value as false
        // when it should be true.
        const debug = true;
        if (debug) {
            allowEmailAddressesSetting = true;
        }

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