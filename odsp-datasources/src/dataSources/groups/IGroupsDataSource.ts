import IGroup from './IGroup';
import IMembership from './IMembership';
import IPerson from '../peoplePicker/IPerson';
import Promise from '@ms/odsp-utilities/lib/async/Promise';
import IDataBatchOperationResult from '../base/DataBatchOperationHelper';

/* Represents an Office 365 Groups data source */
export interface IGroupsDataSource {
    /**
     * Returns a promise that includes Group's basic properties
     * Basic properties include: name, principalName, alias, mail, description, creationTime,
     * inboxUrl, calendarUrl, filesUrl, notebookUrl, pictureUrl, sharePointUrl, editUrl, membersUrl, isPublic
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
     */
    getGroupMembership(groupId: string, userLoginName: string, loadAllMembers?: boolean): Promise<IMembership>;

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
     * Returns a promise that user was added to the group as a member
     */
    addGroupMember(groupId: string, userId: string): Promise<void>;

    /**
     * Returns a promise that user was added to the group as an owner
     */
    addGroupOwner(groupId: string, userId: string): Promise<void>;

    /**
     * Returns a promise that user was removed from the group as a member
     */
    removeGroupMember(groupId: string, userId: string): Promise<void>;

    /**
     * Returns a promise that user was removed from the group as a owner
     */
    removeGroupOwner(groupId: string, userId: string): Promise<void>;

    /**
     * Add set of users to the group as members or owners, with given group id and set of user ids.
     */
    addUsersToGroup(groupId: string, owners: string[], members: string[]): Promise<IDataBatchOperationResult>;

    /**
     * Returns a promise to update the basic properties of the specified Group
     */
    setGroupBasicProperties(group: IGroup): Promise<void>;

    /**
     * Returns an IPerson promise of a current user given user's principal name
     */
    getUserInfo(userPrincipalName: string): Promise<IPerson>;
}

export default IGroupsDataSource;
