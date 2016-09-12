// OneDrive:IgnoreCodeCoverage

import { ISitePermissionsPanelProps } from '../../components/SitePermissionsPanel';
import { ISpPageContext } from '@ms/odsp-datasources/lib/interfaces/ISpPageContext';
import { ISitePermissionsPanelContainerStateManagerParams, ISitePermissionsPanelContainerState } from './SitePermissionsStateManager.Props';
import { ISitePermissionsProps, ISitePersonaPermissions } from '../../components/SitePermissions/SitePermissions.Props';
import { ISPUser } from '@ms/odsp-datasources/lib/SitePermissions';
import SitePermissionsProvider from '@ms/odsp-datasources/lib/providers/sitePermissions/SitePermissionsProvider';
import EventGroup from '@ms/odsp-utilities/lib/events/EventGroup';
import { GroupsProvider, IGroupsProvider, SourceType } from '@ms/odsp-datasources/lib/Groups';
import { IContextualMenuItem } from 'office-ui-fabric-react/lib/components/ContextualMenu/index';
import SitePermissionsDataSource from '@ms/odsp-datasources/lib/dataSources/roleAssignments/SitePermissionsDataSource';

const PERMISSIONS = {
    4: 'Full Control',
    5: 'Read',
    6: 'Edit'
};

const FULLCONTROL_ROLE = '4';
const READ_ROLE = '5';
const EDIT_ROLE = '6';

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
            sitePermissions: (state !== null) ? state.sitePermissions : undefined
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
                    let _personas: ISitePersonaPermissions[] = this.getPersona(group);
                    sitePermissionsPropsArray.push({
                        personas: _personas,
                        title: group.title,
                        permLevel: PERMISSIONS[group.id]
                    });
                });

                this._params.sitePermissionsPanel.setState({
                    title: this._params.title,
                    sitePermissions: sitePermissionsPropsArray
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
                personas.push({
                    name: user.title,
                    imageUrl: user.urlImage,
                    initialsColor: user.initialsColor,
                    imageInitials: user.imageInitials,
                     menuItems: this.getUserPermissions(user)

                });
            }
        }
        return personas;
    }

    // TODO: localize strings and filter out the current role
    private getUserPermissions(spUser: ISPUser): IContextualMenuItem[] {
        let menuItems: IContextualMenuItem[] = [];

        menuItems.push(
            { name: PERMISSIONS[4], key: 'full', onClick: onClick => { this._updatePerm(spUser, FULLCONTROL_ROLE); } },
            { name: PERMISSIONS[6], key: 'edit', onClick: onClick => { this._updatePerm(spUser, EDIT_ROLE); } },
            { name: PERMISSIONS[5], key: 'read', onClick: onClick => { this._updatePerm(spUser, READ_ROLE); } });

        return menuItems;
    }

    private _updatePerm(spUser: ISPUser, newRoleId: string): void {
        this._sitePermissionsDataSource.addUserToGroup(newRoleId, spUser.loginName);
        this._sitePermissionsDataSource.removeFromGroupById(spUser.principalId.toString(), spUser.id.toString());
     }
}
