// OneDrive:CoverageThreshold(85)

import Promise from '@ms/odsp-utilities/lib/async/Promise';
import { IDisposable }  from '@ms/odsp-utilities/lib/interfaces/IDisposable';
import Async from '@ms/odsp-utilities/lib/async/Async';

import { IPeoplePickerCapabilities } from '../providers/PeoplePicker/IPeoplePickerCapabilities';
import { IPeoplePickerQueryParams } from '../providers/PeoplePicker/IPeoplePickerQueryParams';
import { IPerson } from '../dataSources/peoplePicker/IPerson';
import { IPickerEntityInformation } from '../dataSources/peoplePicker/IPickerEntityInformation';
import { IPeoplePickerDataSource } from '../dataSources/peoplePicker/IPeoplePickerDataSource';

class PeoplePickerDataSource implements IPeoplePickerDataSource {
    private _capabilities: IPeoplePickerCapabilities;

    public static getMockPeople(name: string, numOfPeople: number): Array<IPerson> {
        let data: Array<IPerson> = [];
        for (let i = 0; i < numOfPeople; i++) {
            let pickerItem: IPerson = { name: undefined, email: undefined, userId: undefined };
            let strExtension = (100 + i).toString();
            pickerItem.name = name + ' ' + strExtension;
            pickerItem.email = name + strExtension + '@contoso.com';
            pickerItem.sip = pickerItem.email;
            pickerItem.userId = pickerItem.email;
            pickerItem.job = 'Software Engineer';
            pickerItem.isResolved = true;
            pickerItem.image = 'http://images4.wikia.nocookie.net/__cb20090617143357/poohadventures/images/1/11/SpongeBob.jpg';
            pickerItem.rawPersonData = {
                EntityData: {
                    PrincipalType: 'GUEST_USER'
                }
            };
            data.push(pickerItem);
        }
        return data;
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
export = PeoplePickerDataSource;
