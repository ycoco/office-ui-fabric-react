
import IGroupsDataSource from '../../dataSources/groups/IGroupsDataSource';
import DataStore from '@ms/odsp-utilities/lib/models/store/BaseDataStore';
import DataStoreCachingType from '@ms/odsp-utilities/lib/models/store/DataStoreCachingType';
import Group from '../../models/groups/Group';
import { SourceType } from './../../interfaces/groups/SourceType';
import GroupsDataSource from '../../dataSources/groups/GroupsDataSource';
import IGroup from '../../dataSources/groups/IGroup';
import IMembership from '../../dataSources/groups/IMembership';
import IPerson from '../../dataSources/peoplePicker/IPerson';
import Promise from '@ms/odsp-utilities/lib/async/Promise';
import ISpPageContext from '../../interfaces/ISpPageContext';
import { IDisposable }  from '@ms/odsp-utilities/lib/interfaces/IDisposable';
import EventGroup from '@ms/odsp-utilities/lib/events/EventGroup';
import { IDataBatchOperationResult } from '../../interfaces/IDataBatchOperationResult';
import DataRequestor from '../../dataSources/base/DataRequestor';

/** Represents the parameters to the Groups service provider */
export interface IGroupsProviderParams {
    groupId?: string;
    pageContext?: ISpPageContext;
    /** data store used for caching group data, usually the bowser session storage */
    dataStore?: DataStore;
    /** optional data source to use in obtaining group data */
    dataSource?: IGroupsDataSource;
}

/** Represents an Office 365 Groups service provider */
export interface IGroupsProvider {
    /**
     * Group model being tracked
     */
    group: Group;

    /**
     * The list of groups the current user belongs to.
     */
    userGroups: Group[];

    /**
     * Current user being tracked
     */
    currentUser: IPerson;

    /**
     * Provides an alternate way to get access to the current group via the Promise model.
     * The promise will only complete when the group's source property indicates the group has loaded.
     * If groupId is not provided, will attempt to load the current group being observed by the GroupsProvider.
     * @param groupId? The GUID of the group to load. If undefined, will use the currently observed group.
     * @param bypassCache? (boolean) Whether to bypass cache regardless if a cached version is available. Defaults to false.
     */
    getGroup(
        groupId?: string,
        bypassCache?: boolean
    ): Promise<IGroup>;

    /**
     * Gets groups that user is a member of, and saves in the group model and localstorage
     *
     * @param isLoadFromAAD The boolean to decide if to load user form AAD directly or
     * get RankedMembership from exchange meanwhile has load from AAD as fallback.
     */
    loadUserGroups(isLoadFromAAD?: boolean);

    /**
     * Check if user is a member of group.
     *
     * @param groupId The GUID of of the group need to be checked.
     */
    isUserInGroup(groupId: string): Promise<boolean>;

    /**
     * Given a user id and group id, add this user to the group as a member.
     *
     * @param groupId The GUID of of the group where the member will be added.
     * @param userId The GUID of the user to be added as a member of the group.
     * @param principalName The principal name of the user to be added as a member of the group.
     */
    addUserToGroupMembership(groupId: string, userId?: string, principalName?: string): Promise<void>;

    /**
     * Given a user id and group id, add this user to the group as an owner.
     *
     * @param groupId The GUID of of the group where the owner will be added.
     * @param userId The GUID of the user to be added as a onwer of the group.
     * @param principalName The principal name of the user to be added as a onwer of the group.
     */
    addUserToGroupOwnership(groupId: string, userId?: string, principalName?: string): Promise<void>;

    /**
     * Given a user id and group id, remove this user from the group membership.
     *
     * @param groupId The GUID of of the group where the member will be removed.
     * @param userId The GUID of the user to be removed from the group membership.
     */
    removeUserFromGroupMembership(groupId: string, userId: string): Promise<void>;

    /**
     * Given a user id and group id, remove this user from the group ownership.
     *
     * @param groupId The GUID of of the group where the owner will be removed.
     * @param userId The GUID of the user to be removed from the group ownership.
     */
    removeUserFromGroupOwnership(groupId: string, userId: string): Promise<void>;

