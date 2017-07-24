import * as React from 'react';
import { IBaseProps } from 'office-ui-fabric-react';

import { MembersInfo } from './MembersInfo';
import { MembersInfoJoinButton } from './MembersInfo.JoinButton';

export interface IMembersInfoProps extends React.Props<MembersInfo|MembersInfoJoinButton>, IBaseProps {
  /**
   * Text displaying how many members are part of this site.
   * @default: null
   */
  membersText: string;

  /**
   * The boolean indicates if the user is a member of current group.
   * @default: false
   */
  isMemberOfCurrentGroup?: boolean;

  /**
   * The boolean indicates if join/leave group feature is enabled.
   * @default: false
   */
  enableJoinLeaveGroup?: boolean;

  /**
   * Properties for Joined button, which shows up when the user is already a member of current group.
   */
  onJoined?: IJoinedButtonProps;

  /**
   * Properties for Join button, which shows up when the user is not a member of current group.
   */
  onJoin?: IJoinButtonProps;

  /**
   * Properties for Leave group menu item, which shows up as a contextual menu item after you click Joined button.
   */
  onLeaveGroup?: ILeaveGroupProps;

  /**
   * The error message text for join or leave error.
   */
  joinLeaveError?: string;

  /** What happens when you click error dismiss X */
  onErrorDismissClick?: (ev: React.MouseEvent<HTMLElement>) => void;

  /**
   * The boolean to track the leaving status after Leave Group is clicked.
   * @default: false
   */
  isLeavingGroup?: boolean;

  /**
   * This method will get called when the text in membersText is clicked.
   * If group membership panel feature is turned off, this will navigate to OWA membership experience.
   * If group membership panel feature is turned on, this will execute action to launch the group membership panel.
   *
   * @default: undefined
   */
  goToMembersAction?: (ev: React.MouseEvent<HTMLElement>) => void;
}

export interface IJoinedButtonProps {
  /** String for Joined button */
  onJoinedString?: string;

  /** What happens when you click Joined button */
  onJoinedAction?: (ev: React.MouseEvent<HTMLElement>) => void;
}

export interface IJoinButtonProps {
  /** String for Join button */
  onJoinString?: string;

  /** String for joining status */
  onJoiningString?: string;

  /** What happens when you click Join button */
  onJoinAction?: (ev: React.MouseEvent<HTMLElement>) => void;
}

export interface ILeaveGroupProps {
  /** String for Leave group menu item */
  onLeaveGroupString?: string;

  /** String for leaving status */
  onLeavingGroupString?: string;

  /** What happens when you click Leave group menu item */
  onLeaveGroupAction?: (ev: React.MouseEvent<HTMLElement>) => void;
}
