// external packages
import * as React from 'react';
import { PeoplePickerDataSource } from '@ms/odsp-datasources/lib/mocks/MockPeoplePickerDataSource';
import { IPerson } from '@ms/odsp-datasources/lib/PeoplePicker';
import { PrimaryButton } from 'office-ui-fabric-react/lib/Button';
import PrincipalType from '@ms/odsp-datasources/lib/dataSources/roleAssignments/PrincipalType';
import SchemaMapper from '@ms/odsp-utilities/lib/object/SchemaMapper';
import { IPeoplePickerQueryParams } from '@ms/odsp-datasources/lib/providers/peoplePicker/IPeoplePickerQueryParams';

// local packages
import { IReactFieldEditor } from '../IReactFieldEditor';
import { PeoplePicker } from '../../../PeoplePicker/index';
import { BaseReactFieldEditor, IBaseReactFieldEditorProps } from '../BaseReactFieldEditor';
import './PeopleEidtor.scss';

export class PeopleEditor extends BaseReactFieldEditor implements IReactFieldEditor {
    private _selectedPeople: IPerson[];
    private _overTheWireOriginal: string;
    private _peoplePickerQueryParams: IPeoplePickerQueryParams;

    public constructor(props: IBaseReactFieldEditorProps) {
        super(props);
        this._selectedPeople = [];
        this._endEdit = this._endEdit.bind(this);
        this._onSelectedPersonasChange = this._onSelectedPersonasChange.bind(this);
        this._peoplePickerQueryParams = {
            allowEmailAddresses: false,
            allowOnlyEmailAddresses: false,
            allowMultipleEntities: this.state.field.schema["AllowMultipleValues"],
            allUrlZones: false,
            //enabledClaimProviders?: string;
            //forceClaims?: boolean;
            groupID: this.state.field.schema["SharePointGroupID"],
            maximumEntitySuggestions: 50,
            principalSource: this.state.field.schema["ResolvePrincipalSource"],
            principalType: this._createSPPrincipalType(this.state.field.schema["PrincipalAccountType"]),
            // queryString: string;
            required: this.state.field.schema["Required"]
            //urlZone?: number;
            //urlZoneSpecified?: boolean;
        };

        let schemaMap = [
            { from: "DisplayText", to: "name" },
            { from: "EntityData.Email", to: "email" },
            { from: "EntityData.AccountName", to: "userId" },
            { from: "EntityData.Title", to: "job" },
            { from: "EntityData.Department", to: "department" },
            { from: "EntityData.SIPAddress", to: "sip" }
        ];
        let schemaMapper = new SchemaMapper(schemaMap, (result: any, obj: any) => {
            if (result.hasOwnProperty("EntityData")) {
                result = result["EntityData"];
                result["DisplayText"] = obj["DisplayText"];
            }
        });
        let initialSelection: any = this.state.field.data;
        if (Boolean(initialSelection) && Boolean(initialSelection.length)) {
            if (typeof initialSelection === "string") {
                initialSelection = JSON.parse(initialSelection);
            }
            let currentPeople = schemaMapper.forwardTransform(initialSelection);
            this._selectedPeople = currentPeople;
            for (let i = 0; i < this._selectedPeople.length; i++) {
                this._selectedPeople[i].isResolved = true; //mark each of these as Resolved.
                this._selectedPeople[i]["rawData"] = initialSelection[i];
            }
        }
        this._overTheWireOriginal = this._getOverTheWireValue(this._selectedPeople);
    }

    /**
     * Core editor control for this field
     *
     * @override
     */
    protected _getEditor(): JSX.Element {
        // TODO: localization strings
        return (
            <div className='od-PeopleEditorContainer'>
                < PeoplePicker
                    className='od-PeopleEditorField is-editing'
                    inputProps={ { placeholder: this._selectedPeople.length === 0 ? 'Enter a name or email address' : undefined } }
                    noResultsFoundText={ 'No Result Found' }
                    loadingText={ 'Loading ' }
                    dataSource={ new PeoplePickerDataSource() }
                    onSelectedPersonasChange={ this._onSelectedPersonasChange }
                    defaultSelectedItems={ this._selectedPeople }
                    peoplePickerQueryParams={ this._peoplePickerQueryParams }
                />
                <span className='od-PeopleEditorButton custom'>
                    < PrimaryButton
                        iconProps={ { iconName: 'CheckMark' } }
                        onClick={ this._endEdit }
                    />
                </span>
            </div>
        );
    }

    protected _endEdit(ev: React.MouseEvent<HTMLButtonElement>): void {
        let updatedField = { ...this.state.field };
        updatedField.data = this._getOverTheWireValue(this._selectedPeople);

        this.setState({
            mode: this._getModeAfterEdit(),
            field: updatedField
        });
        ev.stopPropagation();
        ev.preventDefault();
        this.props.onSave(updatedField);;
    }

    /**
     * Set place holder string for boolean field editor
     * @override
     */
    protected _getPlaceHolderString(): string {
        // TODO: localization strings
        return 'Enter value here';
    }

    protected _getRendererText(): string {
        let names = '';
        for (let currPerson of this._selectedPeople) {
            names += currPerson.name;
            names += ' ';
        }
        return names;
    }

    private _onSelectedPersonasChange(items?: IPerson[]): void {
        this._selectedPeople = items;
    }

    private _getOverTheWireValue(selectedPeopleNew: IPerson[]): string {
        let arrSelectedPeopleRaw: Array<any> = [];
        let overTheWireValue = "";
        if (selectedPeopleNew !== null && selectedPeopleNew !== undefined) {
            //cycle through the values in the selectedPeople array and
            //concatinate the "rawData" values
            for (let selectedPeople of selectedPeopleNew) {
                // When selected people is SharePointGroup, it doesn't have email and isResolved is set to false.
                // We want to continue save when either isResolved is true or it is SharePointGroup.

                if (!selectedPeople.isResolved && selectedPeople.principalType !== PrincipalType.sharePointGroup) {
                    continue;
                }

                let rawData = selectedPeople["rawData"];
                let rawPersonData = selectedPeople["rawPersonData"];
                // try to use rawPersonData if there is no rawData
                if (!Boolean(rawData)) {
                    rawData = rawPersonData;
                }

                if (Boolean(rawData)) {
                    //make sure that we remove a few properties that the for some reason
                    //makes SPO choke.
                    delete rawData.Claim;
                    delete rawData.EntityDataElements;
                    if (rawData.EntityData) {
                        delete rawData.EntityData.DisplayText;
                    }
                    arrSelectedPeopleRaw.push(rawData);
                }
            }

            if (arrSelectedPeopleRaw.length > 0) {
                overTheWireValue = JSON.stringify(arrSelectedPeopleRaw);
            }
        }
        return overTheWireValue;
    }

    private _createSPPrincipalType(typeString: string): number {
        if (!typeString) {
            return 0; /*SP.Utilities.PrincipalType.none*/
        }

        let result = 0;
        let types = typeString.split(',');
        /* tslint:disable: no-bitwise */
        for (let idx in types) {
            if (types[idx] === "User") {
                result |= 1; /*SP.Utilities.PrincipalType.user*/
            } else if (types[idx] === "DL") {
                result |= 2; /*SP.Utilities.PrincipalType.distributionList*/
            } else if (types[idx] === "SecGroup") {
                result |= 4; /*SP.Utilities.PrincipalType.securityGroup*/
            } else if (types[idx] === "SPGroup") {
                result |= 8; /*SP.Utilities.PrincipalType.sharePointGroup*/
            }
        }
        /* tslint:enable: no-bitwise */
        return result;
    }
}

export default PeopleEditor;