    /**
     * Add set of users to the group as members or owners, with given group id and set of user ids or principalName.
     *
     * @param groupId The GUID of of the group where the members and oweners will be added.
     * @param owners The GUID of the users to be added as owners of the group.
     * @param members The GUID of the users to be added as members of the group.
     * @param ownersPrincipalName The principal names of the users to be added as members of the group.
     * @param membersPrincipalName The principal names of the users to be added as owners of the group.
     */
    addUsersToGroup(groupId: string, owners?: string[], members?: string[], ownersPrincipalName?: string[], membersPrincipalName?: string[]): Promise<IDataBatchOperationResult>;

    /**
     * Saves any changes made to writable group properties given a group object
     */
    saveGroupProperties(group: IGroup): Promise<void>;

    /**
     * Changes currently observed group, given group Id
     */
    switchCurrentGroup(groupId: string): void;

    /**
     * Calls the /_api/GroupService/SyncGroupProperties endpoint to sync the Group properties that are locally
     * stored on SharePoint from Federated Directory.
     * Properties currently locally stored on SharePoint (and thus are synced):
     * - Title
     * - Description
     */
    syncGroupProperties(): Promise<void>;

    /**
     * Compares the Group properties stored/cached locally in SharePoint with the corresponding group properties
     * from a Group object.
     * The Group object should come from Groups Provider and thus have fresh info
     * @param group {IGroup} Group object that should have fresh properties
     * @returns {boolean} True if there is a difference, false if properties match
     */
    doesCachedGroupPropertiesDiffer(group: IGroup): boolean;

    /**
     * Gets group membership information from datasource and saves in the group model and localStorage
     * [September 2016] If loadAllMembers is true, loads all members, otherwise loads top 3 members
     * If loadOwnershipInformation is true, set attribute for whether each member is also a group owner
     * 
     * @param {boolean} loadAllMembers - Indicates whether to load all members or only the top three. Defaults to false.
     * @param {boolean} loadOwnershipInformation - Indicates whether to add information to each member saying whether they are a group owner. Defaults to false.
     */
    loadMembershipContainerFromServer(id: string, loadAllMembers?: boolean, loadOwnershipInformation?: boolean): Promise<IMembership>;
}

const MISSING_GROUP_ID_ERROR: string = 'Missing group id.';
const DEFAULT_GROUPSPROVIDER_DATASTORE_KEY = 'GroupsNext';
const CURRENT_USER_CACHE_ID = 'CurrentUser';

/**
 * O365 Groups service provider
 */
export class GroupsProvider implements IGroupsProvider, IDisposable {
    /** The name of the userGroups change event */
    public static onUserGroupsChange = 'userGroups';
    /** Current group being tracked */
    public group: Group;
    /** The list of groups the current user belongs to. */
    public userGroups: Group[];
    /** Current user being tracked */
    public currentUser: IPerson;

    /**
     * User login name passed from the page in form of user@microsoft.com
     */
    private _userLoginName: string;
    private _dataSource: IGroupsDataSource;
    private _dataStore: DataStore;
    private _groups: IGroup[];
    private _pageContext: ISpPageContext;
    private _missingLoginNameError: string = 'Missing user login name information.';
    private _eventGroup: EventGroup;
    private _dataRequestor: DataRequestor;

    constructor(params: IGroupsProviderParams) {
        this._pageContext = params.pageContext;
        this._dataRequestor = new DataRequestor({}, { pageContext: params.pageContext });
        this._dataSource = params.dataSource || new GroupsDataSource(params.pageContext);
        this._dataStore = params.dataStore || new DataStore(DEFAULT_GROUPSPROVIDER_DATASTORE_KEY, DataStoreCachingType.session);
        this._userLoginName = params.pageContext && params.pageContext.userLoginName;
        this._groups = [];
        this._eventGroup = new EventGroup(this);
        this.switchCurrentGroup(params.groupId || (params.pageContext && params.pageContext.groupId));
    }

    public dispose() {
        if (this._eventGroup) {
            this._eventGroup.dispose();
            this._eventGroup = undefined;
        }
    }

