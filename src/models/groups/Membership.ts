// OneDrive:IgnoreCodeCoverage
import IGroup from '../../dataSources/groups/IGroup';
import IMembership from '../../dataSources/groups/IMembership';
import MembersList from '../../dataSources/groups/MembersList';
import { IGroupsProvider } from '../../providers/groups/GroupsProvider';
import Group, { SourceType } from './Group';
import Promise from '@ms/odsp-utilities/lib/async/Promise';
import { IDisposable }  from '@ms/odsp-utilities/lib/interfaces/IDisposable';
import EventGroup from '@ms/odsp-utilities/lib/events/EventGroup';

export default class Membership implements IMembership, IDisposable {
    public isMember: boolean;
    public isOwner: boolean;
    public isJoinPending: boolean;
    public totalNumberOfMembers: number;

    /**
     * May 4 2016 - The members list will only contain the first 3 members
     * as there is no need for members beyond the first 3, and the API no longer
     * returns all data. We don't actually want to fetch all of several thousands
     * of members anyway.
     *
     * @deprecated
     */
    public membersList: MembersList;
    public source: SourceType;
    public lastLoadTimeStampFromServer: number;
    public isLoadingFromServer: boolean;
    public error: string;

    private _groupsProvider: IGroupsProvider;
    private _parent: Group;
    private _eventGroup: EventGroup;

    constructor(membershipInfo?: IMembership, groupsProvider?: IGroupsProvider, group?: Group) {
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

    public load() {
        if (this._groupsProvider && this._parent.id) {
            if (this.source === SourceType.None) {
                let groupInfo: IGroup = this._groupsProvider.loadGroupInfoFromCache(this._parent.id);
                if (groupInfo && groupInfo.membership &&
                    groupInfo.membership.lastLoadTimeStampFromServer > 0) {
                    this.extend(groupInfo.membership, SourceType.Cache);
                }
            }

            if (this._shouldLoadNewData()) {
                this._startLoadingFromServer();
                let promise: Promise<IMembership> = this._groupsProvider.loadMembershipContainerFromServer(this._parent.id);
                promise.then(
                    (membership: IMembership) => {
                        this.extend(membership, SourceType.Server);
                        this._finishLoadingFromServer();
                        this._groupsProvider.saveGroupToCache(this._parent);
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
        this.lastLoadTimeStampFromServer = m.totalNumberOfMembers;
        this._parent.membership = this;
        this.source = sourceType;
        this._eventGroup.raise('source', this.source);
    }

    /**
     * Returns if last load is older that given number of milliseconds,
     * or data is from cache, or have never been loaded.
     */
    private _shouldLoadNewData(): boolean {
        return !this.isLoadingFromServer &&
               (this.source !== SourceType.Server) &&
               (!this.lastLoadTimeStampFromServer || ((Date.now() - this.lastLoadTimeStampFromServer) > 120000));
    }

    /**
     * Should be called after loading new data
     */
    private _startLoadingFromServer() {
        this.isLoadingFromServer = true;
    }

    /**
     * Should be called after loading new data
     */
    private _finishLoadingFromServer() {
        this.isLoadingFromServer = false;
        this.lastLoadTimeStampFromServer = Date.now();
    }

    /**
     * Indicates to the controller that loading of data has failed
     */
    private _errorLoading(errorMessage: string) {
        this.isLoadingFromServer = false;
        this.error = errorMessage;
    }
}
