// OneDrive:IgnoreCodeCoverage

import Promise from '@ms/odsp-utilities/lib/async/Promise';
import DataSource from '../base/DataSource';
import { getSafeWebServerRelativeUrl } from '../../interfaces/ISpPageContext';
import ISitePermissionsDataSource from './ISitePermissionsDataSource';
import ISPUser from './ISPUser';
import StringHelper = require('@ms/odsp-utilities/lib/string/StringHelper');

const USER_IMAGE_URL_TEMPLATE: string = '/_layouts/15/userphoto.aspx?size=S&accountname={0}';

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

    /**
     * Parses and returns ISPUser objects
     */
    private _parseSiteGroupsAndUsers(responseText: string): ISPUser[] {
        let src = JSON.parse(responseText);
        return ((src && src.d && src.d.results && src.d.results.length > 0) ? src.d.results.map((o: any) => {
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
                        loginName: u.LoginName,
                        isSiteAdmin: u.IsSiteAdmin,
                        principalType: u.PrincipalType,
                        title: u.Title,
                        urlImage: this._fixUserImage(u)
                    };
                }) : undefined)
            };
        }) : responseText);
    }

    private _fixUserImage(u: any): string {
        if (u.PrincipalType === 1 && u.Email) {
            return this._pageContext.webAbsoluteUrl + StringHelper.format(USER_IMAGE_URL_TEMPLATE, u.Email);
        }
        return undefined;
    }
}
export default SitePermissionsDataSource ;
