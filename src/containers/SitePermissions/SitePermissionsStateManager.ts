// OneDrive:IgnoreCodeCoverage

import { ISitePermissionsPanelProps } from '../../components/SitePermissionsPanel';
import { ISpPageContext } from '@ms/odsp-datasources/lib/interfaces/ISpPageContext';
import { ISitePermissionsPanelContainerStateManagerParams, ISitePermissionsPanelContainerState } from './SitePermissionsStateManager.Props';
import { ISitePermissionsProps, ISitePersonaPermissions } from '../../components/SitePermissions/SitePermissions.Props';
import { ISPUser, RoleType } from '@ms/odsp-datasources/lib/SitePermissions';
import { SitePermissionsProvider } from '@ms/odsp-datasources/lib/SitePermissions';
import { SitePermissionsDataSource } from '@ms/odsp-datasources/lib/SitePermissions';
import EventGroup from '@ms/odsp-utilities/lib/events/EventGroup';
import { GroupsProvider, IGroupsProvider, SourceType } from '@ms/odsp-datasources/lib/Groups';
import { IContextualMenuItem } from 'office-ui-fabric-react/lib/components/ContextualMenu/index';

const SYSTEM_ACCOUNT_LOGIN = 'SHAREPOINT\\system';

export enum PermissionLevel {
    FullControl,
    Edit,
    Read
}

const ROLE_PERMISSION_MAP = {
    [RoleType.Guest]: PermissionLevel.Read,
    [RoleType.Reader]: PermissionLevel.Read,
    [RoleType.Contributor]: PermissionLevel.Edit,
    [RoleType.WebDesigner]: PermissionLevel.Edit,
    [RoleType.Edit]: PermissionLevel.Edit,
    [RoleType.Administrator]: PermissionLevel.FullControl
};

/**
 * This class manages the state of the SitePermissionsPanel component.
 */
export default class SitePermissionsPanelStateManager {
    private _pageContext: ISpPageContext;
    private _params: ISitePermissionsPanelContainerStateManagerParams;
    private _groupsProvider: IGroupsProvider;
    private _sitePermissionsDataSource: SitePermissionsDataSource;
    private _eventGroup: EventGroup;
    private _sitePermissionsProvider: SitePermissionsProvider;
    private _permissionGroups = {};

    constructor(params: ISitePermissionsPanelContainerStateManagerParams) {
        this._params = params;
        this._pageContext = params.pageContext;
        this._sitePermissionsProvider = new SitePermissionsProvider(this._params.pageContext);
        this._sitePermissionsDataSource = new SitePermissionsDataSource(this._params.pageContext);
        this.setPropsState(this._sitePermissionsProvider);
    }

    public componentDidMount() {
        const params = this._params;
        this._groupsProvider = new GroupsProvider({
            pageContext: params.pageContext
        });
        const group = this._groupsProvider.group;

        let loadGroupProperties = (source: SourceType) => {
            if (source !== SourceType.None) {
                // either Group source is Server or Cached...
                this.setState({
                    title: this._params.title
                });
            }
        };

        // react to Group source data being updated
        this._eventGroup = new EventGroup(this);
        this._eventGroup.on(group, 'source', loadGroupProperties);
        loadGroupProperties(group.source);
    }

    public componentWillUnmount() {
        if (this._eventGroup) {
            this._eventGroup.dispose();
            this._eventGroup = null;
        }
    }

    public getRenderProps(): ISitePermissionsPanelProps {
        const params = this._params;
        const state = params.sitePermissionsPanel.state;
        return {
            title: (state !== null) ? state.title : params.title,
            sitePermissions: (state !== null) ? state.sitePermissions : undefined,
            panelDescription: this._params.panelDescription,
            invitePeople: this._params.invitePeople,
            showShareSiteOnly: (state !== null) ? state.showShareSiteOnly : false,
            menuItems: this._getPanelAddMenu()
        };
    }

    private setState(state: ISitePermissionsPanelContainerState) {
        this._params.sitePermissionsPanel.setState(state);
    }

    private setPropsState(sitePermissions: SitePermissionsProvider): void {
        let sitePermissionsPropsArray: ISitePermissionsProps[];
        sitePermissionsPropsArray = new Array();

        this._sitePermissionsProvider.getSiteGroupsAndUsersWithPermissions().done((groupsAndUsers: ISPUser[]) => {

            if (groupsAndUsers && groupsAndUsers.length > 0) {
                groupsAndUsers.forEach((group) => {
                    this._permissionGroups[ROLE_PERMISSION_MAP[group.roleType]] = group.id;

                    let _personas: ISitePersonaPermissions[] = this.getPersona(group);
                    sitePermissionsPropsArray.push({
                        personas: _personas,
                        title: this._getTitle(group),
                        permLevel: ROLE_PERMISSION_MAP[group.roleType]
                    });
                });

                this._params.sitePermissionsPanel.setState({
                    title: this._params.title,
                    sitePermissions: this._orderGroups(sitePermissionsPropsArray),
                    menuItems: this._getPanelAddMenu()
                });
            }
        });
    }

