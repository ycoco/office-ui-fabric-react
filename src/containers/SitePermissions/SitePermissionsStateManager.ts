// OneDrive:IgnoreCodeCoverage

import { ISitePermissionsPanelProps } from '../../components/SitePermissionsPanel';
import { ISpPageContext } from '@ms/odsp-datasources/lib/interfaces/ISpPageContext';
import { ISitePermissionsPanelContainerStateManagerParams, ISitePermissionsPanelContainerState } from './SitePermissionsStateManager.Props';
import { ISitePermissionsProps, ISitePersonaPermissions } from '../../components/SitePermissions/SitePermissions.Props';
import { ISPUser, SitePermissionsDataSource } from '@ms/odsp-datasources/lib/SitePermissions';
import EventGroup from '@ms/odsp-utilities/lib/events/EventGroup';
import { GroupsProvider, IGroupsProvider, SourceType } from '@ms/odsp-datasources/lib/Groups';

/**
 * This class manages the state of the SitePermissionsPanel component.
 */
export default class SitePermissionsPanelStateManager {
    private _pageContext: ISpPageContext;
    private _params: ISitePermissionsPanelContainerStateManagerParams;
    private _groupsProvider: IGroupsProvider;
    private _eventGroup: EventGroup;
    private _sitePermissionsDataSource: SitePermissionsDataSource;

    constructor(params: ISitePermissionsPanelContainerStateManagerParams) {
        this._params = params;
        this._pageContext = params.pageContext;
        this._sitePermissionsDataSource = new SitePermissionsDataSource(this._params.pageContext);
        this.setPropsState(this._sitePermissionsDataSource);
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

    private setPropsState(sitePermissions: SitePermissionsDataSource): void {
        let sitePermissionsPropsArray: ISitePermissionsProps[];
        sitePermissionsPropsArray = new Array();
        this._sitePermissionsDataSource.getSiteGroupsAndUsers().done((value: ISPUser[]) => {
            for (let i = 0; i < value.length; i++) {
                let _personas: ISitePersonaPermissions[] = this.getPersona(value[i]);
                sitePermissionsPropsArray.push({ personas: _personas, title: value[i].title });
            }

            this._params.sitePermissionsPanel.setState({
                title: this._params.title,
                sitePermissions: sitePermissionsPropsArray
            });
        });
    }

    private getPersona(spUser: ISPUser): ISitePersonaPermissions[] {
                let personas: ISitePersonaPermissions[];
                personas = new Array();
                for (let i = 0; i < spUser.users.length; i++) {
                    personas.push({ name: spUser.users[i].title, imageUrl: spUser.users[i].urlImage });
                }
        return personas;
    }
}
