import IContext from '../../dataSources/base/IContext';
import IGroup from '../../dataSources/groups/IGroup';
import GroupsProvider from '../../providers/groups/GroupsProvider';
import Membership from './Membership';
import Promise from '@ms/odsp-utilities/lib/async/Promise';
import { IDisposable }  from '@ms/odsp-utilities/lib/interfaces/IDisposable';
import EventGroup from '@ms/odsp-utilities/lib/events/EventGroup';
import StringHelper = require('@ms/odsp-utilities/lib/string/StringHelper');

declare var _spPageContextInfo;

const EDOG_PLANNER_HOST: string = 'tasks.officeppe.com';
const DEFAULT_PLANNER_HOST: string = 'tasks.office.com';
const PLANNER_URL_FORMAT_STRING: string = 'https://{0}/{1}/Home/Group/Planner?auth_pvr=OrgId&auth_upn={2}';

/**
 * Represents the source of the group data.
 */
export enum SourceType {
    /** Group data comes from cache. */
    Cache,
    /** Group data comes from the server. */
    Server,
    /** Group data is missing. */
    None
}

/**
 * A concrete model of a Group that implements IGroup, but also has additional methods and built-in support
 * for cache interaction.
 */
export default class Group implements IGroup, IDisposable {
    /** The name of the source change event */
    public static onSourceChange = 'source';
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
    /** The URL of the planner app. */
    public plannerUrl: string;
    /** @inheritDoc */
    public isPublic: boolean;
    /** @inheritDoc */
    public classification: string;
    /** Group members information */
    public membership: Membership;
    /** Timestamp of the last group load */
    public lastLoadTimeStampFromServer: number;
    /** The source of the group data */
    public source: SourceType;
    /** Indicates if a group loading from server action is in progress */
    public isLoadingFromServer: boolean;
    /** The load from sever error */
    public error: string;

    private _groupsProvider: GroupsProvider;
    private _eventGroup: EventGroup;

    private static _getPlannerUrl(context: IContext): string {
        context = context && _spPageContextInfo;
        if (context) {
            let hostName = context.env === 'EDog' ? EDOG_PLANNER_HOST : DEFAULT_PLANNER_HOST;
            let cultureName = context.currentUICultureName;
            let uid = context.userLoginName;
            return StringHelper.format(PLANNER_URL_FORMAT_STRING, hostName, cultureName, uid);
        }
        return undefined;
    }

    /**
     * Constructs a new Group model.
     * @params groupInfo? - The IGroup properties to apply to the model.
     * @params groupsProvider? - If supplied together with groupId, will result in an attempt to
     *      load the group through appropriate datasources.
     * @params groupId? - The ID (GUID) of the Group. If supplied together with groupsProvider, will result in
     *      an attempt to load the group through appropriate datasources.
     * @params context? - Context used to determine Planner URL.
     */
    constructor(groupInfo?: IGroup, groupsProvider?: GroupsProvider, groupId?: string, context?: IContext) {
        this._eventGroup = new EventGroup(this);
        this.source = SourceType.None;
        this.lastLoadTimeStampFromServer = -1;
        this._groupsProvider = groupsProvider;
        this.id = groupId;

        if (groupInfo) {
            this.extend(groupInfo);
        } else {
            this.load();
        }

        this.membership = new Membership(undefined, this._groupsProvider, this);
        this.plannerUrl = Group._getPlannerUrl(context);
    }

    public dispose() {
        if (this._eventGroup) {
            this._eventGroup.dispose();
            this._eventGroup = undefined;
        }
    }

    /**
     * Attempts to load a group, attempting to load from cache, and will preserve loaded data to cache.
     * Will also save loaded data to cache.
     *
     * Note: Requires the Group object to have been initialized a GroupsProvider instance, or load() will not
     *       do anything.
     */
    public load() {
        if (this._groupsProvider && this.id) {
            if (this.source === SourceType.None) {
                let groupInfo: IGroup = this._groupsProvider.loadGroupInfoFromCache(this.id);
                if (groupInfo &&
                    groupInfo.lastLoadTimeStampFromServer > 0) {
                    this.extend(groupInfo);
                    this.source = SourceType.Cache;
                    this._eventGroup.raise(Group.onSourceChange, this.source);
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
        this.principalName = g.principalName;
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
        this._eventGroup.raise(Group.onSourceChange, this.source);
    }

    /**
     * Indicates to the controller that loading of data has failed
     */
    private _errorLoading(errorMessage: string) {
        this.isLoadingFromServer = false;
        this.error = errorMessage;
    }
}