// OneDrive:CoverageThreshold(80)

import Promise from '@ms/odsp-utilities/lib/async/Promise';
import {
    IPeoplePickerProvider,
    IPeoplePickerProviderParams
} from './IPeoplePickerProvider';
import { IPeoplePickerCapabilities } from './IPeoplePickerCapabilities';
import { IPeoplePickerQueryParams } from './IPeoplePickerQueryParams';
import { PeoplePickerDataSource } from '../../dataSources/peoplePicker/PeoplePickerDataSource';
import { IPeoplePickerProviderResults } from  './IPeoplePickerProviderResults';
import { IPerson } from '../../dataSources/peoplePicker/IPerson';
import { IDisposable }  from '@ms/odsp-utilities/lib/interfaces/IDisposable';
import { PeopleStore } from '../../models/store/PeopleStore';
import { IPickerEntityInformation } from '../../dataSources/peoplePicker/IPickerEntityInformation';
const UNVALIDATED_EMAIL_ADDRESS = 'UNVALIDATED_EMAIL_ADDRESS'; // Person PrincipalType value to ignore when adding to cache.

export class PeoplePickerProvider implements IPeoplePickerProvider {
    /* tslint:disable */
    public MaxCacheSuggestions: number;
    /* tslint:enable */

    private _dataSource: PeoplePickerDataSource;
    private _ppCapabilities: IPeoplePickerCapabilities;
    private _mruCache: PeopleStore;

    constructor(params: IPeoplePickerProviderParams) {

        this._dataSource = new PeoplePickerDataSource(params.pageContext);
        this._ppCapabilities = this._dataSource.getCapabilities();

        if (this._ppCapabilities.supportsMruCaching) {
            this._mruCache = new PeopleStore();
            this.MaxCacheSuggestions = 5;
        } else {
            this.MaxCacheSuggestions = 0;
        }
    }

    public search(query: string, context: IPeoplePickerQueryParams): IPeoplePickerProviderResults {
        let searchPromise: Promise<void>;

        let results: IPeoplePickerProviderResults = {
            cached: undefined,
            promise: undefined
        };

        // Send cached results to caller immediately without waiting for server results
        // Don't use cache if limiting results to members of a particular SP Group
        // (context.groupID of zero indicates there are no group membership restrictions)
        let cacheResults: IPerson[];
        if (this._ppCapabilities.supportsMruCaching && !context.groupID) {
            cacheResults = this.searchMruCache(query, context && context.filterExternalUsers);  // get the items from the cache for the current query
            if (cacheResults.length > 0) {
                results.cached = cacheResults;
            }
        }

        results.promise = new Promise((complete: (data: IPerson[]) => void, error: (data: any) => void) => {
            // Call the server to search for people that match the query
            searchPromise = this._dataSource.search(query, context).then((data: Array<IPerson>) => {
                if (cacheResults) {
                    // Look through cached results and remove any matches from the server data that already exist in the local cache
                    for (let i: number = 0; i < data.length; i++) {
                        for (let j: number = 0; j < cacheResults.length; j++) {
                            if (data[i].email === cacheResults[j].email) {
                                delete data[i];
                                break;
                            }
                        }
                    }

                    // Remove any items that were deleted from the data array
                    complete(data.filter(Boolean));
                } else {
                    complete(data);
                }
            }, /* onError */(data: any): void => {
                // pass through error to parent promise
                error(data);
            });
        }, /* onCancel */(): void => {
            if (searchPromise) {
                searchPromise.cancel();
            }
        });

        return results;
    }

    public resolve(query: string, context: IPeoplePickerQueryParams): Promise<IPerson> {
        let _this = this;
        return _this._dataSource.resolve(query, context).then((data: IPerson) => {
            if (_this._ppCapabilities.supportsMruCaching) {
                if (data.isResolved) {
                    _this.addToMruCache(data);
                }
            }

            return data;
        });

        // TODO: Only add item to the cache for certain query parameter values:
        //  return (this.UseLocalSuggestionCache) &&
        // (this.UrlZone == undefined) &&
        // (this.SharePointGroupID <= 0) &&
        // (this.WebApplicationID == '{00000000-0000-0000-0000-000000000000}') &&
        // (this.EnabledClaimProviders == '' || this.EnabledClaimProviders == undefined) &&
        // (this.PrincipalAccountTypeEnum % 2 == 1 /*SP.Utilities.PrincipalType.user*/) &&
        // (this.ResolvePrincipalSource == 15 /*SP.Utilities.PrincipalSource.all*/);
    }

    public subscribePresence(accountID: string, fnCallback?: Function): IDisposable {
        let _this = this;
        return _this._dataSource.subscribePresence(accountID, fnCallback);
    }

    public addToMruCache(item: IPerson): void {
        if (this._mruCache && item.rawPersonData && item.rawPersonData.EntityData && item.rawPersonData.EntityData.PrincipalType !== UNVALIDATED_EMAIL_ADDRESS) {
            this._mruCache.setItem(item);
        }
    }

    public getPickerEntityInformation(person: IPerson): Promise<IPickerEntityInformation> {
        return this._dataSource.getPickerEntityInformation(person);
    }

    private searchMruCache(query: string, filterExternalUsers?: boolean): Array<IPerson> {
        let data: Array<IPerson> = [];

        if (this._mruCache) {
            data = this._mruCache.getItems(query, filterExternalUsers);
            // Only return up to the maximum number of suggestions requested
            if (data.length > this.MaxCacheSuggestions) {
                data = data.splice(0, this.MaxCacheSuggestions);
            }
        }

        return data;
    }
}