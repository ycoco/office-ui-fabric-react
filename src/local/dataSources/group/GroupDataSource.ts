// OneDrive:IgnoreCodeCoverage

import { format } from '../../string/StringHelper';
import MembersList,  { IPerson, IMembership } from './MembersList';
import { IHostSettings } from '../IHostSettings';

/**
 * Interface for an object that is passed to the constructor of a Group
 * to initialize its properties.
 */
export interface IGroup {
    id?: string;
    name?: string;
    principalName?: string;
    alias?: string;
    mail?: string;
    description?: string;
    creationTime?: number;
    inboxUrl?: string;
    calendarUrl?: string;
    filesUrl?: string;
    /** Is a Group a favorite group? (From EXO) */
    isFavorite?: boolean;

    /**
     * Url to groups profile page
     */
    profileUrl?: string;
    notebookUrl?: string;
    pictureUrl?: string;
    sharePointUrl?: string;
    editUrl?: string;
    membersUrl?: string;
    isPublic?: boolean;
    membership?: IMembership;
    //siteInfo?: IGroupSiteInfo;
    lastLoadTimeStampFromServer?: number;
}

/**
 * This datasource makes server call to get group related information.
 */
export default class GroupDataSource {

    /**
     * Static members
     */
    // Url templates
    private static groupBasicPropertiesUrlTemplate: string =
    'Group(\'{0}\')?$select=PrincipalName,DisplayName,Alias,Description,InboxUrl,CalendarUrl,DocumentsUrl,SiteUrl,EditGroupUrl,PictureUrl,PeopleUrl,NotebookUrl,Mail,IsPublic,CreationTime';

    private static groupBasicPropertiesWithMembershipUrlTemplate: string =
    'Group(\'{0}\')?$expand=Members,Owners&$select=PrincipalName,DisplayName,Alias,Description,InboxUrl,CalendarUrl,DocumentsUrl,SiteUrl,EditGroupUrl,PictureUrl,PeopleUrl,NotebookUrl,Mail,IsPublic,CreationTime,Members/PrincipalName,Members/Id,Members/DisplayName,Members/PictureUrl,Owners/PrincipalName,Owners/Id,Owners/DisplayName,Owners/PictureUrl';

    private static groupStatusPageTemplate: string = '_layouts/15/groupstatus?id={0}&target={1}';

    /**
     * private members
     */
    private _hostSettings: IHostSettings;

    /**
     * @constructor
     */
    constructor(hostSettings: IHostSettings) {
        this._hostSettings = hostSettings;
    }

    /**
     * Get REST Url to get group properties
     * @param {string} Id (Guid) of the group
     * @returns the REST url that can be used to get group basic properties
     */
    public getGroupBasicPropertiesRESTUrl(groupId: string, withMembership: boolean): string {
        return this._getRESTUrl(format(
            withMembership ? GroupDataSource.groupBasicPropertiesWithMembershipUrlTemplate : GroupDataSource.groupBasicPropertiesUrlTemplate,
            groupId),
            'SP.Directory.DirectorySession');
    }

    public getGroupBasicProperties(responseText: string): IGroup {
        let group: IGroup = {};

        try {
            let response = JSON.parse(responseText);
            if (response.d) {
                group = this._copyGroup(response.d);
                this._calculateMissingGroupProperties(group, group.id);
            }
        } catch (e) {
            group = {};
        }

        return group;
    }

    private _getRESTUrl(op: string, ns: string): string {
        return this._hostSettings.webServerRelativeUrl + '/_api/' + ns + '/' + op;
    }

