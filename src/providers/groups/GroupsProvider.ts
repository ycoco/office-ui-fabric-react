
import IGroupsDataSource from '../../dataSources/groups/IGroupsDataSource';
import DataStore from '@ms/odsp-utilities/lib/models/store/BaseDataStore';
import DataStoreCachingType from '@ms/odsp-utilities/lib/models/store/DataStoreCachingType';
import Group, { SourceType } from '../../models/groups/Group';
import GroupsDataSource from '../../dataSources/groups/GroupsDataSource';
import IGroup from '../../dataSources/groups/IGroup';
import IMembership from '../../dataSources/groups/IMembership';
import IPerson from '../../dataSources/peoplePicker/IPerson';
import IGroupSiteInfo from '../../dataSources/groups/IGroupSiteInfo';
import Promise from '@ms/odsp-utilities/lib/async/Promise';
import IContext from '../../dataSources/base/IContext';

/* Represents the parameters to the Groups service provider */
export interface IGroupsProviderParams {
    groupId?: string;
    context: IContext;
    /** data store used for caching group data, usually the bowser session storage */
    dataStore?: DataStore;
}

/* Represents an Office 365 Groups service provider */
export interface IGroupsProvider {
    /**
     * Group model being tracked
     */
    group: Group;

    /**
     * Current user being tracked
     */
    currentUser: IPerson;

    /**
     * Groups that current user owns
     */
    userOwnedGroups: IGroup[];

    /**
     * True when call to get user owned groups succeeds.
     */
    userOwnedGroupsLoaded: boolean;

    /**
     * Given group id loads group object
     */
    loadGroupInfoFromCache(id: string): IGroup;

    /**
     * Saves group container of a current group to cache.
     */
    saveGroupToCache(group: IGroup);

    /**
     * Gets group basic properties from datasource and saves in the group model and localStorage
     * Basic properties include: name, principalName, alias, mail, description, creationTime,
     * inboxUrl, calendarUrl, filesUrl, notebookUrl, pictureUrl, sharePointUrl, editUrl, membersUrl, isPublic
     */
    loadGroupInfoContainerFromServer(id: string): Promise<IGroup>;

    /**
     * Gets group membership information and saves in the group model and localStorage
     * Membership properties include: isMember, isOwner, isJoinPending, membersList, ownersList
     */
    loadMembershipContainerFromServer(id: string): Promise<IMembership>;

    /**
     * Gets groups that user is a member of and saves in the group model and localstorage
     */
    // loadUserGroups();

    /**
     * Gets groups that user is an owner of and saves in the group model and localstorage
     */
    loadUserOwnedGroups();

    /**
     * Gets current user person model
     */
    getCurrentUser(): Promise<IPerson>;

    /**
     * Given a user id and group id, add this user to the group as a member
     */
    addUserToGroupMembership(groupId: string, userId: string): Promise<any>;

    /**
     * Given a user id and group id, add this user to the group as an owner
     */
    addUserToGroupOwnership(groupId: string, userId: string): Promise<any>;

    /**
     * Given a user id and group id, remove this user from the group
     */
    removeUserFromGroupMembership(groupId: string, userId: string): Promise<any>;

    /**
     * Checks the availability of the site and alias.
     */
    checkSiteAndAliasAvailability(strAlias: string): Promise<boolean>;

    /**
     * Checks the existance of a site with site url.
     */
    checkSiteExists(siteUrl: string): Promise<boolean>;

    /**
     * Creates the group according to the provided parameters.
     */
    // createGroup(strName: string, strAlias: string, isPublic: boolean, description: string,
    //    dataClassification: string, allowGuestUsers: boolean): Promise<ICreateGroupResponse>;

    /**
     * Gets the group notebook URL from the GroupSiteManager API.
     */
    getNotebookUrl(groupId: string): Promise<string>;

    /**
     * Gets the group site provisioning status.
     */
    getGroupSiteStatus(groupId: string): Promise<IGroupSiteInfo>;

    /**
     * Creates the group site if necessary.
     */
    createGroupSite(groupId: string): Promise<IGroupSiteInfo>;

    /**
     * Changes currently observed group, given group Id
     */
    switchCurrentGroup(groupId: string): void;

    /**
     * Returns the fallback url to navigate if group files arn't provisioned yet.
     */
    getFallbackFilesUrl(groupId: string): string;

   /**
    * Gets group object that is cached in memory
    * If it doesn't exist then load it from browser cache
    */
    getCachedGroup(id: string): IGroup;

    /**
     * get group creation context
     */
    getGroupCreationContext(): Promise<any>;

    /**
     * get site Url from alias
     */
    getSiteUrlFromAlias(alias: string): Promise<string>;
}

/**
 * O365 Groups service provider
 */
export default class GroupsProvider implements IGroupsProvider {
    /**
     * Current group being tracked
     */
    public group: Group;

    /**
     * The list of groups the current user belongs to.
     */
    public userGroups: IGroup[];

