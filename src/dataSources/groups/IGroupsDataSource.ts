import IGroup from './IGroup';
import IMembership from './IMembership';
import IPerson from '../peoplePicker/IPerson';
import Promise from '@ms/odsp-utilities/lib/async/Promise';

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
     * Membership properties include: isMember, isOwner, isJoinPending, membersList, ownersList
     */
    getGroupMembership(groupId: string, userLoginName: string): Promise<IMembership>;

    /**
     * Returns a promise that includes groups that user is a member of
     */
    getUserGroups(user: IPerson): Promise<IGroup[]>;

    /**
     * Returns a promise that user was added to the group as a member
     */
    addGroupMember(groupId: string, userId: string): Promise<any>;

    /**
     * Returns a promise that user was added to the group as an owner
     */
    addGroupOwner(groupId: string, userId: string): Promise<any>;

    /**
     * Returns a promise that user was removed from the group as a member
     */
    removeGroupMember(groupId: string, userId: string): Promise<any>;

    /**
     * Returns an IPerson promise of a current user given user's principal name
     */
    getUserInfo(userPrincipalName: string): Promise<IPerson>;
}

export default IGroupsDataSource;
