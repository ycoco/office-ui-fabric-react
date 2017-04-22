
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
import { IDisposable } from '@ms/odsp-utilities/lib/interfaces/IDisposable';
import EventGroup from '@ms/odsp-utilities/lib/events/EventGroup';
import { IDataBatchOperationResult } from '../../interfaces/IDataBatchOperationResult';
import DataRequestor from '../../dataSources/base/DataRequestor';

/** Key for Yammer conversations */
const YAMMER_CONVERSATIONS_KEY = 'Yammer.FeedURL';

/** 
 * Ensure that this constant stays in sync with the one in StateManager.ts 
 * from the CompositeHeader control in odsp-shared-react.
 */
const GET_GROUP_IMAGE_ENDPOINT = '/_api/GroupService/GetGroupImage';

const SET_GROUP_IMAGE_ENDPOINT = '/_api/GroupService/SetGroupImage';

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
     * Gets current user person model.
     */
    getCurrentUser(): Promise<IPerson>

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
     * Given a userId or principalName, and groupId, add this user to the group as a member.
     * If the added user is current user, the UserGroups cache of current user will be cleared after successfully added.
     *
     * @param groupId The GUID of of the group where the member will be added.
     * @param userId The GUID of the user to be added as a member of the group.
     * @param principalName The principal name of the user to be added as a member of the group.
     * @param qosName The customized qosName, if not provided, the default qosName will be used.
     */
    addUserToGroupMembership(groupId: string, userId?: string, principalName?: string, qosName?: string): Promise<void>;

    /**
     * Given a userId or principalName, and groupId, add this user to the group as a owner.
     * If the added owner is current user, the UserGroups cache of current user will be cleared after successfully added.
     *
     * @param groupId The GUID of of the group where the owner will be added.
     * @param userId The GUID of the user to be added as a onwer of the group.
     * @param principalName The principal name of the user to be added as a onwer of the group.
     * @param qosName The customized qosName, if not provided, the default qosName will be used.
     */
    addUserToGroupOwnership(groupId: string, userId?: string, principalName?: string, qosName?: string): Promise<void>;

    /**
     * Given a userId and group id, remove this user from the group membership.
     * If the removed user is current user, the UserGroups cache of current user will be cleared after successfully removed.
     *
     * @param groupId The GUID of of the group where the member will be removed.
     * @param userId The GUID of the user to be removed from the group membership.
     * @param qosName The customized qosName, if not provided, the default qosName will be used.
     */
    removeUserFromGroupMembership(groupId: string, userId: string, qosName?: string): Promise<void>;

    /**
      * Given a userId and group id, remove this user from the group ownership.
      * If the removed owner is current user, the UserGroups cache of current user will be cleared after successfully removed.
      *
      * @param groupId The GUID of of the group where the owner will be removed.
      * @param userId The GUID of the user to be removed from the group ownership.
      * @param qosName The customized qosName, if not provided, the default qosName will be used.
      */
    removeUserFromGroupOwnership(groupId: string, userId: string, qosName?: string): Promise<void>;

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
     * Calls the /_api/GroupService/SetGroupImage endpoint to update the image associated with the Group.
     */
    setGroupImage(image: File): Promise<void>;

    /**
     * Changes currently observed group, given group Id
     */
    switchCurrentGroup(groupId: string): void;

    /**
     * Calls the /_api/GroupService/SyncGroupProperties endpoint to sync 
     * the Group properties stored in SharePoint from Federated Directory.
     * Properties currently synced:
     * - Title
     * - Description
     * - Classification
     * - Privacy (public/private)
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

    /**
     * Requests the deletion of the specified group
     */
    deleteGroup(group: IGroup): Promise<void>;
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

    public getSPPageContext(): ISpPageContext {
        return this._pageContext;
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
     * yammerResources
     */
    public loadGroupInfoContainerFromServer(id: string): Promise<IGroup> {
        if (id) {
            return this._dataSource.getGroupBasicProperties(id).then((group: IGroup) => {
                // Perform any necessary post processing on group basic properties
                this._performBasicPropertiesPostProcessing(group);

                // Compare some of the Group properties in SharePoint with the corresponding properties in AAD.
                // If found different then calls the /_api/GroupService/SyncGroupProperties endpoint to sync.
                if (this.doesCachedGroupPropertiesDiffer(group)) {
                    this.syncGroupProperties();
                }
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
     * @inheritDoc
     */
    public addUserToGroupMembership(groupId: string, userId?: string, principalName?: string, qosName?: string): Promise<void> {
        if (!groupId) {
            return Promise.wrapError(MISSING_GROUP_ID_ERROR);
        }

        let userIdForCacheClear: string;

        return this._getUserIdForCacheClear(userId, principalName).then((userIdObtained: string) => {
            userIdForCacheClear = userIdObtained;
            return this._dataSource.addGroupMember(groupId, userId, principalName, qosName);
        }).then(() => {
            this._clearUserGroupsCache(userIdForCacheClear);
        });

    }

    /**
     * @inheritDoc
     */
    public addUserToGroupOwnership(groupId: string, userId?: string, principalName?: string, qosName?: string): Promise<void> {
        if (!groupId) {
            return Promise.wrapError(MISSING_GROUP_ID_ERROR);
        }

        let userIdForCacheClear: string;

        return this._getUserIdForCacheClear(userId, principalName).then((userIdObtained: string) => {
            userIdForCacheClear = userIdObtained;
            return this._dataSource.addGroupOwner(groupId, userId, principalName, qosName);
        }).then(() => {
            this._clearUserGroupsCache(userIdForCacheClear);
        });
    }

    /**
     * @inheritDoc
     */
    public removeUserFromGroupMembership(groupId: string, userId: string, qosName?: string): Promise<void> {
        if (!groupId) {
            return Promise.wrapError(MISSING_GROUP_ID_ERROR);
        }

        let userIdForCacheClear: string;

        return this._getUserIdForCacheClear(userId).then((userIdObtained: string) => {
            userIdForCacheClear = userIdObtained;
            return this._dataSource.removeGroupMember(groupId, userId, qosName);
        }).then(() => {
            this._clearUserGroupsCache(userIdForCacheClear);
        });
    }

    /**
     * @inheritDoc
     */
    public removeUserFromGroupOwnership(groupId: string, userId: string, qosName?: string): Promise<void> {
        if (!groupId) {
            return Promise.wrapError(MISSING_GROUP_ID_ERROR);
        }

        let userIdForCacheClear: string;

        return this._getUserIdForCacheClear(userId).then((userIdObtained: string) => {
            userIdForCacheClear = userIdObtained;
            return this._dataSource.removeGroupOwner(groupId, userId, qosName);
        }).then(() => {
            this._clearUserGroupsCache(userIdForCacheClear);
        });
    }

    /**
     * @inheritDoc
     */
    public addUsersToGroup(groupId: string, owners?: string[], members?: string[], ownersPrincipalName?: string[], membersPrincipalName?: string[]): Promise<IDataBatchOperationResult> {
        if (!groupId) {
            return Promise.wrapError(MISSING_GROUP_ID_ERROR);
        }
        let userId: string;

        if (this.currentUser) {
            userId = this.currentUser.userId;
            return this._dataSource.addUsersToGroup(groupId, owners, members, ownersPrincipalName, membersPrincipalName).then((result: IDataBatchOperationResult) => {
                this._clearUserGroupsCache(userId);
                return result;
            });
        } else {
            return this.getCurrentUser().then((currentUser: IPerson) => {
                userId = currentUser.userId;
            }).then(() => {
                return this._dataSource.addUsersToGroup(groupId, owners, members, ownersPrincipalName, membersPrincipalName);
            }).then((result: IDataBatchOperationResult) => {
                this._clearUserGroupsCache(userId);
                return result;
            });
        }
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
            group = new Group(groupInfo, this, id, this._pageContext);
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
            method: 'POST',
            noRedirect: true
        });
    }

    /**
     * Calls the /_api/GroupService/SetGroupImage endpoint to update the image associated with the Group.
     */
    public setGroupImage(image: File): Promise<void> {
        let url: string = this._pageContext.webAbsoluteUrl + SET_GROUP_IMAGE_ENDPOINT;

        return this._dataRequestor.getData<void>({
            url: url,
            qosName: 'SetGroupImage',
            method: 'POST',
            noRedirect: true,
            additionalPostData: image,
            contentType: image ? image.type : 'image/jpeg' // just specify jpeg type when image blob is null
        })
    }

    /**
     * Compares some of the Group properties in SharePoint with the corresponding properties in AAD.
     * @param group {IGroup} Group object
     * @returns {boolean} True if a difference is found, false otherwise
     */
    public doesCachedGroupPropertiesDiffer(group: IGroup): boolean {
        if (this._pageContext.groupId === group.id) { // ensure matching group
            return this._pageContext.webTitle !== group.name || // title
                this._pageContext.siteClassification !== group.classification || // classification
                (this._pageContext.groupType === 'Public') != group.isPublic; // privacy
        }
        return false;
    }

    /**
     * Requests the deletion of the specified group
     */
    public deleteGroup(group: IGroup): Promise<void> {
        return this._dataSource.deleteGroup(group);
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
            group.hasPictureUrl = !!group.pictureUrl;
            group.pictureUrl = `${this._pageContext.webAbsoluteUrl}${GET_GROUP_IMAGE_ENDPOINT}`;
            group.inboxUrl = this._getWorkloadUrl(group, 'inboxUrl', 'conversations', YAMMER_CONVERSATIONS_KEY);
            group.calendarUrl = this._getWorkloadUrl(group, 'calendarUrl', 'CALENDAR', null);
            group.membersUrl = this._getWorkloadUrl(group, 'membersUrl', 'members', null);

        }
    }

    /**
     * This function generates the final workload URL taking into consideration the following rules
     * If this is a Yammer Group (yammerResources is non-null), then
     *      - use the yammerResource property specified by yammerProperty to get the value of the requested workload.
     *        if it doesn't exist, we just return null.
     *
     * If it's not a Yammer Group,
     *      - and the groupProperty (e.g. inboxUrl) is null, then return the grouipstatus.aspx page with the appropriate target.
     *      - if the groupProperty (e.g. inboxUrl) is non null, just return that.
     *
     *  @param group: The group object.
     *  @param groupProperty: The property of group we want to set. e.g. inboxUrl or calendarUrl or membersUrl.
     *  @param targetWorkload: The query parameter to groupstatus.aspx that we want for this workload. e.g. conversations, CALENDAR,members.
     *  @param yammerProperty: The name of the property we need to search for in YammerResources... if this is a Yammer Group.
     */
    private _getWorkloadUrl(group: IGroup,
        groupProperty: string,
        targetWorkload: string,
        yammerProperty: string)
        : string {
        let retUrl: string = null;
        let { yammerResources } = group;
        if (yammerResources && yammerResources.results) {
            let yammerResourcesArr = yammerResources.results;
            // This is a Yammer Group
            if (yammerProperty) {
                // This is a Yammer Group, and we have a specific property to look for,
                // so filter to the appropriate property in yammerResources to return.
                let yammerResource = yammerResourcesArr.filter((currentValue) => {
                    return currentValue.Key === yammerProperty;
                });
                retUrl = (yammerResource && yammerResource[0]) ? yammerResource[0].Value : null;
            }
            // For Yammer groups (those with non null yammerResources), if no yammerProperty is specified
            // then we just fall through to the end of the function... essentially returning null.
            // As such, for Yammer groups, workloads like calendar and members will be hidden.
        } else {
            // Not a Yammer Group, so if the existing group property does not exist, use the status page with the appropriate workload.
            if (!group[groupProperty]) {
                retUrl = `${this._pageContext.webAbsoluteUrl}/_layouts/15/groupstatus.aspx?id=${group.id}&target=${targetWorkload}`;
            } else {
                retUrl = group[groupProperty];
            }
        }

        return retUrl;
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
        if (userId) {
            if (this._dataStore) {
                this._dataStore.setValue<IGroup[]>('UserGroupsFromAAD' + userId, undefined, DataStoreCachingType.session);
                this._dataStore.setValue<IGroup[]>('UserGroups' + userId, undefined, DataStoreCachingType.session);
            }
        }
    }

    /**
    * Return user id for cache clear if the user to add or remove is current user, otherwise return null.
    */
    private _getUserIdForCacheClear(userId?: string, principalName?: string): Promise<string> {
        let userIdForCacheClear: string;

        if (this.currentUser && userId) {
            userIdForCacheClear = userId === this.currentUser.userId ? userId : null;
            return Promise.wrap(userIdForCacheClear);
        } else {
            return this.getCurrentUser().then((currentUser: IPerson) => {
                if (userId) {
                    userIdForCacheClear = userId === currentUser.userId ? currentUser.userId : null;
                } else {
                    userIdForCacheClear = principalName === currentUser.principalName ? currentUser.userId : null;
                }
                return userIdForCacheClear;
            })
        }
    }
}

export default GroupsProvider;
