// OneDrive:IgnoreCodeCoverage

import Promise from '@ms/odsp-utilities/lib/async/Promise';
import DataSource from '../base/DataSource';
import { getSafeWebServerRelativeUrl } from '../../interfaces/ISpPageContext';
import ISitePermissionsDataSource from './ISitePermissionsDataSource';
import { ISPUser, RoleType } from './ISPUser';
import StringHelper = require('@ms/odsp-utilities/lib/string/StringHelper');

const USER_IMAGE_URL_TEMPLATE: string = '/_layouts/15/userphoto.aspx?size=S&accountname={0}';
const NUMBER_OF_RETRIES: number = 3;
const addRoleAssignmentUrlTemplate: string = 'web/RoleAssignments/addroleassignment(principalid=\{0}\,roledefid=\{1}\)';
const removeRoleAssignmentUrlTemplate: string = 'web/RoleAssignments/removeroleassignment(principalid=\{0}\,roledefid=\{1}\)';
const removeFromGroupByIdUrlTemplate: string = 'web/sitegroups(id=\{0}\)/users/removebyid(id=\{1}\)';
const addUserToGroupUrlTemplate: string = 'web/sitegroups(id=\{0}\)/users';

/**
 * The enum of assciated permission groups, which get from associatedPermissionGroups().
 * The order is the important, this is the we want to render in UI.
 */
export enum AssociatedPermGroups {
    Owners,
    Members,
    Vistors
}

export class SitePermissionsDataSource extends DataSource implements ISitePermissionsDataSource {
    protected getDataSourceName() {
        return 'SitePermissionsDataSource';
    }

    public getSiteGroupsAndUsers(): Promise<ISPUser[]> {
        return this.getData<ISPUser[]>(
            () => getSafeWebServerRelativeUrl(this._pageContext) + '/_api/web/SiteGroups?$expand=Users',
            (responseText: string) => {
                return this._parseSiteGroupsAndUsers(responseText);
            },
            'GetSiteGroupsAndUsers',
            undefined,
            'GET'
        );
    }

    public getSiteGroupAndUsersById(id: number): Promise<ISPUser> {
        return this.getData<ISPUser>(
            () => getSafeWebServerRelativeUrl(this._pageContext) + `/_api/web/SiteGroups/GetById(id=${id})?$expand=Users`,
            (responseText: string) => {
                return this._parseSiteGroupAndUsers(responseText);
            },
            'GetSiteGroupAndUsersById',
            undefined,
            'GET'
        );
    }

    public associatedPermissionGroups(): Promise<any> {
        return this.getData<{}>(
            () => getSafeWebServerRelativeUrl(this._pageContext) + '/_api/web?$expand=AssociatedOwnerGroup,AssociatedMemberGroup,AssociatedVisitorGroup',
            (responseText: string) => {
                return this._parseAssociatedPermissionGroups(responseText);
            },
            'associatedPermissionGroups',
            undefined,
            'GET'
        );
    }

    public addRoleAssignment(principalid: string, roledefid: string): Promise<void> {
        const restUrl = () => {
            return this._getUrl(StringHelper.format(addRoleAssignmentUrlTemplate, principalid, roledefid));
        };

        return this.getData<any>(
            restUrl,
            undefined,
            'AddRoleAssignment',
            undefined,
            'POST',
            undefined,
            undefined,
            NUMBER_OF_RETRIES);
    }

    public removeRoleAssignment(principalid: string, roledefid: string): Promise<void> {
        const restUrl = () => {
            return this._getUrl(StringHelper.format(removeRoleAssignmentUrlTemplate, principalid, roledefid));
        };

        return this.getData<any>(
            restUrl,
            undefined,
            'RemoveRoleAssignment',
            undefined,
            'POST',
            undefined,
            undefined,
            NUMBER_OF_RETRIES);
    }

