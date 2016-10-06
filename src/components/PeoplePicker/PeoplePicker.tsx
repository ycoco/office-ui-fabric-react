import * as React from 'react';
import {
    IPersonaProps
} from 'office-ui-fabric-react/lib/Persona';
import {
    autobind
} from 'office-ui-fabric-react/lib/Utilities';
import {
    NormalPeoplePicker,
    CompactPeoplePicker,
    MemberListPeoplePicker,
    BasePeoplePicker,
    // Lint thinks that this is using IPeoplePickerProps before it's declared because of the reference to it further down.
    /* tslint:disable */
    IPeoplePickerProps as OufrPickerProps
    /* tslint:enable */
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
import { IPeoplePickerProps, PeoplePickerType } from './PeoplePicker.Props';
import './PickerItem.scss';

export interface IPeoplePickerState {
    hasUnresolvedText?: boolean;
}

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
                allowEmailAddresses: true,
                allowMultipleEntities: null,
                allUrlZones: null,
                enabledClaimProviders: null,
                forceClaims: null,
                groupID: null,
                maximumEntitySuggestions: 5,
                principalSource: null,
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
        let { onRenderItem, onRenderSuggestionsItem, defaultSelectedItems, onSelectedPersonasChange, suggestionsHeaderText } = this.props;
        let pickerProps: OufrPickerProps = {
            onRenderItem: onRenderItem,
            onRenderSuggestionsItem: onRenderSuggestionsItem,
            onResolveSuggestions: this._onResolveSuggestions,
            getTextFromItem: (persona: IPersonaProps) => persona.primaryText,
            defaultSelectedItems: defaultSelectedItems,
            onChange: onSelectedPersonasChange,
            pickerSuggestionsProps: {
                suggestionsHeaderText: suggestionsHeaderText
            }
        };

        switch (this.props.peoplePickerType) {
            case PeoplePickerType.compact:
                return <CompactPeoplePicker { ...pickerProps } />;
            case PeoplePickerType.custom:
                return <BasePeoplePicker { ...pickerProps } />;
            case PeoplePickerType.customListBelow:
                return <MemberListPeoplePicker { ...pickerProps } />;
            default:
                return <NormalPeoplePicker { ...pickerProps } />;
        }
    }

    @autobind
    private _onResolveSuggestions(value: any): Promise<IPersonaProps[]> | IPersonaProps[] {

        let peoplePickerSearchResult: IPeoplePickerProviderResults = this._dataProvider.search(value.trim(), this._peoplePickerQueryParams);

        if (!peoplePickerSearchResult) {
            return [];
        }

        let cachedItems: IPersonaProps[] = peoplePickerSearchResult.cached ? this._convertIPersonArrayToPersona(peoplePickerSearchResult.cached) : [];

        if (this._peoplePickerSearchPromise) {
            this._peoplePickerSearchPromise.cancel();
            this._peoplePickerSearchPromise = undefined;
        }

        this._peoplePickerSearchPromise = peoplePickerSearchResult.promise;
        return this._peoplePickerSearchPromise.then((personList: IPerson[]) => {
            this._peoplePickerSearchPromise = undefined;
            return personList ? this._convertIPersonArrayToPersona(personList).concat(cachedItems) : [];
        });
    }

    private _convertIPersonToPersona(person: IPerson): IPersonaProps {
        return {
            primaryText: person.name,
            imageUrl: person.image,
            secondaryText: person.email,
            tertiaryText: person.userId,
            imageInitials: this._getInitials(person.name)
        };
    }

    private _convertIPersonArrayToPersona(persons: IPerson[]): Array<IPersonaProps> {
        let personas: Array<IPersonaProps> = new Array<IPersonaProps>();

        for (let i: number = 0; i < persons.length; i++) {
            personas.push(this._convertIPersonToPersona(persons[i]));
        }

        return personas;
    }

    private _getInitials(personName: string): string {
        let imageInitials: string = '';

        if (personName) {
            let splitInitials = personName.split(' ');

            imageInitials = splitInitials[0] && splitInitials[0][0] ? splitInitials[0][0] : '';
            imageInitials += splitInitials[1] && splitInitials[1][0] ? splitInitials[1][0] : '';
        }

        return imageInitials;
    }
}
export default PeoplePicker;