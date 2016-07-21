// OneDrive:IgnoreCodeCoverage

import * as React from 'react';

/* odsp-shared-react */
import {
    GroupCardLinkTypes,
    IGroupCardLinkParams,
    ISiteHeaderContainerState,
    ISiteHeaderContainerStateManagerParams
} from './StateManager.Props';
import { ISiteHeaderProps, ISiteLogoInfo, IGoToMembersProps } from '../../SiteHeader';
import { IHorizontalNavProps, IHorizontalNavItem } from '../../HorizontalNav';
import { IFacepileProps, IFacepilePersona } from '@ms/office-ui-fabric-react/lib/Facepile';
import { IGroupCardLinks } from '../../components/GroupCard/GroupCard.Props';
import {
    FollowState,
    ICompositeHeaderProps,
    IFollowProps,
    IGoToOutlookProps,
    IShareButtonProps
} from '../../CompositeHeader';

/* odsp-datasources */
import IHostSettings from '@ms/odsp-datasources/lib/dataSources/base/IContext';
import SiteHeaderLogoAcronymDataSource, { IAcronymColor } from '@ms/odsp-datasources/lib/dataSources/siteHeader/SiteHeaderLogoAcronymDataSource';
import INavNode from '@ms/odsp-datasources/lib/dataSources/base/INavNode';
import Group, { SourceType } from '@ms/odsp-datasources/lib/models/groups/Group';
import GroupsProvider, { IGroupsProvider } from '@ms/odsp-datasources/lib/providers/groups/GroupsProvider';

/* odsp-utilities */
import StringHelper = require('@ms/odsp-utilities/lib/string/StringHelper');
import Async from '@ms/odsp-utilities/lib/async/Async';
import EventGroup from '@ms/odsp-utilities/lib/events/EventGroup';
import Features from '@ms/odsp-utilities/lib/features/Features';
import FollowDataSource, { SitesSeperator } from '@ms/odsp-datasources/lib/dataSources/siteHeader/FollowDataSource';
import DataStore from '@ms/odsp-utilities/lib/models/store/BaseDataStore';
import DataStoreCachingType from '@ms/odsp-utilities/lib/models/store/DataStoreCachingType';
import { Engagement } from '@ms/odsp-utilities/lib/logging/events/Engagement.event';

/**
 * How long to hover before displaying people card
 * @description From 'odsp-next/controls/peopleCard/PeopleCardConstants'
 */