    /**
     * Given response from the server convert it into a group
     */
    private _copyGroup(src: any): IGroup {
        var groupInfo: IGroup = {};

        if (src.description) {
            groupInfo.description = src.description;
        }

        if (src.alias) {
            groupInfo.alias = src.alias;
        }

        if (src.displayName) {
            groupInfo.name = src.displayName;
        }

        if (src.principalName) {
            groupInfo.principalName = src.principalName;
        }

        if (src.creationTime) {
            groupInfo.creationTime = src.creationTime;
        }

        if (src.pictureUrl) {
            groupInfo.pictureUrl = src.pictureUrl;
        }

        if (src.inboxUrl) {
            groupInfo.inboxUrl = src.inboxUrl;
        }

        if (src.calendarUrl) {
            groupInfo.calendarUrl = src.calendarUrl;
        }

        if (src.documentsUrl) {
            groupInfo.filesUrl = src.documentsUrl;
        }

        if (src.siteUrl) {
            groupInfo.sharePointUrl = src.siteUrl;
        }

        if (src.editGroupUrl) {
            groupInfo.editUrl = src.editGroupUrl;
        }

        if (src.peopleUrl) {
            groupInfo.membersUrl = src.peopleUrl;
        }

        if (src.notebookUrl) {
            groupInfo.notebookUrl = src.notebookUrl;
        }

        if (src.isPublic) {
            groupInfo.isPublic = src.isPublic;
        }

        if (src.mail) {
            groupInfo.mail = src.mail;
        }

        // TODO: remove this once all branches get lowerCamelCase changelist
        if (src.Description) {
            groupInfo.description = src.Description;
        }

        if (src.Alias) {
            groupInfo.alias = src.Alias;
        }

        if (src.DisplayName) {
            groupInfo.name = src.DisplayName;
        }

        if (src.PrincipalName) {
            groupInfo.principalName = src.PrincipalName;
        }

        if (src.CreationTime) {
            groupInfo.creationTime = src.CreationTime;
        }

        if (src.PictureUrl) {
            groupInfo.pictureUrl = src.PictureUrl;
        }

        if (src.InboxUrl) {
            groupInfo.inboxUrl = src.InboxUrl;
        }

        if (src.CalendarUrl) {
            groupInfo.calendarUrl = src.CalendarUrl;
        }

        if (src.DocumentsUrl) {
            groupInfo.filesUrl = src.DocumentsUrl;
        }

        if (src.SiteUrl) {
            groupInfo.sharePointUrl = src.SiteUrl;
        }

        if (src.EditGroupUrl) {
            groupInfo.editUrl = src.EditGroupUrl;
        }

        if (src.PeopleUrl) {
            groupInfo.membersUrl = src.PeopleUrl;
        }

        if (src.NotebookUrl) {
            groupInfo.notebookUrl = src.NotebookUrl;
        }

        if (src.IsPublic) {
            groupInfo.isPublic = src.IsPublic;
        }

        if (src.Mail) {
            groupInfo.mail = src.Mail;
        }

        if (src.members || src.owners) {
            this._copyMembership(src);
        }

        return groupInfo;
    }

    /**
     *  Remove once federated directory makes appropriate fixes
     */
    private _calculateMissingGroupProperties(group: IGroup, groupId: string) {
        if (!group.creationTime) {
            group.creationTime = Date.now();
        }

        if (!group.pictureUrl) {
            group.pictureUrl = group.pictureUrl.replace("EWS/Exchange.asmx/s/GetUserPhoto", "OWA/service.svc/s/GetPersonaPhoto");
        }

        if (!group.profileUrl) {
            group.profileUrl = this._getProfileUrl(groupId);
        }

        if (!group.notebookUrl && groupId) {
            group.notebookUrl = this._getGroupStatusNotebookUrl(groupId);
        }
    }

    private _getProfileUrl(id: string): string {
        return this._hostSettings.siteAbsoluteUrl + format(GroupDataSource.groupStatusPageTemplate, id, 'profile');
    }

    private _getGroupStatusNotebookUrl(id: string): string {
        return this._hostSettings.siteAbsoluteUrl + format(GroupDataSource.groupStatusPageTemplate, id, 'notebook');
    }

    private _copyMembership(src: any): IMembership {
        var membershipInfo: IMembership = {};

        if (src.members && src.members.results) {
            var membersList: MembersList = this._copyMembers(src.members.results);
            membershipInfo.membersList = membersList;
        }

        if (src.owners && src.owners.results) {
            var ownersList: MembersList = this._copyMembers(src.owners.results);
            membershipInfo.ownersList = ownersList;
        }

        return membershipInfo;
    }

    /**
     * Copy from member list json to memberList object
     */
    private _copyMembers(src: any): MembersList {
        var membersList: MembersList = new MembersList();
        var members: IPerson[] = new Array<IPerson>();
        for (var i = 0; i < src.length; i++) {
            var member: IPerson = this._copyMember(src[i]);
            members.push(member);
        }

        membersList.members = members;
        membersList.totalCount = members.length;

        return membersList;
    }

    /**
     * Copy from json to IPerson object
     */
    private _copyMember(src: any): IPerson {
        var user: IPerson = <IPerson>{};

        if (src.alias) {
            user.sip = src.alias;
        }

        if (src.id) {
            user.userId = src.id;
        }

        if (src.principalName) {
            user.email = src.principalName;
        }

        if (src.displayName) {
            user.name = src.displayName;
        }

        if (src.title) {
            user.job = src.title;
        }

        if (src.pictureUrl) {
            user.image = src.pictureUrl;
        }

        if (src.profilePage) {
            user.profilePage = src.profilePage;
        }

        return user;
    }
}