    /**
     * The list of groups the current user is an owner of.
     */
    public userOwnedGroups: IGroup[];
    public userOwnedGroupsLoaded: boolean;

    /**
     * Current user being tracked
     */
    public currentUser: IPerson;

    /**
     * User login name passed from the page in form of user@microsoft.com
     */
    private _userLoginName: string;
    private _dataSource: IGroupsDataSource;
    private _dataStore: DataStore;
    private _groups: IGroup[];
    private _context: IContext;
    private _missingGroupIdError: string = 'Missing group id.';
    private _missingLoginNameError: string = 'Missing user login name information.';

    constructor(params: IGroupsProviderParams) {
        this._context = params.context;
        this._dataSource = new GroupsDataSource(params.context);
        this._dataStore = params.dataStore;
        this._userLoginName = params.context.userLoginName;
        this._groups = [];
        this.switchCurrentGroup(params.groupId || params.context.groupId);
    }

    /**
     * Given group id loads group info object
     */
    public loadGroupInfoFromCache(id: string): IGroup {
        if (this._dataStore && id) {
            return this._dataStore.getValue<IGroup>(id, DataStoreCachingType.session);
        }
        return undefined;
    }

    /**
     * Given group save to local storage of the browser
     */
    public saveGroupToCache(group: IGroup): void {
        if (group && this._dataStore) {
            this._dataStore.setValue<IGroup>(group.id, group, DataStoreCachingType.session);
        }
    }

    /**
     * Gets group basic properties from datasource and saves in the group model and localstorage
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
        return Promise.wrapError(this._missingGroupIdError);
    }

    /**
     * Gets group membership information from datasource and saves in the group model and localStorage
     * [May 4 2016] - Will only load first 3 members and number of members due to API behavior change.
     */
    public loadMembershipContainerFromServer(id: string): Promise<IMembership> {
        if (!id) {
            return Promise.wrapError(this._missingGroupIdError);
        } else if (!this._userLoginName) {
            return Promise.wrapError(this._missingLoginNameError);
        } else {
            return this._dataSource.getGroupMembership(id, this._userLoginName);
        }
    }

    /**
     * Gets groups that user is a member of.
     */
    /*
    public loadUserGroups(): void {
        let user: IPerson;
        this.getCurrentUser().then((currentUser: IPerson) => {
            this.loadUserGroupsFromCache();
            user = currentUser;
            return this._dataSource.getUserGroups(currentUser);
        }).then((leftNavGroups: IGroup[]) => {
            this._dataStore.setValue<IGroup[]>('UserGroups' + user.userId, leftNavGroups, DataStoreCachingType.session);
            this._setUsersGroups(leftNavGroups, SourceType.Server);
        });
    }
    */

    /**
     * Gets cached groups that user is a member of.
     */
    public loadUserGroupsFromCache(): void {
        this.getCurrentUser().then((currentUser: IPerson) => {
            let leftNavGroups = this._dataStore.getValue<IGroup[]>('UserGroups' + currentUser.userId, DataStoreCachingType.session);
            if (leftNavGroups) {
                this._setUsersGroups(leftNavGroups, SourceType.Cache);
            }
        });
    }

    /**
     * Gets groups that user is an owner of.
     */
    public loadUserOwnedGroups(): void {
        this.getCurrentUser().then((currentUser: IPerson) => {
            let promise = this._dataSource.getUserOwnedGroups(currentUser);
            promise.then((groupsInfo: IGroup[]) => {
                let groupsModel = groupsInfo.map((groupInfo: IGroup) => {
                    let g: Group = this.getCachedGroup(groupInfo.id);
                    g.extend(groupInfo);
                    return g;
                });

                this.userOwnedGroups = groupsModel;
                this.userOwnedGroupsLoaded = true;
            });
        });
    }

    /**
     * Gets current user person model
     */
    public getCurrentUser(): Promise<IPerson> {
        if (!this._userLoginName) {
            return Promise.wrapError(this._missingLoginNameError);
        }

        if (this.currentUser) {
            return Promise.wrap(this.currentUser);
        } else {
            return this._dataSource.getUserInfo(this._userLoginName).then((c: IPerson) => {
                this.currentUser = c;
                return c;
            });
        }
    }

    /**
     * Given a user id and group id, add this user to the group
     */
    public addUserToGroupMembership(groupId: string, userId: string): Promise<any> {
        if (!groupId) {
            return Promise.wrapError(this._missingGroupIdError);
        }
        return this._dataSource.addGroupMember(groupId, userId);
    }

    /**
     * Given a user id and group id, add this user to the group
     */
    public addUserToGroupOwnership(groupId: string, userId: string): Promise<any> {
        if (!groupId) {
            return Promise.wrapError(this._missingGroupIdError);
        }

        return this._dataSource.addGroupOwner(groupId, userId);
    }

    /**
     * Given a user id and group id, remove this user from the group
     */
    public removeUserFromGroupMembership(groupId: string, userId: string): Promise<any> {
        if (!groupId) {
            return Promise.wrapError(this._missingGroupIdError);
        }

        return this._dataSource.removeGroupMember(groupId, userId);
    }

