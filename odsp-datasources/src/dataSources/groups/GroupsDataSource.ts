import IGroupsDataSource from './IGroupsDataSource';
import { IMembership, IOwnership } from './IMembership';
import MembersList from './MembersList';
import { IPerson } from '../peoplePicker/IPerson';
import IGroup from './IGroup';
import DataSource from '../base/DataSource';
import Promise from '@ms/odsp-utilities/lib/async/Promise';
import StringHelper = require('@ms/odsp-utilities/lib/string/StringHelper');
import UriEncoding from '@ms/odsp-utilities/lib/encoding/UriEncoding';
import ICSOMUserGroupsFormat from './ICSOMUserGroupsFormat';
import IRankedMembershipResult from './IRankedMembershipResult';
import Guid from '@ms/odsp-utilities/lib/guid/Guid';
import { IDataBatchOperationResult } from '../../interfaces/IDataBatchOperationResult';
import { DataBatchOperationHelper } from '../base/DataBatchOperationHelper';
import { IErrorData } from '../base/ServerData';

/**
 * Default number of maximum retries when error occurs during rest call.
 */
const NUMBER_OF_RETRIES: number = 3;

/**
 * Main XHR query for getting Group resources.
 * Notice new parameter yammerResources. See IYammerResources for more details.
 */
const groupBasicPropertiesUrlTemplate: string =
    'Group(\'{0}\')?$select=PrincipalName,Id,DisplayName,Alias,Description,InboxUrl,CalendarUrl,DocumentsUrl,SiteUrl,EditGroupUrl,PictureUrl,PeopleUrl,NotebookUrl,Mail,IsPublic,CreationTime,Classification,yammerResources,allowToAddGuests';
const getGroupByAliasUrlTemplate: string = 'Group(alias=\'{0}\')';
const getGroupByIdUrlTemplate: string = 'Group(\'{0}\')';
const groupMembershipUrlTemplate: string =
    'Group(\'{0}\')/{1}?$skip={2}&$top={3}&$inlinecount=allpages&$select=PrincipalName,Id,DisplayName,PictureUrl,UserType';
const addGroupMemberUrlTemplate: string = 'Group(\'{0}\')/Members/Add(objectId=\'{1}\', principalName=\'{2}\')';
const addGroupOwnerUrlTemplate: string = 'Group(\'{0}\')/Owners/Add(objectId=\'{1}\', principalName=\'{2}\')';
const removeGroupMemberUrlTemplate: string = 'Group(\'{0}\')/Members/Remove(\'{1}\')';
const removeGroupOwnerUrlTemplate: string = 'Group(\'{0}\')/Owners/Remove(\'{1}\')';
const getUserInfoUrlTemplate: string = 'User(principalName=\'{0}\')';
const userProfileUrlTemplate: string = '/_layouts/15/me.aspx?p={0}&v=profile&origin=ProfileODB';
const userImageUrlTemplate: string = '/_layouts/15/userphoto.aspx?size=S&accountname={0}';
const groupStatusPageTemplate: string = '/_layouts/15/groupstatus.aspx?id={0}&target={1}';
const getUserGroupsUrlTemplate: string =
    'User(\'{0}\')/RankedMembership?$top=100&$select=DisplayName,DocumentsUrl,SharePointPictureUrl,PictureUrl,Id,IsFavorite';
const csomGetUserGroupsBodyTemplate: string = '<Request xmlns="http://schemas.microsoft.com/sharepoint/clientquery/2009" SchemaVersion="15.0.0.0" LibraryVersion="16.0.0.0" ApplicationName="Javascript Library"><Actions><ObjectPath Id="4" ObjectPathId="3" /><Query Id="5" ObjectPathId="3"><Query SelectAllProperties="true"><Properties /></Query></Query></Actions><ObjectPaths><StaticMethod Id="3" Name="GetMyGroups" TypeId="{1e54feb9-52a0-49f7-b464-6b722cf86f94}"><Parameters><Parameter Type="String">{0}</Parameter><Parameter Type="Number">0</Parameter><Parameter Type="Number">100</Parameter></Parameters></StaticMethod></ObjectPaths></Request>';

/**
 * The string used in the userType attribute when a person is a guest user
 */
const USER_TYPE_GUEST: string = 'guest';

/**
 * The default number of owners to load.
 * May 2017 - AAD currently only allows a group to have up to 100 owners,
 * so there is no need to request more.
 */