    /**
     * Given group id loads group info object from the browser session cache.
     */
    public loadGroupInfoFromCache(id: string): IGroup {
        if (this._dataStore && id) {
            return this._dataStore.getValue<IGroup>(id, DataStoreCachingType.session);
        }
        return undefined;
    }

    /**
     * Saves the given group to the browser session cache.
     */
    public saveGroupToCache(group: IGroup): void {
        if (group && this._dataStore) {
            this._dataStore.setValue<IGroup>(group.id, group, DataStoreCachingType.session);
        }
    }

    /**
     * Auguments the already local session cached group with the membership data.
     */
    public saveMembershipToCache(groupId: string, membership: IMembership): void {
        if (this._dataStore) {
            let group: IGroup = this._dataStore.getValue<IGroup>(groupId, DataStoreCachingType.session);
            if (group) {
                group.membership = <IMembership>{
                    isMember: membership.isMember,
                    totalNumberOfMembers: membership.totalNumberOfMembers,
                    totalNumberOfOwners: membership.totalNumberOfOwners,
                    membersList: membership.membersList,
                    isOwner: membership.isOwner,
                    isJoinPending: membership.isJoinPending,
                    lastLoadTimeStampFromServer: membership.lastLoadTimeStampFromServer
                };
                this.saveGroupToCache(group);
            }
        }
    }

    /**
     * Gets group basic properties from datasource, and returns an IGroup object.
     * Basic properties include: name, principalName, alias, mail, description, creationTime,
     * inboxUrl, calendarUrl, filesUrl, notebookUrl, pictureUrl, sharePointUrl, editUrl, membersUrl, isPublic
     */
    public loadGroupInfoContainerFromServer(id: string): Promise<IGroup> {
        if (id) {
            return this._dataSource.getGroupBasicProperties(id).then((group: IGroup) => {
                // Perform any necessary post processing on group basic properties
                this._performBasicPropertiesPostProcessing(group);
                return group;
            });
        }
        return Promise.wrapError(MISSING_GROUP_ID_ERROR);
    }

    /**
     * Gets group membership information from datasource and saves in the group model and localStorage
     * [September 2016] If loadAllMembers is true, loads all members, otherwise loads top 3 members
     * If loadOwnershipInformation is true, sets an attribute on each member to say whether they are a group owner
     * (requires an additional server call).
     * 
     * @param {boolean} loadAllMembers - Indicates whether to load all members or only the top three. Defaults to false.
     * @param {boolean} loadOwnershipInformation - Indicates whether to add information to each member saying whether they are a group owner. Defaults to false.
     */
    public loadMembershipContainerFromServer(id: string, loadAllMembers = false, loadOwnershipInformation = false): Promise<IMembership> {
        if (!id) {
            return Promise.wrapError(MISSING_GROUP_ID_ERROR);
        } else if (!this._userLoginName) {
            return Promise.wrapError(this._missingLoginNameError);
        } else {
            return this._dataSource.getGroupMembership(id, this._userLoginName, loadAllMembers, loadOwnershipInformation);
        }
    }

    /**
     * Gets groups that user is a member of, and saves in the group model and localstorage
     *
     * @param isLoadFromAAD The boolean to decide if to load user form AAD directly or
     * get RankedMembership from exchange meanwhile has load from AAD as fallback.
     */
    public loadUserGroups(isLoadFromAAD?: boolean): Promise<IGroup[]> {
        return this.loadUserGroupsFromCache(isLoadFromAAD).then((userGroups: IGroup[]) => {
            if (!userGroups || userGroups.length === 0) {
                return this.getCurrentUser().then((currentUser: IPerson) => {
                    if (isLoadFromAAD) {
                        return this._dataSource.getUserGroupsFromAAD(currentUser).then((userGroupsFromServer: IGroup[]) => {
                            if (this._dataStore) {
                                this._dataStore.setValue<IGroup[]>('UserGroupsFromAAD' + currentUser.userId, userGroupsFromServer, DataStoreCachingType.session);
                            }
                            return userGroupsFromServer;
                        });
                    } else {
                        return this._dataSource.getUserGroups(currentUser).then((userGroupsFromServer: IGroup[]) => {
                            if (this._dataStore) {
                                this._dataStore.setValue<IGroup[]>('UserGroups' + currentUser.userId, userGroupsFromServer, DataStoreCachingType.session);
                            }
                            this._setUsersGroups(userGroupsFromServer, SourceType.Server);
                            return userGroupsFromServer;
                        });
                    }
                });
            } else {
                return Promise.wrap(userGroups);
            }
        });
    }

