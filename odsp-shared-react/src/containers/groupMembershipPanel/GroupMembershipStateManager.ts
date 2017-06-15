import { IGroupMembershipPanelProps, IGroupMemberPersona } from '../../components/GroupMembershipPanel';
import { ISpPageContext } from '@ms/odsp-datasources/lib/interfaces/ISpPageContext';
import { IGroupMembershipPanelContainerStateManagerParams, IGroupMembershipPanelContainerState } from './GroupMembershipStateManager.Props';
import EventGroup from '@ms/odsp-utilities/lib/events/EventGroup';
import { IGroupsProvider, IMembershipPager, IMembershipPage, SourceType } from '@ms/odsp-datasources/lib/Groups';
import { IContextualMenuItem } from 'office-ui-fabric-react/lib/components/ContextualMenu/index';
import { IPerson } from '@ms/odsp-datasources/lib/PeoplePicker';
import { IDataBatchOperationResult } from '@ms/odsp-datasources/lib/interfaces/IDataBatchOperationResult';
import { autobind } from 'office-ui-fabric-react/lib/Utilities';
import StringHelper = require('@ms/odsp-utilities/lib/string/StringHelper');
import Promise from '@ms/odsp-utilities/lib/async/Promise';
import { Engagement } from '@ms/odsp-utilities/lib/logging/events/Engagement.event';
import Features from '@ms/odsp-utilities/lib/features/Features';
import { IGroupSiteProvider, IGroupCreationContext } from '@ms/odsp-datasources/lib/GroupSite';
import { Killswitch } from '@ms/odsp-utilities/lib/killswitch/Killswitch';

/** The largest group for which we can currently load all members */
const LARGE_GROUP_CUTOFF = 100;
/** The groupType property value indicating a public group. */
export const GROUP_TYPE_PUBLIC: string = 'Public';

/**
 * This class manages the state of the GroupMembershipPanel component.
 */
export class GroupMembershipPanelStateManager {
    private _params: IGroupMembershipPanelContainerStateManagerParams;
    private _pageContext: ISpPageContext;
    private _groupsProvider: IGroupsProvider;
    private _eventGroup: EventGroup;
    private _isVirtualMembersListEnabled: boolean; // Whether to use paged members list.
    private _isAddRemoveGuestsFeatureEnabled: boolean; // Whether to show add/remove guests functionality if group and user allow it.
    private _membershipPager: IMembershipPager; // Used to iterate over members list one page at a time.
    private _getNextMembershipPage: () => Promise<IMembershipPage>; // Called to obtain a promise for the next page of members.
    private _isPageLoading: boolean; // True if a page load is currently underway.
    private _currentMembershipPagePromise: Promise<IMembershipPage>; // The promise currently in progress to obtain next page of members, if any.
    private _membershipCountChanged: boolean; // True if members were added/removed. Tells whether to update member count in site header.
    private _ownersCanAddGuests: boolean; // True if owners can add and remove guest members for this group.
    private _isMembershipDynamic: boolean; // True if group has dynamic membership (determined by a rule like "Mary's direct reports")