    /**
     * Checks the availability of the site and alias.
     */
    public checkSiteAndAliasAvailability(strAlias: string): Promise<boolean> {
        return this._dataSource.getGroupByAlias(strAlias).then((group: IGroup) => {
            return !Boolean(group);
        }, (error: any) => {
            let errorCode: string = error.code;
            if (errorCode) {
                let exception = errorCode.split(',')[1];
                if (exception && exception.indexOf('ResourceNotFoundException')) {
                    return true;
                }
            }
            return false;
        });
    }

    /**
     * Checks the existance of a site with site url.
     */
    public checkSiteExists(siteUrl: string): Promise<boolean> {
        return this._dataSource.checkSiteExists(siteUrl);
    }

    /**
     * get site Url from alias
     */
    public getSiteUrlFromAlias(alias: string): Promise<string> {
        return this._dataSource.getSiteUrlFromAlias(alias);
    }

    /**
     * get group creation context
     */
    public getGroupCreationContext(): Promise<any> {
        return this._dataSource.getGroupCreationContext();
    }

    /**
     * Creates the group according to the provided parameters.
     */
    /*
    public createGroup(strName: string, strAlias: string, isPublic: boolean, description: string
            , dataClassification: string, allowGuestUsers: boolean): Promise<ICreateGroupResponse> {
        return this._dataSource.sendCreateGroupOperation(strName, strAlias, isPublic, description, dataClassification, allowGuestUsers);
    }
    */

    /**
     * Gets the group notebook URL from the GroupSiteManager API.
     */
    public getNotebookUrl(groupId: string): Promise<string> {
        if (!groupId) {
            return Promise.wrapError(this._missingGroupIdError);
        }
        return this._dataSource.getNotebookUrl(groupId);
    }

    /**
     * Gets the group site provisioning status.
     */
    public getGroupSiteStatus(groupId: string): Promise<IGroupSiteInfo> {
        if (!groupId) {
            return Promise.wrapError(this._missingGroupIdError);
        }
        return this._dataSource.getSiteStatus(groupId);
    }

    /**
     * Creates the group site if necessary.
     */
    public createGroupSite(groupId: string): Promise<IGroupSiteInfo> {
        if (!groupId) {
            return Promise.wrapError(this._missingGroupIdError);
        }
        return this._dataSource.createSite(groupId);
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
     * Returns the fallback files url if the group is not provisioned.
     */
    public getFallbackFilesUrl(groupId: string): string {
        return this._dataSource.getFallbackFilesUrl(groupId);
    }

    /**
     * Gets group object that is cached in memory
     * If it doesn't exist then load it from browser cache
     */
    public getCachedGroup(id: string): Group {
        let group = this._groups[id];

        // If we can't find the group already created, make a new object which gets info from cache.
        if (!group) {
            group = new Group(undefined, this, id);
            this._groups[id] = group;
        }
        return group;
    }

    private _setUsersGroups(leftNavGroups: IGroup[], leftNavSource: SourceType) {
        this.userGroups = leftNavGroups.map((groupInfo: IGroup) => {
            let group = this.getCachedGroup(groupInfo.id);

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
    }

    /**
     * This is run after fetching data from the datasource to perform any fixups to the properties
     */
    private _performBasicPropertiesPostProcessing(group: IGroup): void {
        // pictureUrl conversion
        // pictureUrl is a URL for an Exchange Service call to fetch the picture.
        // Unfortunately, there's issues with using it directly because it is cross-domain
        // Our solution is to go through a proxy that lives in SharePoint instead.
        if (!!group.pictureUrl) {
            group.pictureUrl = this._convertDirectExchangeServiceCallToOWAWebServiceUrl(group.pictureUrl);
        }
    }

    /**
     * Converts a direct call to the Exchange service into an indirect call that goes through the
     * OWAWebService, which is a proxy running in SharePoint.
     * Example Exchange URL:
     *  https://outlook.office365.com/OWA/service.svc/s/GetPersonaPhoto?email=newgroup-testd@service.microsoft.com&size=HR96x96
     * Corresponding OWAWebService Url:
     *  https://microsoft.sharepoint.com/teams/newgroup-testd/_api/OWAWebService/service.svc/s/GetPersonaPhoto?email=newgroup-testd@service.microsoft.com&size=HR96x96
     */
    private _convertDirectExchangeServiceCallToOWAWebServiceUrl(exchangeServiceUrl: string): string {
        if (this._context) {
            let serviceCallIndex = exchangeServiceUrl.indexOf('service.svc');
            if (serviceCallIndex !== -1) {
                let serviceCall = exchangeServiceUrl.substring(serviceCallIndex);
                return this._context.webAbsoluteUrl + '/_api/OWAWebService/' + serviceCall;
            }
        }

        // If hostSettings is undefined or some other issue occurs, just return the original url
        return exchangeServiceUrl;
    }
}