    /**
     * Gets cached groups that user is a member of.
     *
     * @param isLoadFromAAD The boolean to decide if to load user form UserGroupsFromAAD cache or UserGroups Cache.
     */
    public loadUserGroupsFromCache(isLoadFromAAD?: boolean): Promise<IGroup[]> {
        if (this._dataStore) {
            return this.getCurrentUser().then((currentUser: IPerson) => {
                let userGroups: IGroup[];
                if (isLoadFromAAD) {
                    userGroups = this._dataStore.getValue<IGroup[]>('UserGroupsFromAAD' + currentUser.userId, DataStoreCachingType.session);
                } else {
                    userGroups = this._dataStore.getValue<IGroup[]>('UserGroups' + currentUser.userId, DataStoreCachingType.session);
                }
                if (userGroups) {
                    if (!isLoadFromAAD) {
                        this._setUsersGroups(userGroups, SourceType.Cache);
                    }
                    return Promise.wrap(userGroups);
                }
                return Promise.wrap(undefined);
            });
        } else {
            return Promise.wrap(undefined);
        }
    }

    /**
     * Check if user is a member of group.
     *
     * @param groupId The groupId of the group need to be checked.
     */
    public isUserInGroup(groupId: string): Promise<boolean> {
        const isLoadFromAAD = true;

        return this.loadUserGroups(isLoadFromAAD).then((userGroups: IGroup[]) => {
            for (let i = 0, len = userGroups.length; i < len; i++) {
                if (userGroups[i].id === groupId) {
                    return true;
                }
            }
            return false;
        });
    }

    /**
     * @inheritDoc
     */
    public getGroup(groupId?: string, bypassCache: boolean = false): Promise<IGroup> {
        if (groupId) {
            throw new Error('NotImplemented: Calling getGroup() on groupsProvider supplying a groupId is not yet implemented.');
        }

        if (!bypassCache && (!groupId || groupId.length === 0 || (this.group && groupId === this.group.id))) {
            // will flow through this if we're not bypassing cache and we're loading the currently observed group
            return new Promise<IGroup>((onComplete: (result: IGroup) => void, onError: (error?: any) => void) => {
                const group = this.group;

                if (!this.group) {
                    onError('There is no group currently being managed by GroupsProvider.');
                    return;
                }

                if (group.source !== SourceType.None) {
                    onComplete(group);
                    return;
                }

                this._eventGroup.on(group, Group.onSourceChange, (newValue: SourceType) => {
                    if (newValue !== SourceType.None) {
                        onComplete(group);
                        return;
                    }
                });
            });
        } else {
            // if we're bypassing cache or loading a different group
            if (!groupId || groupId.length === 0) {
                groupId = this.group.id;
            }

            return this.loadGroupInfoContainerFromServer(groupId);
        }
    }

    /**
     * Gets current user person model
     */
    public getCurrentUser(): Promise<IPerson> {
        if (!this._userLoginName) {
            return Promise.wrapError(this._missingLoginNameError);
        }

        if (!this.currentUser) {
            this.currentUser = this._getUserFromCache(CURRENT_USER_CACHE_ID);
        }

        if (this.currentUser) {
            return Promise.wrap(this.currentUser);
        } else {
            return this._dataSource.getUserInfo(this._userLoginName).then((c: IPerson) => {
                this._saveUserToCache(c, CURRENT_USER_CACHE_ID);
                this.currentUser = c;
                return c;
            });
        }
    }