    constructor(params: IGroupMembershipPanelContainerStateManagerParams) {
        this._params = params;
        this._pageContext = params.pageContext;
        this._isVirtualMembersListEnabled = Features.isFeatureEnabled(
            /* VirtualGroupMembersList */
            { ODB: 124, ODC: null, Fallback: false }
        );
        this._isAddRemoveGuestsFeatureEnabled = Features.isFeatureEnabled(
            /* EnableAddRemoveGuests */
            { ODB: 208, ODC: null, Fallback: false }
        )
        this._membershipCountChanged = false;
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

            this._isMembershipDynamic = !Killswitch.isActivated('56213E86-E001-42AD-B118-4A79CA1A90B4') && this._groupsProvider.group.isDynamic === true;

            this._checkAddRemoveGuestsEnabled().then((addRemoveGuestsEnabled: boolean) => {
                this._ownersCanAddGuests = addRemoveGuestsEnabled;
                // Check that currentUser is available to avoid subtle bug
                if (!this._groupsProvider.currentUser) {
                    this._groupsProvider.getCurrentUser().then(() => {
                        this._updateGroupInformation(true);
                    }, (error: any) => {
                        this._setErrorMessage(error);
                    });
                } else {
                    this._updateGroupInformation(true);
                }
            });
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
        const context = this._pageContext;
        const state = params.groupMembershipPanelContainer.state;
        return {
            // Properties for the members list
            title: (state !== null) ? state.title : params.strings.title,
            onDismiss: this._onDismiss,
            personas: (state !== null) ? state.personas : null,
            useVirtualizedMembersList: this._isVirtualMembersListEnabled,
            onLoadMoreMembers: this._onLoadMoreMembers,
            canAddMembers: !this._isMembershipDynamic && ((state && state.currentUserIsOwner) || (context && context.groupType && context.groupType === GROUP_TYPE_PUBLIC)),
            canAddGuests: !this._isMembershipDynamic && state && state.currentUserIsOwner && this._ownersCanAddGuests,
            canChangeMemberStatus: !this._isMembershipDynamic && state && state.currentUserIsOwner,
            numberOfMembersText: (state !== null) ? state.numberOfMembersText : undefined,
            totalNumberOfMembers: (state != null) ? state.totalNumberOfMembers : undefined,
            largeGroupMessage: (state != null) ? state.largeGroupMessage : undefined,
            membersUrl: this._groupsProvider ? this._groupsProvider.group.membersUrl : undefined,
            outlookLinkText: this._isVirtualMembersListEnabled ? params.strings.searchLinkText : params.strings.outlookLinkText,
            showConfirmationDialog: (state !== null) ? state.showConfirmationDialog : false,
            onApproveConfirmationDialog: (state != null) ? state.onApproveConfirmationDialog : undefined,
            onCloseConfirmationDialog: this._closeConfirmationDialog,
            okButtonText: params.strings.okButtonText,
            confirmationText: params.strings.confirmationText,
            // Properties for the add members UX
            pageContext: this._pageContext,
            addMembersText: params.strings.addMembersText,
            doneButtonText: params.strings.doneButtonText,
            cancelButtonText: params.strings.cancelButtonText,
            addMembersInstructionsText: params.strings.addMembersInstructionsText,
            addMembersOrGuestsInstructionsText: params.strings.addMembersOrGuestsInstructionsText,
            addGuestsLinkText: params.strings.addGuestsLinkText,
            peoplePickerPlaceholderText: params.strings.peoplePickerPlaceholderText,
            onSave: this._onSave,
            addingGuestText: params.strings.addingGuestText,
            // Properties for both
            closeButtonAriaLabel: params.strings.closeButtonAriaLabel,
            dismissErrorMessageAriaLabel: params.strings.dismissErrorMessageAriaLabel,
            errorMessageText: (state !== null) ? state.errorMessageText : undefined,
            clearErrorMessage: this._clearErrorMessage,
        };
    }

