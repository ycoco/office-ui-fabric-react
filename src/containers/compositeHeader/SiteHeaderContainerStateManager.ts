// OneDrive:IgnoreCodeCoverage

import * as React from 'react';
import { ISiteHeaderProps, ISiteLogoInfo } from '../../components/SiteHeader';
import { IHorizontalNavProps, IHorizontalNavItem } from '../../components/HorizontalNav';
import {
FollowState,
ICompositeHeaderProps,
IFollowProps,
IGoToOutlookProps,
IShareButtonProps
} from '../../components/CompositeHeader';
import { IFacepileProps, IFacepilePersona } from '@ms/office-ui-fabric-react/lib/Facepile';
import IHostSettings from '@ms/odsp-datasources/lib/dataSources/base/IContext';
import SiteHeaderLogoAcronymDataSource, { IAcronymColor } from '@ms/odsp-datasources/lib/dataSources/siteHeader/SiteHeaderLogoAcronymDataSource';
import INavNode from '@ms/odsp-datasources/lib/dataSources/base/INavNode';
import Group, { SourceType } from '@ms/odsp-datasources/lib/models/groups/Group';
import { IGroupsProvider } from '@ms/odsp-datasources/lib/providers/groups/GroupsProvider';
import StringHelper = require('@ms/odsp-utilities/lib/string/StringHelper');
import Async from '@ms/odsp-utilities/lib/async/Async';
import Promise from '@ms/odsp-utilities/lib/async/Promise';
import EventGroup from '@ms/odsp-utilities/lib/events/EventGroup';
import Features from '@ms/odsp-utilities/lib/features/Features';
import FollowDataSource, { SitesSeperator } from '@ms/odsp-datasources/lib/dataSources/siteHeader/FollowDataSource';
import DataStore from '@ms/odsp-utilities/lib/models/store/BaseDataStore';
import DataStoreCachingType from '@ms/odsp-utilities/lib/models/store/DataStoreCachingType';

const PEOPLE_CARD_HOVER_DELAY: number = 300; /* ms */ // from 'odsp-next/controls/peopleCard/PeopleCardConstants'

/**
 * The state of the site header container control
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
    /**
     * For a group site, the metadata about the members that
     * should show in the face-pile control
     */
    facepilePersonas?: IFacepilePersona[];
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
}

/** SP horizontal nav constant */
const HorizontalNavHomeNodeId: number = 2003;
/** The groupType property value indicating a public group */
const GroupTypePublic: string = 'Public';
/** default site icon */
const DefaultLogoString: string = '_layouts/15/images/siteicon.png';
/** default logo size */
const DefaultLogoSize: string = '&size=HR96x96';
/** possible colors from the acronym service */
const ColorServicePossibleColors: string[] = [
    '#0078d7',
    '#088272',
    '#107c10',
    '#881798',
    '#b4009e',
    '#e81123',
    '#da3b01',
    '#006f94',
    '#005e50',
    '#004e8c',
    '#a80000',
    '#4e257f'
];
/** Identifier for site header session storage */
export const SiteHeaderStoreKey: string = 'ModernSiteHeader';
/** Identifier for string in store that contains the user's followed sites */
export const FollowedSitesInStoreKey: string = 'FollowedSites';

/**
 * This class manages the state of the SiteHeaderHost.
 * It will be moved outside of ODSP-NEXT so please do not add any new ODSP-NEXT dependencies to it
 */
export default class SiteHeaderContainerStateManager {
    private _params: ISiteHeaderContainerStateManagerParams;
    private _hostSettings: IHostSettings;
    private _isGroup: boolean;
    private _hasParsedMembers: boolean;
    private _hasParsedGroupBasicInfo: boolean;
    private _utilizingTeamsiteCustomLogo: boolean;
    private _groupsProvider: IGroupsProvider;
    private _acronymDatasource: SiteHeaderLogoAcronymDataSource;
    private _followDataSource: FollowDataSource;
    private _hoverTimeoutId: number;
    private _lastMouseMove: any;
    private _async: Async;
    private _eventGroup;
    private _store: DataStore = new DataStore(SiteHeaderStoreKey, DataStoreCachingType.session);
    private _followedSites: string;

