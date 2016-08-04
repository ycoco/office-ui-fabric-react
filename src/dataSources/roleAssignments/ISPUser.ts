// OneDrive:IgnoreCodeCoverage
import PrincipalType from'./PrincipalType';
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
     * URL path to user picture
     */
    urlImage?: string;
}
export default ISPUser;
