import Promise from '@ms/odsp-utilities/lib/async/Promise';
import ISPList from './ISPList';
import { ISPListCreationInformation  } from './ISPListCreationInformation';

/**
 * SharePoint/ODB data source for operations on collections of lists.
 */
interface ISPListCollectionDataSource {
    /**
     * Create a new list.
     */
    createList(listCreationInformation: ISPListCreationInformation): Promise<ISPList>;
}

export default ISPListCollectionDataSource;
