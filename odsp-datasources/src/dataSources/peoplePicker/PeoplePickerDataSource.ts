// OneDrive:CoverageThreshold(50)

import Promise from '@ms/odsp-utilities/lib/async/Promise';
import { DataSource } from '../base/DataSource';
import {
    IPerson,
    EntityType,
    PrincipalType
} from './IPerson';
import { IDisposable }  from '@ms/odsp-utilities/lib/interfaces/IDisposable';
import { IPeoplePickerDataSource } from './IPeoplePickerDataSource';
import { IPeoplePickerCapabilities } from'../../providers/peoplePicker/IPeoplePickerCapabilities';
import { IPeoplePickerQueryParams } from '../../providers/peoplePicker/IPeoplePickerQueryParams';
import { PresenceType } from './IPresenceType';
import { ISpPageContext } from '../../interfaces/ISpPageContext';
import { IPickerEntityInformation } from './IPickerEntityInformation';

declare let O365Shell_Shim: any;

export class PeoplePickerDataSource extends DataSource implements IPeoplePickerDataSource {
    private _capabilities: IPeoplePickerCapabilities;
    private _skypeIntegration: any;

    constructor(hostSettings: ISpPageContext) {
        super(hostSettings);

        this._capabilities = {
            supportsMruCaching: true
        };

    }

    public getCapabilities(): IPeoplePickerCapabilities {
        return this._capabilities;
    }

    public search(query: string, context: IPeoplePickerQueryParams): Promise<Array<IPerson>> {
        return this.getData<Array<IPerson>>(
            (): string => {   // URL
                return this.getWebServerRelativeUrl() + '/_api/SP.UI.ApplicationPages.ClientPeoplePickerWebServiceInterface.ClientPeoplePickerSearchUser';
            },
            (responseText: string): any => { // parse the response
                let response: any = JSON.parse(responseText);
                let peopleArray: Array<any> = JSON.parse(response.d.ClientPeoplePickerSearchUser);
                let entities = this._transformData(peopleArray, context.filterExternalUsers);
                if (context.filterExternalUsers) {
                    entities = entities.filter((person) => person.entityType !== EntityType.externalUser);
                }
                return entities;
            },
            'Search',
            (): string => { return this._constructPostBody(query, context); }
        );
    }

    public resolve(query: string, context: IPeoplePickerQueryParams): Promise<IPerson> {
        return this.getData<IPerson>(
            (): string => {   // URL
                return this.getWebServerRelativeUrl() + '/_api/SP.UI.ApplicationPages.ClientPeoplePickerWebServiceInterface.ClientPeoplePickerResolveUser';
            },
            (responseText: string): any => { // parse the response
                let response: any = JSON.parse(responseText);
                let responseData: any = JSON.parse(response.d.ClientPeoplePickerResolveUser);
                let personArray: Array<any> = [];
                personArray[0] = responseData;

                if (!responseData.IsResolved) {
                    personArray[0].DisplayText = responseData.Key;
                }
                personArray = this._transformData(personArray, context.filterExternalUsers);
                let person: IPerson = personArray[0];
                if (context.filterExternalUsers && person && person.entityType === EntityType.externalUser) {
                    // If filterExternalUsers is passed then mark any existing external user in directory as unresolved
                    // and change its entity type to deafult.
                    person.isResolved = false;
                    person.entityType = EntityType.regularUser;
                }
                return person;
            },
            'Resolve',
            (): string => { return this._constructPostBody(query, context); }
        );
    }

    public subscribePresence(accountID: string, fnCallback?: Function): IDisposable {
        try {
            this.ensureSkypePresence();

            let fnPresenceCallback = (type: any) => {
                try {
                    switch (type) {
                        case 0: // Microsoft.O365.SuiteApi.SkypeIntegration.SkypePresenceState.Unknown:
                            fnCallback(PresenceType.Unknown);
                            break;

                        case 1: // Microsoft.O365.SuiteApi.SkypeIntegration.SkypePresenceState.Online:
                            fnCallback(PresenceType.Online);
                            break;

                        case 2: // Microsoft.O365.SuiteApi.SkypeIntegration.SkypePresenceState.Busy:
                            fnCallback(PresenceType.Busy);
                            break;

                        case 3: // Microsoft.O365.SuiteApi.SkypeIntegration.SkypePresenceState.DoNotDisturb:
                            fnCallback(PresenceType.DoNotDisturb);
                            break;

                        case 4: // Microsoft.O365.SuiteApi.SkypeIntegration.SkypePresenceState.BeRightBack:
                            fnCallback(PresenceType.BeRightBack);
                            break;

                        case 5: // Microsoft.O365.SuiteApi.SkypeIntegration.SkypePresenceState.Away:
                            fnCallback(PresenceType.Away);
                            break;

                        case 6: // Microsoft.O365.SuiteApi.SkypeIntegration.SkypePresenceState.Offline:
                            fnCallback(PresenceType.Offline);
                            break;

                        case 8: // Microsoft.O365.SuiteApi.SkypeIntegration.SkypePresenceState.Hidden:
                            fnCallback(PresenceType.Hidden);
                            break;

                        default:
                            fnCallback(PresenceType.Unknown);
                            break;
                    }
                } catch (e) {
                    // do nothing
                }
            };

            this._skypeIntegration.TrackPresence(accountID, fnPresenceCallback);

            let disposable: IDisposable = {
                dispose: () => {
                    try {
                        this._skypeIntegration.UntrackPresence(accountID, fnPresenceCallback);
                    } catch (e) {
                        // do nothing
                    }
                }
            };
            return disposable;
        } catch (e) {
            // do nothing
        }
        return undefined;
    }

