import Promise from '@ms/odsp-utilities/lib/async/Promise';
import ISPList from './ISPList';
import { ISPListCreationInformation } from './ISPListCreationInformation';

/**
 * SharePoint/ODB data source for operations on collections of lists.
 */
interface ISPListCollectionDataSource {
    /**
     * Create a new list.
     *
     * @public
     * @param {ISPListCreationInformation} listCreationInformation
     * @returns {Promise<ISPList>}
     */
    createList(listCreationInformation: ISPListCreationInformation): Promise<ISPList>;

    /**
     * Returns a list that is designated as a default asset location for images and other files.
     * List is created if it doesn't already exist.
     *
     * @public
     * @returns {Promise<ISPList>}
     */
    ensureSiteAssetsLibrary(): Promise<ISPList>;
}

export default ISPListCollectionDataSource;
