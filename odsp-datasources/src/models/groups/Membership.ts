import IGroup from '../../dataSources/groups/IGroup';
import { IMembership, IMembersList } from '../../dataSources/groups/IMembership';
import MembersList from '../../dataSources/groups/MembersList';
import GroupsProvider from '../../providers/groups/GroupsProvider';
import Group from './Group';
import { SourceType } from './../../interfaces/groups/SourceType';
import Promise from '@ms/odsp-utilities/lib/async/Promise';
import { IDisposable } from '@ms/odsp-utilities/lib/interfaces/IDisposable';
import EventGroup from '@ms/odsp-utilities/lib/events/EventGroup';

/**
 * You can load group membership with different options depending on how much information you need.
 * This enum provides bitflags to track which options were requested.
 */
export enum MembershipLoadOptions {
    /**
     * No special options were requested
     */
    none = 0,

    /**
     * All members were requested instead of the top three
     */
    allMembers = 1,

    /**
     * Ownership information was requested
     */
    ownershipInformation = 2
}

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
     * The total number of owners of the group.
     * Only set if ownership information was requested.
     */
    public totalNumberOfOwners: number;

    /**
     * September 2016 - The members list will either contain the first
     * three members or all members, depending on the loadAllMembers
     * parameter of the load method. (The facepile control in the site
     * header requires only three members, while the group membership
     * panel requires all of them. We don't want to load more than needed.)
     *
     */
    public membersList: IMembersList;

    /** The source of the group members data */
    public source: SourceType;
    /** The timestamp of the last load of the members data */
    public lastLoadTimeStampFromServer: number;
    /** True if the data is currently being loaded from the server */
    public isLoadingFromServer: boolean;
    /** The error reported by the server */
    public error: string;

    /**
     * If data is currently being loaded from the server, stores the options
     * being used according to the MembershipLoadOptions enum. Helps us determine 
     * whether to make another server call or wait for the one in progress to complete.
     */
    private _currentLoadOptions: number;

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
     * If loadOwnershipInformation is true, set the isOwnerOfCurrentGroup attribute on each member to say whether they are an owner.
     * (This requires an additional server call.) If false, do not add ownership information.
     * 
     * @param {boolean} loadAllMembers - true if we need all members, false for top three. Defaults to false.
     * @param {boolean} loadOwnershipInformation - true if we need to know whether each member is also a group owner. Defaults to false.
     */
    public load(loadAllMembers = false, loadOwnershipInformation = false) {
        if (this._groupsProvider && this._parent.id) {
            let options: number = 0;
            /* tslint:disable: no-bitwise */
            if (loadAllMembers) {
                options |= MembershipLoadOptions.allMembers;
            }
            if (loadOwnershipInformation) {
                options |= MembershipLoadOptions.ownershipInformation;
            }
            /* tslint:enable: no-bitwise */

            // If there are no special load options, use the cache
            if (this.source === SourceType.None && !options) {
                let groupInfo: IGroup = this._groupsProvider.loadGroupInfoFromCache(this._parent.id);
                if (groupInfo && groupInfo.membership &&
                    groupInfo.membership.lastLoadTimeStampFromServer > 0) {
                    this.extend(groupInfo.membership, SourceType.Cache);
                }
            }

            if (this._shouldLoadNewData(options)) {
                this._startLoadingFromServer(options);
                let promise: Promise<IMembership> = this._groupsProvider.loadMembershipContainerFromServer(this._parent.id, loadAllMembers, loadOwnershipInformation);
                promise.then(
                    (membership: IMembership) => {
                        this.extend(membership, SourceType.Server);
                        this._finishLoadingFromServer();
                        // If there are no special load options, use the cache
                        if (!options) {
                            membership.lastLoadTimeStampFromServer = this.lastLoadTimeStampFromServer;
                            this._groupsProvider.saveMembershipToCache(this._parent.id, membership);
                        }
                    },
                    (error: any) => {
                        this._errorLoading(error);
                    }
                );
            }
        }
    }

    /**
     * Load the group membership according to the requested load options.
     * 
     * Note that until we can implement paging, loading with the allMembers option really loads up to 100 members.
     * 
     * @param {number} options - set bit flags to indicate which MembershipLoadOptions (if any) to request.
     * Select any options from MembershipLoadOptions. For more than one option, do a bitwise OR between options like this:
     * MembershipLoadOptions.allMembers | MembershipLoadOptions.ownershipInformation
     */
    public loadWithOptions(options: number): Promise<void> {
        if (this._groupsProvider && this._parent.id) {
            // If there are no special load options, use the cache
            if (this.source === SourceType.None && !options) {
                let groupInfo: IGroup = this._groupsProvider.loadGroupInfoFromCache(this._parent.id);
                if (groupInfo && groupInfo.membership &&
                    groupInfo.membership.lastLoadTimeStampFromServer > 0) {
                    this.extend(groupInfo.membership, SourceType.Cache);
                }
            }

            if (this._shouldLoadNewData(options)) {
                this._startLoadingFromServer(options);
                let promise: Promise<IMembership> = this._groupsProvider.loadMembershipContainerFromServer(
                    this._parent.id,
                    /* tslint:disable: no-bitwise */
                    options && (options & MembershipLoadOptions.allMembers) === MembershipLoadOptions.allMembers,
                    options && (options & MembershipLoadOptions.ownershipInformation) === MembershipLoadOptions.ownershipInformation);
                /* tslint:enable: no-bitwise */
                return promise.then(
                    (membership: IMembership) => {
                        this.extend(membership, SourceType.Server);
                        this._finishLoadingFromServer();
                        // If there are no special load options, use the cache
                        if (!options) {
                            membership.lastLoadTimeStampFromServer = this.lastLoadTimeStampFromServer;
                            this._groupsProvider.saveMembershipToCache(this._parent.id, membership);
                        }
                    },
                    (error: any) => {
                        this._errorLoading(error);
                    }
                );
            }
        }
        return Promise.wrap(undefined);
    }

    public extend(m: IMembership, sourceType: SourceType) {
        this.isMember = m.isMember;
        this.isOwner = m.isOwner;
        this.isJoinPending = m.isJoinPending;
        this.membersList = m.membersList;
        this.totalNumberOfMembers = m.totalNumberOfMembers;
        this.totalNumberOfOwners = m.totalNumberOfOwners;
        this.lastLoadTimeStampFromServer = m.lastLoadTimeStampFromServer;
        this._parent.membership = this;
        this.source = sourceType;
        this._eventGroup.raise(Membership.onSourceChange, this.source);
    }

    /**
     * Returns true if last load is older that given number of milliseconds,
     * or data is from cache, or have never been loaded.
     * Also returns true if the load options are requesting special additional information.
     * 
     * @param {number} options - set bit flags to indicate which MembershipLoadOptions (if any) to request
     */
    private _shouldLoadNewData(options: number): boolean {
        return (!this.isLoadingFromServer &&
            (this.source !== SourceType.Server) &&
            (this.lastLoadTimeStampFromServer < 0 || ((Date.now() - this.lastLoadTimeStampFromServer) > 120000))) ||
            /* tslint:disable: no-bitwise */
            // If we want all members and are not currently loading them, must load new data
            (options && (options & MembershipLoadOptions.allMembers) === MembershipLoadOptions.allMembers &&
                !(this._currentLoadOptions && ((this._currentLoadOptions & MembershipLoadOptions.allMembers) === MembershipLoadOptions.allMembers))) ||
            // If we want ownership information and are not currently loading it, must load new data
            (options && (options & MembershipLoadOptions.ownershipInformation) === MembershipLoadOptions.ownershipInformation &&
                !(this._currentLoadOptions && ((this._currentLoadOptions & MembershipLoadOptions.ownershipInformation) === MembershipLoadOptions.ownershipInformation)));
        /* tslint:enable: no-bitwise */
    }

    /**
     * Should be called before loading new data
     */
    private _startLoadingFromServer(options: number) {
        this.isLoadingFromServer = true;
        this._currentLoadOptions = options;
    }

    /**
     * Should be called after loading new data
     */
    private _finishLoadingFromServer() {
        this.isLoadingFromServer = false;
        this._currentLoadOptions = undefined;
        this.lastLoadTimeStampFromServer = Date.now();
    }

    /**
     * Indicates to the controller that loading of data has failed
     */
    private _errorLoading(errorMessage: string) {
        this.isLoadingFromServer = false;
        this._currentLoadOptions = undefined;
        this.error = errorMessage;
    }
}

export default Membership;