// OneDrive:IgnoreCodeCoverage

import IGroupSiteInfo from './IGroupSiteInfo';
import IGroupsDataSource from './IGroupsDataSource';
import IMembership from './IMembership';
import MembersList from './MembersList';
import IPerson  from '../peoplePicker/IPerson';
import IGroup from './IGroup';
import ISiteLink from './ISiteLink';
import IContext from '../base/IContext';
import IRestUserGroupsFormat from './IRestUserGroupsFormat';
import DataSource from '../base/DataSource';
import Promise from '@ms/odsp-utilities/lib/async/Promise';
import StringHelper = require('@ms/odsp-utilities/lib/string/StringHelper');
import UriEncoding from '@ms/odsp-utilities/lib/encoding/UriEncoding';

/**
 * Default number of maximum retries when error occurs during rest call.
 */
const NUMBER_OF_RETRIES: number = 3;

const groupBasicPropertiesUrlTemplate: string =
    'Group(\'{0}\')?$select=PrincipalName,DisplayName,Alias,Description,InboxUrl,CalendarUrl,DocumentsUrl,SiteUrl,EditGroupUrl,PictureUrl,PeopleUrl,NotebookUrl,Mail,IsPublic,CreationTime,Classification';
const getGroupByAliasUrlTemplate: string =
    'Group(alias=\'{0}\')';

const getUserOwnedGroupsUrlTemplate: string = 'User(\'{0}\')?$expand=Ownership';

const groupMembershipUrlTemplate: string =
'Group(\'{0}\')/members?$top=3&$inlinecount=allpages&$select=PrincipalName,Id,DisplayName,PictureUrl';

const addGroupMemberUrlTemplate: string = 'Group(\'{0}\')/Members/Add(principalName=\'{1}\')';

const addGroupOwnerUrlTemplate: string = 'Group(\'{0}\')/Owners/Add(principalName=\'{1}\')';

const removeGroupMemberUrlTemplate: string = 'Group(\'{0}\')/Members/Remove(\'{1}\')';

const getUserInfoUrlTemplate: string = 'User(principalName=\'{0}\')';

const userProfileUrlTemplate: string = '/_layouts/15/me.aspx?p={0}&v=profile&origin=ProfileODB';

const userImageUrlTemplate: string = '/_layouts/15/userphoto.aspx?size=S&accountname={0}';

const getNotebookUrlTemplate: string = '/_api/GroupSiteManager/Notebook?groupId=\'{0}\'';

const getSiteStatusUrlTemplate: string = '/_api/GroupSiteManager/GetSiteStatus?groupId=\'{0}\'';

const groupStatusPageTemplate: string = '/_layouts/15/groupstatus.aspx?target={1}';

const createSiteUrlTemplate: string = '/_api/GroupSiteManager/Create?groupId=\'{0}\'';

const checkSiteExistsUrlTemplate: string = '/_api/SP.Site.Exists(url=@v)?@v=\'{0}\'';

const getGroupCreationContextUrlTemplate: string = '/_api/GroupSiteManager/GetGroupCreationContext';

const getSiteUrlFromAliasUrlTemplate: string = '/_api/GroupSiteManager/GetValidSiteUrlFromAlias?alias=\'{0}\'';

const siteLinksTemplate: string = '/_api/SiteLinkingManager/GetSiteLinks';

export default class GroupsDataSource extends DataSource implements IGroupsDataSource {

    constructor(context: IContext) {
        super(context);
    }

    protected getDataSourceName() {
        return 'GroupsDataSource';
    }

    /**
     * Returns a promise that includes Group's basic properties
     * Basic properties include: name, principalName, alias, mail, description, creationTime,
     * inboxUrl, calendarUrl, filesUrl, notebookUrl, pictureUrl, sharePointUrl, editUrl, membersUrl, isPublic
     */
    public getGroupBasicProperties(groupId: string): Promise<IGroup> {
        return this.getData<IGroup>(
            () => {
                return this._getUrl(StringHelper.format(groupBasicPropertiesUrlTemplate,
                    groupId),
                    'SP.Directory.DirectorySession');
            },
            (responseText: string) => {
                let parsedGroup: IGroup = this._parseGroup(responseText);
                this._calculateMissingGroupProperties(parsedGroup, groupId);
                return parsedGroup;
            },
            'GetBasicProperties',
            undefined,
            'GET',
            undefined,
            undefined,
            NUMBER_OF_RETRIES);
    }

