// OneDrive:IgnoreCodeCoverage

import IGroupsDataSource from './IGroupsDataSource';
import IMembership from './IMembership';
import MembersList from './MembersList';
import IPerson  from '../peoplePicker/IPerson';
import IGroup from './IGroup';
import IContext from '../base/IContext';
import DataSource from '../base/DataSource';
import Promise from '@ms/odsp-utilities/lib/async/Promise';
import StringHelper = require('@ms/odsp-utilities/lib/string/StringHelper');
import UriEncoding from '@ms/odsp-utilities/lib/encoding/UriEncoding';
import ICSOMUserGroupsFormat from './ICSOMUserGroupsFormat';
import IRankedMembershipResult from './IRankedMembershipResult';

/**
 * Default number of maximum retries when error occurs during rest call.
 */
const NUMBER_OF_RETRIES: number = 3;

const groupBasicPropertiesUrlTemplate: string =
    'Group(\'{0}\')?$select=PrincipalName,DisplayName,Alias,Description,InboxUrl,CalendarUrl,DocumentsUrl,SiteUrl,EditGroupUrl,PictureUrl,PeopleUrl,NotebookUrl,Mail,IsPublic,CreationTime,Classification';
const getGroupByAliasUrlTemplate: string = 'Group(alias=\'{0}\')';
const groupMembershipUrlTemplate: string =
    'Group(\'{0}\')/members?$top=3&$inlinecount=allpages&$select=PrincipalName,Id,DisplayName,PictureUrl';
const addGroupMemberUrlTemplate: string = 'Group(\'{0}\')/Members/Add(principalName=\'{1}\')';
const addGroupOwnerUrlTemplate: string = 'Group(\'{0}\')/Owners/Add(principalName=\'{1}\')';
const removeGroupMemberUrlTemplate: string = 'Group(\'{0}\')/Members/Remove(\'{1}\')';
const getUserInfoUrlTemplate: string = 'User(principalName=\'{0}\')';
const userProfileUrlTemplate: string = '/_layouts/15/me.aspx?p={0}&v=profile&origin=ProfileODB';
const userImageUrlTemplate: string = '/_layouts/15/userphoto.aspx?size=S&accountname={0}';
const groupStatusPageTemplate: string = '/_layouts/15/groupstatus.aspx?id={0}&target={1}';
const getUserGroupsUrlTemplate: string =
    'User(\'{0}\')/RankedMembership?$top=100&$select=DisplayName,DocumentsUrl,SharePointPictureUrl,Id,IsFavorite';
const csomGetUserGroupsBodyTemplate: string = '<Request xmlns="http://schemas.microsoft.com/sharepoint/clientquery/2009" SchemaVersion="15.0.0.0" LibraryVersion="16.0.0.0" ApplicationName="Javascript Library"><Actions><ObjectPath Id="4" ObjectPathId="3" /><Query Id="5" ObjectPathId="3"><Query SelectAllProperties="true"><Properties /></Query></Query></Actions><ObjectPaths><StaticMethod Id="3" Name="GetMyGroups" TypeId="{1e54feb9-52a0-49f7-b464-6b722cf86f94}"><Parameters><Parameter Type="String">{0}</Parameter><Parameter Type="Number">0</Parameter><Parameter Type="Number">100</Parameter></Parameters></StaticMethod></ObjectPaths></Request>';

export default class GroupsDataSource extends DataSource implements IGroupsDataSource {

    /**
     * Copy from json to IPerson object
     */
    private static _copyMember(src: any): IPerson {
        return {
            sip: src.alias,
            userId: src.id,
            email: src.principalName,
            name: src.displayName,
            job: src.title,
            image: src.sharePointPictureUrl,
            profilePage: src.profilePage
        };
    }

    /**
     * Given response from the server convert it into IPerson object
     */
    private static _parseUser(responseText: string): IPerson {
        const src = JSON.parse(responseText);
        return GroupsDataSource._copyMember(src.d);
    }

    /**
     * Copy from member list json to MemberList object
     */
    private static _copyMembers(src: any[]): MembersList {
        let membersList: MembersList = new MembersList();
        membersList.members = src.map<IPerson>(
            (member: any) => {
                return GroupsDataSource._copyMember(member);
            });
        return membersList;
    }

    /**
     * Given response from the server convert it into a group
     */
    private static _parseGroup(responseText: string): IGroup {
        const src = JSON.parse(responseText);
        return GroupsDataSource._copyGroup(src.d);
    }

    /**
     * Given response from the server convert it into a membership
     */
    private static _parseMembership(responseText: string): IMembership {
        const src = JSON.parse(responseText);
        return GroupsDataSource._copyMembership(src.d);
    }

