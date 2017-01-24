import * as React from 'react';
import {
    IPersonaProps
} from 'office-ui-fabric-react/lib/Persona';
import {
    autobind
} from 'office-ui-fabric-react/lib/Utilities';
import {
    BasePickerListBelow,
    BasePicker,
    IBasePickerProps
} from 'office-ui-fabric-react/lib/Pickers';
import Promise from '@ms/odsp-utilities/lib/async/Promise';
import {
    PeoplePickerProvider,
    IPeoplePickerProviderResults,
    IPeoplePickerQueryParams,
    IPeoplePickerProvider,
    IPerson
} from '@ms/odsp-datasources/lib/PeoplePicker';
import PrincipalType from '@ms/odsp-datasources/lib/dataSources/roleAssignments/PrincipalType';
import { SuggestionItemDefault, SelectedItemDefault, SelectedItemBelowDefault } from './PeoplePickerDefaultItems';
import { IPeoplePickerProps, PeoplePickerType } from './PeoplePicker.Props';
import './PickerItem.scss';

export interface IPeoplePickerState {
    hasUnresolvedText?: boolean;
}
const PersonPicker = BasePicker as new (props: IBasePickerProps<IPerson>) => BasePicker<IPerson, IBasePickerProps<IPerson>>;
const PersonPickerListBelow = BasePickerListBelow as new (props: IBasePickerProps<IPerson>)
    => BasePicker<IPerson, IBasePickerProps<IPerson>>;
export class PeoplePicker extends React.Component<IPeoplePickerProps, IPeoplePickerState> {

    public _selectedPeople: Array<IPersonaProps>;

    private _dataProvider: IPeoplePickerProvider;
    private _peoplePickerSearchPromise: any;
    private _context;
    private _peoplePickerQueryParams: IPeoplePickerQueryParams;

    constructor(props: IPeoplePickerProps) {
        super(props);

        this._context = props.context;
        if (props.peoplePickerQueryParams) {
            this._peoplePickerQueryParams = props.peoplePickerQueryParams;
        } else {  // use default values for people picker context
            this._peoplePickerQueryParams = {
                allowEmailAddresses: false,
                allowMultipleEntities: null,
                allUrlZones: null,
                enabledClaimProviders: null,
                forceClaims: null,
                groupID: 0,
                maximumEntitySuggestions: 30,
                // Corresponds to all sources server side.
                principalSource: 15,
                blockExternalUsers: true,
                // The enum this variable is based off of is bitwise so we can use bitwise "or" to allow for multiple
                // prinicpalTypes being returned from the search.
                // tslint thinks that all bitwise opperators are mistyped (e.g. && as & or || as |).
                // So we need to turn it off for this.
                /* tslint:disable */
                principalType: (PrincipalType.user | PrincipalType.securityGroup | PrincipalType.sharePointGroup),
                /* tslint:enable */
                required: null,
                urlZone: null,
                urlZoneSpecified: null
            };
        }
        this._dataProvider = new PeoplePickerProvider({ pageContext: props.context, peoplePickerDataSource: props.dataSource });
        this.state = {
            hasUnresolvedText: false
        };
    }

    public render() {
        let {
            className,
            onRenderItem,
            onRenderSuggestionsItem,
            defaultSelectedItems,
            onSelectedPersonasChange,
            suggestionsHeaderText,
            noResultsFoundText,
            loadingText,
            inputProps } = this.props;
        let pickerProps: IBasePickerProps<IPerson> = {
            className: className,
            onRenderSuggestionsItem: onRenderSuggestionsItem ? onRenderSuggestionsItem : SuggestionItemDefault,
            onResolveSuggestions: this._onResolveSuggestions,
            getTextFromItem: this._getSuggestionStringFromPerson,
            defaultSelectedItems: defaultSelectedItems,
            onChange: onSelectedPersonasChange,
            inputProps: inputProps,
            pickerSuggestionsProps: {
                suggestionsHeaderText: suggestionsHeaderText,
                loadingText: loadingText,
                noResultsFoundText: noResultsFoundText
            }
        };

        switch (this.props.peoplePickerType) {
            case PeoplePickerType.listBelow:
                pickerProps.onRenderItem = onRenderItem ? onRenderItem : SelectedItemBelowDefault;
                return <PersonPickerListBelow { ...pickerProps } />;
            default:
                pickerProps.onRenderItem = onRenderItem ? onRenderItem : SelectedItemDefault;
                return <PersonPicker { ...pickerProps } />;
        }
    }

    private _getSuggestionStringFromPerson(person: IPerson, currentValue?: string): string {
        if (!currentValue) {
            return person.name;
        }

        if (person.name.toLowerCase().indexOf(currentValue.toLowerCase()) === 0) {
            return person.name;
        }

        if (person.email.toLowerCase().indexOf(currentValue.toLowerCase()) === 0) {
            return person.email;
        }

        return person.name;
    }

    @autobind
    private _onResolveSuggestions(value: any): Promise<IPerson[]> | IPerson[] {

        if (this._peoplePickerSearchPromise) {
            this._peoplePickerSearchPromise.cancel();
            this._peoplePickerSearchPromise = undefined;
        }
        // 1 character returns too many results so we should only search if there are 2 or more characters.
        // This is inline with the current way that the peoplepicker works in odsp-next.
        if (value.length < 2) {
            return [];
        }

        let peoplePickerSearchResult: IPeoplePickerProviderResults = this._dataProvider.search(value.trim(), this._peoplePickerQueryParams);

        if (!peoplePickerSearchResult) {
            return [];
        }

        let cachedItems: IPerson[] = peoplePickerSearchResult.cached ? peoplePickerSearchResult.cached : [];

        this._peoplePickerSearchPromise = peoplePickerSearchResult.promise;
        return this._peoplePickerSearchPromise.then((personList: IPerson[]) => {
            this._peoplePickerSearchPromise = undefined;
            return personList ? cachedItems.concat(personList) : [];
        });
    }
}
export default PeoplePicker;