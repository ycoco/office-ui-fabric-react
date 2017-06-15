import * as React from 'react';

import { INavLink } from 'office-ui-fabric-react/lib/Nav';
import { IFacepilePersona } from 'office-ui-fabric-react/lib/Facepile';
import {
    FollowState,
    IExtendedMessageBarProps
} from '../../CompositeHeader';
import { ISpPageContext as IHostSettings } from '@ms/odsp-datasources/lib/interfaces/ISpPageContext';
import { IGroupCardLinks } from '../../components/GroupCard/GroupCard.Props';

import Promise from '@ms/odsp-utilities/lib/async/Promise';
import { IGroupsProvider } from '@ms/odsp-datasources/lib/providers/groups/GroupsProvider';
import { IGroupSiteProvider } from '@ms/odsp-datasources/lib/providers/groups/GroupSiteProvider';
import { SiteDataSource, SiteReadOnlyState } from '@ms/odsp-datasources/lib/Site';
import { ViewNavDataSource } from '@ms/odsp-datasources/lib/ViewNav';
import { FollowDataSource } from '@ms/odsp-datasources/lib/Follow';

/**
 * Enum to specify what kind of link this is.
 */
export enum GroupCardLinkTypes {
    // do not change the order of these enums. It's used as an index into the
    // the map array GROUP_CARD_LINK_TYPES_MAP in StateManager.ts
    mail,
    calendar,
    docs,
    notebook,
    site,
    peopleUrl,
    planner
}

/**
 * Enum to specify what kind of link this is.
 */
export enum HorizontalNavTypes {
    quickLaunch,
    topNav,
    divisionalNav
}

/**
 * Hosts that want to show a group card as part of the site header need to provide the set of links
 * that will be displayed in the group card.
 */
export interface IGroupCardLinkParams {
    /**
     * Specifies the type of link this is. e.g. mail, calendar etc. This will determine what URL
     * gets mapped with this link.
     */
    linkType: GroupCardLinkTypes;
    /**
     * Localized string that is the title of this link. Optional, but one of title or icon or both must be specified.
     */
    title?: string;
    /**
     * Icon string to specify the icon to display. Optional, but on of title or icon or both must be specified.
     */
    icon?: string;
}

/**
 * The state of the site header container that is being managed.
 */
export interface ISiteHeaderContainerState {
    /**
     * To be used only for group sites, contains the formatted members text.
     * Should be left undefined when members info should not be displayed.
     * Ex: 13 members
     */
    membersText?: string;
    /**
     * The formatted info for the group or site.
     * Ex: Private Group with guests | LBI
     */
    groupInfoString?: string;
    /**
     * The URL to navigate when people click on the site logo action.
     */
    siteLogoUrl?: string;
    /**
     * The metadata about the site acronym containing the acronym
     * and the colors.
     */
    siteAcronym?: string;
    /**
     * The site logo color.
     */
    siteLogoColor?: string;
    /**
     * The data structure that contains the horizontal navigation metadata.
     */
    horizontalNavItems?: INavLink[];
    /** The horizontalNav edit mode flag. */
    editModeHorizontalNav?: boolean;
    /** The absolute url to the site. */
    webAbsoluteUrl?: string;
    /** The on click handler for the site logo . */
    logoOnClick?: (ev: React.MouseEvent<HTMLElement>) => void;
    /** URL to Conversations in OWA for a group. */
    outlookUrl?: string;
    /** URL to Members in OWA for a group. */
    membersUrl?: string;
    /** URL to usage guidelines, if there is one. */
    usageGuidelineUrl?: string;
    /**
     * For a group site, the metadata about the members that
     * should show in the face-pile control.
     */
    facepilePersonas?: IFacepilePersona[];
    /**
     * Group links: An array of links that will show up in the Group Card of the site header.
     */
    groupLinks?: IGroupCardLinks[];
    /**
     * What state the follow button is in.
     */
    followState?: FollowState;
    /** The state for the message bar. */
    messageBarState?: IExtendedMessageBarProps;
    /** Whether the site is read only. */
    isSiteReadOnly?: boolean;
    /** The site read only and cross-geo move state */
    siteReadOnlyState?: SiteReadOnlyState;
    /** The state for the policy bar. */
    policyBarState?: IExtendedMessageBarProps;
    /** Whether authentication policy is enabled */
    isAuthenticationPolicyEnabled?: boolean;
    /** Whether the user is a member of current group. */
    isMemberOfCurrentGroup?: boolean;
    /** The error message during join and leave group process. */
    joinLeaveErrorMessage?: string;
    /** The status for leaving group but not finish the leave process yet. */
    isLeavingGroup?: boolean;
    /**The boolean state indicates if join/leave group feature is enabled. */
    enableJoinLeaveGroup?: boolean;
    /**The horizontal Nav Edit link. */
    editLink?: INavLink;
    /**The horizontal Nav Edit mode flag. */
    isEditMode?: boolean;
}

/**
 * Holds the params of the manager that controls the state
 * of the SiteHeaderContainer.
 .*/
