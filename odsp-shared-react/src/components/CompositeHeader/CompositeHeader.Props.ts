import * as React from 'react';
import { ISiteHeaderProps } from '../SiteHeader/index';
import { IHorizontalNavProps } from '../HorizontalNav/index';
import { IMessageBarProps } from 'office-ui-fabric-react/lib/MessageBar';
import { IWithResponsiveModeState } from 'office-ui-fabric-react/lib/utilities/decorators/withResponsiveMode';
import { CompositeHeader } from './CompositeHeader';
import { HeaderLayoutType } from '@ms/odsp-datasources/lib/ChromeOptions';
import { SiteReadOnlyState } from '@ms/odsp-datasources/lib/dataSources/site/SiteDataSource';

/**
 * CompositeHeader class interface.
 */
export interface ICompositeHeader {
  /**
   * This is a passthrough method for the HorizontalNav's measureLayout() method. If horizontal nav
   * is present, it will invoke measureLayout on it. Otherwise, it will do nothing.
   *
   * @see IHorizontalNav.measureLayout()
   */
  measureNavLayout();
}

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
  /** Properties to pass through to StatusBar */
  messageBarProps?: IExtendedMessageBarProps;
  /** Properties for the Read Only bar */
  siteReadOnlyProps?: ISiteReadOnlyProps;
  /** Properties for the Policy bar */
  policyBarProps?: IExtendedMessageBarProps;
  /**
   * A search box that will be placed in the CompositeHeader
   */
  searchBox?: React.ReactElement<{}>;
  /** Composite header control layout for the current site - currently only supports two layouts. */
  layout?: HeaderLayoutType;
}


export interface IGoToOutlookProps {
  /** String for go to outlook string */
  goToOutlookString: string;
  /** What happens when you click go to Outlook */
  goToOutlookAction: (ev: React.MouseEvent<HTMLElement>) => void;
}

export interface IShareButtonProps extends IWithResponsiveModeState {
  /** The URL of the share page. */
  url: string;
  /** The share label */
  shareLabel: string;
  /** The loading label */
  loadingLabel: string;
  /** Override Share Command */
  onShare?: (ev: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => void
}

export interface IFollowProps extends IWithResponsiveModeState {
  /** Localized label for Follow */
  followLabel: string;
  /** Optional callback for when follow button is clicked. */
  followAction?: (ev: React.MouseEvent<HTMLElement>) => void;
  /** An enum value indicating follow state and in turn how the follow icon should be rendered. */
  followState: FollowState;
  /** Aria label to apply when you're following the site. */
  notFollowedAriaLabel?: string;
  /** Aria label to apply when you're not following the site. */
  followedAriaLabel?: string;
  /** Hover tooltip for when you're not following. */
  notFollowedHoverText?: string;
  /** Hover tooltip for when you're following. */
  followedHoverText?: string;
  /**
   * Label for follow button when you're not in following state.
   * @default Will default to value supplied for followLabel property.
   */
  notFollowedLabel?: string;

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
  /** The full read only and move state of the site. */
  siteReadOnlyState?: SiteReadOnlyState;
  /** The string to display when the site is read only because of a site move in progress. */
  siteIsMovingString?: string;
  /** The string to display when the site is read only because of a completed site move. */
  siteMoveCompletedString?: string;
}
