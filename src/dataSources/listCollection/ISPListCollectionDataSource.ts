import Promise from '@ms/odsp-utilities/lib/async/Promise';
import ISPList from './ISPList';
import { ISPListCreationInformation  } from './ISPListCreationInformation';

/**
 * OneDrive for Business Data source for List related operations
 */
interface ISPListCollectionDataSource {
    /**
     * Create a new list
     * @param {string} title - The title of the new list
     * @param {string} description - The description of the new list
     * @param {string} templateType - The template type value of the new list
     */
    createList(listCreationInformation: ISPListCreationInformation): Promise<ISPList>;
}

export default ISPListCollectionDataSource;
