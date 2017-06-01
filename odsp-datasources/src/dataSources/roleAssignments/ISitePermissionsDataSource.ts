// OneDrive:IgnoreCodeCoverage

import Promise from '@ms/odsp-utilities/lib/async/Promise';
import ISPUser from './ISPUser';
/**
 * Provides methods for getting or setting site permissions
 */
interface ISitePermissionsDataSource {
  /**
   *gets the site groups and users
   */
  getSiteGroupsAndUsers(): Promise<ISPUser[]>;

  /**
   *gets one site group and users by id
   */
  getSiteGroupAndUsersById(id: number): Promise<ISPUser>;

  /**
   *gets the site permission groups only
   */
  associatedPermissionGroups(): Promise<ISPUser[]>;

  /**
   *adds permission level for a given spuser
   */
  addRoleAssignment(principalid: string, roledefid: string): Promise<void>;

  /**
   *removes permission level for a given spuser
   */
  removeRoleAssignment(principalid: string, roledefid: string): Promise<void>;

  /**
   *adds a given spuser to a given group
   */
  addUserToGroup(groupId: string, loginName: string): Promise<void>;
}
export default ISitePermissionsDataSource;