const PEOPLE_CARD_HOVER_DELAY: number = 300; /* ms */
/** Id for the node in top nav that points to the subsite itself. */
const HORIZONTAL_NAV_HOME_NODE_ID: number = 2003;
/** The groupType property value indicating a public group. */
const GROUP_TYPE_PUBLIC: string = 'Public';
/** default site icon. */
const DEFAULT_LOGO_STRING: string = '_layouts/15/images/siteicon.png';
/** default logo size. */
const DEFAULT_LOGO_SIZE: string = '&size=HR96x96';
/** possible colors from the acronym service. */
const COLOR_SERVICE_POSSIBLE_COLORS: string[] = [
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
/** Identifier for site header session storage. */
export const SITE_HEADER_STORE_KEY: string = 'ModernSiteHeader';
/** Identifier for string in store that contains the user's followed sites. */
export const FOLLOWED_SITES_IN_STORE_KEY: string = 'FollowedSites';

/**
 * This class manages the state of the SiteHeaderHost.
 * It will be moved outside of ODSP-NEXT so please do not add any new ODSP-NEXT dependencies to it
 */
export class SiteHeaderContainerStateManager {
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
    private _store: DataStore = new DataStore(SITE_HEADER_STORE_KEY, DataStoreCachingType.session);
    private _followedSites: string;

    constructor(params: ISiteHeaderContainerStateManagerParams) {
        this._params = params;
        const hostSettings = params.hostSettings;
        this._hostSettings = hostSettings;
        this._isGroup = !!hostSettings.groupId;
        this._async = new Async();

        this._onGoToOutlookClick = this._onGoToOutlookClick.bind(this);
        this._onFollowClick = this._onFollowClick.bind(this);
        this._onGoToMembersClick = this._onGoToMembersClick.bind(this);

        // setup site logo
        let siteLogoUrl: string = params.hostSettings.webLogoUrl;
        if (siteLogoUrl) {
            this._utilizingTeamsiteCustomLogo = siteLogoUrl.indexOf(DEFAULT_LOGO_STRING) === -1;
            if (!this._utilizingTeamsiteCustomLogo) {
                siteLogoUrl = undefined;
            }
        }

        // Set up what happens when the logo is clicked
        // For sign-in anonymous guest => params.logoOnClick is undefined
        // guests only have permission to access current view
        // guests have no permission to access the site
        const webAbsoluteUrl: string = params.logoOnClick ?
            params.hostSettings.webAbsoluteUrl : undefined;

        let logoOnClick: (ev: React.MouseEvent) => void;

        if (webAbsoluteUrl) {
            logoOnClick = (ev: React.MouseEvent) => {
                Engagement.logData({ name: 'SiteHeader.Logo.Click' });
                params.logoOnClick(webAbsoluteUrl, ev);
                ev.stopPropagation();
                ev.preventDefault();
            };
        }

        const horizontalNavItems = this._setupHorizontalNav();
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
        this._followedSites = this._store.getValue<string>(FOLLOWED_SITES_IN_STORE_KEY);
        if (this._followedSites) {
            setStateBasedOnIfSiteIsAlreadyFollowed(this._followedSites);
        } else {
            this._followDataSource.getFollowedSites().done((sites: string) => {
                setStateBasedOnIfSiteIsAlreadyFollowed(sites);
                this._followedSites = sites;
                this._store.setValue<string>(FOLLOWED_SITES_IN_STORE_KEY, sites);
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

        const goToMembersProps: IGoToMembersProps = state.membersUrl ? {
            goToMembersAction: this._onGoToMembersClick
        } : undefined;

        const siteHeaderProps: ISiteHeaderProps = {
            siteTitle: params.hostSettings.webTitle,
            groupInfoString: state.groupInfoString,
            siteLogo: siteLogo,
            // For sign-in anonymous guest => params.logoOnClick is undefined
            // Anonymous guest has no permission to access team site.
            logoHref: params.logoOnClick ? state.webAbsoluteUrl : undefined,
            logoOnClick: state.logoOnClick,
            disableSiteLogoFallback: true,
            membersText: state.membersText,
            facepile: facepileProps,
            showGroupCard: !!(state.groupLinks),
            groupLinks: state.groupLinks,
            __goToMembers: goToMembersProps
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
        Engagement.logData({ name: 'SiteHeader.GoToConversations.Click' });
        this._params.goToOutlookOnClick(ev);
        ev.stopPropagation();
        ev.preventDefault();
    }

    private _onGoToMembersClick(ev: React.MouseEvent): void {
        Engagement.logData({ name: 'SiteHeader.GoToMembers.Click' });
        this._params.goToMembersOnClick(ev);
        ev.stopPropagation();
        ev.preventDefault();
    }

    private _onFollowClick(ev: React.MouseEvent) {
        Engagement.logData({ name: 'SiteHeader.Follow.Click' });
        this.setState({ followState: FollowState.transitioning });
        if (this._params.siteHeader.state.followState === FollowState.followed) {
            this._followDataSource.unfollowSite(this._hostSettings.webAbsoluteUrl).done(() => {
                this.setState({ followState: FollowState.notFollowing });
                this._followedSites =
                    this._followedSites
                        .split(SitesSeperator)
                        .filter((site: string) => site !== this._hostSettings.webAbsoluteUrl)
                        .join(SitesSeperator);
                this._store.setValue(FOLLOWED_SITES_IN_STORE_KEY, this._followedSites);
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
                this._store.setValue(FOLLOWED_SITES_IN_STORE_KEY, this._followedSites);
            }, (error: any) => {
                // on error, revert to notfollowing (could also just set to following instead
                // and allow user to attempt to follow)
                this.setState({ followState: FollowState.notFollowing });
            });
        }
    }

    /**
     * Sets up the horizontal nav with top nav nodes.
     */
    private _setupHorizontalNav() {
        const hostSettings = this._hostSettings;
        let horizontalNavItems: IHorizontalNavItem[];
        if (hostSettings.navigationInfo && hostSettings.navigationInfo.topNav) {
            const topNavNodes: INavNode[] = hostSettings.navigationInfo.topNav;
            const navClick = (node: INavNode) => ((item: IHorizontalNavItem, ev: React.MouseEvent) => {
                this._params.topNavNodeOnClick(node, item, ev);
                ev.stopPropagation();
                ev.preventDefault();
            });

            horizontalNavItems = topNavNodes
                .filter((node: INavNode) => node.Id !== HORIZONTAL_NAV_HOME_NODE_ID) // remove the home link from the topnav
                .map((node: INavNode) => ({
                    text: node.Title,
                    onClick: navClick(node),
                    childNavItems: (node.Children && node.Children.length) ?
                        node.Children.map((childNode: INavNode) => ({
                            text: childNode.Title,
                            onClick: navClick(childNode)
                        })) : undefined
                }));
        }

        return horizontalNavItems;
    }

    private _processGroups() {
        if (this._isGroup) {
            this._groupsProvider = new GroupsProvider({
                context: this._hostSettings
            });
            this._groupsProvider.group.membership.load();
            this._updateGroupsInfo();
        }
    }

    private _updateGroupsInfo(): void {
        let outlookUrl: string;
        let membersUrl: string;
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
                                    initialsColor: (COLOR_SERVICE_POSSIBLE_COLORS.indexOf(acronym.color) + 1),
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
                            (group.pictureUrl + DEFAULT_LOGO_SIZE);
                    groupInfoString = this._determineGroupInfoString(group);
                    outlookUrl = group.inboxUrl;
                    membersUrl = group.membersUrl;

                    let groupCardLinks = this._groupCardLinksFromGroupCardLinkParams(this._params.groupCardInfo, group);
                    this.setState({
                        siteLogoUrl: pictureUrl,
                        groupInfoString: groupInfoString,
                        outlookUrl: outlookUrl,
                        membersUrl: membersUrl,
                        groupLinks: groupCardLinks
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

    /* tslint:disable:member-ordering */
    /**
     * This function uses the linkType parameter to map to the appropriate property.
     */
    private _getUrlFromEnum: (linkType: GroupCardLinkTypes, group: Group) => string =
    (() => {
        // cyrusb: I could have used other methods to map, but this was the least verbose, albeit a bit hard-coded.
        const map: string[] = [
            'inboxUrl',     // GroupCardLinks.mail
            'calendarUrl',  // GroupCardLinks.calendar
            'filesUrl',     // GroupCardLinks.documentsUrl
            'notebookUrl',  // GroupCardLinks.notebookUrl
            'siteUrl',      // GroupCardLinks.siteUrl
            'membersUrl'    // GroupCardLinks.peopleUrl
        ];

        return ((linkType: GroupCardLinkTypes, group: Group) => {
            let url = group[map[linkType]];
            if (!url && linkType === GroupCardLinkTypes.site) {
                // If no site URL is provided on the group, use the host settings URL.
                url = this._params.hostSettings.webAbsoluteUrl;
            }
            return url;
        });
    })();
    /* tslint:enable:member-ordering */

    /**
     * This function creates an array of IGroupCardLinks to feed to the GroupCard control.
     *
     * @param groupLinks: list of links we want to display in the group card
     * @param group: the Group model  that is the object for the Group.
     */
    private _groupCardLinksFromGroupCardLinkParams(groupLinks: IGroupCardLinkParams[], group: Group): IGroupCardLinks[] {
        let ret: IGroupCardLinks[] = [];
        // Create a map from GroupCardLink enum to the JSON property returned by our API to get group info
        if (this._isGroup && group && groupLinks && groupLinks.length) {
            for (let i = 0; i < groupLinks.length; i++) {
                let url = this._getUrlFromEnum(groupLinks[i].linkType, group);
                if (url) {
                    ret.push({
                        title: groupLinks[i].title,
                        icon: groupLinks[i].icon,
                        href: url
                    });
                }
            }
            return ret;
        }
        return null;
    }

    /**
     * Logic for determining the string that displays under the site title in the Header.
     */
    private _determineGroupInfoString(group?: Group): string {
        const strings = this._params.strings;
        const hostSettings = this._hostSettings;
        const isWithGuestsFeatureEnabled = Features.isFeatureEnabled(
            /* DisplayGuestPermittedInfoInModernHeader */
            { ODB: 363, ODC: null, Fallback: true }
        );

        if (group) {
            const groupType = hostSettings.groupType === GROUP_TYPE_PUBLIC ? strings.publicGroup : strings.privateGroup;
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

export default SiteHeaderContainerStateManager;
