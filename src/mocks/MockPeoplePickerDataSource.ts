// OneDrive:CoverageThreshold(85)

import Promise from '@ms/odsp-utilities/lib/async/Promise';
import { IDisposable }  from '@ms/odsp-utilities/lib/interfaces/IDisposable';
import Async from '@ms/odsp-utilities/lib/async/Async';

import { IPeoplePickerCapabilities } from '../providers/PeoplePicker/IPeoplePickerCapabilities';
import { IPeoplePickerQueryParams } from '../providers/PeoplePicker/IPeoplePickerQueryParams';
import { IPerson } from '../dataSources/peoplePicker/IPerson';
import { IPickerEntityInformation } from '../dataSources/peoplePicker/IPickerEntityInformation';
import { IPeoplePickerDataSource } from '../dataSources/peoplePicker/IPeoplePickerDataSource';

const mockPickerData: IPerson[] = [
    {
        name: 'Annie Lindqvist',
        email: 'AnnieLindqvist@contoso.com',
        sip: 'AnnieLindqvist@contoso.com',
        userId: 'AnnieLindqvist@contoso.com',
        job: 'Software Engineer',
        isResolved: true,
        rawPersonData: {
            EntityData: {
                PrincipalType: 'GUEST_USER'
            }
        }
    },
    {
        name: 'Aaron Reid',
        email: 'AaronReid@contoso.com',
        sip: 'AaronReid@contoso.com',
        userId: 'AaronReid@contoso.com',
        job: 'Software Engineer',
        isResolved: true,
        rawPersonData: {
            EntityData: {
                PrincipalType: 'GUEST_USER'
            }
        }
    },
    {
        name: 'Roko Kolar',
        email: 'RokoKolar@contoso.com',
        sip: 'RokoKolar@contoso.com',
        userId: 'RokoKolar@contoso.com',
        job: 'Software Engineer',
        isResolved: true,
        rawPersonData: {
            EntityData: {
                PrincipalType: 'GUEST_USER'
            }
        }
    },
    {
        name: 'Christian Bergqvist',
        email: 'ChristianBergqvist@contoso.com',
        sip: 'ChristianBergqvist@contoso.com',
        userId: 'ChristianBergqvist@contoso.com',
        job: 'Software Engineer',
        isResolved: true,
        rawPersonData: {
            EntityData: {
                PrincipalType: 'GUEST_USER'
            }
        }
    },
    {
        name: 'Valentina Lovric',
        email: 'ValentinaLovric@contoso.com',
        sip: 'ValentinaLovric@contoso.com',
        userId: 'ValentinaLovric@contoso.com',
        job: 'Software Engineer',
        isResolved: true,
        rawPersonData: {
            EntityData: {
                PrincipalType: 'GUEST_USER'
            }
        }
    },
    {
        name: 'Maor Sharett',
        email: 'MaorSharett@contoso.com',
        sip: 'MaorSharett@contoso.com',
        userId: 'MaorSharett@contoso.com',
        job: 'Software Engineer',
        isResolved: true,
        rawPersonData: {
            EntityData: {
                PrincipalType: 'GUEST_USER'
            }
        }
    },
    {
        name: 'Annie Lindqvist2',
        email: 'AnnieLindqvist2@contoso.com',
        sip: 'AnnieLindqvist2@contoso.com',
        userId: 'AnnieLindqvist2@contoso.com',
        job: 'Software Engineer',
        isResolved: true,
        rawPersonData: {
            EntityData: {
                PrincipalType: 'GUEST_USER'
            }
        }
    },
    {
        name: 'Aaron Reid2',
        email: 'AaronReid2@contoso.com',
        sip: 'AaronReid2@contoso.com',
        userId: 'AaronReid2@contoso.com',
        job: 'Software Engineer',
        isResolved: true,
        rawPersonData: {
            EntityData: {
                PrincipalType: 'GUEST_USER'
            }
        }
    }
];

export class PeoplePickerDataSource implements IPeoplePickerDataSource {
    private _capabilities: IPeoplePickerCapabilities;

    public static getMockPeople(name: string, numOfPeople: number): Array<IPerson> {
        return name ? mockPickerData.filter(item => item.name.toLowerCase().indexOf(name.toLowerCase()) === 0) : [];
    }

    constructor() {
        this._capabilities = {
            supportsMruCaching: true
        };
    }

    public getCapabilities(): IPeoplePickerCapabilities {
        return this._capabilities;
    }

    public search(query: string, context: IPeoplePickerQueryParams): Promise<Array<IPerson>> {
        let async = new Async(this);

        let onExecute = (complete: any, error: any) => {
            async.setTimeout(() => {
                let data: Array<IPerson> = PeoplePickerDataSource.getMockPeople(query, context.maximumEntitySuggestions);
                complete(data);
            }, 10);
        };

        return new Promise<Array<IPerson>>(onExecute);
    }

    public resolve(query: string, context: IPeoplePickerQueryParams): Promise<IPerson> {
        return this.search(query, context).then((data: any) => {
            // Always return a single item here. Mock search API always returns 100 items so force it to resolve to a single item.
            return data.splice(0, 1)[0];
        });
    }

    public subscribePresence(accountID: string, fnCallback?: Function): IDisposable {
        return undefined;
    }

    public getPickerEntityInformation(person: IPerson): Promise<IPickerEntityInformation> {
        return Promise.wrap<IPickerEntityInformation>({
            person: person,
            totalMemberCount: 10
        });
    }

}
