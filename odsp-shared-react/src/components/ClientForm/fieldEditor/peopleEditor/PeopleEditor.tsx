// external packages
import * as React from 'react';
import { PeoplePickerDataSource } from '@ms/odsp-datasources/lib/mocks/MockPeoplePickerDataSource';
import { IPerson } from '@ms/odsp-datasources/lib/PeoplePicker';
import { PrimaryButton } from 'office-ui-fabric-react/lib/Button';
import PrincipalType from '@ms/odsp-datasources/lib/dataSources/roleAssignments/PrincipalType';
import { IPeoplePickerQueryParams } from '@ms/odsp-datasources/lib/providers/peoplePicker/IPeoplePickerQueryParams';

// local packages
import { IReactFieldEditor } from '../IReactFieldEditor';
import { PeoplePicker } from '../../../PeoplePicker/index';
import { BaseReactFieldEditor, IBaseReactFieldEditorProps } from '../BaseReactFieldEditor';
import './PeopleEditor.scss';

interface IRawPeopleEditorPerson {
    DisplayText?: string;
    EntityData?: IRawPeopleEditorEntityData;
}
interface IRawPeopleEditorEntityData {
    DisplayText?: string;
    Email?: string;
    AccountName?: string;
    Title?: string;
    Department?: string;
    SIPAddress?: string;
}

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

        let data: string | IRawPeopleEditorPerson[] = this.state.field.data;
        if (data && data.length) {
            let initialSelection: IRawPeopleEditorPerson[] = typeof data === 'string' ? JSON.parse(data) : data;
            this._selectedPeople = initialSelection.map((rawPerson: IRawPeopleEditorPerson) => {
                let rawEntityData: IRawPeopleEditorEntityData = rawPerson.EntityData || {};
                rawEntityData.DisplayText = rawPerson.DisplayText;
                return {
                    name: rawEntityData.DisplayText,
                    email: rawEntityData.Email,
                    userId: rawEntityData.AccountName,
                    job: rawEntityData.Title,
                    department: rawEntityData.Department,
                    sipAddress: rawEntityData.SIPAddress,
                    rawData: rawPerson,
                    isResolved: true
                };
            });
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
        ev.stopPropagation();
        ev.preventDefault();
        let newData = this._getOverTheWireValue(this._selectedPeople);
        this._onSave(newData);
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
        return this._selectedPeople.map((person: IPerson) => person.name).join(' ') + ' ';
    }

    private _onSelectedPersonasChange(items?: IPerson[]): void {
        this._selectedPeople = items;
    }

    private _getOverTheWireValue(selectedPeopleNew: IPerson[]): string {
        let selectedPeopleRaw: any[] = [];
        let overTheWireValue = "";
        if (selectedPeopleNew) {
            //cycle through the values in the selectedPeople array and
            //concatinate the "rawData" values
            for (let selectedPerson of selectedPeopleNew) {
                // When selected people is SharePointGroup, it doesn't have email and isResolved is set to false.
                // We want to continue save when either isResolved is true or it is SharePointGroup.

                if (!selectedPerson.isResolved && selectedPerson.principalType !== PrincipalType.sharePointGroup) {
                    continue;
                }

                let rawData = selectedPerson.rawData || selectedPerson.rawPersonData;

                if (rawData) {
                    //make sure that we remove a few properties that the for some reason
                    //makes SPO choke.
                    delete rawData.Claim;
                    delete rawData.EntityDataElements;
                    if (rawData.EntityData) {
                        delete rawData.EntityData.DisplayText;
                    }
                    selectedPeopleRaw.push(rawData);
                }
            }

            if (selectedPeopleRaw.length > 0) {
                overTheWireValue = JSON.stringify(selectedPeopleRaw);
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
        for (let t of types) {
            if (t === "User") {
                result |= 1; /*SP.Utilities.PrincipalType.user*/
            } else if (t === "DL") {
                result |= 2; /*SP.Utilities.PrincipalType.distributionList*/
            } else if (t === "SecGroup") {
                result |= 4; /*SP.Utilities.PrincipalType.securityGroup*/
            } else if (t === "SPGroup") {
                result |= 8; /*SP.Utilities.PrincipalType.sharePointGroup*/
            }
        }
        /* tslint:enable: no-bitwise */
        return result;
    }
}

export default PeopleEditor;