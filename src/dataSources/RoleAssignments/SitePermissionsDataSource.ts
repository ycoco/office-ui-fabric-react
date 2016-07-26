// OneDrive:IgnoreCodeCoverage

import Promise from '@ms/odsp-utilities/lib/async/Promise';
import DataSource from '../base/DataSource';
import IContext from '../base/IContext';
import ISitePermissionsDataSource from './ISitePermissionsDataSource';
import ISPUser from './ISPUser';

export class SitePermissionsDataSource extends DataSource implements ISitePermissionsDataSource {
    constructor(context: IContext) {
        super(context);
    }

    protected getDataSourceName() {
        return 'SitePermissionsDataSource';
    }

    public getSiteGroupsAndUsers(): Promise<ISPUser[]> {
        return this.getData<ISPUser[]>(
            () => this._context.webServerRelativeUrl + '_api/web/SiteGroups?$expand=Users',
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
                        title: o.Title
                    };
                }) : undefined)
            };
        }) : responseText);
    }
}
export default SitePermissionsDataSource ;
