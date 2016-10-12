import * as React from 'react';
import { GroupMembershipPanel } from './GroupMembershipPanel';
import { PersonaInitialsColor } from 'office-ui-fabric-react/lib/Persona';

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
}
