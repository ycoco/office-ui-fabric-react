import IGroup from './IGroup';
import { IMembership, IOwnership } from './IMembership';
import IPerson from '../peoplePicker/IPerson';
import Promise from '@ms/odsp-utilities/lib/async/Promise';
import { IDataBatchOperationResult } from '../../interfaces/IDataBatchOperationResult';

/* Represents an Office 365 Groups data source */
export interface IGroupsDataSource {
    /**
     * Returns a promise that includes Group's basic properties
     * Basic properties include: name, principalName, alias, mail, description, creationTime,
     * inboxUrl, calendarUrl, filesUrl, notebookUrl, pictureUrl, sharePointUrl, editUrl, membersUrl, isPublic
     * yammerResources, allowToAddGuests, dynamicMembership
     */
    getGroupBasicProperties(groupId: string): Promise<IGroup>;

    /**
     * Returns a promise that returns a group with the given alias
     */
    getGroupByAlias(groupAlias: string): Promise<IGroup>;

    /**
     * Returns a promise that includes Group's membership information
     * If loadAllMembers is true, membersList will contain all members. Otherwise, will contain top three.
     * Membership properties include: isMember, isOwner, isJoinPending, membersList, ownersList
     *
     * TODO: Note that until we implement paging, loading all members really loads top 100.
     *
     * @param groupId - the id of the group
     * @param userLoginName - user login name passed from the page in form of user@microsoft.com
     * @param loadAllMembers - true to load all members, false to load only top three. Defaults to false.
     * @param loadOwnershipInformation - true to load whether each members is also an owner, false otherwise. Defaults to false.
     */
    getGroupMembership(groupId: string, userLoginName: string, loadAllMembers?: boolean, loadOwnershipInformation?: boolean): Promise<IMembership>;

    /**
     * Returns a promise that includes a page of group members using the skip and top parameters.
     * 
     * @param groupId - the id of the group
     * @param userLoginName - user login name passed from the page in form of user@microsoft.com
     * @param skip - the number of members to skip
     * @param top - the number of members to include in the page
     */
    getGroupMembershipPage(groupId: string, userLoginName: string, skip: number, top: number): Promise<IMembership>;

     /**
      * Returns a promise that includes the Group's owners
      * Ownership properties include: totalNumberOfMembers, membersList
      *
      * @param {string} groupId The id of the group
      * @param {string} numberOfOwnersToLoad A string representation of the number of owners to load, used in the URL template
      * Defaults to 100, the maximum number of group owners permitted by AAD.
      */
    getGroupOwnership(groupId: string, numberOfOwnersToLoad?: string): Promise<IOwnership>;

    /**
     * The CSOM method that retrieves the user information from Azure Active Directory‎,
     * and returns a promise that includes groups that user is a member of.
     *
     * @param user - indicates the user for which the groups are returned
     */
    getUserGroupsFromAAD(user: IPerson): Promise<IGroup[]>;

    /**
     * Returns a promise that includes groups that user is a member of.
     * Calls the FBI rest endpoint by default which in turn calls Exchange and returns a sorted (Prankie) list of groups.
     * Also has a fallback that retrieves the user information from Azure Active Directory.
     *
     * @param user - indicates the user for which the groups are returned
     */
    getUserGroups(user: IPerson): Promise<IGroup[]>;

    /**
     * Returns a promise that user was added to the group as a member.
     *
     * @param groupId The GUID of of the group where the member will be added.
     * @param userId The GUID of the user to be added as a member of the group.
     * @param principalName The principal name of the user to be added as a member of the group.
     * @param qosName The customized qosName, if not provided, the default qosName will be used.
     */
    addGroupMember(groupId: string, userId?: string, principalName?: string, qosName?: string): Promise<void>;

    /**
     * Returns a promise that user was added to the group as an owner.
     *
     * @param groupId The GUID of of the group where the owner will be added.
     * @param userId The GUID of the user to be added as a onwer of the group.
     * @param principalName The principal name of the user to be added as a onwer of the group.
     * @param qosName The customized qosName, if not provided, the default qosName will be used.
     */
    addGroupOwner(groupId: string, userId?: string, principalName?: string, qosName?: string): Promise<void>;

    /**
     * Returns a promise that user was removed from the group as a member.
     *
     * @param groupId The GUID of of the group where the member will be removed.
     * @param userId The GUID of the user to be removed from the group membership.
     * @param qosName The customized qosName, if not provided, the default qosName will be used.
     */
    removeGroupMember(groupId: string, userId: string, qosName?: string): Promise<void>;

    /**
     * Returns a promise that user was removed from the group as a owner.
     *
     * @param groupId The GUID of of the group where the owner will be removed.
     * @param userId The GUID of the user to be removed from the group ownership.
     * @param qosName The customized qosName, if not provided, the default qosName will be used.
     */
    removeGroupOwner(groupId: string, userId: string, qosName?: string): Promise<void>;

    /**
     * Add set of users to the group as members or owners, with given group id and set of user ids or principalNames.
     *
     * @param groupId The GUID of of the group where the members and oweners will be added.
     * @param owners The GUID of the users to be added as owners of the group.
     * @param members The GUID of the users to be added as members of the group.
     * @param ownersPrincipalName The principal names of the users to be added as members of the group.
     * @param membersPrincipalName The principal names of the users to be added as owners of the group.
     */
    addUsersToGroup(groupId: string, owners?: string[], members?: string[], ownersPrincipalName?: string[], membersPrincipalName?: string[]): Promise<IDataBatchOperationResult>;

    /**
     * Returns a promise to update the basic properties of the specified Group
     */
    setGroupBasicProperties(group: IGroup): Promise<void>;

    /**
     * Returns an IPerson promise of a current user given user's principal name
     */
    getUserInfo(userPrincipalName: string): Promise<IPerson>;

    /**
     * Requests the deletion of the specified group
     */
    deleteGroup?(group: IGroup): Promise<void>;
}

export default IGroupsDataSource;