    private getPersona(spUser: ISPUser): ISitePersonaPermissions[] {
        let personas: ISitePersonaPermissions[];
        personas = new Array();
        if (spUser.users && spUser.users.length > 0) {
            for (let i = 0; i < spUser.users.length; i++) {
                let user = spUser.users[i];
                if (user.loginName !== SYSTEM_ACCOUNT_LOGIN) {
                    personas.push({
                        name: user.title,
                        imageUrl: user.urlImage,
                        initialsColor: user.initialsColor,
                        imageInitials: user.imageInitials,
                        menuItems: this.getUserPermissions(user, spUser)

                    });
                }
            }
        }
        return personas;
    }

    // TODO: localize strings and filter out the current role
    private getUserPermissions(user: ISPUser, group: ISPUser): IContextualMenuItem[] {
        let menuItems: IContextualMenuItem[] = [];

        switch (ROLE_PERMISSION_MAP[group.roleType]) {
            case PermissionLevel.FullControl:
                menuItems.push(
                    {
                        name: this._params.edit, key: 'edit', onClick: onClick => { this._updatePerm(user, this._permissionGroups[PermissionLevel.Edit]); }
                    },
                    {
                        name: this._params.read, key: 'read', onClick: onClick => { this._updatePerm(user, this._permissionGroups[PermissionLevel.Read]); }
                    });
                break;
            case PermissionLevel.Edit:
                menuItems.push(
                    {
                        name: this._params.fullControl, key: 'full', onClick: onClick => { this._updatePerm(user, this._permissionGroups[PermissionLevel.FullControl]); }
                    },
                    {
                        name: this._params.read, key: 'read', onClick: onClick => { this._updatePerm(user, this._permissionGroups[PermissionLevel.Read]); }
                    });
                break;
            case PermissionLevel.Read:
                menuItems.push(
                    {
                        name: this._params.fullControl, key: 'full', onClick: onClick => { this._updatePerm(user, this._permissionGroups[PermissionLevel.FullControl]); }
                    },
                    {
                        name: this._params.edit, key: 'edit', onClick: onClick => { this._updatePerm(user, this._permissionGroups[PermissionLevel.Edit]); }
                    });
                break;
        }
        return menuItems;
    }

    private _updatePerm(spUser: ISPUser, newRoleId: string): void {
        this._sitePermissionsDataSource.addUserToGroup(newRoleId, spUser.loginName).then(() => {
            this._sitePermissionsDataSource.removeFromGroupById(spUser.principalId.toString(), spUser.id.toString()).then(() => {
                this.setPropsState(this._sitePermissionsProvider);
            });
        });
    }

    private _getTitle(group): string {
        switch (ROLE_PERMISSION_MAP[group.roleType]) {
            case PermissionLevel.FullControl:
                return this._params.fullControl;
            case PermissionLevel.Edit:
                return this._params.edit;
            case PermissionLevel.Read:
                return this._params.read;
            default:
                return '';
        }
    }

    private _orderGroups(sitePermissionsPropsArray: ISitePermissionsProps[]): ISitePermissionsProps[] {
        if (sitePermissionsPropsArray[0].permLevel.toString() === PermissionLevel.Edit.toString() &&
            sitePermissionsPropsArray[1].permLevel.toString() === PermissionLevel.FullControl.toString()) {
            let tempGroup = sitePermissionsPropsArray[0];
            sitePermissionsPropsArray[0] = sitePermissionsPropsArray[1];
            sitePermissionsPropsArray[1] = tempGroup;
            return sitePermissionsPropsArray;
        }
    }

    private _getPanelAddMenu(): IContextualMenuItem[] {
        let menuItems: IContextualMenuItem[] = [];
         menuItems.push(
                    { name: this._params.addMembersToGroup, key: 'addToGroup' },
                    { name: this._params.shareSiteOnly, key: 'shareSiteOnly', onClick: onClick => { this._shareSiteOnlyOnClick(); } }
         );
         return menuItems;
    }

    private _shareSiteOnlyOnClick() {
        this.setState({
            showShareSiteOnly: !this._params.sitePermissionsPanel.state.showShareSiteOnly
        });
    }
}
