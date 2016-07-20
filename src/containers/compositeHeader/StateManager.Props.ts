import * as React from 'react';

import { IHorizontalNavItem } from '../../HorizontalNav';
import { IFacepilePersona } from '@ms/office-ui-fabric-react/lib/Facepile';
import {
    FollowState
} from '../../CompositeHeader';
import IHostSettings from '@ms/odsp-datasources/lib/dataSources/base/IContext';
import { IGroupCardLinks } from '../../components/GroupCard/GroupCard.Props';
import INavNode from '@ms/odsp-datasources/lib/dataSources/base/INavNode';

import Promise from '@ms/odsp-utilities/lib/async/Promise';
import { IGroupsProvider } from '@ms/odsp-datasources/lib/providers/groups/GroupsProvider';

/**
 * Enum to specify what kind of link this is.
 */
export enum GroupCardLinkTypes {
    // do not change the order of these enums. It's used as an index into the
    // the map array in _groupCardLinksFromGroupCardLinkParams
    mail,
    calendar,
    docs,
    notebook,
    site,
    peopleUrl
}

/**
 * Hosts that want to show a group card as part of the site header need to provide the set of links
 * that will be displayed in the group card.
 */
export interface IGroupCardLinkParams {
    /**
     * Specifies the type of link this is. e.g. mail, calendar etc. This will determine what URL
     * gets mapped with this link
     */
    linkType: GroupCardLinkTypes;
    /**
     * Localized string that is the title of this link. Optional, but one of title or icon or both must be specified
     */
    title?: string;
    /**
     * Icon string to specify the icon to display. Optional, but on of title or icon or both must be specified
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
     * The formated info for the group or site.
     * Ex: Private Group with guests | LBI
     */
    groupInfoString?: string;
    /**
     * The URL to navigate when people click on the site logo action.
     */
    siteLogoUrl?: string;
    /**
     * The metadata about the site actonym containig the acronym
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
    horizontalNavItems?: IHorizontalNavItem[];
    /** The absolute url to the site */
    webAbsoluteUrl?: string;
    /** The on click handler for the site logo  */
    logoOnClick?: (ev: React.MouseEvent) => void;
    /** URL to Conversations in OWA for a group */
    outlookUrl?: string;
    /** URL to Members in OWA for a group */
    membersUrl?: string;
    /**
     * For a group site, the metadata about the members that
     * should show in the face-pile control
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
}

/**
 * Holds the params of the manager that controls the state
 * of the SiteHeaderContainer.
 */
export interface ISiteHeaderContainerStateManagerParams {
    /** The host settings */
    hostSettings: IHostSettings;
    /** The SiteHeaderContainer object */
    siteHeader: React.Component<any, ISiteHeaderContainerState>;
    /** The callback when the site icon has been clicked on */
    logoOnClick: (url: string, ev: React.MouseEvent) => void;
    /** The callback for the navigation to group conversation */
    goToOutlookOnClick: (ev: React.MouseEvent) => void;
    /** The callback for the navigation to members */
    goToMembersOnClick: (ev: React.MouseEvent) => void;
    /** The callback for nav node click */
    topNavNodeOnClick: (node: INavNode, item: IHorizontalNavItem, ev: React.MouseEvent) => void;
    /** The callback to open a persona card */
    openPersonaCard: (persona: IFacepilePersona, ev: React.MouseEvent) => void;
    /** Requests a groups provider */
    getGroupsProvider: () => Promise<IGroupsProvider>;
    /** Collection of localized strings to show in the site header UI */
    strings: {
        /** The Group Conversations link text */
        goToOutlook: string;
        /** The group info for Public Group */
        publicGroup: string;
        /** The group info for Private Group */
        privateGroup: string;
        /** The string format for the group info including classification and guests */
        groupInfoWithClassificationAndGuestsFormatString: string;
        /** The string format for the group info including classification */
        groupInfoWithClassificationFormatString: string;
        /** The string format for the team site info incldding guests */
        groupInfoWithGuestsForTeamsites: string;
        /** The string format for the members info including the count */
        membersCount: string;
        /** The count intervals for the members info including the count */
        membersCountIntervals: string;
        /** String for a group that has guests. */
        groupInfoWithGuestsFormatString: string;
        /** Localized label for follow */
        followString?: string;
        /** String for the share dialog label. */
        shareLabel?: string;
        /** String for the loading spinner. */
        loadingLabel?: string;
    };
    /**
     * Optional array of GroupCard link info. This is optional. If not provided, then the GroupCard will not be
     * displayed as part of the header
     */
    groupCardInfo?: IGroupCardLinkParams[];
}