export interface ISiteHeaderContainerStateManagerParams {
    /** The host settings. */
    hostSettings: IHostSettings;
    /** The SiteHeaderContainer object. */
    siteHeader: React.Component<any, ISiteHeaderContainerState>;
    /** The callback when the site icon has been clicked on. */
    logoOnClick: (url: string, ev: React.MouseEvent<HTMLElement>) => void;
    /** The callback for the navigation to group conversation. */
    goToOutlookOnClick: (ev: React.MouseEvent<HTMLElement>) => void;
    /** The callback for the navigation to members. */
    goToMembersOnClick: (ev: React.MouseEvent<HTMLElement>) => void;
    /** The callback for nav node click. */
    topNavNodeOnClick: (ev: React.MouseEvent<HTMLElement>, item?: INavLink) => void;
    /** The callback to open a persona card. */
    openPersonaCard: (persona: IFacepilePersona, ev: React.MouseEvent<HTMLElement>) => void;
    /** Requests a groups provider. */
    getGroupsProvider: () => Promise<IGroupsProvider>;
    /** Requests a site data source. */
    getSiteDataSource: () => Promise<SiteDataSource>;
    /** Requests a group site provider. */
    getGroupSiteProvider?: () => Promise<IGroupSiteProvider>;
    /** (optional)Requests a topNav data source. */
    getViewNavDataSource?: () => Promise<ViewNavDataSource>;
    /** (optional) Returns an instance of the followDataSource, if not will initialize one itself. */
    followDataSource?: FollowDataSource;
    /** Collection of localized strings to show in the site header UI. */
    strings: ISiteHeaderContainerStateManagerStrings;
    /**
     * Optional array of GroupCard link info. This is optional. If not provided, then the GroupCard will not be
     * displayed as part of the header.
     */
    groupCardInfo?: IGroupCardLinkParams[];
    /** The callback for join group button. */
    joinGroupOnClick?: (ev: React.MouseEvent<HTMLElement>) => void;
    /** The callback for leave group contextual menu item. */
    leaveGroupOnClick?: (ev: React.MouseEvent<HTMLElement>) => void;
    /** The callback for joined button. */
    joinedButtonOnClick?: (ev: React.MouseEvent<HTMLElement>) => void;
    /** After the user left a private group, this callback can be used for customizing the place to navigate. */
    navigateOnLeaveGroup?: (ev: React.MouseEvent<HTMLElement>) => void;
    /** Horizontal navigation type. */
    horizontalNavType?: HorizontalNavTypes;
    /** horizontalNav edit entry link if applied. */
    editLink?: INavLink;
}

export interface ISiteHeaderContainerStateManagerStrings {
    /** The Group Conversations link text. */
    goToOutlook: string;
    /** The group info for Public Group. */
    publicGroup: string;
    /** The group info for Private Group. */
    privateGroup: string;
    /** The string format for the group info including classification and guests. */
    groupInfoWithClassificationAndGuestsFormatString: string;
    /** The string format for the group info including classification. */
    groupInfoWithClassificationFormatString: string;
    /** The string format for the team site info incldding guests. */
    groupInfoWithGuestsForTeamsites: string;
    /** Site Header groupInfo property string for teamsites that includes classification and guests information. */
    groupInfoWithClassificationAndGuestsForTeamsites?: string;
    /** The string format for the members info including the count. */
    membersCount: string;
    /** The count intervals for the members info including the count. */
    membersCountIntervals: string;
    /** String for a group that has guests.. */
    groupInfoWithGuestsFormatString: string;
    /** Localized label for follow. */
    followString?: string;
    /** String for the share dialog label. */
    shareLabel?: string;
    /** String for the loading spinner. */
    loadingLabel?: string;
    /** String for the site read only bar. */
    siteReadOnlyString?: string;
    /** String for the site read only bar when the site is read only due to a cross-geo move in progress. */
    siteIsMovingString?: string;
    /** String for the site read only bar when the site is read only due to a cross-geo move that has completed. */
    siteMoveCompleteString?: string;
    /** Aria label to apply when you're following the site. */
    notFollowedAriaLabel?: string;
    /** Aria label to apply when you're not following the site. */
    followedAriaLabel?: string;
    /** Hover tooltip for when you're not following. */
    followedHoverText?: string;
    /** Hover tooltip for when you're following. */
    notFollowedHoverText?: string;
    /**
     * Label for follow button when you're not in following state.
     * @default Will default to value supplied for followLabel property.
     */
    notFollowedLabel?: string;
    /** Localized "More info" string for the MessageBar.  */
    messageBarMoreInfoString?: string;
    /** String for the authentication policy bar. */
    authPolicyEnabledString?: string;
    /** String for join group button. */
    joinGroupLabel?: string;
    /** String for leave group contextual menu item. */
    leaveGroupLabel?: string;
    /** String for joined button. */
    joinedButtonLabel?: string;
    /** String for joining status. */
    joiningGroupLabel?: string;
    /** String for leaving status. */
    leavingGroupLabel?: string;
    /** String for the error when you try to leave the group as the last owner of the group. */
    lastOwnerError?: string;
    /** Aria label for horizontal nav bar. */
    horizontalNavAriaLabel?: string;
    /** Aria label for horizontal nav bar split button. */
    horizontalNavSplitButtonAriaLabel?: string;
}