    /**
     * Copy from group json to group object
     */
    private static _copyGroup(src: any): IGroup {
        return {
            description: src.description,
            alias: src.alias,
            name: src.displayName,
            principalName: src.principalName,
            creationTime: src.creationTime,
            pictureUrl: src.pictureUrl,
            inboxUrl: src.inboxUrl,
            calendarUrl: src.calendarUrl,
            filesUrl: src.documentsUrl,
            sharePointUrl: src.siteUrl,
            editUrl: src.editGroupUrl,
            membersUrl: src.peopleUrl,
            notebookUrl: src.notebookUrl,
            isPublic: src.isPublic,
            mail: src.mail,
            classification: src.classification,
            membership: GroupsDataSource._copyMembership(src)
        };
    }

    /** Copies the response data into a IMembership object */
    private static _copyMembership(src: any): IMembership {
        return {
            totalNumberOfMembers:
            (typeof src.__count === 'string') ? parseInt(<string>src.__count, 10) : src.__count,
            membersList:
            (src && src.results) ? GroupsDataSource._copyMembers(src.results) : undefined
        };
    }

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
                let parsedGroup: IGroup = GroupsDataSource._parseGroup(responseText);
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
                let parsedGroup: IGroup = GroupsDataSource._parseGroup(responseText);
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
                let membership: IMembership = GroupsDataSource._parseMembership(responseText);

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
     * Returns a promise that includes groups that user is a member of
     */
    public getUserGroups(user: IPerson): Promise<IGroup[]> {
        const GET_USER_GROUPS_FBIRANKED_RETRIES: number = 0;
        const restUrl = () => {
            return this._getUrl(StringHelper.format(getUserGroupsUrlTemplate, user.userId),
                'SP.Directory.DirectorySession');
        };

        const parseResponse = (responseText: string) => {
            const r = JSON.parse(responseText);
            // CSOM call will return an array
            if (r.constructor === Array) {
                return r[4].GroupsList.map((obj: ICSOMUserGroupsFormat) => {
                    return <IGroup>{
                        filesUrl: obj.DocumentsUrl,
                        name: obj.DisplayName,
                        id: obj.Id
                    };
                });
            } else {
                // RankedMembership REST call
                const restResults: IRankedMembershipResult[] = r.d.results;
                let results = restResults.map((obj: IRankedMembershipResult) => {
                    let group: IGroup = <IGroup>{
                        filesUrl: obj.documentsUrl,
                        name: obj.displayName,
                        id: obj.id,
                        pictureUrl: obj.pictureUrl,
                        isFavorite: obj.isFavorite
                    };

                    this._calculateMissingGroupProperties(group, group.id);
                    return group;
                });

                // Results that we receive from the server are backwards
                let sortedGroups = results.filter((group: IGroup) => group.isFavorite);
                sortedGroups.push.apply(sortedGroups, (results.filter((group: IGroup) => !group.isFavorite)));
                return sortedGroups;
            }
        };

        const getUserGroupsFallback = () => {
            const csomUrl = () => {
                return this._getCsomUrl('ProcessQuery');
            };

            return this.getData<IGroup>(
                csomUrl,
                parseResponse,
                'GetUserGroupsFallback',
                () => {
                    return StringHelper.format(csomGetUserGroupsBodyTemplate, user.email);
                },
                'POST');
        };

        return this.getData<IGroup[]>(
            restUrl,
            parseResponse,
            'GetUserGroups',
            undefined,
            'GET',
            undefined,
            undefined,
            GET_USER_GROUPS_FBIRANKED_RETRIES).then(
                (value: IGroup[]) => { return value; },
                getUserGroupsFallback);
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
                let user: IPerson = GroupsDataSource._parseUser(responseText);
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

    private _getUrl(op: string, ns: string): string {
        return this._context.webServerRelativeUrl + '/_api/' + ns + '/' + op;
    }

    private _getCsomUrl(op: string): string {
        return this._context.webServerRelativeUrl + '/_vti_bin/client.svc/' + op;
    }

    private _getGroupStatusNotebookUrl(groupId: string): string {
        return this._context.webServerRelativeUrl +
            StringHelper.format(groupStatusPageTemplate, groupId, 'notebook');
    }

    private _getGroupStatusFilesUrl(groupId: string): string {
        return this._context.webServerRelativeUrl +
            StringHelper.format(groupStatusPageTemplate, groupId, 'documents');
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
     * Calculates and sets isOwner, isMember, isJoinPending properties in the group
     * Remove once federated directory makes appropriate fixes
     */
    private _calculateMissingMembershipProperties(groupMembership: IMembership, userLoginName: string) {
        groupMembership.membersList.members.forEach((member: IPerson) => {
            this._fixUserImages(member);
        });
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

        if (!group.filesUrl && groupId) {
            group.filesUrl = this._getGroupStatusFilesUrl(groupId);
        }
    }
}