    /**
     * Load new group membership information from the server and update the component state.
     * 
     * @param {boolean} updateMembershipBeforeLoadComplete - If true, display any group membership information you already have before the load from the server completes.
     * Defaults to false.
     */
    private _updateGroupInformation(updateMembershipBeforeLoadComplete: boolean = false): void {

        const group = this._groupsProvider.group;
        if (updateMembershipBeforeLoadComplete) {
            if (group.membership.source != SourceType.None) {
                this.setState({
                    title: this._params.strings.title,
                    // Do not update personas until load is complete
                    currentUserIsOwner: !!group.membership.isOwner,
                    numberOfMembersText: this._getNumberOfMembersText(group.membership.totalNumberOfMembers),
                    errorMessageText: undefined
                });
            }
        }

        // If the members list virtualization feature is enabled, rely on the paging mechanism.
        // Otherwise, use the old behavior and load all members up to the hundred member limit.
        if (this._isVirtualMembersListEnabled) {
            // Cancel any page loads currently in progress.
            if (this._isPageLoading && this._currentMembershipPagePromise) {
                this._currentMembershipPagePromise.cancel();
                this._isPageLoading = false;
            }
            this._membershipPager = this._groupsProvider.getMembershipPager(/*Default paging options*/);
            this._membershipPager.loadPage(0 /*first page*/).then((membershipPage: IMembershipPage) => {
                let groupMembershipPersonas: IGroupMemberPersona[] = this._getGroupMemberPersonas(membershipPage.page, 0);
                this._getNextMembershipPage = membershipPage.getNextPagePromise;
                this.setState({
                    title: this._params.strings.title,
                    personas: groupMembershipPersonas,
                    currentUserIsOwner: this._membershipPager.isOwner,
                    numberOfMembersText: this._getNumberOfMembersText(this._membershipPager.totalNumberOfMembers),
                    totalNumberOfMembers: this._membershipPager.totalNumberOfMembers,
                    totalNumberOfOwners: this._membershipPager.totalNumberOfOwners,
                    largeGroupMessage: this._getLargeGroupMessage(this._membershipPager.totalNumberOfMembers),
                    errorMessageText: undefined
                });
            }, (error: any) => {
                this.setState({
                    errorMessageText: this._params.strings.loadingMembersErrorText
                });
            });
        } else {
            group.membership.load(true, true); // Load all members and ownership information from server

            const updateGroupMembership = (newValue: SourceType) => {
                if (newValue !== SourceType.None) {

                    let groupMembershipPersonas: IGroupMemberPersona[] = this._getGroupMemberPersonas(group.membership.membersList.members, 0);
                    this.setState({
                        title: this._params.strings.title,
                        personas: groupMembershipPersonas,
                        currentUserIsOwner: !!group.membership.isOwner,
                        numberOfMembersText: this._getNumberOfMembersText(group.membership.totalNumberOfMembers),
                        totalNumberOfMembers: group.membership.totalNumberOfMembers,
                        totalNumberOfOwners: group.membership.totalNumberOfOwners,
                        largeGroupMessage: this._getLargeGroupMessage(group.membership.totalNumberOfMembers),
                        errorMessageText: undefined
                    });
                }
            };

            this._ensureEventGroup();
            this._eventGroup.on(group.membership, 'source', updateGroupMembership);
        }
    }

    /**
     * Determines whether the current group allows owners to add and remove guest members.
     * Guests are allowed if both of the following are true:
     * (1) Guests are allowed at the group level
     * (2) Guests are allowed at the tenant level
     */
    private _checkAddRemoveGuestsEnabled(): Promise<boolean> {
        if (this._isAddRemoveGuestsFeatureEnabled && this._groupsProvider.group.allowToAddGuests && this._params.getGroupSiteProvider) {
            // Use the GroupSiteProvider to check if guests are allowed at the tenant level.
            // This requires another call to FBI, so only do it if all other requirements to allow guests have been met.
            return this._params.getGroupSiteProvider().then((groupSiteProvider: IGroupSiteProvider) => {
                let groupCreationContextPromise: Promise<IGroupCreationContext>;
                if (groupSiteProvider) {
                    groupCreationContextPromise = groupSiteProvider.getGroupCreationContext();
                }
                return groupCreationContextPromise;
            }).then((groupCreationContext: IGroupCreationContext) => {
                let allowToAddGuests: boolean;
                if (groupCreationContext) {
                    allowToAddGuests = groupCreationContext.allowToAddGuests;
                }
                return Promise.wrap(allowToAddGuests);
            }, (error: any) => {
                // If an error occurs, play it safe and do not allow adding guests
                return Promise.wrap(false);
            });
        } else {
            return Promise.wrap(false);
        }
    }

    @autobind
    /**
     * When the user dismisses the panel, reload membership to refresh member count and facepile
     * in the site header, or any other components tracking the source change event.
     */
    private _onDismiss() {
        if (this._isVirtualMembersListEnabled && this._membershipCountChanged) {
            this._groupsProvider.group.membership.loadWithOptions(4 /*force skip cache*/);
        }
    }

