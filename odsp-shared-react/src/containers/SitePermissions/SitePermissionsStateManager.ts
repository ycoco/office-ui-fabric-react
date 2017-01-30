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
import { autobind } from 'office-ui-fabric-react/lib/Utilities';
import Promise from '@ms/odsp-utilities/lib/async/Promise';
import { Engagement } from '@ms/odsp-utilities/lib/logging/events/Engagement.event';
import StringHelper = require('@ms/odsp-utilities/lib/string/StringHelper');

const SYSTEM_ACCOUNT_LOGIN = 'SHAREPOINT\\system';
const GROUP_CLAIM_LOGIN_SUBSTRING = 'federateddirectoryclaimprovider';
const GROUP_OWNER_CLAIM_LOGIN_SUBSTRING = '_o';

export enum PermissionLevel {
    Limited,
    FullControl,
    Edit,
    Read
}

const ROLE_PERMISSION_MAP = {
    [RoleType.Guest]: PermissionLevel.Limited,
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
        const state = params.sitePermissionsPanelContainer.state;
        return {
            title: (state !== null) ? state.title : params.title,
            sitePermissions: (state !== null) ? state.sitePermissions : undefined,
            panelDescription: this._params.panelDescription,
            invitePeople: this._params.invitePeople,
            showShareSiteOnly: (state !== null) ? state.showShareSiteOnly : false,
            showSavingSpinner: (state !== null) ? state.showSavingSpinner : false,
            menuItems: this._getPanelAddMenu(),
            pageContext: this._pageContext,
            onSave: this._addPerm,
            onCancel: this._onCancel,
            saveButton: this._params.saveButton,
            cancelButton: this._params.cancelButton,
            shareSiteOnlyDescription: this._params.shareSiteOnlyDescription,
            addUserOrGroupText: this._params.addUserOrGroupText,
            advancedPermSettings: this._params.advancedPermSettings,
            advancedPermSettingsUrl: this._params.advancedPermSettingsUrl,
            membersUrl: this._groupsProvider ? this._groupsProvider.group.membersUrl : undefined,
            goToOutlookLink: this._params.goToOutlookLink,
            goToOutlookText: this._params.goToOutlookText,
            manageSitePermissions: this._params.manageSitePermissions,
            closeButton: this._params.closeButton
        };
    }

    private setState(state: ISitePermissionsPanelContainerState) {
        this._params.sitePermissionsPanelContainer.setState(state);
    }

    private setPropsState(sitePermissions: SitePermissionsProvider): void {
        let sitePermissionsPropsArray: ISitePermissionsProps[];
        sitePermissionsPropsArray = new Array();

        this._sitePermissionsProvider.getSiteGroupsAndUsersWithPermissions().done((groupsAndUsers: ISPUser[]) => {

            if (groupsAndUsers && groupsAndUsers.length > 0) {
                groupsAndUsers.forEach((group) => {
                    const permission = ROLE_PERMISSION_MAP[group.roleType];
                    this._permissionGroups[permission] = group.id;
                });

                groupsAndUsers.forEach((group) => {
                    let _personas: ISitePersonaPermissions[] = this.getPersona(group);
                    const permission = ROLE_PERMISSION_MAP[group.roleType];
                    sitePermissionsPropsArray.push({
                        personas: _personas,
                        title: this._getTitle(group),
                        permLevel: permission,
                        permLevelTitle: this._getPermLevel(permission)
                    });
                });

                this._params.sitePermissionsPanelContainer.setState({
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
                        name: this._getUserTitle(user),
                        imageUrl: user.urlImage,
                        initialsColor: user.initialsColor,
                        imageInitials: user.imageInitials,
                        menuItems: !this._isGroupClaimOwner(user.loginName) ? this.getUserPermissions(user, spUser) : undefined
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
                if (this._permissionGroups[PermissionLevel.Edit]) {
                    menuItems.push(
                        {
                            name: this._params.edit, key: 'edit', onClick: onClick => { this._updatePerm(user, this._permissionGroups[PermissionLevel.Edit]); }
                        });
                }
                if (this._permissionGroups[PermissionLevel.Read]) {
                    menuItems.push(
                        {
                            name: this._params.read, key: 'read', onClick: onClick => { this._updatePerm(user, this._permissionGroups[PermissionLevel.Read]); }
                        });
                }
                break;
            case PermissionLevel.Edit:
                if (this._permissionGroups[PermissionLevel.FullControl]) {
                    menuItems.push(
                        {
                            name: this._params.fullControl, key: 'full', onClick: onClick => { this._updatePerm(user, this._permissionGroups[PermissionLevel.FullControl]); }
                        });
                }
                if (this._permissionGroups[PermissionLevel.Read]) {
                    menuItems.push(
                        {
                            name: this._params.read, key: 'read', onClick: onClick => { this._updatePerm(user, this._permissionGroups[PermissionLevel.Read]); }
                        });
                }
                break;
            case PermissionLevel.Read:
                if (this._permissionGroups[PermissionLevel.FullControl]) {
                    menuItems.push(
                        {
                            name: this._params.fullControl, key: 'full', onClick: onClick => { this._updatePerm(user, this._permissionGroups[PermissionLevel.FullControl]); }
                        });
                }
                if (this._permissionGroups[PermissionLevel.Edit]) {
                    menuItems.push(
                        {
                            name: this._params.edit, key: 'edit', onClick: onClick => { this._updatePerm(user, this._permissionGroups[PermissionLevel.Edit]); }
                        });
                }
                break;
        }

        if (!this._isGroupClaim(user.loginName)) {
            menuItems.push(
                {
                    name: this._params.remove, key: 'remove', onClick: onClick => { this._removePerm(user); }
                });
        }
        return menuItems;
    }

    private _updatePerm(spUser: ISPUser, newRoleId: string): void {
        this._sitePermissionsDataSource.addUserToGroup(newRoleId, spUser.loginName).then(() => {
            this._sitePermissionsDataSource.removeFromGroupById(spUser.principalId.toString(), spUser.id.toString()).then(() => {
                this.setPropsState(this._sitePermissionsProvider);
            });
        });

        Engagement.logData({ name: 'SitePermissionsPanel.UpdatePermTo' + newRoleId });
    }

    @autobind
    private _addPerm(userLoginNames: string[]): Promise<boolean> {
        return Promise.all(userLoginNames.map(userLoginName => {
            return this._sitePermissionsDataSource.addUserToGroup(this._permissionGroups[PermissionLevel.Edit], userLoginName).then(() => {
                return true;
            });
        })).then((results: any[]) => {
            this.setState({ showShareSiteOnly: false });
            this.setPropsState(this._sitePermissionsProvider);
            return true;
        });
    }

    @autobind
    private _onCancel(): void {
        this.setState({ showShareSiteOnly: false });
        this.setPropsState(this._sitePermissionsProvider);
    }

    private _removePerm(spUser: ISPUser): void {
        this._sitePermissionsDataSource.removeFromGroupById(spUser.principalId.toString(), spUser.id.toString()).then(() => {
            this.setPropsState(this._sitePermissionsProvider);
        });
    }

    // TODO - remove the string check once the strings are available in odsp-next
    private _getTitle(group): string {
        switch (ROLE_PERMISSION_MAP[group.roleType]) {
            case PermissionLevel.FullControl:
                return this._params.siteOwners ? this._params.siteOwners : this._params.fullControl;
            case PermissionLevel.Edit:
                return this._params.siteMembers ? this._params.siteMembers : this._params.edit;
            case PermissionLevel.Read:
                return this._params.siteVisitors ? this._params.siteVisitors : this._params.read;
            default:
                return '';
        }
    }

    private _getUserTitle(user: ISPUser): string {
        return this._isGroupClaim(user.loginName) ? (this._isGroupClaimOwner(user.loginName) ?
            StringHelper.format(this._params.groupOwners, user.title) :
            StringHelper.format(this._params.groupMembers, user.title)) :
            user.title;
    }

    private _isGroupClaim(loginName: string): boolean {
        return (loginName && loginName.indexOf(GROUP_CLAIM_LOGIN_SUBSTRING) !== -1
            && loginName.indexOf(this._groupsProvider.group.id) !== -1);
    }

    private _isGroupClaimOwner(loginName: string): boolean {
        return (this._isGroupClaim(loginName) && loginName.indexOf(GROUP_OWNER_CLAIM_LOGIN_SUBSTRING) !== -1);
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
            { name: this._params.addMembersToGroup, key: 'addToGroup', onClick: onClick => { this._goToOutlookClick(); } },
            { name: this._params.shareSiteOnly, key: 'shareSiteOnly', onClick: onClick => { this._shareSiteOnlyOnClick(); } }
        );
        return menuItems;
    }

    private _shareSiteOnlyOnClick() {
        Engagement.logData({ name: 'SitePermissions.ShareSiteOnlyClick' });
        this.setState({
            showShareSiteOnly: !this._params.sitePermissionsPanelContainer.state.showShareSiteOnly,
            showSavingSpinner: false
        });
    }

    @autobind
    private _goToOutlookClick(): void {
        Engagement.logData({ name: 'SitePermissions.GoToOutlookClick' });
        this._params.goToOutlookOnClick();
    }

    private _getPermLevel(permission: PermissionLevel): string {
        switch (permission) {
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
}
