import Promise from '@ms/odsp-utilities/lib/async/Promise';
import { IPerson } from '../../dataSources/peoplePicker/IPerson';
import { IDisposable }  from '@ms/odsp-utilities/lib/interfaces/IDisposable';
import { IPeoplePickerQueryParams } from './IPeoplePickerQueryParams';
import { IPeoplePickerProviderResults } from './IPeoplePickerProviderResults';
import { IPickerEntityInformation } from '../../dataSources/peoplePicker/IPickerEntityInformation';
import { ISpPageContext } from '../../interfaces/ISpPageContext';
export interface IPeoplePickerProvider {

    /** Maximum suggestions to return from the local browser cache */
    MaxCacheSuggestions: number;

    /**
     * Searches for a person.
     * @param query - partial text used to find a matching person
     * @param context - contains context information to pass when calling server-side API to control how the people search is performed
     * @returns {IPeoplePickerProviderResults} People that match the query. People that match the query, but already exist in the cachedItems will be returned in the in the cached property. The rest will be in the promise result.
     */
    search(query: string, context: IPeoplePickerQueryParams): IPeoplePickerProviderResults;

     /**
      * Resolves a person after pressing TAB or ';' in people picker.
      * Different API than search for ODB. Perhaps someday we won't need this API? Need to do more research into what they do different.
      * @param query - partial text used to match a person.
      * @param context - contains context information to pass when calling server-side API to control how the people search is performed
      * @returns {Promise} People that match the query. If zero items were returned there wasn't a match. If one item is returned there was a single match. If more than one item is returned, there were multiple matches.
      */
    resolve(query: string, context: IPeoplePickerQueryParams): Promise<IPerson>;

    /**
     * Gets presence of the accountID
     * fOn = true means that we want to start tracking presence for the accountID
     * fOn = false means that we want to stop tracking presence for the accountID
     * fnCallback is the function to call when presence changes
     */
    subscribePresence(accountID: string, fnCallback?: Function): IDisposable;

     /**
      * Adds a person the cache of recently resolved people.
      * @param item - the person to add to the cache
      */
    addToMruCache(item: IPerson): void;

    /**
     * Gets information for the specified people picker entity.
     */
    getPickerEntityInformation(person: IPerson): Promise<IPickerEntityInformation>;
}

export interface IPeoplePickerProviderParams {
  params?: any;
  pageContext: ISpPageContext;
}