    /**
     * Given a user id and group id, add this user to the group as a member.
     *
     * @param groupId The GUID of of the group where the member will be added.
     * @param userId The GUID of the user to be added as a member of the group.
     * @param principalName The principal name of the user to be added as a member of the group.
     */
    public addUserToGroupMembership(groupId: string, userId?: string, principalName?: string): Promise<void> {
        if (!groupId) {
            return Promise.wrapError(MISSING_GROUP_ID_ERROR);
        }
        return this._dataSource.addGroupMember(groupId, userId, principalName).then(() => {
            this._clearUserGroupsCache(userId);
        });
    }

     /**
     * Given a user id and group id, add this user to the group as an owner.
     *
     * @param groupId The GUID of of the group where the owner will be added.
     * @param userId The GUID of the user to be added as a onwer of the group.
     * @param principalName The principal name of the user to be added as a onwer of the group.
     */
    public addUserToGroupOwnership(groupId: string, userId?: string, principalName?: string): Promise<void> {
        if (!groupId) {
            return Promise.wrapError(MISSING_GROUP_ID_ERROR);
        }

        return this._dataSource.addGroupOwner(groupId, userId, principalName).then(() => {
            this._clearUserGroupsCache(userId);
        });
    }

    /**
     * Given a user id and group id, remove this user from the group membership.
     *
     * @param groupId The GUID of of the group where the member will be removed.
     * @param userId The GUID of the user to be removed from the group membership.
     */
    public removeUserFromGroupMembership(groupId: string, userId: string): Promise<void> {
        if (!groupId) {
            return Promise.wrapError(MISSING_GROUP_ID_ERROR);
        }

        return this._dataSource.removeGroupMember(groupId, userId).then(() => {
            this._clearUserGroupsCache(userId);
        });
    }

    /**
     * Given a user id and group id, remove this user from the group ownership.
     *
     * @param groupId The GUID of of the group where the owner will be removed.
     * @param userId The GUID of the user to be removed from the group ownership.
     */
    public removeUserFromGroupOwnership(groupId: string, userId: string): Promise<void> {
        if (!groupId) {
            return Promise.wrapError(MISSING_GROUP_ID_ERROR);
        }

        return this._dataSource.removeGroupOwner(groupId, userId).then(() => {
            this._clearUserGroupsCache(userId);
        });
    }

    /**
     * Add set of users to the group as members or owners, with given group id and set of user ids or principalName.
     *
     * @param groupId The GUID of of the group where the members and oweners will be added.
     * @param owners The GUID of the users to be added as owners of the group.
     * @param members The GUID of the users to be added as members of the group.
     * @param ownersPrincipalName The principal names of the users to be added as members of the group.
     * @param membersPrincipalName The principal names of the users to be added as owners of the group.
     */
    public addUsersToGroup(groupId: string, owners?: string[], members?: string[], ownersPrincipalName?: string[], membersPrincipalName?: string[]): Promise<IDataBatchOperationResult> {
        if (!groupId) {
            return Promise.wrapError(MISSING_GROUP_ID_ERROR);
        }

        return this._dataSource.addUsersToGroup(groupId, owners, members, ownersPrincipalName, membersPrincipalName);
    }

    public saveGroupProperties(group: IGroup): Promise<void> {
        return this._dataSource.setGroupBasicProperties(group);
    }

    /**
     * Changes currently observed group, given group Id
     */
    public switchCurrentGroup(groupId: string): void {
        const currentGroupId = this.group ? this.group.id : undefined;
        if (groupId && groupId !== currentGroupId) {
            let g: Group = this.getCachedGroup(groupId);
            g.load();
            this.group = g;
        }
    }

    /**
     * Gets group object that is cached in memory
     * If it doesn't exist then load it from browser cache
     */
    public getCachedGroup(id: string, groupInfo?: IGroup): Group {
        let group = this._groups[id];

        // If we can't find the group already created, make a new object which gets info from cache.
        if (!group) {
            group = new Group(groupInfo, this, id);
            this._groups[id] = group;
        }
        return group;
    }

