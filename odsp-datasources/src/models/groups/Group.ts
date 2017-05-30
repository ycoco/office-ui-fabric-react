import ISpPageContext from '../../interfaces/ISpPageContext';
import { IGroup, IYammerResources } from '../../dataSources/groups/IGroup';
import GroupsProvider from '../../providers/groups/GroupsProvider';
import Membership from './Membership';
import Promise from '@ms/odsp-utilities/lib/async/Promise';
import { IDisposable } from '@ms/odsp-utilities/lib/interfaces/IDisposable';
import EventGroup from '@ms/odsp-utilities/lib/events/EventGroup';
import StringHelper = require('@ms/odsp-utilities/lib/string/StringHelper');
import { SourceType } from './../../interfaces/groups/SourceType';

const groupStatusPageTemplate: string = '/_layouts/15/groupstatus.aspx?id={0}&target={1}';

/**
 * A concrete model of a Group that implements IGroup, but also has additional methods and built-in support
 * for cache interaction.
 */
export class Group implements IGroup, IDisposable {
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
    public hasPictureUrl: boolean;
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
    /** @inheritDoc */
    public allowToAddGuests: boolean;
    /** @inheritDoc */
    public yammerResources: IYammerResources;
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

    private static _getPlannerUrl(pageContext: ISpPageContext, groupId: string): string {
        if (pageContext) {
            if (!groupId) {
                groupId = pageContext.groupId;
            }

            return pageContext.webAbsoluteUrl + StringHelper.format(groupStatusPageTemplate, groupId, 'planner');
        }
        return undefined;
    }

    /**
     * Constructs a new Group model.
     * @param groupInfo? - The IGroup properties to apply to the model.
     * @param groupsProvider? - If supplied together with groupId, will result in an attempt to
     *      load the group through appropriate datasources.
     * @param groupId? - The ID (GUID) of the Group. If supplied together with groupsProvider, will result in
     *      an attempt to load the group through appropriate datasources.
     * @param pageContext? - Context used to determine Planner URL.
     */
    constructor(groupInfo?: IGroup, groupsProvider?: GroupsProvider, groupId?: string, pageContext?: ISpPageContext) {
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
        if (!pageContext && groupsProvider) {
            pageContext = groupsProvider.getSPPageContext();
        }
        this.plannerUrl = Group._getPlannerUrl(pageContext, groupId);
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
     * @param loadNewData? - Force load new data.
     */
    public load(loadNewData?: boolean) {
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

            if (this._shouldLoadNewData(loadNewData)) {
                this._startLoadingFromServer();
                let promise: Promise<IGroup> = this._groupsProvider.loadGroupInfoContainerFromServer(this.id);
                promise.then(
                    (groupInfo: IGroup) => {
                        groupInfo.lastLoadTimeStampFromServer = Date.now();
                        this.extend(groupInfo);
                        this._finishLoadingFromServer();
                        this._groupsProvider.saveGroupToCache(groupInfo);
                    },
                    (error: any) => {
                        this._errorLoading(error);
                    });
            }
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
        this.hasPictureUrl = g.hasPictureUrl;
        this.sharePointUrl = g.sharePointUrl;
        this.editUrl = g.editUrl;
        this.membersUrl = g.membersUrl;
        this.isPublic = g.isPublic;
        this.classification = g.classification;
        this.allowToAddGuests = g.allowToAddGuests;
        this.yammerResources = g.yammerResources;
        this.lastLoadTimeStampFromServer = g.lastLoadTimeStampFromServer;
    }

    /**
     * Returns if last load is older than threshold number of milliseconds,
     * or data is from cache, or have never been loaded.
     */
    private _shouldLoadNewData(loadNewData: boolean): boolean {
        return !this.isLoadingFromServer &&
            (loadNewData || 
            (this.source !== SourceType.Server && 
            (!this.lastLoadTimeStampFromServer || (Date.now() - this.lastLoadTimeStampFromServer) > 60000)));
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

export default Group;
