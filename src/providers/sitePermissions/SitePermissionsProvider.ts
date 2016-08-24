
import IContext from '../../interfaces/ISpPageContext';
import SitePermissionsDataSource from '../../dataSources/roleAssignments/SitePermissionsDataSource';
import ISitePermissionsDataSource from '../../dataSources/roleAssignments/ISitePermissionsDataSource';
import ISPUser from '../../dataSources/roleAssignments/ISPUser';
import AcronymAndColorDataSource, { IAcronymColor } from '../../dataSources/siteHeader/AcronymAndColorDataSource';
import Promise from '@ms/odsp-utilities/lib/async/Promise';

export interface ISitePermissionsProvider {
    /**
     * Returns a promise containing the site groups and users
     */
    getSiteGroupsAndUsers(): Promise<ISPUser[]>;
}

const COLOR_SERVICE_POSSIBLE_COLORS: string[] = [
    '#0078d7',
    '#088272',
    '#107c10',
    '#881798',
    '#b4009e',
    '#e81123',
    '#da3b01',
    '#006f94',
    '#005e50',
    '#004e8c',
    '#a80000',
    '#4e257f'
];

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

        return this._dataSource.getSiteGroupsAndUsers().then((value: ISPUser[]) => {
            let noEmailUsersTitle: string[] = [];
            let noEmailUsers: ISPUser[] = [];

            for (let i = 0; i < value.length; i++) {

                if (value[i].users && value[i].users.length > 0) {

                    let spuser = value[i];
                    for (let j = 0; j < spuser.users.length; j++) {
                        if (!spuser.users[j].urlImage) {
                            noEmailUsersTitle.push(spuser.users[j].title);
                            noEmailUsers.push(spuser.users[j]);
                        }
                    }
                }
            }

            if (noEmailUsersTitle && noEmailUsersTitle.length > 0) {
                return this._siteHeaderLogoAcronymDataSource.getAcronyms(noEmailUsersTitle).then((val: IAcronymColor[]) => {
                    for (let i = 0; i < val.length; i++) {
                        noEmailUsers[i].imageInitials = val[i].acronym;
                        noEmailUsers[i].initialsColor = (COLOR_SERVICE_POSSIBLE_COLORS.indexOf(val[i].color) + 1);
                    }
                    return value;
                });
            }
            return Promise.wrap(value);
        });
    }
}

export default SitePermissionsProvider;