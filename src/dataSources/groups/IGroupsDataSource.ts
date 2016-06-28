import IGroup from './IGroup';
import IMembership from './IMembership';
import IPerson from '../peoplePicker/IPerson';
import IGroupSiteInfo from './IGroupSiteInfo';
import ISiteLink from './ISiteLink';
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
     * Returns a promise that includes groups that user is an owner of
     */
    getUserOwnedGroups(user: IPerson): Promise<IGroup[]>;

    getSiteLinks(): Promise<ISiteLink[]>;

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

    /**
     * Gets the group's notebook URL from the GroupSiteManager API
     */
    getNotebookUrl(id: string): Promise<string>;

    /**
     * Returns a promise of the group site provisioning status
     */
    getSiteStatus(groupId: string): Promise<IGroupSiteInfo>;

    /**
     * Creates the group site if necessary, and returns a promise of the provisioning status
     */
    createSite(groupId: string): Promise<IGroupSiteInfo>;

    /**
     * Returns the fallback url to navigate if group files are not provisioned yet.
     */
    getFallbackFilesUrl(groupId: string): string;

    /**
     * Checks the existance of a site with site url.
     */
    checkSiteExists(siteUrl: string): Promise<boolean>;

    /**
     * get group creation context
     */
    getGroupCreationContext(): Promise<any>;

    /**
     * get site Url from alias
     */
    getSiteUrlFromAlias(alias: string): Promise<string>;
}

export default IGroupsDataSource;