    /**
     * Loads the next page of group members.
     * The GroupMembersList component will call this function when a user has scrolled to the bottom of all the members loaded so far,
     * but there are still more members we need to show.
     */
    @autobind
    private _onLoadMoreMembers(): void {
        // Do not request the next page if it is already loading.
        // If the user scrolls up and then back down again, _onLoadMoreMembers will be triggered twice, but we do not want to request the same page twice.
        if (this._getNextMembershipPage && !this._isPageLoading) {
            this._isPageLoading = true;
            this._currentMembershipPagePromise = this._getNextMembershipPage();
            this._currentMembershipPagePromise.then((membershipPage: IMembershipPage) => {
                const state = this._params.groupMembershipPanelContainer.state;
                let currentGroupMembershipPersonas: IGroupMemberPersona[] = (state && state.personas) ? state.personas : [];
                let nextGroupMembershipPersonas: IGroupMemberPersona[] = this._getGroupMemberPersonas(membershipPage.page, currentGroupMembershipPersonas.length);
                let groupMembershipPersonas: IGroupMemberPersona[] = currentGroupMembershipPersonas.concat(nextGroupMembershipPersonas);
                this._getNextMembershipPage = membershipPage.getNextPagePromise;
                this._isPageLoading = false;
                // Only update total number of members if we have a new value
                if (state.totalNumberOfMembers === this._membershipPager.totalNumberOfMembers) {
                    this.setState({
                        personas: groupMembershipPersonas
                    });
                } else {
                    this.setState({
                        personas: groupMembershipPersonas,
                        numberOfMembersText: this._getNumberOfMembersText(this._membershipPager.totalNumberOfMembers),
                        totalNumberOfMembers: this._membershipPager.totalNumberOfMembers
                    }); 
                }
            }, (error: any) => {
                this._isPageLoading = false;
                // If the page load was cancelled intentionally, do not show an error message
                if(!Promise.isCanceled(error)) {
                    this.setState({
                        errorMessageText: this._params.strings.loadingMembersErrorText,
                    });
                    this._getNextMembershipPage = undefined;
                }
            });
        }
    }

    /**
     * Transforms the IPerson array returned from the data source into a format we can display in the panel.
     * Adds contextual menu title and items.
     * 
     * @param {IPerson[]} members The array of members returned from the server.
     * @param {number} indexOffset If the array is a page to be appended to the existing members list, include the number of preceding members.
     * This allows us to mark each member with the correct index.
     */
    private _getGroupMemberPersonas(members: IPerson[], indexOffset: number): IGroupMemberPersona[] {
        let groupMemberPersonas: IGroupMemberPersona[] = members.map((member: IPerson, index: number) => {
            return {
                name: member.name,
                imageUrl: member.image,
                isGroupOwner: member.isOwnerOfCurrentGroup,
                memberStatusMenuItems: this._getMemberStatusMenuItems(member, index + indexOffset),
                contextualMenuTitle: this._getContextualMenuTitle(member)
            } as IGroupMemberPersona;
        });
        return groupMemberPersonas;      
    }

    /**
     * Get the text to display for the total number of group members
     */
    private _getNumberOfMembersText(totalNumberOfMembers: number): string {
        let localizedCountFormat = StringHelper.getLocalizedCountValue(this._params.strings.membersCountText, this._params.strings.membersCountIntervalsText, totalNumberOfMembers);
        return StringHelper.format(localizedCountFormat, totalNumberOfMembers);
    }

    /**
     * Get the message to display if the group has a large number of members.
     * If the number of members does not exceed the chosen cutoff, returns undefined.
     * If virtual members list is enabled, the message will appear at the top of the list and direct users to search.
     * If the virtual members list is disabled, the message will appear at the bottom of the list and direct users to
     * view the full members list in OWA.
     */
    private _getLargeGroupMessage(totalNumberOfMembers: number): string {
        if (totalNumberOfMembers > LARGE_GROUP_CUTOFF) {
            Engagement.logData({ name: 'GroupMembershipPanel.RenderLargeGroup', extraData: { numberOfMembers: totalNumberOfMembers }});
            return this._isVirtualMembersListEnabled ? this._params.strings.searchMembersMessage : this._params.strings.largeGroupMessage;
        } else {
            Engagement.logData({ name: 'GroupMembershipPanel.RenderSmallGroup', extraData: { numberOfMembers: totalNumberOfMembers }});
            return undefined;
        }
    }

    /**
     * Get the contextual menu title for a user. Can be either Owner, Guest, or Member.
     *
     * @param {IPerson} member - the member for whom we are getting the contextual menu title
     */
    private _getContextualMenuTitle(member: IPerson): string {
        if (member.isOwnerOfCurrentGroup) {
            return this._params.strings.ownerText;
        } else if (member.entityType === 1 /* EntityType.externalUser */) {
            return this._params.strings.guestText;
        } else {
            return this._params.strings.memberText;
        }
    }

