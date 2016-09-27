import Promise from '@ms/odsp-utilities/lib/async/Promise';
import { IPerson } from './IPerson';
import { IDisposable }  from '@ms/odsp-utilities/lib/interfaces/IDisposable';
import { IPeoplePickerCapabilities } from'../../providers/peoplePicker/IPeoplePickerCapabilities';
import { IPeoplePickerQueryParams } from '../../providers/peoplePicker/IPeoplePickerQueryParams';
import { IPickerEntityInformation } from './IPickerEntityInformation';

/**
 * Provides methods for getting people for use in a people picker control.
 */
export interface IPeoplePickerDataSource {

    /**
     * Gets the abilities supported by this particular data source.
     */
    getCapabilities(): IPeoplePickerCapabilities;

    /**
     * Searches for a person.
     * @param query - partial text used to find a matching person
     * @param context - contains context information to pass when calling server-side API to control how the people search is performed
     * @returns {Array} People that match the query.
     */
    search(query: string, context: IPeoplePickerQueryParams): Promise<Array<IPerson>>;

     /**
      * Resolves a person after pressing TAB or ';' in people picker.
      * Different API than search for ODB. Perhaps someday we won't need this API? Need to do more research into what they do different.
      * @param query - partial text used to match a person.
      * @param context - contains context information to pass when calling server-side API to control how the people search is performed
      * @returns {Array} People that match the query. If zero items were returned there wasn't a match. If one item is returned there was a single match. If more than one item is returned, there were multiple matches.
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
     * Gets information for the specified people picker entity.
     */
    getPickerEntityInformation(person: IPerson): Promise<IPickerEntityInformation>;
}