import * as React from 'react';
import { GroupMembershipPanel } from './GroupMembershipPanel';
import { PersonaInitialsColor } from 'office-ui-fabric-react/lib/Persona';
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
   * Text for the title header of the group membership panel.
   */
  title: string;

  /**
   * Whether or not the current user can (1) change member status between owner and member
   * and (2) remove members from the group. Only true if the current user is an owner.
   * Determines whether or not to display the contextual menu for each person.
   */
  canChangeMemberStatus?: boolean;

  /**
   * Text to display for each person who is a group member.
   */
  memberText?: string;

  /**
   * Text to display for each person who is a group owner.
   */
  ownerText?: string;

  /**
   * Text to display the total number of members in the group.
   */
  numberOfMembersText?: string;

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
   * The user's initials to display in the image area when there is no image.
   */
  imageInitials?: string;

  /**
   * The background color when the user's initials are displayed.
   * @defaultvalue PersonaInitialsColor.blue
   */
  initialsColor?: PersonaInitialsColor;

  /**
   * Whether the person is a group owner.
   */
  isGroupOwner?: boolean;

  /**
   * The contextual menu items to make a person a member,
   * owner, or remove them from the group.
   */
  memberStatusMenuItems?: IContextualMenuItem[];
}
