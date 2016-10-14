// OneDrive:IgnoreCodeCoverage
import PrincipalType from'./PrincipalType';
import { PersonaInitialsColor } from '../../dataSources/siteHeader/AcronymAndColorDataSource';

export enum RoleType {
  /**
   * Gurst permissions - Has limited rights to view pages and specific page elements.
   */
  Guest = 1,

  /**
   * Reader permissions - 	Has rights to view items; the reader cannot add content
   */
  Reader = 2,

  /**
   *  Contributor permissions - Has Reader rights, plus rights to add items, edit items, delete items, manage list permissions, manage
   *  personal views, personalize Web Part Pages, and browse directories.
   */
  Contributor = 3,

  /**
   *  WebDesigner permissions - Has Contributor rights, plus rights to cancel check out, delete items, manage lists, add and customize
   *  pages, define and apply themes and borders, and link style sheets.
   */
  WebDesigner = 4,

  /**
   *  Administrator permissions - Has all rights from other roles, plus rights to manage roles and view usage analysis data. Includes all
   * rights in the WebDesigner role, plus the following: ManageListPermissions, ManageRoles, ManageSubwebs, ViewUsageData.
   */
  Administrator = 5,

  /**
   * Can add, edit and delete lists; can view, add, update and delete list items and documents.
   */
  Edit = 6,

  /**
   * For SharePoint internal use only. System roles can not be deleted, nor modified.
   */
  System = 255
}

export interface IRoleDefinitionProps {
  /**
   * Numeric user ID
   */
  id: number;

  /**
   * Permission name
   */
  name?: string;

  /**
   * Permission order
   */
  order?: number;

  /**
   * Permission level type
   */
  roleKindType?: number;

  /**
   * Permission level description
   */
  description?: string;

  /**
   * Array of Role Definitions.
   */
  roleDefinitionBindings?: IRoleDefinitionProps[];
}

/**
 * Interface used to describe a SharePoint SPUser object.
 */
export interface ISPUser {
    /**
     * Numeric user ID
     */
    id: number;

    /**
     * User login name, like user@microsoft.com
     */
    loginName?: string;

    /**
     * In case this is describing a SharePoint SPGroup object the users property is an array of ISPUser objects representing the SPGroup
     *  members.
     **/
    users?: ISPUser[];

    /**
     * Numeric principal ID
     */
    principalId?: number;

    /**
     * Boolean allowing the user/group to add/remove users
     */
    allowMembersEditMembership?: boolean;

    /**
     * Boolean allowing users to Join/Leave a group
     */
    allowRequestToJoinLeave?: boolean;

    /**
     * Boolean to autoAccept request to Join/Leave
     */
    autoAcceptRequestToJoinLeave?: boolean;

    /**
     * Description
     */
    description?: string;

    /**
     * Boolean for site admin permissions
     */
    isSiteAdmin?: boolean;

    /**
     * Specifies the type of a principal
     */
    principalType?: PrincipalType;

    /**
     * Title
     */
    title?: string;

    /**
     * Email
     */
    email?: string;

    /**
     * URL path to user picture
     */
    urlImage?: string;

    /**
     * The user's initials to display in the image area when there is no image.
     */
    imageInitials?: string;

    /**
     * The background color when the user's initials are displayed.
     * @defaultvalue PersonaInitialsColor.blue
     */
    initialsColor?: PersonaInitialsColor;

    /**
     * Array of Role Definitions.
     */
    roleDefinitionBindings?: IRoleDefinitionProps[];

    /**
     * Permission level.
     */
    roleType?:  RoleType;

}
export default ISPUser;
