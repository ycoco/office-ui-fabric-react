// OneDrive:IgnoreCodeCoverage

import Promise from '@ms/odsp-utilities/lib/async/Promise';
import ISPUser from './ISPUser';
/**
 * Provides methods for getting or setting site permissions
 */
interface ISitePermissionsDataSource  {
    /**
     *gets the site groups and users
     */
   getSiteGroupsAndUsers(): Promise<ISPUser[]>;
}
export default ISitePermissionsDataSource;