    /**
     * Get the contextual menu options for the dropdown on each group member
     */
    private _getMemberStatusMenuItems(member: IPerson, index: number): IContextualMenuItem[] {

        let memberStatusMenuItems: IContextualMenuItem[] = [];

        if (member.entityType !== 1 /* EntityType.externalUser */) {
            // Non-guest members show all options
            memberStatusMenuItems.push(
                {
                    name: this._params.strings.memberText, key: 'member', onClick: onClick => { this._makeMember(member, index); }, canCheck: true, checked: !member.isOwnerOfCurrentGroup
                },
                {
                    name: this._params.strings.ownerText, key: 'owner', onClick: onClick => { this._makeOwner(member, index); }, canCheck: true, checked: !!member.isOwnerOfCurrentGroup
                },
                {
                    name: this._params.strings.removeFromGroupText, key: 'remove', onClick: onClick => { this._removeFromGroup(member, index); }, canCheck: false, checked: false
                });
        } else if (this._ownersCanAddGuests) {
            // Can remove guests, but not promote them to owner
            memberStatusMenuItems.push(
                {
                    name: this._params.strings.removeFromGroupText, key: 'remove', onClick: onClick => { this._removeFromGroup(member, index); }, canCheck: false, checked: false
                });            
        }

        return memberStatusMenuItems;
    }

    /**
     * Makes a user into a member.
     * Does nothing if they were already a member, but removes from group ownership if they were an owner.
     */
    private _makeMember(member: IPerson, index: number): void {
        Engagement.logData({ name: 'GroupMembershipPanel.MakeMember.Click' });
        if (member.isOwnerOfCurrentGroup) {
            // If trying to remove last owner, show error message and do not change status
            let removingLastOwner = (this._params.groupMembershipPanelContainer.state) && (this._params.groupMembershipPanelContainer.state.totalNumberOfOwners < 2);
            if (removingLastOwner) {
                this.setState({
                    errorMessageText: this._params.strings.demoteLastOwnerErrorText
                });
            // If user is trying to demote themselves to member, give them a confirmation dialog to be sure
            } else if (member.userId === this._groupsProvider.currentUser.userId) {
                this._launchConfirmationDialog(() => { this.setState({showConfirmationDialog: false}); this._changeGroupOwnerToMember(member, index); })
            } else {
                this._changeGroupOwnerToMember(member, index);
            }
        }
    }

    /**
     * Removes a user from the owners list of a group.
     * If the user is changing themselves from owner to member, they must approve confirmation dialog before this is called.
     */
    private _changeGroupOwnerToMember(member: IPerson, index: number): void {
        // Set member status to updating
        let updatingPersonas: IGroupMemberPersona[] = this._params.groupMembershipPanelContainer.state.personas;
        let oldContextualMenuTitle = updatingPersonas[index].contextualMenuTitle;
        let oldMemberStatusMenuItems = updatingPersonas[index].memberStatusMenuItems;
        this._setMemberStatusToUpdating(index);

        this._groupsProvider.removeUserFromGroupOwnership(
            this._pageContext.groupId,
            member.userId
        ).then(() => {
            this._updateGroupInformation();
        }, (error: any) => {
            this._setErrorMessage(error);
            // If an error occurred, undo setting the member status to updating
            this._undoSetMemberStatusToUpdating(index, oldContextualMenuTitle, oldMemberStatusMenuItems);
        });
    }

    private _launchConfirmationDialog(onApproveConfirmationDialog: () => void): void {
        this.setState({
            showConfirmationDialog: true,
            onApproveConfirmationDialog: onApproveConfirmationDialog
        });
    }

    @autobind
    private _closeConfirmationDialog(): void {
        this.setState({
            showConfirmationDialog: false
        });
    }

    /**
     * Makes a group member into an owner
     */
    private _makeOwner(member: IPerson, index: number): void {
        Engagement.logData({ name: 'GroupMembershipPanel.MakeOwner.Click' });
        if (!member.isOwnerOfCurrentGroup) {
            // Set member status to updating
            let updatingPersonas: IGroupMemberPersona[] = this._params.groupMembershipPanelContainer.state.personas;
            let oldContextualMenuTitle = updatingPersonas[index].contextualMenuTitle;
            let oldMemberStatusMenuItems = updatingPersonas[index].memberStatusMenuItems;
            this._setMemberStatusToUpdating(index);

            this._groupsProvider.addUserToGroupOwnership(
                this._pageContext.groupId,
                member.userId
            ).then(() => {
                this._updateGroupInformation();
            }, (error: any) => {
                this._setErrorMessage(error);
                // If an error occurred, undo setting the member status to updating
                this._undoSetMemberStatusToUpdating(index, oldContextualMenuTitle, oldMemberStatusMenuItems);
            });
        }
    }

