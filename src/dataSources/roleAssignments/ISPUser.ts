// OneDrive:IgnoreCodeCoverage
import PrincipalType from'./PrincipalType';
import { PersonaInitialsColor } from '../../dataSources/siteHeader/AcronymAndColorDataSource';

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
}
export default ISPUser;
