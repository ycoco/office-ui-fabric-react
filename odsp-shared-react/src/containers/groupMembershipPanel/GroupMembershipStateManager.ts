import { IGroupMembershipPanelProps, IGroupMemberPersona } from '../../components/GroupMembershipPanel';
import { ISpPageContext } from '@ms/odsp-datasources/lib/interfaces/ISpPageContext';
import { IGroupMembershipPanelContainerStateManagerParams, IGroupMembershipPanelContainerState } from './GroupMembershipStateManager.Props';
import EventGroup from '@ms/odsp-utilities/lib/events/EventGroup';
import { IGroupsProvider, SourceType } from '@ms/odsp-datasources/lib/Groups';
import { AcronymAndColorDataSource, IAcronymColor, COLOR_SERVICE_POSSIBLE_COLORS } from '@ms/odsp-datasources/lib/AcronymAndColor';
import { IContextualMenuItem } from 'office-ui-fabric-react/lib/components/ContextualMenu/index';
import { IPerson } from '@ms/odsp-datasources/lib/PeoplePicker';
import { IDataBatchOperationResult } from '@ms/odsp-datasources/lib/interfaces/IDataBatchOperationResult';
import { autobind } from 'office-ui-fabric-react/lib/utilities/autobind';
import StringHelper = require('@ms/odsp-utilities/lib/string/StringHelper');
import Promise from '@ms/odsp-utilities/lib/async/Promise';

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
        const state = params.groupMembershipPanelContainer.state;
        return {
            // Properties for the members list
            title: (state !== null) ? state.title : params.strings.title,
            personas: (state !== null) ? state.personas : null,
            canChangeMemberStatus: (state !== null) ? state.canChangeMemberStatus : false,
            memberText: params.strings.memberText,
            ownerText: params.strings.ownerText,
            numberOfMembersText: (state !== null) ? state.numberOfMembersText : undefined,
            // Properties for the add members UX
            pageContext: this._pageContext,
            addMembersText: params.strings.addMembersText,
            doneButtonText: params.strings.doneButtonText,
            cancelButtonText: params.strings.cancelButtonText,
            addMembersInstructionsText: params.strings.addMembersInstructionsText,
            onSave: this._onSave,
            // Properties for both
            errorMessageText: (state !== null) ? state.errorMessageText : undefined,
            clearErrorMessage: this._clearErrorMessage
        };
    }

    private _updateGroupInformation(): void {

        const group = this._groupsProvider.group;
        group.membership.load(true, true); // Load all members and ownership information from server

        const updateGroupMembership = (newValue: SourceType) => {
            if (newValue !== SourceType.None) {

                /* tslint:disable:typedef */
                // everything here is easily inferred by the TS compiler
                const memberNames = group.membership.membersList.members.map((member) => member.name);
                /* tslint:enable:typedef */

                if (!this._acronymDataSource) {
                    this._acronymDataSource = new AcronymAndColorDataSource(this._pageContext);
                }

                let groupMembershipPersonas: IGroupMemberPersona[] = [];
                this._acronymDataSource.getAcronyms(memberNames).done((acronyms: IAcronymColor[]) => {
                    groupMembershipPersonas = acronyms.map((acronym: IAcronymColor, index: number) => {
                        let member = group.membership.membersList.members[index];
                        return {
                            name: memberNames[index],
                            imageUrl: member.image,
                            imageInitials: acronym.acronym,
                            initialsColor: (COLOR_SERVICE_POSSIBLE_COLORS.indexOf(acronym.color) + 1),
                            isGroupOwner: member.isOwnerOfCurrentGroup,
                            memberStatusMenuItems: this._getMemberStatusMenuItems(member)
                        } as IGroupMemberPersona;
                    });
                    this.setState({
                        title: this._params.strings.title,
                        personas: groupMembershipPersonas,
                        canChangeMemberStatus: !!group.membership.isOwner, // Can only change member status if current user is group owner
                        numberOfMembersText: this._getNumberOfMembersText(group.membership.totalNumberOfMembers),
                        errorMessageText: undefined
                    });
                }, (error: any) => {
                    // If the acronymDataSource returned an error, display with images only
                    groupMembershipPersonas = group.membership.membersList.members.map((member: IPerson, index: number) => {
                        return {
                            name: memberNames[index],
                            imageUrl: member.image,
                            isGroupOwner: member.isOwnerOfCurrentGroup,
                            memberStatusMenuItems: this._getMemberStatusMenuItems(member)
                        } as IGroupMemberPersona;
                    });
                    this.setState({
                        title: this._params.strings.title,
                        personas: groupMembershipPersonas,
                        canChangeMemberStatus: !!group.membership.isOwner, // Can only change member status if current user is group owner
                        numberOfMembersText: this._getNumberOfMembersText(group.membership.totalNumberOfMembers),
                        errorMessageText: undefined
                    });
                });
            }
        };

        this._ensureEventGroup();
        this._eventGroup.on(group.membership, 'source', updateGroupMembership);
        updateGroupMembership(group.membership.source);
    }

    /**
     * Get the text to display for the total number of group members
     */
    private _getNumberOfMembersText(totalNumberOfMembers: number): string {
        let localizedCountFormat = StringHelper.getLocalizedCountValue(this._params.strings.membersCountText, this._params.strings.membersCountIntervalsText, totalNumberOfMembers);
        return StringHelper.format(localizedCountFormat, totalNumberOfMembers);
    }

    /**
     * Get the contextual menu options for the dropdown on each group member
     */
    private _getMemberStatusMenuItems(member: IPerson): IContextualMenuItem[] {
        let memberStatusMenuItems: IContextualMenuItem[] = [];

        memberStatusMenuItems.push(
            {
                name: this._params.strings.memberText, key: 'member', onClick: onClick => { this._makeMember(member); }, canCheck: true, isChecked: !member.isOwnerOfCurrentGroup
            },
            {
                name: this._params.strings.ownerText, key: 'owner', onClick: onClick => { this._makeOwner(member); }, canCheck: true, isChecked: !!member.isOwnerOfCurrentGroup
            },
            {
                name: this._params.strings.removeFromGroupText, key: 'remove', onClick: onClick => { this._removeFromGroup(member); }, canCheck: false, isChecked: false
            });

        return memberStatusMenuItems;
    }

    /**
     * Makes a group owner into a member
     */
    private _makeMember(member: IPerson): void {
        if (member.isOwnerOfCurrentGroup) {
            // If trying to remove last owner, show error message and do not change status
            if (this._groupsProvider.group.membership.totalNumberOfOwners < 2) {
                this.setState({
                    errorMessageText: this._params.strings.demoteLastOwnerErrorText
                });
            } else {
                this._groupsProvider.removeUserFromGroupOwnership(
                    this._pageContext.groupId,
                    member.userId
                ).then(() => {
                    this._updateGroupInformation();
                }, (error: any) => {
                    this._setErrorMessage(error);
                });
            }
        }
    }

    /**
     * Makes a group member into an owner
     */
    private _makeOwner(member: IPerson): void {
        if (!member.isOwnerOfCurrentGroup) {
            this._groupsProvider.addUserToGroupOwnership(
                this._pageContext.groupId,
                member.userId
            ).then(() => {
                this._updateGroupInformation();
            }, (error: any) => {
                this._setErrorMessage(error);
            });
        }
    }

    /**
     * Removes a group member from the group
     */
    private _removeFromGroup(member: IPerson): void {
        // If trying to remove last owner, show error message and do not remove
        if (member.isOwnerOfCurrentGroup && this._groupsProvider.group.membership.totalNumberOfOwners < 2) {
            this.setState({
                errorMessageText: this._params.strings.removeLastOwnerErrorText
            });
            return;
        }
        // If member is an owner, remove from the owners list first
        if (member.isOwnerOfCurrentGroup) {
            this._groupsProvider.removeUserFromGroupOwnership(
                this._pageContext.groupId,
                member.userId
            ).then(() => {
                this._groupsProvider.removeUserFromGroupMembership(
                    this._pageContext.groupId,
                    member.userId
                ).then(() => {
                    this._updateGroupInformation();
                }, (error: any) => {
                    this._setErrorMessage(error);
                });
            }, (error: any) => {
                this._setErrorMessage(error);
            });
        // If member is not an owner, only remove from members list
        } else {
            this._groupsProvider.removeUserFromGroupMembership(
                this._pageContext.groupId,
                member.userId
            ).then(() => {
                this._updateGroupInformation();
            }, (error: any) => {
                this._setErrorMessage(error);
            });
        }
    }

    private _ensureEventGroup() {
        if (!this._eventGroup) {
            this._eventGroup = new EventGroup(this);
        }
    }

    private setState(state: IGroupMembershipPanelContainerState) {
        this._params.groupMembershipPanelContainer.setState(state);
    }

    @autobind
    private _onSave(selectedMembers: IPerson[]): Promise<void> {
        let selectedMemberPrincipalNames: string[] = selectedMembers ? selectedMembers.map(member => { return this._extractPrincipalName(member.userId); }) : [];
        let selectedMemberNames: string[] = selectedMembers ? selectedMembers.map(member => { return member.name; }) : [];
        return this._groupsProvider.addUsersToGroup(
            this._pageContext.groupId,
            null, /* owners (by GUID) */
            null, /* members (by GUID) */
            null, /* ownersPrincipalName */
            selectedMemberPrincipalNames).then((result: IDataBatchOperationResult) => {
                this._updateGroupInformation();
                return;
            }, (error: IDataBatchOperationResult) => {
                this._setAddMembersErrorMessage(error, [], selectedMemberNames);
                return Promise.wrapError(error);
            }
        );
    }

    /**
     * Checks for the presence of an error message returned from the server.
     * If there is none, uses a generic error message.
     */
    private _setErrorMessage(error: any) {
        let errorMessage: string = this._params.strings.serverErrorMessage;
        if (error && error.message && error.message.value) {
            errorMessage = error.message.value;
        }
        this.setState({
            errorMessageText: errorMessage
        });
    }

    @autobind
    private _clearErrorMessage(): void {
        this.setState({
            errorMessageText: undefined
        });
    }

    /**
     * Computes an error message if the add members operation failed. Follows the same pattern used in group creation.
     * Currently not using selectedOwnerNames, but including for when the long term add members design is complete.
     * 
     * @param {IDataBatchOperationResult} error - error returned from the server
     * @param {string[]} selectedOwnerNames - names of the owners you were attempting to add
     * @param {string[]} selectedMemberNames - names of the members you were attempting to add
     */
    private _setAddMembersErrorMessage(error: IDataBatchOperationResult, selectedOwnerNames: string[], selectedMemberNames: string[]): void {
        let failedMembers = [];
        let failedOwners = [];
        if (error && error.hasError && error.items) {
            let errors = error.items;
            for (let i = 0; i < errors.length; i++) {
                let currentError = errors[i].error;
                if (currentError && (currentError.code || currentError.message)) {
                    if (i < selectedOwnerNames.length) {
                        failedOwners.push(selectedOwnerNames[i]);
                    } else {
                        failedMembers.push(selectedMemberNames[i - selectedOwnerNames.length]);
                    }
                }
            }
        }

        let errorMsg = '';

        // TODO: When you can add owners as well as members, create an error message for any owners that failed to be added.

        if (failedMembers.length === 1) {
            errorMsg = errorMsg + ' ' + StringHelper.format(this._params.strings.addMemberFailedSingularText, failedMembers[0]);
        } else if (failedMembers.length >= 2) {
            errorMsg = errorMsg + ' ' + StringHelper.format(this._params.strings.addMemberFailedPluralText, failedMembers.join(', '));
        }

        if (!errorMsg) {
            errorMsg = this._params.strings.addMemberFailedText;
        }

        this.setState({
            errorMessageText: errorMsg
        });
    }

    /**
     * There is a discrepancy between the userId returned from the GroupsDataSource, which is a 
     * GUID like '2282955c-14bd-4e69-9c2d-cb0d49935a88', and the userId returned from the PeoplePicker,
     * which has the form 'i:0#.f|membership|examplename@microsoft.com'.
     * As a result, when receiving an IPerson from the PeoplePicker, we need to extract the principalName
     * from the userId rather than using the userId directly.
     */
    private _extractPrincipalName(userId: string): string {
        let principalName = userId;
        if (principalName) {
            let separatorIndex = userId.lastIndexOf('|');
            if (separatorIndex !== -1) {
                return principalName.substring(separatorIndex + 1);
            }
        }
        return principalName;
    }

}
