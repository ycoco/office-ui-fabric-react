import IGroup from '../../dataSources/groups/IGroup';
import IMembership from '../../dataSources/groups/IMembership';
import MembersList from '../../dataSources/groups/MembersList';
import GroupsProvider from '../../providers/groups/GroupsProvider';
import Group from './Group';
import { SourceType } from './../../interfaces/groups/SourceType';
import Promise from '@ms/odsp-utilities/lib/async/Promise';
import { IDisposable }  from '@ms/odsp-utilities/lib/interfaces/IDisposable';
import EventGroup from '@ms/odsp-utilities/lib/events/EventGroup';

export class Membership implements IMembership, IDisposable {
    /** The name of the source change event */
    public static onSourceChange = 'source';
    /** True if the current user is a member of the group. */
    public isMember: boolean;
    /** True if the current user is an owner of the group. */
    public isOwner: boolean;
    /** True if a join group operation is pending */
    public isJoinPending: boolean;
    /** the total number of members of the group */
    public totalNumberOfMembers: number;

    /**
     * September 2016 - The members list will either contain the first
     * three members or all members, depending on the loadAllMembers
     * parameter of the load method. (The facepile control in the site
     * header requires only three members, while the group membership
     * panel requires all of them. We don't want to load more than needed.)
     *
     */
    public membersList: MembersList;
    /** The source of the group members data */
    public source: SourceType;
    /** The timestamp of the last load of the members data */
    public lastLoadTimeStampFromServer: number;
    /** True if the data is currently being loaded from the server */
    public isLoadingFromServer: boolean;
    /** The error reported by the server */
    public error: string;

    /** 
     * Indicates whether the most recent successful load
     * of members data was for all members or for only the top three members
     */
    private _lastQueriedAllMembers: boolean;
    /** True if the we're in the middle of attempting to load all members */
    private _isLoadingAllFromServer: boolean;
    private _groupsProvider: GroupsProvider;
    private _parent: Group;
    private _eventGroup: EventGroup;

    constructor(membershipInfo?: IMembership, groupsProvider?: GroupsProvider, group?: Group) {
        this._eventGroup = new EventGroup(this);
        this.source = SourceType.None;
        this.lastLoadTimeStampFromServer = -1;
        this._groupsProvider = groupsProvider;
        this._parent = group;

        if (membershipInfo) {
            this.extend(membershipInfo, SourceType.None);
        }

        if (!this.membersList) {
            this.membersList = new MembersList();
        }
    }

    public dispose() {
        if (this._eventGroup) {
            this._eventGroup.dispose();
            this._eventGroup = undefined;
        }
        this._parent = undefined;
    }

    /**
     * If loadAllMembers is true, load all members. If false, load only the top three members.
     * (Only the top three members are required for the facepile control in the site header,
     * but if the user opens the Group Membership panel, we will need all members.)
     * 
     * Note that until we can implement paging, loading all members really loads up to 100 members.
     * 
     * @param {boolean} loadAllMembers - true if we need all members, false for top three. Defaults to false.
     */
    public load(loadAllMembers = false) {
        if (this._groupsProvider && this._parent.id) {
            if (this.source === SourceType.None) {
                let groupInfo: IGroup = this._groupsProvider.loadGroupInfoFromCache(this._parent.id); // TODO: prevent top three briefly appearing before all members
                if (groupInfo && groupInfo.membership &&
                    groupInfo.membership.lastLoadTimeStampFromServer > 0) {
                    this.extend(groupInfo.membership, SourceType.Cache);
                }
            }

            if (this._shouldLoadNewData(loadAllMembers)) {
                this._startLoadingFromServer(loadAllMembers);
                let promise: Promise<IMembership> = this._groupsProvider.loadMembershipContainerFromServer(this._parent.id, loadAllMembers);
                promise.then(
                    (membership: IMembership) => {
                        this.extend(membership, SourceType.Server);
                        this._finishLoadingFromServer(loadAllMembers);
                        // Save "this," not "membership," or lastLoadTimeStampFromServer and lastQueriedAllMembers won't be cached!
                        this._groupsProvider.saveMembershipToCache(this._parent.id, this);
                    },
                    (error: any) => {
                        this._errorLoading(error);
                    }
                );

            }
        }
    }

    public extend(m: IMembership, sourceType: SourceType) {
        this.isMember = m.isMember;
        this.isOwner = m.isOwner;
        this.isJoinPending = m.isJoinPending;
        this.membersList = m.membersList;
        this.totalNumberOfMembers = m.totalNumberOfMembers;
        this.lastLoadTimeStampFromServer = Date.now();
        this._lastQueriedAllMembers = m.lastQueriedAllMembers;
        this._parent.membership = this;
        this.source = sourceType;
        this._eventGroup.raise(Membership.onSourceChange, this.source);
    }

    /**
     * Returns true if last load is older that given number of milliseconds,
     * or data is from cache, or have never been loaded.
     * Also returns true if we want to load all members and the previous query
     * did not load all members.
     * 
     * @param {boolean} loadAllMembers - true if we need all members, false for top three.
     */
    private _shouldLoadNewData(loadAllMembers: boolean): boolean {
        return (!this.isLoadingFromServer &&
               (this.source !== SourceType.Server) &&
               // this.lastLoadTimeStampFromServer is initially set to -1
               (this.lastLoadTimeStampFromServer < 0 || ((Date.now() - this.lastLoadTimeStampFromServer) > 120000))) ||
               (!this._isLoadingAllFromServer &&
               loadAllMembers &&
               !this._lastQueriedAllMembers);
    }

    /**
     * Should be called before loading new data
     */
    private _startLoadingFromServer(loadAllMembers: boolean) {
        this.isLoadingFromServer = true;
        this._isLoadingAllFromServer = loadAllMembers;
    }

    /**
     * Should be called after loading new data
     */
    private _finishLoadingFromServer(loadAllMembers: boolean) {
        this.isLoadingFromServer = false;
        this._isLoadingAllFromServer = false;
        this.lastLoadTimeStampFromServer = Date.now();
        this._lastQueriedAllMembers = loadAllMembers;
    }

    /**
     * Indicates to the controller that loading of data has failed
     */
    private _errorLoading(errorMessage: string) {
        this.isLoadingFromServer = false;
        this.error = errorMessage;
    }
}

export default Membership;