    constructor(params: ISiteHeaderContainerStateManagerParams) {
        this._params = params;
        const hostSettings = params.hostSettings;
        this._hostSettings = hostSettings;
        this._isGroup = !!hostSettings.groupId;
        this._async = new Async();

        this._onGoToOutlookClick = this._onGoToOutlookClick.bind(this);
        this._onFollowClick = this._onFollowClick.bind(this);

        // setup site logo
        let siteLogoUrl: string = params.hostSettings.webLogoUrl;
        if (siteLogoUrl) {
            this._utilizingTeamsiteCustomLogo = siteLogoUrl.indexOf(DefaultLogoString) === -1;
            if (!this._utilizingTeamsiteCustomLogo) {
                siteLogoUrl = undefined;
            }
        }

        // Set up what happens when the logo is clicked
        const webAbsoluteUrl: string = params.hostSettings.webAbsoluteUrl;
        let logoOnClick: (ev: React.MouseEvent) => void;

        if (webAbsoluteUrl) {
            logoOnClick = (ev: React.MouseEvent) => {
                params.logoOnClick(webAbsoluteUrl, ev);
                ev.stopPropagation();
                ev.preventDefault();
            };
        }

        // setup the horizontal nav
        let horizontalNavItems: IHorizontalNavItem[];
        if (hostSettings.navigationInfo && hostSettings.navigationInfo.topNav) {
            const topNavNodes: INavNode[] = hostSettings.navigationInfo.topNav;
            horizontalNavItems = topNavNodes
                .filter((node: INavNode) => node.Id !== HorizontalNavHomeNodeId) // remove the home link from the topnav
                .map((node: INavNode) => ({
                    onClick: (item: IHorizontalNavItem, ev: React.MouseEvent): void => {
                        params.topNavNodeOnClick(node, item, ev);
                        ev.stopPropagation();
                        ev.preventDefault();
                    },
                    text: node.Title
                } as IHorizontalNavItem));
        }

        this._processGroups();

        this._params.siteHeader.state = {
            membersText: undefined,
            groupInfoString: this._determineGroupInfoString(),
            siteLogoUrl: siteLogoUrl,
            horizontalNavItems: horizontalNavItems,
            logoOnClick: logoOnClick,
            webAbsoluteUrl: webAbsoluteUrl
        };
    }

    public componentDidMount() {
        const hostSettings = this._hostSettings;

        // **** Acronym setup ****/
        const acronymDatasource = new SiteHeaderLogoAcronymDataSource(hostSettings);
        this._acronymDatasource = acronymDatasource;
        acronymDatasource.getAcronymData(hostSettings.webTitle).done((value: IAcronymColor) => {
            this.setState({
                siteAcronym: value.acronym,
                siteLogoColor: value.color
            });
        });

        // **** Follow Button Setup ****/
        const setStateBasedOnIfSiteIsAlreadyFollowed = (followedSites: string) => {
            const sitesFollowed = followedSites.split(SitesSeperator);
            this.setState({
                followState: sitesFollowed.indexOf(hostSettings.webAbsoluteUrl) !== -1 ?
                    FollowState.followed : FollowState.notFollowing
            });
        };

        this._followDataSource = new FollowDataSource(this._hostSettings);
        this._followedSites = this._store.getValue<string>(FollowedSitesInStoreKey);
        if (this._followedSites) {
            setStateBasedOnIfSiteIsAlreadyFollowed(this._followedSites);
        } else {
            this._followDataSource.getFollowedSites().done((sites: string) => {
                setStateBasedOnIfSiteIsAlreadyFollowed(sites);
                this._followedSites = sites;
                this._store.setValue<string>(FollowedSitesInStoreKey, sites);
            });
        }
    }

    public componentWillUnmount() {
        this._async.dispose();
        if (this._eventGroup) {
            this._eventGroup.dispose();
            this._eventGroup = null;
        }
    }

