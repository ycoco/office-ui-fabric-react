import * as React from 'react';
import ISpPageContext from '@ms/odsp-datasources/lib/interfaces/ISpPageContext';
import Promise from '@ms/odsp-utilities/lib/async/Promise';
import { IGroupsProvider } from '@ms/odsp-datasources/lib/Groups';
import { IGroupSiteProvider } from '@ms/odsp-datasources/lib/providers/groups/GroupSiteProvider';
import { IGroupMemberPersona } from '../../components/GroupMembershipPanel/GroupMembershipPanel.Props';

/**
 * The state of the group membership container control.
 */
export interface IGroupMembershipPanelContainerState {
    /**
     * Text for the title header of the group membership panel
     */
    title?: string;
    /**
     * List of group members to display
     */
    personas?: IGroupMemberPersona[];
    /**
     * Whether or not the current user is an owner. Owners can
     * (1) change member status between owner and member,
     * (2) remove members from the group, and
     * (3) add/remove guests if group and tenant settings allow it.
     */
    currentUserIsOwner?: boolean;

    /**
     * Total number of members in the group
     */
    totalNumberOfMembers?: number;

    /**
     * Total number of owners in the group
     */
    totalNumberOfOwners?: number;

    /**
     * Text to display the total number of members in the group
     */
    numberOfMembersText?: string;

    /**
     * Error message at the top of the panel, if any
     */
    errorMessageText?: string;

    /**
     * Message displayed if the group has a large number of members
     * to direct the user to use Search. If the number of members is not
     * large, will be undefined.
     */
    largeGroupMessage?: string;

    /**
     * Whether or not to show the confirmation dialog that appears
     * when a user is trying to remove themselves from the group ownership.
     * Defaults to false.
     */
    showConfirmationDialog?: boolean;

    /**
     * Callback function for when the user approves the confirmation dialog
     * to remove themselves as an owner
     */
    onApproveConfirmationDialog?: () => void;

    /**
     * Callback function for when the user closes or cancels the confirmation dialog
     * to remove themselves as an owner
     */
    onCloseConfirmationDialog?: () => void;
}

/**
 * Holds the params of the manager that controls the state
 * of the GroupMembershipPanel
 */
export interface IGroupMembershipPanelContainerStateManagerParams {
    /**
     * The GroupMembershipPanelContainer object
     */
    groupMembershipPanelContainer: React.Component<{}, IGroupMembershipPanelContainerState>;

    /**
     * Contextual information for the current host
     */
    pageContext: ISpPageContext;

    /** 
     * Requests a groups provider
     */
    getGroupsProvider: () => Promise<IGroupsProvider>;

    /**
     * Requests a group site provider.
     * Used to determine whether guests are enabled at the tenant level
     */
    getGroupSiteProvider?: () => Promise<IGroupSiteProvider>;

    /**
     * All the strings to use in the group membership panel
     */
    strings: IGroupMembershipPanelContainerStateManagerStrings;

    /** 
     * Optional callback to navigate to a particular place when the owner
     * of a private group removes him/herself. By default, we will navigate to
     * the SharePoint home page.
     */
    onMemberRemoved?: () => void;
}

export interface IGroupMembershipPanelContainerStateManagerStrings {
    /**
     * Text for the title header of the group membership panel.
     */
    title: string;

    /**
     * Text to display for each person who is a group member.
     */
    memberText?: string;

    /**
     * Text to display for each person who is a group owner.
     */
    ownerText?: string;

    /**
     * Text to display for each person who is a guest.
     */
    guestText?: string;

    /**
     * Text to display in the persona when the member status is updating.
     */
    updatingText?: string;

    /**
     * Text to display for the option to remove a person from
     * the group.
     */
    removeFromGroupText?: string;

    /**
     * String used by StringHelper.getLocalizedCountValue to compute
     * the string for the total number of members. Has the format
     * {0} members||{0} member||{0} members
     */
    membersCountText?: string;

    /**
     * String used by StringHelper.getLocalizedCountValue to compute
     * the string for the total number of members. Has the format
     * 0||1||2-
     */
    membersCountIntervalsText?: string;

    /**
     * Text for the add members button and title.
     */
    addMembersText?: string;

    /**
     * Text for the done button in the add members UX.
     */
    doneButtonText?: string;

    /**
     * Text for the cancel button in the add members UX.
     */
    cancelButtonText?: string;

    /**
     * Error message to display when user attempts to remove last owner.
     */
    removeLastOwnerErrorText?: string;

    /**
     * Error message to display when user attempts to demote last owner to a member.
     */
    demoteLastOwnerErrorText?: string;

    /**
     * Instructions to display for adding group members.
     */
    addMembersInstructionsText?: string;

    /**
     * Hint to the user of what can be entered into the
     * PeoplePicker control.
     */
    peoplePickerPlaceholderText?: string;

    /**
     * Error message to display when adding a single member failed.
     */
    addMemberFailedSingularText?: string;

    /**
     * Error message to display when adding multiple members failed.
     */
    addMemberFailedPluralText?: string;

    /**
     * Generic error message to display when the add members operation failed.
     */
    addMemberFailedText?: string;

    /**
     * Generic error message to display when the request to the server failed
     * but no error message was returned
     */
    serverErrorMessage?: string;

    /**
     * Message to display if the group has a large number of members
     * to direct the user to view all members in OWA.
     */
    largeGroupMessage?: string;

    /**
     * String to display for the link to manage group members in OWA.
     * This string will be inserted into the largeGroupMessage.
     */
    outlookLinkText?: string;

    /**
     * Message to display if the group has a large number of members
     * to direct the user to use Search.
     */
    searchMembersMessage?: string;

    /**
     * String to display for the link to search for specific members in OWA.
     * This string will be inserted into the searchMembersMessage.
     */
    searchLinkText?: string;

    /**
     * Aria label for the close button in the top right corner of the panel
     * and in the confirmation dialog.
     */
    closeButtonAriaLabel?: string;

    /**
     * Aria label for the close button on the message bar that displays
     * error messages.
     */
    dismissErrorMessageAriaLabel?: string;

    /**
     * Text for the OK button in the confirmation dialog.
     */
    okButtonText?: string;

    /**
     * Text for the confirmation dialog when an owner attempts to remove themselves
     * from the group.
     */
    confirmationText?: string;

    /**
     * Text for the message that appears when the user is about to add a guest
     * to the group.
     */
    addingGuestText?: string;

    /**
     * Error message to display if a server error occurred while loading the group
     * members.
     */
    loadingMembersErrorText?: string;
}