    /**
     * Returns a promise that returns a group with the given alias
     */
    public getGroupByAlias(groupAlias: string): Promise<IGroup> {
        return this.getData<IGroup>(
            () => {
                return this._getUrl(StringHelper.format(
                    getGroupByAliasUrlTemplate, groupAlias),
                    'SP.Directory.DirectorySession');
            },
            (responseText: string) => {
                let parsedGroup: IGroup = this._parseGroup(responseText);
                return parsedGroup;
            },
            'GetGroupByAlias',
            undefined,
            'GET',
            undefined,
            undefined,
            0 /* NumberOfRetries*/);
    }

    /**
     * Returns a promise that includes Group's membership information
     * Membership properties include: isMember, isOwner, isJoinPending, membersList, ownersList
     */
    public getGroupMembership(groupId: string, userLoginName: string): Promise<IMembership> {
        return this.getData<IMembership>(
            () => {
                 return this._getUrl(
                    StringHelper.format(groupMembershipUrlTemplate, groupId),
                    'SP.Directory.DirectorySession');
            },
            (responseText: string) => {
                let membership: IMembership = this._parseMembership(responseText);

                // TODO: remove once Federated directory will start returning user membership information
                // Calculates if user isOwner and isMember, and sets it in the group being returned
                // This is temporary until rest endpoints will have this information
                this._calculateMissingMembershipProperties(membership, userLoginName);
                return membership;
            },
            'GetMembership',
            undefined,
            'GET',
            undefined,
            undefined,
            NUMBER_OF_RETRIES);
    }

    /**
     * Returns groups that user is an owner of
     */
    public getUserOwnedGroups(user: IPerson): Promise<IGroup[]> {
        const restUrl = () => {
            return this._getUrl(
            StringHelper.format(getUserOwnedGroupsUrlTemplate, user.userId),
            'SP.Directory.DirectorySession');
        };

        return this.getData<IGroup[]>(
            restUrl,
            (responseText: string) => {
                return this._parseGroups(responseText);
            },
            'GetUserOwnedGroups',
            undefined,
            'GET',
            undefined,
            undefined,
            NUMBER_OF_RETRIES);
    }

    /**
     * Returns linked sites/groups
     */
    public getSiteLinks(): Promise<ISiteLink[]> {
        const restUrl = () => {
            return this._context.webAbsoluteUrl + siteLinksTemplate;
        };

        return this.getData<ISiteLink[]>(restUrl,
            (responseText: string) => {
                return this._parseSiteLinks(responseText);
            },
            'GetSiteLinks',
            undefined,
            'GET',
            undefined,
            undefined,
            NUMBER_OF_RETRIES);
    }

    /**
     * Returns a promise that user was added to the group as a member
     */
    public addGroupMember(groupId: string, userId: string): Promise<any> {
        const restUrl = () => {
            return this._getUrl(
            StringHelper.format(addGroupMemberUrlTemplate, groupId, userId),
            'SP.Directory.DirectorySession');
        };

        return this.getData<any>(
            restUrl,
            undefined,
            'AddMember',
            undefined,
            'POST',
            undefined,
            undefined,
            NUMBER_OF_RETRIES);
    }

    /**
     * Returns a promise that user was added to the group as a owner
     */
    public addGroupOwner(groupId: string, userId: string): Promise<any> {
        const restUrl = () => {
            return this._getUrl(
                StringHelper.format(addGroupOwnerUrlTemplate, groupId, userId),
                'SP.Directory.DirectorySession');
        };

        return this.getData<any>(
            restUrl,
            undefined,
            'AddOwner',
            undefined,
            'POST',
            undefined,
            undefined,
            NUMBER_OF_RETRIES);
    }

    /**
     * Returns a promise that user was removed from the group as a member
     */
    public removeGroupMember(groupId: string, userId: string): Promise<any> {
        const restUrl = () => {
            return this._getUrl(
                StringHelper.format(removeGroupMemberUrlTemplate, groupId, userId),
                'SP.Directory.DirectorySession');
        };

        return this.getData<any>(
            restUrl,
            undefined,
            'RemoveMember',
            undefined,
            'POST',
            undefined,
            undefined,
            NUMBER_OF_RETRIES);
    }

    /**
     * Returns an IPerson promise of a current user given user's principal name
     * by making GetGraphUser rest call to federated directory
     */
    public getUserInfo(userPrincipalName: string): Promise<IPerson> {
        const restUrl = () => {
            return this._getUrl(
            StringHelper.format(getUserInfoUrlTemplate, UriEncoding.encodeRestUriStringToken(userPrincipalName)),
            'SP.Directory.DirectorySession');
        };

        return this.getData<IPerson>(
            restUrl,
            (responseText: string) => {
                let user: IPerson = this._parseUser(responseText);
                user.email = userPrincipalName;
                return user;
            },
            'GetGraphUser',
            undefined,
            'GET',
            undefined,
            undefined,
            NUMBER_OF_RETRIES);
    }

