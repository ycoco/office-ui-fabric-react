
import IContext from '../../interfaces/ISpPageContext';
import { SitePermissionsDataSource } from '../../dataSources/roleAssignments/SitePermissionsDataSource';
import ISitePermissionsDataSource from '../../dataSources/roleAssignments/ISitePermissionsDataSource';
import ISPUser from '../../dataSources/roleAssignments/ISPUser';
import AcronymAndColorDataSource, { IAcronymColor } from '../../dataSources/siteHeader/AcronymAndColorDataSource';
import Promise from '@ms/odsp-utilities/lib/async/Promise';

export interface ISitePermissionsProvider {
    /**
     * Returns a promise containing the site groups and users with permission level
     */
    getSiteGroupsAndUsersWithPermissions(): Promise<ISPUser[]>;
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
     * Returns a promise containing the site groups and users with permission level
     */
    public getSiteGroupsAndUsersWithPermissions(): Promise<ISPUser[]> {
        let groupsAndUsers: ISPUser[] = [];

        return this._dataSource.associatedPermissionGroups().then((permGroups: {}) => {
            if (permGroups) {
                let promises = [];
                for (let key in permGroups) {
                    let promise = this._dataSource.getSiteGroupAndUsersById(permGroups[key].id).then((group: ISPUser) => {
                        group.roleType = permGroups[key].roleType;
                        if (group.users && group.users.length > 0) {
                            group.users.forEach((user) => {
                                user.roleType = group.roleType;
                            });
                        }
                        groupsAndUsers[key] = group;
                    })
                    promises.push(promise);
                }

                return Promise.all(promises).then(() => { return this._fixUsersImage(groupsAndUsers); });
            } else {
                return Promise.wrap(undefined);
            }
        });
    }

    private _fixUsersImage(groups: ISPUser[]): Promise<ISPUser[]> {
        let incompleteUsers: ISPUser[] = [];

        if (groups && groups.length > 0) {
            groups.forEach((groupOrUser) => {
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
                    return groups;
                }, () => { return groups; } /*onReject*/);
            }
        }
        return Promise.wrap(groups);
    }
}

export default SitePermissionsProvider;
