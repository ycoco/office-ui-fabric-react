import * as React from 'react';
import { ISiteHeaderProps } from '../SiteHeader/index';
import { IHorizontalNavProps } from '../HorizontalNav/index';
import { IMessageBarProps } from 'office-ui-fabric-react/lib/MessageBar';
import { IWithResponsiveModeState } from 'office-ui-fabric-react/lib/utilities/decorators/withResponsiveMode';
import { CompositeHeader } from './CompositeHeader';

export interface ICompositeHeaderProps extends React.Props<CompositeHeader>, IWithResponsiveModeState {
  /** Properties to pass through for site header */
  siteHeaderProps: ISiteHeaderProps;
  /** Properties to pass through to HorizontalNav */
  horizontalNavProps: IHorizontalNavProps;
  /** Properties for Go To Outlook button - go to outlook button will only render if this is defined */
  goToOutlook?: IGoToOutlookProps;
  /** Properties for the Follow button - follow button will only render if this is defined */
  follow?: IFollowProps;
  /** Properties for the Share Button */
  shareButton?: IShareButtonProps;
  /** Properties to pass through to MessageBar */
  messageBarProps?: IExtendedMessageBarProps;
  /** Properties for the Read Only bar */
  siteReadOnlyProps?: ISiteReadOnlyProps;
}

export interface IGoToOutlookProps {
  /** String for go to outlook string */
  goToOutlookString: string;
  /** What happens when you click go to Outlook */
  goToOutlookAction: (ev: React.MouseEvent) => void;
}

export interface IShareButtonProps {
  /** The URL of the share page. */
  url: string;
  /** The share label */
  shareLabel: string;
  /** The loading label */
  loadingLabel: string;
}

export interface IFollowProps {
  /** Localized label for Follow */
  followLabel: string;
  /** Optional callback for when follow button is clicked. */
  followAction?: (ev: React.MouseEvent) => void;
  /** An enum value indicating follow state and in turn how the follow icon should be rendered. */
  followState: FollowState;
}

/**
 * An enumeration indicating follow state and in turn how the follow icon should be rendered.
 */
export enum FollowState {
  /**
   * Renders an empty star indicating that the user is not following the site.
   */
  notFollowing,
  /**
   * Renders an animation indicating that a state transition is taking place.
   */
  transitioning,
  /**
   * Renders a filled star indicated that the user is currently following the site.
   */
  followed
}

export interface IExtendedMessageBarProps extends IMessageBarProps {
  /** The message to show in the MessageBar */
  message: string;
  linkText?: string;
  linkTarget?: string;
}

export interface ISiteReadOnlyProps {
  /** Whether the site is read only. */
  isSiteReadOnly: boolean;
  /** The string to display to users when the site is read only. */
  siteReadOnlyString: string;
}