    /**
     * Removes a user from the group
     */
    private _removeFromGroup(member: IPerson, index: number): void {
        Engagement.logData({ name: 'GroupMembershipPanel.RemovePerson.Click' });
        
        if (member.isOwnerOfCurrentGroup) {
            // If trying to remove last owner, show error message and do not remove
            let removingLastOwner = (this._params.groupMembershipPanelContainer.state) && (this._params.groupMembershipPanelContainer.state.totalNumberOfOwners < 2);
            if (removingLastOwner) {
                this.setState({
                    errorMessageText: this._params.strings.removeLastOwnerErrorText
                });
            // If an owner is trying to remove themselves from the group, must approve confirmation dialog
            } else if (member.userId === this._groupsProvider.currentUser.userId) {
                this._launchConfirmationDialog(() => { this.setState({showConfirmationDialog: false}); this._removeOwnerFromGroup(member, index); });
            } else {
                this._removeOwnerFromGroup(member, index);
            }
        } else {
            this._removeMemberFromGroup(member, index);
        }
    }

    /**
     * Removes an owner from the group entirely.
     * If the owner is trying to remove themselves from the group, they must approve confirmation dialog before this is called.
     */
    private _removeOwnerFromGroup(member: IPerson, index: number): void {
        // Set member status to updating
        let updatingPersonas: IGroupMemberPersona[] = this._params.groupMembershipPanelContainer.state.personas;
        let oldContextualMenuTitle = updatingPersonas[index].contextualMenuTitle;
        let oldMemberStatusMenuItems = updatingPersonas[index].memberStatusMenuItems;
        this._setMemberStatusToUpdating(index);
        // If member is an owner, should remove from the owners list first
        this._groupsProvider.removeUserFromGroupOwnership(
            this._pageContext.groupId,
            member.userId
        ).then(() => {
            this._groupsProvider.removeUserFromGroupMembership(
                this._pageContext.groupId,
                member.userId
            ).then(() => {
                this._processingAfterRemoveMember(member.userId);
            }, (error: any) => {
                this._setErrorMessage(error);
                this._undoSetMemberStatusToUpdating(index, oldContextualMenuTitle, oldMemberStatusMenuItems);
            });
        }, (error: any) => {
            this._setErrorMessage(error);
            this._undoSetMemberStatusToUpdating(index, oldContextualMenuTitle, oldMemberStatusMenuItems);
        });
    }

    /**
     * Removes a member (not an owner) from the group entirely.
     */
    private _removeMemberFromGroup(member: IPerson, index: number): void {
        // Set member status to updating
        let updatingPersonas: IGroupMemberPersona[] = this._params.groupMembershipPanelContainer.state.personas;
        let oldContextualMenuTitle = updatingPersonas[index].contextualMenuTitle;
        let oldMemberStatusMenuItems = updatingPersonas[index].memberStatusMenuItems;
        this._setMemberStatusToUpdating(index);
        // If member is not an owner, only remove from members list
        this._groupsProvider.removeUserFromGroupMembership(
            this._pageContext.groupId,
            member.userId
        ).then(() => {
            this._processingAfterRemoveMember(member.userId);
        }, (error: any) => {
            this._setErrorMessage(error);
            this._undoSetMemberStatusToUpdating(index, oldContextualMenuTitle, oldMemberStatusMenuItems);
        });
    }

    /**
     * Called to indicate that a persona is currently updating.
     * Changes menu title to "updating," removes contextual menu options, and re-renders personas.
     *
     * @param {number} memberIndex - the index in the personas list of the member that is being updated
     */
    private _setMemberStatusToUpdating(memberIndex: number): void {
        // Use .concat to create distinct array. This is necessary to trigger re-rendering of the members list.
        let updatingPersonas: IGroupMemberPersona[] = this._params.groupMembershipPanelContainer.state.personas.concat([]);
        updatingPersonas[memberIndex].showSpinner = true;
        updatingPersonas[memberIndex].contextualMenuTitle = this._params.strings.updatingText;
        updatingPersonas[memberIndex].memberStatusMenuItems = undefined;
        this.setState({
            personas: updatingPersonas
        });
    }