    public addUserToGroup(groupId: string, loginName: string): Promise<void> {
        const restUrl = () => {
            return this._getUrl(StringHelper.format(addUserToGroupUrlTemplate, groupId));
        };

        let postBody = {
            '__metadata': {
                'type': 'SP.User'
            },
            'LoginName': loginName
        };

        return this.getData<any>(
            restUrl,
            undefined,
            'addToGroupById',
            () => JSON.stringify(postBody),
            'POST',
            undefined,
            undefined,
            NUMBER_OF_RETRIES);
    }

    public removeFromGroupById(groupId: string, userId: string): Promise<void> {
        const restUrl = () => {
            return this._getUrl(StringHelper.format(removeFromGroupByIdUrlTemplate, groupId, userId));
        };

        return this.getData<any>(
            restUrl,
            undefined,
            'removeFromGroupById',
            undefined,
            'POST',
            undefined,
            undefined,
            NUMBER_OF_RETRIES);
    }

    /**
     * Parses and returns ISPUser objects
     */
    private _parseSiteGroupsAndUsers(responseText: string): ISPUser[] {
        let src = JSON.parse(responseText);
        return ((src && src.d && src.d.results && src.d.results.length > 0) ? src.d.results.map((o: any) => {
            return this._parseSPUser(o);
        }) : responseText);
    }

    /**
     * Parses and returns one ISPUser object
     */
    private _parseSiteGroupAndUsers(responseText: string): ISPUser {
        let src = JSON.parse(responseText);
        return (src && src.d) ? this._parseSPUser(src.d) : undefined;
    }

    private _parseSPUser(o: any): ISPUser {
        return <ISPUser>{
            id: o.Id,
            loginName: o.LoginName,
            principalType: o.PrincipalType,
            title: o.Title,
            allowMembersEditMembership: o.AllowMembersEditMembership,
            allowRequestToJoinLeave: o.AllowRequestToJoinLeave,
            autoAcceptRequestToJoinLeave: o.AutoAcceptRequestToJoinLeave,
            description: o.Description,
            users: ((o.Users && o.Users.results && o.Users.results.length > 0) ? o.Users.results.map((u: any) => {
                return <ISPUser>{
                    id: u.Id,
                    principalId: o.Id,
                    loginName: u.LoginName,
                    isSiteAdmin: u.IsSiteAdmin,
                    principalType: u.PrincipalType,
                    title: u.Title,
                    urlImage: this._fixUserImage(u)
                };
            }) : undefined)
        };
    }

    /**
     * Parses and returns a dictionary containing ISPUser objects
     */
    private _parseAssociatedPermissionGroups(responseText: string): {} {
        let src = JSON.parse(responseText);
        let groupsDict = {};
        if (src && src.d && src.d.AssociatedMemberGroup && src.d.AssociatedOwnerGroup && src.d.AssociatedVisitorGroup) {
            this._addGroupToDictionary(groupsDict, src.d.AssociatedMemberGroup, RoleType.Edit, AssociatedPermGroups.Members);
            this._addGroupToDictionary(groupsDict, src.d.AssociatedOwnerGroup, RoleType.Administrator, AssociatedPermGroups.Owners);
            this._addGroupToDictionary(groupsDict, src.d.AssociatedVisitorGroup, RoleType.Reader, AssociatedPermGroups.Vistors);
        }
        return groupsDict;
    }

    private _addGroupToDictionary(groupsDict: {}, associatedGroup: any, roleType: RoleType, key: AssociatedPermGroups) {
        groupsDict[key] =
            <ISPUser>{
                id: associatedGroup.Id,
                loginName: associatedGroup.LoginName,
                principalType: associatedGroup.PrincipalType,
                title: associatedGroup.Title,
                roleType: roleType
            };
    }

    private _fixUserImage(u: any): string {
        if (u.PrincipalType === 1 && u.Email) {
            return StringHelper.format(USER_IMAGE_URL_TEMPLATE, u.Email);
        }
        return undefined;
    }

    private _getUrl(op: string): string {
        return `${this._pageContext.webAbsoluteUrl}/_api/${op}`;
    }
}
export default SitePermissionsDataSource;