    public getRenderProps(): ICompositeHeaderProps {
        const params = this._params;
        const state = params.siteHeader.state;

        const siteLogo: ISiteLogoInfo = {
            siteLogoUrl: state.siteLogoUrl,
            siteAcronym: state.siteAcronym,
            siteLogoBgColor: state.siteLogoColor
        };

        const facepileProps: IFacepileProps = state.facepilePersonas && {
            personas: state.facepilePersonas
        };

        const siteHeaderProps: ISiteHeaderProps = {
            siteTitle: params.hostSettings.webTitle,
            groupInfoString: state.groupInfoString,
            siteLogo: siteLogo,
            logoHref: state.webAbsoluteUrl,
            logoOnClick: state.logoOnClick,
            disableSiteLogoFallback: true,
            membersText: state.membersText,
            facepile: facepileProps
        };

        const goToOutlookProps: IGoToOutlookProps = state.outlookUrl ? {
            goToOutlookString: params.strings.goToOutlook,
            goToOutlookAction: this._onGoToOutlookClick
        } : undefined;

        const horizontalNavProps: IHorizontalNavProps = {
            items: state.horizontalNavItems
        };

        const followProps: IFollowProps = state.followState !== undefined ? {
            followLabel: this._params.strings.followString,
            followAction: this._onFollowClick,
            followState: state.followState
        } : undefined;

        const sharePage = '/_layouts/15/share.aspx?isDlg=1&OpenInTopFrame=1';
        const shareButton: IShareButtonProps = params.hostSettings.webTemplate === '64' ? null : {
            url: params.hostSettings.webAbsoluteUrl + sharePage,
            shareLabel: params.strings.shareLabel,
            loadingLabel: params.strings.loadingLabel
        };

        return {
            siteHeaderProps: siteHeaderProps,
            horizontalNavProps: horizontalNavProps,
            goToOutlook: goToOutlookProps,
            shareButton: shareButton,
            follow: followProps
        };
    }

    private setState(state: ISiteHeaderContainerState) {
        this._params.siteHeader.setState(state);
    }

    private _onGoToOutlookClick(ev: React.MouseEvent): void {
        this._params.goToOutlookOnClick(ev);
        ev.stopPropagation();
        ev.preventDefault();
    }

    private _onFollowClick(ev: React.MouseEvent) {
        this.setState({ followState: FollowState.transitioning });
        if (this._params.siteHeader.state.followState === FollowState.followed) {
            this._followDataSource.unfollowSite(this._hostSettings.webAbsoluteUrl).done(() => {
                this.setState({ followState: FollowState.notFollowing });
                this._followedSites =
                    this._followedSites
                        .split(SitesSeperator)
                        .filter((site: string) => site !== this._hostSettings.webAbsoluteUrl)
                        .join(SitesSeperator);
                this._store.setValue(FollowedSitesInStoreKey, this._followedSites);
            }, (error: any) => {
                // on error, revert to followed (could also just set to notfollowing instead
                // and allow user to attempt to unfollow)
                this.setState({ followState: FollowState.followed });
            });
        } else {
            this._followDataSource.followSite(this._hostSettings.webAbsoluteUrl).done(() => {
                this.setState({ followState: FollowState.followed });
                this._followedSites =
                    this._followedSites.concat(SitesSeperator, this._hostSettings.webAbsoluteUrl);
                this._store.setValue(FollowedSitesInStoreKey, this._followedSites);
            }, (error: any) => {
                // on error, revert to notfollowing (could also just set to following instead
                // and allow user to attempt to follow)
                this.setState({ followState: FollowState.notFollowing });
            });
        }
    }

    private _processGroups() {
        if (this._isGroup) {
            this._params.getGroupsProvider()
                .then((groupsProvider: IGroupsProvider) => {
                    this._groupsProvider = groupsProvider;
                    groupsProvider.group.membership.load();
                    this._updateGroupsInfo();
                });
        }
    }