    public getPickerEntityInformation(person: IPerson): Promise<IPickerEntityInformation> {
        return this.getData<IPickerEntityInformation>(
            /* URL */(): string => this.getWebServerRelativeUrl() + '/_api/SP.UI.ApplicationPages.ClientPeoplePickerWebServiceInterface.GetPickerEntityInformation',
            /* parseResponse */(responseText: string): IPickerEntityInformation => {
                // Previous mapping for reference.
                // let schemaMap = [
                //     { from: 'TotalMemberCount', to: 'totalMemberCount' }
                // ];
                let response: any = JSON.parse(responseText);
                let entityInformation: IPickerEntityInformation = {
                    person: response.person,
                    totalMemberCount: response.TotalMemberCount
                };

                entityInformation.person = person;
                return entityInformation;
            },
            /* qosName */ 'getPickerEntityInformation',
            /* getAdditionalPostData */(): string => {
                let groupId = 0;
                if (person.principalType === PrincipalType.sharePointGroup) {
                    groupId = Number(person.rawPersonData.EntityData.SPGroupID);
                }
                let entityTipsInformationRequest: any = {
                    'PrincipalType': person.principalType,
                    'EmailAddress': person.email,
                    'GroupId': groupId
                };
                let strBody = {
                    entityInformationRequest: entityTipsInformationRequest
                };
                return JSON.stringify(strBody);
            }
        );
    }

    protected getDataSourceName() {
        return 'PeoplePickerDataSource';
    }

    private getWebServerRelativeUrl(): string {
        return this._pageContext.webServerRelativeUrl === '/' ? '' : this._pageContext.webServerRelativeUrl;
    }

    private _transformData(data: Array<any>, filterExternalUsers: boolean): Array<IPerson> {
        // Previous mapping for reference.
        // let schemaMap = [
        //     { from: 'DisplayText', to: 'name' },
        //     { from: 'EntityData.Email', to: 'email' },
        //     { from: 'Key', to: 'userId' },
        //     { from: 'EntityData.Title', to: 'job' },
        //     { from: 'EntityData.Department', to: 'department' },
        //     { from: 'EntityData.MobilePhone', to: 'phone' },
        //     { from: 'ProviderDisplayName', to: 'providerName' },
        //     { from: 'EntityType', to: 'entityType' },
        //     { from: 'IsResolved', to: 'isResolved' },
        //     { from: 'MultipleMatches', to: 'multipleMatches' }
        // ];
        let transformedArray: Array<IPerson> = data.map(person => {
            return {
                name: person.DisplayText,
                email: person.EntityData.Email,
                userId: person.Key,
                job: person.EntityData.Title,
                department: person.EntityData.Department,
                phone: person.EntityData.MobilePhone,
                providerName: person.ProviderDisplayName,
                entityType: person.EntityType,
                isResolved: person.IsResolved,
                multipleMatches: person.MultipleMatches
            };
        }
        );

        for (let i = 0; i < transformedArray.length; i++) {
            transformedArray[i].rawPersonData = data[i];
            if (transformedArray[i].multipleMatches.length > 0) {
                transformedArray[i].multipleMatches = this._transformData(transformedArray[i].multipleMatches, filterExternalUsers);
                if (filterExternalUsers) {
                    transformedArray[i].multipleMatches = transformedArray[i].multipleMatches.filter((person) => person.entityType !== EntityType.externalUser);
                }
            }
            // set image URL
            if (transformedArray[i].isResolved) {
                transformedArray[i].image = transformedArray[i].email !== undefined ? '/_layouts/15/userphoto.aspx?size=S&accountname=' + transformedArray[i].email : undefined;
            }

            // calculate entity type
            let serverType = data[i].EntityData.PrincipalType;
            if (!Boolean(serverType)) {
                serverType = data[i].EntityType;
            }
            switch (serverType) {
                case 'UNVALIDATED_EMAIL_ADDRESS':
                case 'GUEST_USER':
                    transformedArray[i].entityType = EntityType.externalUser;
                    transformedArray[i].principalType = PrincipalType.user;
                    break;
                case 'SecGroup':
                case 'SharePointGroup':
                case 'FormsRole':
                    transformedArray[i].entityType = EntityType.group;
                    if (serverType === 'SharePointGroup') {
                        transformedArray[i].principalType = PrincipalType.sharePointGroup;
                    } else {
                        transformedArray[i].principalType = PrincipalType.securityGroup;
                    }
                    break;
                default:
                    transformedArray[i].entityType = EntityType.regularUser;
                    transformedArray[i].principalType = PrincipalType.user;
            }

            // set 'rawData' to be the value exactly returned by the server. For list metadata, we need this exact value
            // when we write back to the list.
            transformedArray[i].rawData = data[i];
        }

        return transformedArray;
    }

    private _constructPostBody(query: string, context: IPeoplePickerQueryParams): string {
        let strBody = {
            queryParams: {
                'QueryString': query,
                'MaximumEntitySuggestions': context.maximumEntitySuggestions,
                'AllowEmailAddresses': context.allowEmailAddresses,
                'AllowOnlyEmailAddresses': context.allowOnlyEmailAddresses,
                'PrincipalType': context.principalType,
                'PrincipalSource': context.principalSource,
                'SharePointGroupID': context.groupID,
                'QuerySettings': context.querySettings
            }
        };
        return JSON.stringify(strBody);
    }

    private ensureSkypePresence() {
        try {
            if (!Boolean(this._skypeIntegration)) {
                let skypeIntegration: any = new O365Shell_Shim.SkypeIntegration();
                skypeIntegration.OnApiReady(() => {
                    this._skypeIntegration = skypeIntegration;
                });
            }
        } catch (e) {
            // do nothing. Basically skype presence didn't work so degrade gracefully
        }
    }
}