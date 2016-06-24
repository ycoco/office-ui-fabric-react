// OneDrive:IgnoreCodeCoverage
import IGroup from '../../dataSources/groups/IGroup';
import { IGroupsProvider } from '../../providers/groups/GroupsProvider';
import Membership from './Membership';
import Promise from '@ms/odsp-utilities/lib/async/Promise';
import { IDisposable }  from '@ms/odsp-utilities/lib/interfaces/IDisposable';
import EventGroup from '@ms/odsp-utilities/lib/events/EventGroup';

export enum SourceType {
    Cache,
    Server,
    None
}

/**
 * Contains information to model a Group
 */
export default class Group implements IGroup, IDisposable {
    /** @inheritDoc */
    public id: string;
    /** @inheritDoc */
    public name: string;
    /** @inheritDoc */
    public principalName: string;
    /** @inheritDoc */
    public alias: string;
    /** @inheritDoc */
    public mail: string;
    /** @inheritDoc */
    public description: string;
    /** @inheritDoc */
    public creationTime: number;
    /** @inheritDoc */
    public profileUrl: string;
    /** @inheritDoc */
    public inboxUrl: string;
    /** @inheritDoc */
    public calendarUrl: string;
    /** @inheritDoc */
    public filesUrl: string;
    /** @inheritDoc */
    public notebookUrl: string;
    /** @inheritDoc */
    public pictureUrl: string;
    /** @inheritDoc */
    public sharePointUrl: string;
    /** @inheritDoc */
    public editUrl: string;
    /** @inheritDoc */
    public membersUrl: string;
    /** @inheritDoc */
    public isPublic: boolean;
    /** @inheritDoc */
    public classification: string;

    /** Group members information */
    public membership: Membership;

    /** */
    // public siteInfo: GroupSiteInfo;

    public lastLoadTimeStampFromServer: number;

    public source: SourceType;

    public isLoadingFromServer: boolean;

    public error: string;

    private _groupsProvider: IGroupsProvider;

    private _eventGroup: EventGroup;

    /**
     * Constructs a new Group model.
     * @param groupInfo  The IGroup properties to apply to the model.
     * @param groupsProvider If supplied together with groupId, will result in an attempt to load the group through appropriate datasources.
     * @param groupId The ID (GUID) of the Group. If supplied together with groupsProvider, will result in an attempt to load the group through appropriate datasources.
     */
    constructor(groupInfo?: IGroup, groupsProvider?: IGroupsProvider, groupId?: string) {
        this._eventGroup = new EventGroup(this);
        this.source = SourceType.None;
        this.lastLoadTimeStampFromServer = -1;
        this._groupsProvider = groupsProvider;
        if (groupId) {
            this.id = groupId;
            if (!groupInfo && groupsProvider) {
                groupInfo = this._groupsProvider.loadGroupInfoFromCache(groupId);
            }
        }

        if (groupInfo) {
            this.extend(groupInfo);
        }

        this.membership = new Membership(undefined, this._groupsProvider, this);
    }

    public dispose() {
        if (this._eventGroup) {
            this._eventGroup.dispose();
            this._eventGroup = undefined;
        }
    }

    public load() {
        if (this._groupsProvider && this.id) {
            if (this.source === SourceType.None) {
                let groupInfo: IGroup = this._groupsProvider.loadGroupInfoFromCache(this.id);
                if (groupInfo &&
                    groupInfo.lastLoadTimeStampFromServer > 0) {
                    this.extend(groupInfo);
                    this.source = SourceType.Cache;
                    this._eventGroup.raise('source', this.source);
                }
            }

            if (this._shouldLoadNewData()) {
                this._startLoadingFromServer();
                let promise: Promise<IGroup> = this._groupsProvider.loadGroupInfoContainerFromServer(this.id);
                promise.then(
                    (groupInfo: IGroup) => {
                        this.extend(groupInfo);
                        this._finishLoadingFromServer();
                        this._groupsProvider.saveGroupToCache(this);
                    },
                    (error: any) => {
                        this._errorLoading(error);
                    });

            }
        }
    }

    public save(): Promise<any> {
        if (this._groupsProvider) {
            // save to browser cache
            this._groupsProvider.saveGroupToCache(this);
            return Promise.wrap();
        }
    }

    /**
     * Add the defined properties of another Group object into this one
     * Also perform necessary initialization steps with the new data
     */
    public extend(g: IGroup) {
        this.name = g.name;
        this.alias = g.alias;
        this.mail = g.mail;
        this.description = g.description;
        this.creationTime = g.creationTime;
        this.profileUrl = g.profileUrl;
        this.inboxUrl = g.inboxUrl;
        this.calendarUrl = g.calendarUrl;
        this.filesUrl = g.filesUrl;
        this.notebookUrl = g.notebookUrl;
        this.pictureUrl = g.pictureUrl;
        this.sharePointUrl = g.sharePointUrl;
        this.editUrl = g.editUrl;
        this.membersUrl = g.membersUrl;
        this.isPublic = g.isPublic;
        this.classification = g.classification;
    }

    /**
     * Returns if last load is older than threshold number of milliseconds,
     * or data is from cache, or have never been loaded.
     */
    private _shouldLoadNewData(): boolean {
        return !this.isLoadingFromServer &&
            (this.source !== SourceType.Server) &&
            (!this.lastLoadTimeStampFromServer || ((Date.now() - this.lastLoadTimeStampFromServer) > 60000));
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
        if (this.source === SourceType.Server) {
            this.source = SourceType.Cache;
        }
        this.source = SourceType.Server;
        this._eventGroup.raise('source', this.source);
    }

    /**
     * Indicates to the controller that loading of data has failed
     */
    private _errorLoading(errorMessage: string) {
        this.isLoadingFromServer = false;
        this.error = errorMessage;
    }
}