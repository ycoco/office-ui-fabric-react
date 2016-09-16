
import IContext from '../../interfaces/ISpPageContext';
import SitePermissionsDataSource from '../../dataSources/roleAssignments/SitePermissionsDataSource';
import ISitePermissionsDataSource from '../../dataSources/roleAssignments/ISitePermissionsDataSource';
import ISPUser, { IRoleDefinitionProps } from '../../dataSources/roleAssignments/ISPUser';
import AcronymAndColorDataSource, { IAcronymColor } from '../../dataSources/siteHeader/AcronymAndColorDataSource';
import Promise from '@ms/odsp-utilities/lib/async/Promise';

export interface ISitePermissionsProvider {
    /**
     * Returns a promise containing the site groups and users
     */
    getSiteGroupsAndUsers(): Promise<ISPUser[]>;
}

/**
 * Site Permissions provider
 */
export class SitePermissionsProvider implements ISitePermissionsProvider {

    private _context: IContext;
    private _dataSource: ISitePermissionsDataSource;
    private _siteHeaderLogoAcronymDataSource: AcronymAndColorDataSource;

    constructor(context: IContext) {
        this._context = context;
        this._dataSource = new SitePermissionsDataSource(this._context);
        this._siteHeaderLogoAcronymDataSource = new AcronymAndColorDataSource(this._context);
    }

    /**
     * Returns a promise containing the site groups and users
     */
    public getSiteGroupsAndUsers(): Promise<ISPUser[]> {

        return this._dataSource.getSiteGroupsAndUsers().then((siteGroupsAndUsers: ISPUser[]) => {
            let incompleteUsers: ISPUser[] = [];

            if (siteGroupsAndUsers && siteGroupsAndUsers.length > 0) {
                siteGroupsAndUsers.forEach((groupOrUser) => {
                    if (groupOrUser.users && groupOrUser.users.length > 0) {
                        groupOrUser.users.forEach((user) => {
                            if (!user.urlImage) {
                                incompleteUsers.push(user);
                            }
                        });
                    }
                });

                if (incompleteUsers && incompleteUsers.length > 0) {
                    return this._siteHeaderLogoAcronymDataSource.getAcronyms(incompleteUsers.map(user => user.title)).then((acronyms: IAcronymColor[]) => {
                        if (acronyms && acronyms.length > 0) {
                            for (let i = 0; i < acronyms.length; i++) {
                                incompleteUsers[i].imageInitials = acronyms[i].acronym;
                                incompleteUsers[i].initialsColor = AcronymAndColorDataSource.decodeAcronymColor(acronyms[i].color);
                            }
                        }
                        return siteGroupsAndUsers;
                    });
                }
            }
            return Promise.wrap(siteGroupsAndUsers);
        });
    }

    /**
     * Returns a promise containing the site groups and users with permission level
     */
    public getSiteGroupsAndUsersWithPermissions(): Promise<ISPUser[]> {
        return this.getSiteGroupsAndUsers().then((groupOrUser: ISPUser[]) => {
            return this._dataSource.roleAssignments().then((roles: IRoleDefinitionProps[]) => {
                let roleDictionary = {};
                roles.forEach((role) => {
                    roleDictionary[role.id] = role.roleDefinitionBindings;
                });
                groupOrUser.forEach((group) => {
                    group.roleDefinitionBindings = roleDictionary[group.id];
                    group.roleType = group.roleDefinitionBindings[0].roleKindType;
                    group.users.forEach((user) => {
                        user.roleDefinitionBindings = roleDictionary[user.principalId];
                    });
                });
                return Promise.wrap(groupOrUser);
            });
        });
    }
}

export default SitePermissionsProvider;