    /**
     * Calls the /_api/GroupService/SyncGroupProperties endpoint to sync the Group properties that are locally
     * stored on SharePoint from Federated Directory.
     * Properties currently locally stored on SharePoint (and thus are synced):
     * - Title
     * - Description
     */
    public syncGroupProperties(): Promise<void> {
        let url: string = this._pageContext.webAbsoluteUrl + '/_api/GroupService/SyncGroupProperties';

        return this._dataRequestor.getData<void>({
            url: url,
            qosName: 'SyncGroupProperties',
            method: 'POST'
        });
    }

    /**
     * Compares the Group properties stored/cached locally in SharePoint with the corresponding group properties
     * from a Group object.
     * The Group object should come from Groups Provider and thus have fresh info
     * @param group {IGroup} Group object that should have fresh properties
     * @returns {boolean} True if there is a difference, false if properties match
     */
    public doesCachedGroupPropertiesDiffer(group: IGroup): boolean {
        let isDifference = false;

        // Group title
        // this._pageContext.webTitle <--> group.name
        if (this._pageContext.webTitle !== group.name) {
            isDifference = true;
        }

        if (this._pageContext.siteClassification !== group.classification) {
            isDifference = true;
        }

        // Add other checks here...

        return isDifference;
    }

    private _setUsersGroups(leftNavGroups: IGroup[], leftNavSource: SourceType) {
        this.userGroups = leftNavGroups.map((groupInfo: IGroup) => {
            let group = this.getCachedGroup(groupInfo.id, groupInfo);

            // Only merge into the group object the left nav data if it's more accurate because:
            // We received the data from the SP Server
            // or if group is from cache, at which point we'll can take the left nav cache data we have.
            if (leftNavSource === SourceType.Server || group.source !== SourceType.Server) {
                group.extend(groupInfo);
            }

            if (!group.pictureUrl) {
                // PictureUrl is undefined or undefined (which will be the case in the CSOM fallback call)
                group.load();
            }
            return group;
        });
        this._eventGroup.raise(GroupsProvider.onUserGroupsChange, this.userGroups);
    }

    /**
     * This is run after fetching data from the datasource to perform any fixups to the properties
     */
    private _performBasicPropertiesPostProcessing(group: IGroup): void {
        if (this._pageContext) {
            // Instead of directly using the PictureUrl given by Federated Directory, we want to go through a SharePoint endpoint
            // This endpoint also performs caching of the picture locally in SharePoint
            group.pictureUrl = `${this._pageContext.webAbsoluteUrl}/_api/GroupService/GetGroupImage`;

            if (!group.inboxUrl) {
                group.inboxUrl = `${this._pageContext.webAbsoluteUrl}/_layouts/15/groupstatus.aspx?id=${group.id}&target=conversations`;
            }

            if (!group.calendarUrl) {
                group.calendarUrl = `${this._pageContext.webAbsoluteUrl}/_layouts/15/groupstatus.aspx?id=${group.id}&target=CALENDAR`;
            }

            if (!group.membersUrl) {
                group.membersUrl = `${this._pageContext.webAbsoluteUrl}/_layouts/15/groupstatus.aspx?id=${group.id}&target=members`;
            }
        }
    }

    /**
     * Save user to local storage of the browser
     */
    private _saveUserToCache(user: IPerson, cacheId: string): void {
        if (user && this._dataStore) {
            this._dataStore.setValue<IPerson>(cacheId, user, DataStoreCachingType.session);
        }
    }

    /**
     * Get user from the local storage of the browser
     */
    private _getUserFromCache(cacheId: string): IPerson {
        return this._dataStore ?
            this._dataStore.getValue<IPerson>(cacheId, DataStoreCachingType.session) :
            undefined;
    }

    /**
     * Clear the UserGroup caches for both UserGroups and UserGroupsFromAAD.
     */
    private _clearUserGroupsCache(userId: string): void {
        if (this._dataStore) {
            this._dataStore.setValue<IGroup[]>('UserGroupsFromAAD' + userId, undefined, DataStoreCachingType.session);
            this._dataStore.setValue<IGroup[]>('UserGroups' + userId, undefined, DataStoreCachingType.session);
        }
    }
}

export default GroupsProvider;