const DEFAULT_NUMBER_OF_OWNERS: string = '100';

export default class GroupsDataSource extends DataSource implements IGroupsDataSource {

    /**
     * Copy from json to IPerson object
     */
    private static _copyMember(src: any): IPerson {
        return {
            sip: src.alias,
            userId: src.id,
            email: src.principalName, // TODO: modify API call to obtain real email
            principalName: src.principalName,
            name: src.displayName,
            job: src.title,
            image: src.sharePointPictureUrl,
            profilePage: src.profilePage,
            // If the userType returned from the server is 'guest', mark entity type as external user
            entityType: (src && src.userType && src.userType === USER_TYPE_GUEST) ? 1 /* EntityType.externalUser, use 1 to prevent perf issue */ : undefined
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
            yammerResources: src.yammerResources,
            allowToAddGuests: src.allowToAddGuests,
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

    /**
     * Given response from server, convert it into an IOwnership
     */
    private static _parseOwnership(responseText: string): IOwnership {
        const src = JSON.parse(responseText);
        return GroupsDataSource._copyOwnership(src.d);
    }

    /** Copies the response data into a IOwnership object */
    private static _copyOwnership(src: any): IOwnership {
        return {
            totalNumberOfOwners:
            (typeof src.__count === 'string') ? parseInt(<string>src.__count, 10) : src.__count,
            ownersList:
            (src && src.results) ? GroupsDataSource._copyMembers(src.results) : undefined
        };
    }

    protected getDataSourceName() {
        return 'GroupsDataSource';
    }

    /**
     * Returns a promise that includes Group's basic properties
     * Basic properties include: name, principalName, alias, mail, description, creationTime,
     * inboxUrl, calendarUrl, filesUrl, notebookUrl, pictureUrl, sharePointUrl, editUrl, membersUrl, isPublic
     * yammerResources, allowToAddGuests
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
                if (!parsedGroup.id) {
                    // ensure that the group has id.
                    parsedGroup.id = groupId;
                }
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
     * Returns a promise to update the basic properties of the specified Group
     */
    public setGroupBasicProperties(group: IGroup): Promise<void> {
        if (!group) {
            return Promise.wrapError('Group parameter is null or undefined');
        }

        const restUrl = () => this._getUrl(
            StringHelper.format(getGroupByIdUrlTemplate, group.id),
            'SP.Directory.DirectorySession');

        const postData = () => {
            let data: any = {
                __metadata: {
                    type: 'SP.Directory.Group'
                },
                displayName: group.name,
                description: group.description,
                isPublic: group.isPublic
            };

            if (group.classification) {
                data.classification = group.classification;
            }

            return JSON.stringify(data);
        };

        return this.getData<void>(
            restUrl,
            undefined /*parseResponse*/,
            'SetBasicProperties' /*qosName*/,
            postData,
            'PATCH' /*method*/,
            undefined /*additionalHeaders*/,
            undefined /*contentType*/,
            NUMBER_OF_RETRIES
        );
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
      * Returns a promise that includes Group's membership information.
      * If loadAllMembers is true, membersList will contain all members. Otherwise, will contain top three.
      * If loadOwnerInformation is true, members who are also owners will have their isOwnerOfCurrentGroup attribute set to true.
      * Otherwise, the attribute will not be set to avoid making an extra call to get the group owners.
      * Membership properties include: isMember, isOwner, isJoinPending, membersList
      *
      * TODO: Note that until we implement paging, loading all members really loads top 100.
      *
      * @param groupId - the id of the group
      * @param userLoginName - user login name passed from the page in form of user@microsoft.com
      * @param loadAllMembers - true to load all members, false to load only top three. Defaults to false.
      * @param loadOwnershipInformation - true to include information about which members are group owners. Defaults to false.
      */
    public getGroupMembership(groupId: string, userLoginName: string, loadAllMembers = false, loadOwnershipInformation = false): Promise<IMembership> {
        // TODO: implement paging for large groups
        let numberOfMembersToLoad = loadAllMembers ? '100' : '3';
        return this.getData<IMembership>(
            () => {
                return this._getUrl(
                    StringHelper.format(groupMembershipUrlTemplate, groupId, 'members', '0' /*skip zero members*/, numberOfMembersToLoad),
                    'SP.Directory.DirectorySession');
            },
            (responseText: string) => {
                let membership: IMembership = GroupsDataSource._parseMembership(responseText);
                // TODO: remove once Federated directory will start returning user membership information.
                // Calculates missing membership properties such as user images.
                this._calculateMissingMembershipProperties(membership, userLoginName);
                return membership;
            },
            'GetMembership',
            undefined,
            'GET',
            undefined,
            undefined,
            NUMBER_OF_RETRIES).then((membership: IMembership) => {
                // Augment the members with ownership information if requested
                if (loadOwnershipInformation) {
                    return this._addOwnerInformation(groupId, userLoginName, membership);
                } else {
                    return Promise.wrap(membership);
                }
            });
    }

    /**
     * Returns a promise that includes one page of group members.
     * 
     * @param groupId The id of the unified group
     * @param userLoginName Current user login name passed from the page in form of user@microsoft.com
     * @param skip Number of members to skip (aka starting index)
     * @param top Number of members to include in the page. Recommended number is 20 for best performance.
     */
    public getGroupMembershipPage(groupId: string, userLoginName: string, skip: number, top: number): Promise<IMembership> {
        return this.getData<IMembership>(
            () => {
                return this._getUrl(
                    StringHelper.format(groupMembershipUrlTemplate, groupId, 'members', skip, top),
                    'SP.Directory.DirectorySession');
            },
            (responseText: string) => {
                let membership: IMembership = GroupsDataSource._parseMembership(responseText);
                // TODO: remove once Federated directory will start returning user membership information.
                // Calculates user images.
                this._calculateMissingMembershipProperties(membership, userLoginName);
                return membership;
            },
            'GetMembershipPage',
            undefined,
            'GET',
            undefined,
            undefined,
            NUMBER_OF_RETRIES);        
    }

    /**
      * Returns a promise that includes only the Group's owners
      * Ownership properties include: totalNumberOfOwners, ownersList
      *
      * @param {string} groupId The id of the group
      * @param {string} numberOfOwnersToLoad A string representation of the number of owners to load, used in the URL template.
      * Defaults to 100, the maximum number of group owners permitted by AAD.
      */
    public getGroupOwnership(groupId: string, numberOfOwnersToLoad?: string): Promise<IOwnership> {
        let top = numberOfOwnersToLoad ? numberOfOwnersToLoad : DEFAULT_NUMBER_OF_OWNERS;
        return this.getData<IOwnership>(
            () => {
                return this._getUrl(
                    StringHelper.format(groupMembershipUrlTemplate, groupId, 'owners', '0' /*skip zero owners*/, top),
                    'SP.Directory.DirectorySession');
            },
            (responseText: string) => {
                let ownership: IOwnership = GroupsDataSource._parseOwnership(responseText);
                // Calculates user images and profile pages
                this._calculateMissingOwnershipProperties(ownership);
                return ownership;
            },
            'GetOwnership',
            undefined,
            'GET',
            undefined,
            undefined,
            NUMBER_OF_RETRIES);
    }

    /**
     * The CSOM method that retrieves the user information from Azure Active Directory‎,
     * and returns a promise that includes groups that user is a member of.
     *
     * @param user - indicates the user for which the groups are returned
     */
    public getUserGroupsFromAAD(user: IPerson): Promise<IGroup[]> {
        const csomUrl = () => {
            return this._getCsomUrl('ProcessQuery');
        };

        return this.getData<IGroup[]>(
            csomUrl,
            this._parseResponseForGetUserGroups.bind(this),
            'GetUserGroupsFromAAD',
            () => {
                return StringHelper.format(csomGetUserGroupsBodyTemplate, user.email);
            },
            'POST');
    }

    /**
     * Returns a promise that includes groups that user is a member of.
     * Calls the FBI rest endpoint by default which in turn calls Exchange and returns a sorted (Prankie) list of groups.
     * Also has a fallback that retrieves the user information from Azure Active Directory.
     *
     * @param user - indicates the user for which the groups are returned
     */
    public getUserGroups(user: IPerson): Promise<IGroup[]> {
        const GET_USER_GROUPS_FBIRANKED_RETRIES: number = 0;
        const restUrl = () => {
            return this._getUrl(StringHelper.format(getUserGroupsUrlTemplate, user.userId),
                'SP.Directory.DirectorySession');
        };

        const getUserGroupsFallback = () => {
            return this.getUserGroupsFromAAD(user);
        };

        return this.getData<IGroup[]>(
            restUrl,
            this._parseResponseForGetUserGroups.bind(this),
            'GetUserGroups',
            undefined,
            'GET',
            undefined,
            undefined,
            GET_USER_GROUPS_FBIRANKED_RETRIES).then((value: IGroup[]) => {
                if (!value || !value.length) {
                    // If we get an empty list then fallback to ADD
                    return getUserGroupsFallback();
                }
                return value;
            }, getUserGroupsFallback);
    }

    /**
     * Returns a promise that user was added to the group as a member.
     *
     * @param groupId The GUID of of the group where the member will be added.
     * @param userId The GUID of the user to be added as a member of the group.
     * @param principalName The principal name of the user to be added as a member of the group.
     * @param qosName The customized qosName, if not provided, the default qosName will be used.
     */
    public addGroupMember(groupId: string, userId?: string, principalName?: string, qosName?: string): Promise<void> {
        userId = userId ? userId : Guid.Empty;
        principalName = principalName ? principalName : '';
        const restUrl = () => {
            return this._getUrl(
                StringHelper.format(addGroupMemberUrlTemplate, groupId, userId, principalName),
                'SP.Directory.DirectorySession');
        };

        return this.getData<any>(
            restUrl,
            undefined,
            qosName || 'AddMember',
            undefined,
            'POST',
            undefined,
            undefined,
            NUMBER_OF_RETRIES);
    }

    /**
     * Returns a promise that user was added to the group as a owner.
     *
     * @param groupId The GUID of of the group where the owner will be added.
     * @param userId The GUID of the user to be added as a onwer of the group.
     * @param principalName The principal name of the user to be added as a onwer of the group.
     * @param qosName The customized qosName, if not provided, the default qosName will be used.
     */
    public addGroupOwner(groupId: string, userId?: string, principalName?: string, qosName?: string): Promise<void> {
        userId = userId ? userId : Guid.Empty;
        principalName = principalName ? principalName : '';
        const restUrl = () => {
            return this._getUrl(
                StringHelper.format(addGroupOwnerUrlTemplate, groupId, userId, principalName),
                'SP.Directory.DirectorySession');
        };

        return this.getData<any>(
            restUrl,
            undefined,
            qosName || 'AddOwner',
            undefined,
            'POST',
            undefined,
            undefined,
            NUMBER_OF_RETRIES);
    }

    /**
     * Returns a promise that user was removed from the group as a member.
     *
     * @param groupId The GUID of of the group where the member will be removed.
     * @param userId The GUID of the user to be removed from the group membership.
     * @param qosName The customized qosName, if not provided, the default qosName will be used.
     */
    public removeGroupMember(groupId: string, userId: string, qosName?: string): Promise<void> {
        const restUrl = () => {
            return this._getUrl(
                StringHelper.format(removeGroupMemberUrlTemplate, groupId, userId),
                'SP.Directory.DirectorySession');
        };

        return this.getData<any>(
            restUrl,
            undefined,
            qosName || 'RemoveMember',
            undefined,
            'POST',
            undefined,
            undefined,
            NUMBER_OF_RETRIES);
    }

    /**
     * Returns a promise that user was removed from the group as a owner.
     *
     * @param groupId The GUID of of the group where the owner will be removed.
     * @param userId The GUID of the user to be removed from the group ownership.
     * @param qosName The customized qosName, if not provided, the default qosName will be used.
     */
    public removeGroupOwner(groupId: string, userId: string, qosName?: string): Promise<void> {
        const restUrl = () => {
            return this._getUrl(
                StringHelper.format(removeGroupOwnerUrlTemplate, groupId, userId),
                'SP.Directory.DirectorySession');
        };

        return this.getData<any>(
            restUrl,
            undefined,
            qosName || 'RemoveOwner',
            undefined,
            'POST',
            undefined,
            undefined,
            NUMBER_OF_RETRIES);
    }

    /**
     * Returns a promise that add users to the group as members or owners.
     *
     * @param groupId The GUID of of the group where the members and oweners will be added.
     * @param owners The GUID of the users to be added as owners of the group.
     * @param members The GUID of the users to be added as members of the group.
     * @param ownersPrincipalName The principal names of the users to be added as members of the group.
     * @param membersPrincipalName The principal names of the users to be added as owners of the group.
     */
    public addUsersToGroup(groupId: string, owners?: string[], members?: string[], ownersPrincipalName?: string[], membersPrincipalName?: string[]): Promise<IDataBatchOperationResult> {
        let batchGuid = Guid.generate();
        let contentType = 'multipart/mixed; boundary=batch_' + batchGuid;
        let membersEndPoints = [];
        let ownersEndPoints = [];
        let ownersNumber: number = 0;
        let membersNumber: number = 0;

        const addGroupUsers = (usersArray: string[], isAddingOwner: boolean, isUsingPrincipalName: boolean) => {
            let addGroupUsersUrlTemplate = isAddingOwner ? addGroupOwnerUrlTemplate : addGroupMemberUrlTemplate;

            for (let i = 0; i < usersArray.length; i++) {
                let userId: string;
                let principalName: string;

                if (isUsingPrincipalName) {
                    principalName = usersArray[i];
                } else {
                    userId = usersArray[i];
                }

                if (userId || principalName) {
                    userId = userId ? userId : Guid.Empty;
                    principalName = principalName ? principalName : '';
                    let getUrl = this._getUrl(
                        StringHelper.format(addGroupUsersUrlTemplate, groupId, userId, principalName),
                        'SP.Directory.DirectorySession'
                    );
                    if (isAddingOwner) {
                        ownersEndPoints.push(getUrl);
                    } else {
                        membersEndPoints.push(getUrl);
                    }
                }
            }
        };

        if (owners) {
            addGroupUsers(owners, true /* isAddingOwner */, false /* isUsingPrincipalName */);
            ownersNumber = owners.length;
        } else if (ownersPrincipalName) {
            addGroupUsers(ownersPrincipalName, true /* isAddingOwner */, true /* isUsingPrincipalName */);
            ownersNumber = ownersPrincipalName.length;
        }

        if (members) {
            addGroupUsers(members, false /* isAddingOwner */, false /* isUsingPrincipalName */);
            membersNumber = members.length;
        } else if (membersPrincipalName) {
            addGroupUsers(membersPrincipalName, false /* isAddingOwner */, true /* isUsingPrincipalName */);
            membersNumber = membersPrincipalName.length;
        }

        if (ownersEndPoints.length < 1 && membersEndPoints.length < 1) {
            return;
        }

        const addUsersToGroupQosHandler = (errorData: IErrorData): string => { 
            errorData.extraData = {
                'OwnersNumber': ownersNumber,
                'MembersNumber': membersNumber
            }

            return errorData.status.toString();
         }

        // When adding members and owners to same group, they needs to be different changeset
        let batchRequestPromise = this.getData<string>(
            () => {
                return DataBatchOperationHelper.getBatchOperationUrl(this._pageContext.webAbsoluteUrl);
            } /*getUrl*/,
            (responseText: string) => {
                return responseText;
            } /*parseResponse*/,
            'AddUsersToGroup' /*qosName*/,
            () => {
                return DataBatchOperationHelper.getBatchContent(
                    batchGuid, [ownersEndPoints, membersEndPoints], 'POST', DataBatchOperationHelper.defaultBatchRequstPostData);
            } /*getAddtionalPostData*/,
            'POST' /*method*/,
            undefined /*additionalHeaders*/,
            contentType,
            undefined,
            undefined,
            undefined,
            addUsersToGroupQosHandler);

        let onExecute = (complete: (result?: IDataBatchOperationResult) => void, error: (error?: IDataBatchOperationResult) => void) => {
            batchRequestPromise.then(
                (responseFromServer: string) => {
                    let batchResponseResult: IDataBatchOperationResult = DataBatchOperationHelper.processBatchResponse(responseFromServer);
                    if (batchResponseResult.hasError) {
                        error(batchResponseResult);
                    } else {
                        complete(batchResponseResult);
                    }
                },
                (errorFromServer: any) => {
                    error(errorFromServer);
                });
        };

        return new Promise<IDataBatchOperationResult>(onExecute);
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

    /**
     * Requests the deletion of the specified group
     */
    public deleteGroup(group: IGroup): Promise<void> {
        if (!group) {
            return Promise.wrapError('Group parameter is null or undefined');
        }

        const restUrl = () => this._getUrl(
            StringHelper.format(getGroupByIdUrlTemplate, group.id),
            'SP.Directory.DirectorySession');

        return this.getData<void>(
            restUrl,
            undefined /*parseResponse*/,
            'DeleteGroup' /*qosName*/,
            undefined /*getAdditionalPostData*/,
            'DELETE' /*method*/,
            undefined /*additionalHeaders*/,
            undefined /*contentType*/,
            NUMBER_OF_RETRIES
        );
    }

    private _getUrl(op: string, ns: string): string {
        return `${this._pageContext.webAbsoluteUrl}/_api/${ns}/${op}`;
    }

    private _getCsomUrl(op: string): string {
        return `${this._pageContext.webAbsoluteUrl}/_vti_bin/client.svc/${op}`;
    }

    private _getGroupStatusNotebookUrl(groupId: string): string {
        return this._pageContext.webAbsoluteUrl +
            StringHelper.format(groupStatusPageTemplate, groupId, 'notebook');
    }

    private _getGroupStatusFilesUrl(groupId: string): string {
        return this._pageContext.webAbsoluteUrl +
            StringHelper.format(groupStatusPageTemplate, groupId, 'documents');
    }

    private _addOwnerInformation(groupId: string, userLoginName: string, membership: IMembership): Promise<IMembership> {
        // A member is an owner if he/she is present in the owners list. In theory, all owners are also present in the members list.
        // In practice, this may not be properly enforced, so we must check for any owners not found in the members list.
        // TODO: progressive loading for large numbers of owners.
        return this.getGroupOwnership(groupId, DEFAULT_NUMBER_OF_OWNERS).then((ownership: IOwnership) => {
            let ownersFromServer = ownership.ownersList.members;
            let membersFromServer = membership.membersList.members;
            let combinedMembersList: IPerson[] = [];

            let ownerDictionary = {};
            ownersFromServer.forEach((owner: IPerson) => {
                ownerDictionary[owner.userId] = true;
                // If the current user is present in the owners list, set isOwner to true
                if (owner.principalName.toLowerCase() === userLoginName.toLowerCase()) {
                    membership.isOwner = true;
                }
            });
            let numberOfOwnersFound = 0;
            let foundOwnersDictionary = {};
            membersFromServer.forEach((member: IPerson) => {
                // If the member is present in the owners list, we mark it as an owner
                if (ownerDictionary[member.userId]) {
                    member.isOwnerOfCurrentGroup = true;
                    combinedMembersList.push(member);
                    numberOfOwnersFound++;
                    foundOwnersDictionary[member.userId] = true;
                } else {
                    combinedMembersList.push(member);
                }
                if (member.principalName === userLoginName) {
                    membership.isMember = true;
                }
            });
            // Check for a malformed members list - are there any dangling owners we didn't find in the members list?
            if (numberOfOwnersFound < ownersFromServer.length) {
                ownersFromServer.forEach((owner: IPerson) => {
                    if (!foundOwnersDictionary[owner.userId]) {
                        owner.isOwnerOfCurrentGroup = true;
                        combinedMembersList.push(owner);
                    }
                })
            }
            // Use the combined list of owners and members in the IMembership object
            membership.membersList.members = combinedMembersList;
            // If owners were missing from the members list, the count of total number of members returned from the server could be
            // inaccurate. Try to correct for this to the extent possible.
            if (membership.totalNumberOfMembers < combinedMembersList.length) {
                membership.totalNumberOfMembers = combinedMembersList.length;
            }
            membership.totalNumberOfOwners = ownership.totalNumberOfOwners;
            return Promise.wrap(membership);
        });
    }

    private _fixUserImages(member: IPerson) {
        if (!member.image && member.email) {
            member.image = StringHelper.format(userImageUrlTemplate, member.email);
        }

        if (!member.profilePage && member.email) {
            member.profilePage = StringHelper.format(userProfileUrlTemplate, member.email);
        }
    }

    /**
     * Calculates and sets member image and profile page
     * Remove once federated directory makes appropriate fixes
     */
    private _calculateMissingMembershipProperties(groupMembership: IMembership, userLoginName: string) {
        groupMembership.membersList.members.forEach((member: IPerson) => {
            this._fixUserImages(member);
        });
    }

    /**
     * Calculates and sets image and profile page for each group owner
     * 
     * @param {IOwnership} groupOwnership - the IOwnership object containing the group's owners
     */
    private _calculateMissingOwnershipProperties(groupOwnership: IOwnership) {
        groupOwnership.ownersList.members.forEach((owner: IPerson) => {
            this._fixUserImages(owner);
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

    /**
     *  Parse the response for the getUserGroups and getUserGroupsFallback.
     */
    private _parseResponseForGetUserGroups(responseText: string) {
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
}