    /**
     * Called in the event of an error to undo the indication that a persona is currently updating.
     * Reverses the changes to the menu title and options.
     *
     * @param {number} memberIndex - the index in the personas list of the member that was being updated
     * @param {string} oldContextualMenuTitle - the previous menu title that you want to put back on the persona
     * @param {IContextualMenuItem[]} - the previous contextual menu options that you want to put back on the persona
     */
    private _undoSetMemberStatusToUpdating(memberIndex: number, oldContextualMenuTitle: string, oldMemberStatusMenuItems: IContextualMenuItem[]): void {
        // Use .concat to create distinct array. This is necessary to trigger re-rendering of the members list.
        let updatingPersonas: IGroupMemberPersona[] = this._params.groupMembershipPanelContainer.state.personas.concat([]);
        updatingPersonas[memberIndex].showSpinner = false;
        updatingPersonas[memberIndex].contextualMenuTitle = oldContextualMenuTitle;
        updatingPersonas[memberIndex].memberStatusMenuItems = oldMemberStatusMenuItems;
        this.setState({
            personas: updatingPersonas
        });
    }

    /**
     * Decide what to do after removing a group member. Handles the edge case when the owner of a private group
     * removes him/herself from the group.
     * 
     * @param {string} removedMemberId - the userId of the member who was just removed from the group
     */
    private _processingAfterRemoveMember(removedMemberId: string): void {
        // If the current user just removed him/herself from a private group, he/she will no longer have group access.
        // Navigate away to avoid getting into a peculiar state.
        this._membershipCountChanged = true;
        if (removedMemberId === this._groupsProvider.currentUser.userId && this._pageContext.groupType !== GROUP_TYPE_PUBLIC) {
            this._navigateOnRemoveMember();
        } else {
            this._updateGroupInformation();
        }
    }

    /**
     * If onMemberRemoved is present, navigate to the customized place.
     * Otherwise, navigate to SharePoint home page by default.
     */
    private _navigateOnRemoveMember() {
        if (this._params.onMemberRemoved) {
            this._params.onMemberRemoved();
        } else {
            window.open(this._getSharePointHomePageUrl(), '_self');
        }
    }

    // TODO: Use SuiteNavDataSource to get this url after msilver moves the SuiteNavDataSource to odsp-datasources (currently in odsp-next)
    private _getSharePointHomePageUrl(): string {
        const layoutString = '/_layouts/15/sharepoint.aspx';
        const webAbsoluteUrl = this._pageContext.webAbsoluteUrl;
        const webServerRelativeUrl = this._pageContext.webServerRelativeUrl;

        if (webAbsoluteUrl && webServerRelativeUrl) {
            return webAbsoluteUrl.replace(webServerRelativeUrl, '') + layoutString;
        } else {
            return undefined;
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
        this._membershipCountChanged = true;
        let selectedMemberNames: string[] = selectedMembers ? selectedMembers.map(member => { return member.name; }) : [];
        let selectedMemberPrincipalNames: string[] = selectedMembers ? selectedMembers.map(member => { return this._extractPrincipalName(member.userId); }) : [];
        return this._groupsProvider.addUsersToGroup(
            this._pageContext.groupId,
            null, /* owners (by GUID) */
            null, /* members (by GUID) */
            null, /* ownersPrincipalName */
            selectedMemberPrincipalNames /* members (by principalName)*/).then((result: IDataBatchOperationResult) => {
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
     * For guests, the userId has the form 'i:0#.f|membership|name_externaldomain.com#ext#@microsoft.onmicrosoft.com',
     * so we must be sure to encode '#' as '%23'.
     */
    private _extractPrincipalName(userId: string): string {
        let principalName = userId;
        if (principalName) {
            let separatorIndex = userId.lastIndexOf('|');
            if (separatorIndex !== -1) {
                let extractedName: string = principalName.substring(separatorIndex + 1);
                return encodeURIComponent(extractedName);
            }
        }
        return principalName;
    }
}
