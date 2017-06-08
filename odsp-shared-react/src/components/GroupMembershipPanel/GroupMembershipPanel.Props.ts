import * as React from 'react';
import { GroupMembershipPanel } from './GroupMembershipPanel';
import { IContextualMenuItem } from 'office-ui-fabric-react/lib/components/ContextualMenu/index';
import { ISpPageContext } from '@ms/odsp-datasources/lib/interfaces/ISpPageContext';
import Promise from '@ms/odsp-utilities/lib/async/Promise';
import { IPerson } from '@ms/odsp-datasources/lib/PeoplePicker';

export interface IGroupMembershipPanelProps extends React.Props<GroupMembershipPanel> {
  /**
  * Event handler for when the panel is closed.
  */
  onDismiss?: () => void;
  /**
  * Indicates whether to show the panel.
  */
  showPanel?: boolean;
  /**
   * List of group members to display.
   */
  personas?: IGroupMemberPersona[];

  /**
   * Whether to use virtualized members list (uses paging)
   * or old members list.
   * Value is based on status of the flight.
   */
  useVirtualizedMembersList?: boolean;

  /**
   * Callback to load next page of members when user scrolls to the bottom
   */
  onLoadMoreMembers?: () => void;

  /**
   * Text for the title header of the group membership panel.
   */
  title: string;

  /**
   * Whether or not the current user can add members. True if the user is an owner or
   * this is a public group. Determines whether or not to display the add members button.
   */
  canAddMembers?: boolean;

  /**
   * Whether or not the current user can add and remove guests in this group.
   * True if the current user is an owner and guests are allowed at the group and tenant levels.
   * Determines whether guests can resolve in the PeoplePicker and whether you can remove them
   * with the contextual menu.
   */
  canAddGuests?: boolean;

  /**
   * Whether or not the current user can (1) change member status between owner and member
   * and (2) remove members from the group. Only true if the current user is an owner.
   * Determines whether or not to display the contextual menu for each person.
   */
  canChangeMemberStatus?: boolean;

  /**
   * Aria label for the close button in the top right corner of the panel
   */
  closeButtonAriaLabel?: string;

  /**
   * Aria label for the close button on the message bar that displays
   * error messages.
   */
  dismissErrorMessageAriaLabel?: string;

  /**
   * Text to display the total number of members in the group.
   */
  numberOfMembersText?: string;

  /**
   * The total number of members in the group.
   */
  totalNumberOfMembers?: number;

  /**
   * Contextual information for the current host.
   */
  pageContext: ISpPageContext;

  /**
   * Text for the add members button and title
   */
  addMembersText?: string;

  /**
   * Text for the done button in the add members UX
   */
  doneButtonText?: string;

  /**
   * Text for the cancel button in the add members UX
   */
  cancelButtonText?: string;

  /**
   * Error message at the top of the panel, if any
   */
  errorMessageText?: string;

  /**
   * Instructions to display for adding group members
   */
  addMembersInstructionsText?: string;

  /**
   * Instructions to display for adding group members or guests.
   * Displayed when adding guests is permitted. Contains a placeholder for a 
   * link defined by addGuestsLinkText.
   */
  addMembersOrGuestsInstructionsText?: string;

  /**
   * String to display for a link to Outlook. To add guests
   * by resolving arbitrary email addresses, users must go
   * to Outlook.
   */
  addGuestsLinkText?: string;

  /**
   * Hint to the user of what can be entered into the
   * PeoplePicker control
   */
  peoplePickerPlaceholderText?: string;

  /**
   * Message displayed if the group has a large number of members
   * to direct the user to use Search. If the group is not large,
   * message will be undefined.
   */
  largeGroupMessage?: string;

  /**
   * String to display for the link to manage group members in OWA.
   * This string will be inserted into the largeGroupMessage.
   */
  outlookLinkText?: string;

  /**
   * Text for the OK button in the confirmation dialog
   */
  okButtonText?: string;

  /**
   * Text for the confirmation dialog when an owner attempts to remove themselves
   * from the group
   */
  confirmationText?: string;

  /**
   * Text for the message that appears when the user is about to add a guest
   * to the group.
   */
  addingGuestText?: string;

  /**
   * URL to manage the group members in OWA
   */
  membersUrl?: string;

  /**
   * Callback function to save selected members
   */
  onSave?: (selectedMembers: IPerson[]) => Promise<void>;

  /**
   * Callback function to clear error message
   */
  clearErrorMessage?: () => void;

  /**
   * Whether or not to show the confirmation dialog that appears
   * when a user is trying to remove themselves from the group ownership
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

export interface IGroupMemberPersona {
  /**
   * Name of the person.
   */
  name?: string;

  /**
   * Url to the image to use, should be a square aspect ratio and big enough to fit in the image area.
   */
  imageUrl?: string;

  /**
   * Whether the person is a group owner.
   */
  isGroupOwner?: boolean;

  /**
   * The contextual menu items to make a person a member,
   * owner, or remove them from the group.
   */
  memberStatusMenuItems?: IContextualMenuItem[];

  /**
   * Title to display for the contextual menu
   */
  contextualMenuTitle?: string;

  /**
   * Whether or not to show the progress spinner
   */
  showSpinner?: boolean;
}
