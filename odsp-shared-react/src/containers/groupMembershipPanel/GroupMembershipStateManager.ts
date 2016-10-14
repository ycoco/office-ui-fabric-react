import { IGroupMembershipPanelProps, IGroupMemberPersona } from '../../components/GroupMembershipPanel';
import { ISpPageContext } from '@ms/odsp-datasources/lib/interfaces/ISpPageContext';
import { IGroupMembershipPanelContainerStateManagerParams, IGroupMembershipPanelContainerState } from './GroupMembershipStateManager.Props';
import EventGroup from '@ms/odsp-utilities/lib/events/EventGroup';
import { IGroupsProvider, SourceType } from '@ms/odsp-datasources/lib/Groups';
import { AcronymAndColorDataSource, IAcronymColor, COLOR_SERVICE_POSSIBLE_COLORS } from '@ms/odsp-datasources/lib/AcronymAndColor';

/**
 * This class manages the state of the GroupMembershipPanel component.
 */
export class GroupMembershipPanelStateManager {
    private _params: IGroupMembershipPanelContainerStateManagerParams;
    private _pageContext: ISpPageContext;
    private _groupsProvider: IGroupsProvider;
    private _acronymDataSource: AcronymAndColorDataSource;
    private _eventGroup: EventGroup;

    constructor(params: IGroupMembershipPanelContainerStateManagerParams) {
        this._params = params;
        this._pageContext = params.pageContext;
    }

    public componentDidMount() {
        // Get the group properties from GroupsProvider.
        // Initially this information may be cached or unavailable, so need to defer update
        // until groups properties come back from server.
        this._params.getGroupsProvider().done((groupsProvider: IGroupsProvider) => {
            // getGroupsProvider returns null if we are not in a group
            if (!groupsProvider) {
                throw new Error('GroupMembershipStateManager fatal error: Groups provider not available.');
            }

            this._groupsProvider = groupsProvider;

            if (!this._groupsProvider.group) {
                throw new Error('GroupMembershipStateManager fatal error: Groups provider does not have an observed group.');
            }

            this._groupsProvider.group.membership.load(true); // Load all members
            this._updateGroupInformation();
        });
    }

    public componentWillUnmount() {
        if (this._eventGroup) {
            this._eventGroup.dispose();
            this._eventGroup = null;
        }
    }

    public getRenderProps(): IGroupMembershipPanelProps {
        // Render the current state. If that is missing, use the initial parameters
        const params = this._params;
        const state = params.groupMembershipPanel.state;
        return {
            title: (state !== null) ? state.title : params.title,
            personas: (state != null) ? state.personas : null
        };
    }

    private _updateGroupInformation(): void {

        const group = this._groupsProvider.group;
        const updateGroupMembership = (newValue: SourceType) => {
            if (newValue !== SourceType.None) {

                /* tslint:disable:typedef */
                // everything here is easily inferred by the TS compiler
                const memberNames = group.membership.membersList.members.map((member) => member.name);
                /* tslint:enable:typedef */

                if (!this._acronymDataSource) {
                    this._acronymDataSource = new AcronymAndColorDataSource(this._pageContext);
                }

                this._acronymDataSource.getAcronyms(memberNames).done((acronyms: IAcronymColor[]) => {
                    const groupMembershipPersonas = acronyms.map((acronym: IAcronymColor, index: number) => {
                        return {
                            name: memberNames[index],
                            imageUrl: group.membership.membersList.members[index].image,
                            imageInitials: acronym.acronym,
                            initialsColor: (COLOR_SERVICE_POSSIBLE_COLORS.indexOf(acronym.color) + 1)
                        } as IGroupMemberPersona;
                    });

                    this.setState({
                        title: this._params.title,
                        personas: groupMembershipPersonas
                    });
                });
            }
        };

        this._ensureEventGroup();
        this._eventGroup.on(group.membership, 'source', updateGroupMembership);
        updateGroupMembership(group.membership.source);
    }

    private _ensureEventGroup() {
        if (!this._eventGroup) {
            this._eventGroup = new EventGroup(this);
        }
    }

    private setState(state: IGroupMembershipPanelContainerState) {
        this._params.groupMembershipPanel.setState(state);
    }
}
