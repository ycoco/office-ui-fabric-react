// OneDrive:IgnoreCodeCoverage
import PrincipalType from'./PrincipalType';

export enum PersonaInitialsColor {
  lightBlue,
  blue,
  darkBlue,
  teal,
  lightGreen,
  green,
  darkGreen,
  lightPink,
  pink,
  magenta,
  purple,
  black,
  orange,
  red,
  darkRed
}

/**
 * ISPUser Interface used to initialize a SitePermissions oject.
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
     * ISUsers array of users
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
    principalType: PrincipalType;

    /**
     * Title
     */
    title: string;

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
}
export default ISPUser;