    /**
     * Gets the group's notebook URL from the GroupSiteManager API
     */
    public getNotebookUrl(id: string): Promise<string> {
        const restUrl = () => {
            return this._context.webAbsoluteUrl + StringHelper.format(getNotebookUrlTemplate, id);
        };

        return this.getData<string>(
            restUrl,
            (responseText: string) => {
                let response = JSON.parse(responseText);
                return response.d.Notebook;
            },
            'GetNotebookUrl',
            undefined,
            'GET',
            undefined,
            undefined,
            NUMBER_OF_RETRIES);
    }

    /**
     * Returns the group's site provisioning status in a GroupSiteInfo promise
     */
    public getSiteStatus(id: string): Promise<IGroupSiteInfo> {
        const restUrl = () => {
            return this._context.webAbsoluteUrl + StringHelper.format(getSiteStatusUrlTemplate, id);
        };

        return this.getData<IGroupSiteInfo>(
            restUrl,
            (responseText: string) => {
                return this._parseGroupSiteInfoResponse(responseText, 'GetSiteStatus');
            },
            'GetSiteStatus',
            undefined,
            'GET',
            undefined,
            undefined,
            NUMBER_OF_RETRIES);
    }

    /**
     * Kicks off group site provisioning and returns the provisioning status in a GroupSiteInfo promise
     */
    public createSite(id: string): Promise<IGroupSiteInfo> {
        const restUrl = () => {
            return this._context.webAbsoluteUrl + StringHelper.format(createSiteUrlTemplate, id);
        };

        return this.getData<IGroupSiteInfo>(restUrl,
            (responseText: string) => {
                return this._parseGroupSiteInfoResponse(responseText, 'Create');
            },
            'CreateSite',
            undefined,
            'POST',
            undefined,
            undefined,
            NUMBER_OF_RETRIES);
    }

    /**
     * returns the navigation url for files if the group hasn't provisioned yet.
     */
    public getFallbackFilesUrl(groupId: string): string {
        return this._context.webAbsoluteUrl +
            StringHelper.format(groupStatusPageTemplate, 'documents');
    }

    /**
     * Checks the existance of a site with site url.
     */
    public checkSiteExists(siteUrl: string): Promise<boolean> {
        const restUrl = () => {
            return this._context.webAbsoluteUrl +
                StringHelper.format(checkSiteExistsUrlTemplate, UriEncoding.encodeRestUriStringToken(siteUrl));
        };

        return this.getData<boolean>(
            restUrl,
            (responseText: string) => {
                let result = JSON.parse(responseText);
                return result && result.d && result.d.Exists;
            },
            'GetSiteExists',
            undefined,
            'GET',
            undefined,
            undefined,
            0 /* NumberOfRetries*/);

    }

    /**
     * get group creation context
     */
    public getGroupCreationContext(): Promise<any> {
        const restUrl = () => {
            return this._context.webAbsoluteUrl + getGroupCreationContextUrlTemplate;
        };

        return this.getData<boolean>(
            restUrl,
            (responseText: string) => {
                let result = JSON.parse(responseText);
                if (result && result.d) {
                    return result.d.GetGroupCreationContext;
                }
            },
            'GetGroupCreationContext',
            undefined,
            'GET',
            undefined,
            undefined,
            NUMBER_OF_RETRIES);
    }

    /**
     * get site Url from alias
     */
    public getSiteUrlFromAlias(alias: string): Promise<string> {
        const restUrl = () => {
            return this._context.webAbsoluteUrl + StringHelper.format(
            getSiteUrlFromAliasUrlTemplate, alias);
        };

        return this.getData<string>(
            restUrl,
            (responseText: string) => {
                let result = JSON.parse(responseText);
                if (result && result.d && result.d.GetValidSiteUrlFromAlias) {
                    return result.d.GetValidSiteUrlFromAlias;
                }
            },
            'GetSiteUrlFromAlias',
            undefined,
            'GET',
            undefined,
            undefined,
            NUMBER_OF_RETRIES);
    }

    private _parseGroupSiteInfoResponse(responseText: string, methodName: string): IGroupSiteInfo {
        let response = JSON.parse(responseText);
        let siteInfoResponse = response.d[methodName];

        let siteInfo: IGroupSiteInfo = {
            siteUrl: siteInfoResponse.SiteUrl,
            errorMessage: siteInfoResponse.ErrorMessage,
            siteStatus: siteInfoResponse.SiteStatus,
            documentsUrl: siteInfoResponse.DocumentsUrl
        };
        return siteInfo;
    }

    private _getUrl(op: string, ns: string): string {
        return this._context.webServerRelativeUrl + '/_api/' + ns + '/' + op;
    }

    private _getGroupStatusNotebookUrl(id: string): string {
        return this._context.webServerRelativeUrl +
            StringHelper.format(groupStatusPageTemplate, 'notebook');
    }