    private _updateGroupsInfo(): void {
        let outlookUrl: string;
        let pictureUrl: string;
        let groupInfoString: string;

        if (this._isGroup) {
            const group = this._groupsProvider.group;
            const updateGroupMember = (newValue: SourceType) => {
                if (newValue !== SourceType.None && !this._hasParsedGroupBasicInfo) {
                    if (!this._hasParsedGroupBasicInfo) {
                        this._hasParsedGroupBasicInfo = true;

                        // *********** Facepile ***********
                        /* tslint:disable:typedef */
                        // everything here is easily inferred by the TS compiler
                        const memberNames = group.membership.membersList.members.map((member) => member.name);
                        /* tslint:enable:typedef */

                        this._acronymDatasource.getAcronyms(memberNames).done((acronyms: IAcronymColor[]) => {
                            const onClick = this._openHoverCard.bind(this);
                            const onMouseMove = this._onMouseMove.bind(this);
                            const onMouseOut = this._clearHover.bind(this);
                            const facepilePersonas = acronyms.map((acronym: IAcronymColor, index: number) => {
                                return {
                                    personaName: memberNames[index],
                                    imageInitials: acronym.acronym,
                                    imageUrl: group.membership.membersList.members[index].image,
                                    initialsColor: (ColorServicePossibleColors.indexOf(acronym.color) + 1),
                                    onClick: onClick,
                                    onMouseMove: onMouseMove,
                                    onMouseOut: onMouseOut,
                                    data: {
                                        groupPerson: group.membership.membersList.members[index]
                                    }
                                } as IFacepilePersona;
                            });

                            this.setState({
                                facepilePersonas: facepilePersonas
                            });
                        });

                        // *********** Number of Members ***********
                        const totalMembers = group.membership.totalNumberOfMembers;
                        if (totalMembers) {
                            const strings = this._params.strings;
                            const localizedCountFormat = StringHelper.getLocalizedCountValue(strings.membersCount, strings.membersCountIntervals, totalMembers);
                            this.setState({
                                membersText: StringHelper.format(localizedCountFormat, totalMembers)
                            });
                        }
                    }
                }
            };

            let updateGroupBasicProperties = (newValue: SourceType) => {
                if (newValue !== SourceType.None && !this._hasParsedMembers) {
                    this._hasParsedMembers = true;

                    pictureUrl =
                        this._utilizingTeamsiteCustomLogo ? this._params.siteHeader.state.siteLogoUrl :
                            (group.pictureUrl + DefaultLogoSize);

                    groupInfoString = this._determineGroupInfoString(group);
                    outlookUrl = group.inboxUrl;

                    this.setState({
                        siteLogoUrl: pictureUrl,
                        groupInfoString: groupInfoString,
                        outlookUrl: outlookUrl
                    });
                }
            };

            this._eventGroup = new EventGroup(this);
            this._eventGroup.on(group, 'source', updateGroupBasicProperties);
            updateGroupBasicProperties(group.source);

            this._eventGroup.on(group.membership, 'source', updateGroupMember);
            updateGroupMember(group.membership.source);
        }
    }

    private _determineGroupInfoString(group?: Group): string {
        const strings = this._params.strings;
        const hostSettings = this._hostSettings;
        const isWithGuestsFeatureEnabled = Features.isFeatureEnabled(
            /* DisplayGuestPermittedInfoInModernHeader */
            { ODB: 363, ODC: null, Fallback: true }
        );

        if (group) {
            const groupType = hostSettings.groupType === GroupTypePublic ? strings.publicGroup : strings.privateGroup;
            let changeSpacesToNonBreakingSpace = (str: string) => str.replace(/ /g, ' ');
            if (group.classification) {
                if (hostSettings.guestsEnabled && isWithGuestsFeatureEnabled) {
                    return changeSpacesToNonBreakingSpace(StringHelper.format(
                        strings.groupInfoWithClassificationAndGuestsFormatString,
                        groupType,
                        group.classification
                    ));
                }

                return changeSpacesToNonBreakingSpace(StringHelper.format(
                    strings.groupInfoWithClassificationFormatString,
                    groupType,
                    group.classification
                ));
            } else {
                if (hostSettings.guestsEnabled && isWithGuestsFeatureEnabled) {
                    return changeSpacesToNonBreakingSpace(StringHelper.format(
                        strings.groupInfoWithGuestsFormatString,
                        groupType
                    ));
                }

                return groupType;
            }
        } else {
            if (!hostSettings.groupId) {
                // if teamsite
                return (hostSettings.guestsEnabled && isWithGuestsFeatureEnabled) ? strings.groupInfoWithGuestsForTeamsites : '';
            } else {
                // this is a group but group object has not loaded, start with empty string
                return '';
            }
        }
    }

    private _openHoverCard(persona: IFacepilePersona, evt: React.MouseEvent = null): void {
        // If an event was passed in, prefer that one, else use the last mouse move event
        evt = evt || this._lastMouseMove;

        if (!evt) {
            return;
        }

        evt.stopPropagation();
        evt.preventDefault();
        this._params.openPersonaCard(persona, evt);
        this._clearHover();
    }

    private _clearHover(): void {
        this._async.clearTimeout(this._hoverTimeoutId);
        this._hoverTimeoutId = -1;
        this._lastMouseMove = null;
    }

    private _onMouseMove(persona: IFacepilePersona, evt: React.MouseEvent) {
        this._lastMouseMove = evt;
        this._lastMouseMove.persist();
        if (this._hoverTimeoutId === -1) {
            this._hoverTimeoutId = this._async.setTimeout(() => this._openHoverCard(persona), PEOPLE_CARD_HOVER_DELAY);
        }
    }
}