    private _fixUserImages(member: IPerson) {
        if (!member.image && member.email) {
            member.image = this._context.webServerRelativeUrl + StringHelper.format(userImageUrlTemplate, member.email);
        }

        if (!member.profilePage && member.email) {
            member.profilePage = this._context.webServerRelativeUrl + StringHelper.format(userProfileUrlTemplate, member.email);
        }
    }

    /**
     *  Remove once federated directory makes appropriate fixes
     */
    private _calculateMissingGroupProperties(group: IGroup, groupId: string) {
        if (!group.creationTime) {
            group.creationTime = Date.now();
        }

        if (group.pictureUrl) {
            group.pictureUrl = group.pictureUrl.replace('EWS/Exchange.asmx/s/GetUserPhoto', 'OWA/service.svc/s/GetPersonaPhoto');
        }

        if (!group.notebookUrl && groupId) {
            group.notebookUrl = this._getGroupStatusNotebookUrl(groupId);
        }
    }

    /**
     * Calculates and sets isOwner, isMember, isJoinPending properties in the group
     * Remove once federated directory makes appropriate fixes
     */
    private _calculateMissingMembershipProperties(groupMembership: IMembership, userLoginName: string) {
        groupMembership.membersList.members.forEach((member: IPerson) => {
            this._fixUserImages(member);
        });
    }

    /**
     * Parses and returns ISite objects
     */
    private _parseSiteLinks(responseText: string): ISiteLink[] {
        let src = JSON.parse(responseText);
        return src.d.GetSiteLinks.LinkedSites.results.map((siteLink: any) => {
            // Group pictures have incorrect picture url
            // TODO: remove picture url fix below
            // when exchange fixes picture urls in AAD
            return <ISiteLink>{
                name: siteLink.DisplayName,
                pictureUrl: siteLink.PictureUrl.replace('EWS/Exchange.asmx/s/GetUserPhoto', 'OWA/service.svc/s/GetPersonaPhoto'),
                siteId: siteLink.SiteId.toLowerCase().replace(/[{}]/g, ''),
                webId: siteLink.WebId.toLowerCase().replace(/[{}]/g, ''),
                url: siteLink.Url,
                groupId: siteLink.GroupId.toLowerCase().replace(/[{}]/g, '')
            };
        });
    }

    /**
     * Parses and returns IGroup objects
     */
    private _parseGroups(responseText: string): IGroup[] {
        let src = JSON.parse(responseText);
        return src.d.ownership.results.map((o: IRestUserGroupsFormat) => {
            return <IGroup>{
                filesUrl: o.documentsUrl,
                name: o.displayName,
                id: o.id
            };
        });
    }

    /**
     * Given response from the server convert it into a group
     */
    private _parseGroup(responseText: string): IGroup {
        let src = JSON.parse(responseText);
        let group: IGroup = this._copyGroup(src.d);
        return group;
    }

    /**
     * Given response from the server convert it into a membership
     */
    private _parseMembership(responseText: string): IMembership {
        let src = JSON.parse(responseText);
        let membership: IMembership = this._copyMembership(src.d);
        return membership;
    }

    /**
     * Given responce from the server convert into IPerson object
     */
    private _parseUser(responseText: string): IPerson {
        let src = JSON.parse(responseText);
        let user: IPerson = this._copyMember(src.d);

        return user;
    }

    /**
     * Copy from group json to group object
     */
    private _copyGroup(src: any): IGroup {
        let groupInfo: IGroup = {};

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

        if (src.classification) {
            groupInfo.classification = src.classification;
        }

        groupInfo.membership = this._copyMembership(src);
        return groupInfo;
    }

    private _copyMembership(src: any): IMembership {
        let membershipInfo: IMembership = {
            totalNumberOfMembers: src.__count
        };

        if (src && src.results) {
            let membersList: MembersList = this._copyMembers(src.results);
            membershipInfo.membersList = membersList;
        }

        return membershipInfo;
    }

    /**
     * Copy from member list json to memberList object
     */
    private _copyMembers(src: any): MembersList {
        let membersList: MembersList = new MembersList();
        let members: IPerson[] = new Array<IPerson>();
        for (let i = 0; i < src.length; i++) {
            let member: IPerson = this._copyMember(src[i]);
            members.push(member);
        }

        membersList.members = members;

        return membersList;
    }

    /**
     * Copy from json to IPerson object
     */
    private _copyMember(src: any): IPerson {
        let user: IPerson = <IPerson>{};

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

        if (src.sharePointPictureUrl) {
            user.image = src.sharePointPictureUrl;
        }

        if (src.profilePage) {
            user.profilePage = src.profilePage;
        }
        return user;
    }
}