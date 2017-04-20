import * as React from 'react';

/* odsp-shared-react */
import {
    GroupCardLinkTypes,
    HorizontalNavTypes,
    IGroupCardLinkParams,
    ISiteHeaderContainerState,
    ISiteHeaderContainerStateManagerParams
} from './StateManager.Props';
import { ISiteHeaderProps, ISiteLogoInfo } from '../../SiteHeader';
import { IMembersInfoProps } from '../../components/MembersInfo/MembersInfo.Props';
import { IFacepileProps, IFacepilePersona } from 'office-ui-fabric-react/lib/Facepile';
import { autobind } from 'office-ui-fabric-react/lib/Utilities';
import { IGroupCardLinks } from '../../components/GroupCard/GroupCard.Props';
import {
    FollowState,
    ICompositeHeaderProps,
    IFollowProps,
    IGoToOutlookProps,
    IShareButtonProps,
    IExtendedMessageBarProps,
    ISiteReadOnlyProps
} from '../../CompositeHeader';
import { IReactDeferredComponentModuleLoader } from '../../components/ReactDeferredComponent/index';
import { INavLinkGroup, INavLink } from 'office-ui-fabric-react/lib/Nav';

/* odsp-datasources */
import { ISpPageContext as IHostSettings, INavNode, isGroupWebContext } from '@ms/odsp-datasources/lib/interfaces/ISpPageContext';
import { AcronymAndColorDataSource, IAcronymColor } from '@ms/odsp-datasources/lib/AcronymAndColor';
import { Group, IGroupsProvider, IMembership } from '@ms/odsp-datasources/lib/Groups';
import { IGroupSiteProvider, IGroupCreationContext } from '@ms/odsp-datasources/lib/GroupSite';
import { SourceType } from '@ms/odsp-datasources/lib/interfaces/groups/SourceType';
import { FollowDataSource } from '@ms/odsp-datasources/lib/Follow';
import SiteDataSource, { StatusBarInfo } from '@ms/odsp-datasources/lib/dataSources/site/SiteDataSource';
import { IPerson } from '@ms/odsp-datasources/lib/PeoplePicker';

/* odsp-utilities */
import StringHelper = require('@ms/odsp-utilities/lib/string/StringHelper');
import Async from '@ms/odsp-utilities/lib/async/Async';
import EventGroup from '@ms/odsp-utilities/lib/events/EventGroup';
import Features, { IFeature } from '@ms/odsp-utilities/lib/features/Features';
import { Engagement } from '@ms/odsp-utilities/lib/logging/events/Engagement.event';
import { ViewNavDataSource } from '@ms/odsp-datasources/lib/ViewNav';
import HtmlEncoding from '@ms/odsp-utilities/lib/encoding/HtmlEncoding';
import { IHorizontalNavProps } from '../../components/HorizontalNav/index';
import { Killswitch } from '@ms/odsp-utilities/lib/killswitch/Killswitch';

/**
 * How long to hover before displaying people card
 * @description From 'odsp-next/controls/peopleCard/PeopleCardConstants'
 */
const PEOPLE_CARD_HOVER_DELAY: number = 300; /* ms */
/** Id for the node in top nav that points to the subsite itself. */
export const HORIZONTAL_NAV_HOME_NODE_ID: number = 2003;
export const NAV_RECENT_NODE_ID: number = 1033;

/** The groupType property value indicating a public group. */
export const GROUP_TYPE_PUBLIC: string = 'Public';
/** default site icon. */
const DEFAULT_LOGO_STRING: string = '_layouts/15/images/siteicon.png';
/** The fwd link that leads the user to more information about authentyication policies. */
const AUTH_POLICY_FWDLINK: string = 'http://go.microsoft.com/fwlink/p/?LinkId=823640';

/**
 * A list of properties associated with each linkType that's specified by GroupCardLinkTypes enum.
 */
interface IGroupCardLinkProps {
    /** The property name on the Groups model associated with this linkType. */
    name: string;

    /** The engagementID that will be logged when this link is clicked. */
    eid: string;

    /** Should this link be removed from the UI if the current user is anonymous. */
    trimIfAnonymous: boolean;
}

const GROUP_EID_PREFIX = 'GroupCard.';
const CLICK = '.Click';
const TOPSWITCHABLE_PROVIDER = 'GlobalNavigationSwitchableProvider';

/** map to associate the GroupCardLinkTypes enum with specific properties */
const GROUP_CARD_LINK_TYPES_MAP: IGroupCardLinkProps[] = [
    { name: 'inboxUrl', eid: 'Mail', trimIfAnonymous: true },     // GroupCardLinks.mail
    { name: 'calendarUrl', eid: 'Calendar', trimIfAnonymous: true },  // GroupCardLinks.calendar
    { name: 'filesUrl', eid: 'Files', trimIfAnonymous: false },     // GroupCardLinks.documentsUrl
    { name: 'notebookUrl', eid: 'Notebook', trimIfAnonymous: false },  // GroupCardLinks.notebookUrl
    { name: 'siteUrl', eid: 'Home', trimIfAnonymous: false },      // GroupCardLinks.siteUrl
    { name: 'membersUrl', eid: 'Members', trimIfAnonymous: true },    // GroupCardLinks.peopleUrl
    { name: 'plannerUrl', eid: 'Planner', trimIfAnonymous: true },    // GroupCardLinks.plannerUrl
];

/** Identifier for string in store that contains the user's followed sites. */
export const FOLLOWED_SITES_IN_STORE_KEY: string = 'FollowedSites';
/** Ensure that this constant stays in sync with the one in GroupsProvider.ts */
const GET_GROUP_IMAGE_ENDPOINT = '/_api/GroupService/GetGroupImage';

/**
 * This class manages the state of the SiteHeaderHost.
 * It will be moved outside of ODSP-NEXT so please do not add any new ODSP-NEXT dependencies to it
 */
export class SiteHeaderContainerStateManager {
    private _params: ISiteHeaderContainerStateManagerParams;
    private _hostSettings: IHostSettings;
    private _isGroup: boolean;
    private _hasParsedMembers: boolean;
    private _totalNumberOfMembers: number;
    private _groupsProvider: IGroupsProvider;
    private _groupSiteProvider: IGroupSiteProvider;
    private _acronymDatasource: AcronymAndColorDataSource;
    private _followDataSource: FollowDataSource;
    private _hoverTimeoutId: number;
    private _lastMouseMove: any;
    private _async: Async;
    private _eventGroup: EventGroup;
    private _isWithGuestsFeatureEnabled: boolean;
    private _isJoinLeaveGroupFeatureEnabled: boolean;
    private _isUseGroupMembershipPanelFeatureEnabled: boolean;
    private _asyncFetchTopNav: boolean;
    private _usageGuidelineUrl: string;

    constructor(params: ISiteHeaderContainerStateManagerParams) {
        this._params = params;
        const hostSettings = params.hostSettings;
        this._hostSettings = hostSettings;
        this._isGroup = isGroupWebContext(hostSettings);
        this._async = new Async();
        this._asyncFetchTopNav = false;

        this._isWithGuestsFeatureEnabled = Features.isFeatureEnabled(
            /* DisplayGuestPermittedInfoInModernHeader */
            { ODB: 363, ODC: null, Fallback: false }
        );
        this._isJoinLeaveGroupFeatureEnabled = Features.isFeatureEnabled(
            /* EnableJoinLeaveGroup */
            { ODB: 93, ODC: null, Fallback: false }
        );
        this._isUseGroupMembershipPanelFeatureEnabled = Features.isFeatureEnabled(
            /* UseGroupMembershipPanel */
            { ODB: 795, ODC: null, Fallback: false }
        );

        // setup site logo
        let siteLogoUrl: string = params.hostSettings.webLogoUrl;
        if (siteLogoUrl) {
            const utilizingTeamsiteCustomLogo = siteLogoUrl.indexOf(DEFAULT_LOGO_STRING) === -1;
            if (!utilizingTeamsiteCustomLogo) {
                // switch to acronym
                siteLogoUrl = undefined;
            }
        }

        // Ensure that group connected sites use the GET_GROUP_IMAGE_ENDPOINT to retrieve the site icon
        if (this._isGroup && (!siteLogoUrl || siteLogoUrl.indexOf(GET_GROUP_IMAGE_ENDPOINT) === -1)) {
            siteLogoUrl = `${this._hostSettings.webAbsoluteUrl}${GET_GROUP_IMAGE_ENDPOINT}`;
        }

        // Set up what happens when the logo is clicked
        // For sign-in anonymous guest => params.logoOnClick is undefined
        // guests only have permission to access current view
        // guests have no permission to access the site
        const webAbsoluteUrl: string = params.logoOnClick ?
            params.hostSettings.webAbsoluteUrl : undefined;

        let logoOnClick: (ev: React.MouseEvent<HTMLElement>) => void;

        if (webAbsoluteUrl) {
            logoOnClick = (ev: React.MouseEvent<HTMLElement>) => {
                Engagement.logData({ name: 'SiteHeader.Logo.Click' });
                params.logoOnClick(webAbsoluteUrl, ev);
                ev.stopPropagation();
                ev.preventDefault();
            };
        }

        const horizontalNavItems = this._setupHorizontalNav();
        // outlookUrl will be rewritten to real mailboxUrl after groups provider loads and returns the group.
        const outlookUrl = this._isGroup ?
            `${hostSettings.webAbsoluteUrl}/_layouts/15/groupstatus.aspx?id=${hostSettings.groupId}&target=conversations`
            : undefined;

        this._params.siteHeader.state = {
            membersText: undefined,
            groupInfoString: this._determineGroupInfoString(),
            usageGuidelineUrl: undefined,
            siteLogoUrl: siteLogoUrl,
            horizontalNavItems: horizontalNavItems,
            logoOnClick: logoOnClick,
            webAbsoluteUrl: webAbsoluteUrl,
            outlookUrl: outlookUrl
        };
    }

    public componentDidMount() {
        if (!this._isGroup) {
            this._loadSiteAcronym();
        }

        // process groups
        this._processGroups();

        this._setupFollowButton();
        this._setupSiteReadOnlyBar();
        this._setupSiteStatusBar();
        this._setupSitePolicyBar();
        if (this._asyncFetchTopNav) {
            // need to fetch global navigation data (publishing/managed navigation top nodes)
            this._fetchTopNavigation();
        }
        this._updateUsageGuidelineUrl();
    }

    public componentWillUnmount() {
        this._async.dispose();
        if (this._eventGroup) {
            this._eventGroup.dispose();
            this._eventGroup = null;
        }
    }

    public getRenderProps(moduleLoader?: IReactDeferredComponentModuleLoader): ICompositeHeaderProps {
        const params = this._params;
        const state = params.siteHeader.state;
        const strings = params.strings;

        // When groupColor is present, we want to allow theming to color the logo.
        // Otherwise, we will set an explicit siteLogoColor for the SiteLogo control.
        let siteLogoColor: string;
        if (!params.hostSettings.groupColor) {
            siteLogoColor = state.siteLogoColor;
        }

        const siteLogo: ISiteLogoInfo = {
            siteLogoUrl: state.siteLogoUrl,
            siteAcronym: state.siteAcronym,
            siteLogoBgColor: siteLogoColor
        };

        const facepileProps: IFacepileProps = state.facepilePersonas && {
            personas: state.facepilePersonas
        };

        const goToMembersAction = this._computeGoToMembersAction(state.membersUrl);

        const membersInfoProps: IMembersInfoProps = {
            membersText: state.membersText,
            goToMembersAction: goToMembersAction,
            isMemberOfCurrentGroup: state.isMemberOfCurrentGroup,
            onJoin: {
                onJoinString: strings.joinGroupLabel,
                onJoiningString: strings.joiningGroupLabel,
                onJoinAction: this._onJoinGroupClick
            },
            onJoined: {
                onJoinedString: strings.joinedButtonLabel,
                onJoinedAction: this._onJoinedButtonClick
            },
            onLeaveGroup: {
                onLeaveGroupString: strings.leaveGroupLabel,
                onLeavingGroupString: strings.leavingGroupLabel,
                onLeaveGroupAction: this._onLeaveGroupClick
            },
            joinLeaveError: state.joinLeaveErrorMessage,
            isLeavingGroup: state.isLeavingGroup,
            onErrorDismissClick: this._onErrorDismissClick
        };

        const siteHeaderProps: ISiteHeaderProps = {
            siteTitle: params.hostSettings.webTitle,
            groupInfoString: state.groupInfoString,
            siteLogo: siteLogo,
            // For sign-in anonymous guest => params.logoOnClick is undefined
            // Anonymous guest has no permission to access team site.
            logoHref: params.logoOnClick ? state.webAbsoluteUrl : undefined,
            logoOnClick: state.logoOnClick,
            disableSiteLogoFallback: !this._isAnonymousGuestUser(),
            facepile: facepileProps,
            showGroupCard: !!(state.groupLinks),
            groupLinks: state.groupLinks,
            membersInfoProps: membersInfoProps,
            moduleLoader: moduleLoader,
            enableJoinLeaveGroup: state.enableJoinLeaveGroup,
            usageGuidelineUrl: state.usageGuidelineUrl
        };

        const goToOutlookProps: IGoToOutlookProps = state.outlookUrl && !this._isAnonymousGuestUser() ? {
            goToOutlookString: strings.goToOutlook,
            goToOutlookAction: this._onGoToOutlookClick
        } : undefined;

        const horizontalNavProps: IHorizontalNavProps = {
            items: state.horizontalNavItems,
            editLink: !state.isSiteReadOnly && !this._isAnonymousGuestUser() ? params.editLink : undefined,
            moduleLoader: moduleLoader,
            isEditMode: state.isEditMode
        };

        const followProps: IFollowProps = state.followState !== undefined ? {
            followLabel: strings.followString,
            followAction: this._onFollowClick,
            followState: state.followState,
            followedAriaLabel: strings.followedAriaLabel,
            notFollowedAriaLabel: strings.notFollowedAriaLabel,
            followedHoverText: strings.followedHoverText,
            notFollowedHoverText: strings.notFollowedHoverText,
            notFollowedLabel: strings.notFollowedLabel
        } : undefined;

        const sharePage = '/_layouts/15/share.aspx?isDlg=1&OpenInTopFrame=1';
        const shareButton: IShareButtonProps =
            params.hostSettings.webTemplate === '64' || params.hostSettings.isAnonymousGuestUser ?
                undefined :
                {
                    url: params.hostSettings.webAbsoluteUrl + sharePage,
                    shareLabel: strings.shareLabel,
                    loadingLabel: strings.loadingLabel
                };

        const siteReadOnlyProps: ISiteReadOnlyProps = state.isSiteReadOnly ? {
            isSiteReadOnly: true,
            siteReadOnlyString: strings.siteReadOnlyString,
            siteReadOnlyState: state.siteReadOnlyState,
            siteIsMovingString: strings.siteIsMovingString,
            siteMoveCompletedString: strings.siteMoveCompleteString
        } : undefined;

        return {
            siteHeaderProps: siteHeaderProps,
            horizontalNavProps: horizontalNavProps,
            goToOutlook: goToOutlookProps,
            shareButton: shareButton,
            follow: followProps,
            messageBarProps: state.messageBarState,
            siteReadOnlyProps: siteReadOnlyProps,
            policyBarProps: state.policyBarState
        };
    }

    public updateHorizontalNav(horizontalLinks: INavLink[]) {
        this.setState({ horizontalNavItems: horizontalLinks, editModeHorizontalNav: false });
    }

    /**
     * Determines the correct action to take when a user clicks on the member count.
     * For anonymous guest users, nothing should happen.
     * For other users, call the goToMembersOnClick callback, which either
     * (1) launches the group membership panel, if the feature is turned on, or
     * (2) attempts to navigate to the members list in OWA using the membersUrl.
     * For Yammer-connected groups, the membersUrl will be null, so we will use the panel if
     * available but no navigation to OWA will occur.
     *
     * To be extra safe, if the membersUrl is null, only call goToMembersOnClick if the group
     * membership panel feature is turned on.
     */
    private _computeGoToMembersAction(membersUrl: string): (ev: React.MouseEvent<HTMLElement>) => void {
        let callback: (ev: React.MouseEvent<HTMLElement>) => void = undefined;
        if (!this._isAnonymousGuestUser()) {
            if (membersUrl || this._isUseGroupMembershipPanelFeatureEnabled) {
                callback = this._onGoToMembersClick;
            }
        }
        return callback;
    }

    private setState(state: ISiteHeaderContainerState) {
        this._params.siteHeader.setState(state);
    }

    /**
     * Instantiates and then makes a call to acronym service.
     */
    private _loadSiteAcronym() {
        if (!this._acronymDatasource) {
            this._acronymDatasource = new AcronymAndColorDataSource(this._hostSettings);
        }

        this._acronymDatasource.getAcronymData(this._hostSettings.webTitle).done((value: IAcronymColor) => {
            this.setState({
                siteAcronym: value.acronym,
                siteLogoColor: value.color
            });
        });
    }

    @autobind
    private _onGoToOutlookClick(ev: React.MouseEvent<HTMLElement>): void {
        Engagement.logData({ name: 'SiteHeader.GoToConversations.Click' });
        this._params.goToOutlookOnClick(ev);
        ev.stopPropagation();
        ev.preventDefault();
    }

    @autobind
    private _onGoToMembersClick(ev: React.MouseEvent<HTMLElement>): void {
        Engagement.logData({ name: 'SiteHeader.GoToMembers.Click' });
        this._params.goToMembersOnClick(ev);
        if (ev) {
            ev.stopPropagation();
            ev.preventDefault();
        }
    }

    @autobind
    private _onErrorDismissClick(ev: React.MouseEvent<HTMLElement>): void {
        Engagement.logData({ name: 'SiteHeader.joinLeaveErrorDismiss.Click' });
        this.setState({
            joinLeaveErrorMessage: undefined
        });
    }

    @autobind
    private _onJoinGroupClick(ev: React.MouseEvent<HTMLElement>): void {
        Engagement.logData({ name: 'SiteHeader.JoinGroup.Click' });
        let groupId: string;
        let userId: string;

        if (this._groupsProvider) {
            if (!this._groupsProvider.group) {
                throw new Error('SiteHeaderContainerStateManager fatal error: Groups provider does not have an observed group.');
            }

            groupId = this._groupsProvider.group.id;

            const addUserToGroupMembership = () => {
                this._groupsProvider.addUserToGroupMembership(groupId, userId, null, 'JoinGroup').then(
                    () => {
                        this.setState({
                            isMemberOfCurrentGroup: true,
                        });
                    },
                    (error: any) => {
                        this.setState({ joinLeaveErrorMessage: error.message.value });
                    }
                ).then(
                    () => {
                        this._groupsProvider.group.membership.loadWithOptions(2 /* MembershipLoadOptions.ownershipInformation */);
                    }
                    );
            };

            // If currentUser is not exist in groupProvider, run getCurrentUser to get it.
            if (this._groupsProvider.currentUser) {
                userId = this._groupsProvider.currentUser.userId;
                addUserToGroupMembership();
            } else {
                this._groupsProvider.getCurrentUser().then((currentUser: IPerson) => {
                    userId = currentUser.userId;
                    addUserToGroupMembership();
                });
            }
        }

        if (this._params.joinGroupOnClick) {
            this._params.joinGroupOnClick(ev);
        }

        if (ev) {
            ev.stopPropagation();
            ev.preventDefault();
        }
    }

    @autobind
    private _onLeaveGroupClick(ev: React.MouseEvent<HTMLElement>): void {
        Engagement.logData({ name: 'SiteHeader.LeaveGroup.Click' });
        let groupId: string;
        let userId: string;

        this.setState({ isLeavingGroup: true });

        if (this._groupsProvider) {
            if (!this._groupsProvider.group) {
                throw new Error('SiteHeaderContainerStateManager fatal error: Groups provider does not have an observed group.');
            }

            groupId = this._groupsProvider.group.id;

            const removeUserFromGroupMembership = () => {
                // If this is a private group, directly navigate to SharePoint home page after successfully leave group instead of UI update for group.
                if (this._hostSettings.groupType !== GROUP_TYPE_PUBLIC) {
                    this._groupsProvider.removeUserFromGroupMembership(groupId, userId, 'LeaveGroup').then(
                        () => {
                            this._navigateOnLeaveGroup(ev);
                        },
                        (error: any) => {
                            this.setState({
                                joinLeaveErrorMessage: error.message.value,
                                isLeavingGroup: false
                            });
                        }
                    );
                } else {
                    this._groupsProvider.removeUserFromGroupMembership(groupId, userId, 'LeaveGroup').then(
                        () => {
                            this.setState({
                                isMemberOfCurrentGroup: false,
                                isLeavingGroup: false,
                            });
                        },
                        (error: any) => {
                            this.setState({
                                joinLeaveErrorMessage: error.message.value,
                                isLeavingGroup: false
                            });
                        }
                    ).then(
                        () => {
                            this._groupsProvider.group.membership.loadWithOptions(2 /* MembershipLoadOptions.ownershipInformation */);
                        }
                        );
                };
            };

            const leaveGroup = () => {
                // If only one owner left in the group and the current user is the owner, throw the last owner error.
                if (this._groupsProvider.group.membership.totalNumberOfOwners < 2 && this._groupsProvider.group.membership.isOwner) {
                    this.setState({
                        isLeavingGroup: false,
                        joinLeaveErrorMessage: this._params.strings.lastOwnerError
                    });
                } else {
                    // If the current user is the owner of the group, first remove user's ownership and then remove membership.
                    if (this._groupsProvider.group.membership.isOwner) {
                        this._groupsProvider.removeUserFromGroupOwnership(groupId, userId, 'LeaveGroupOwnership').then(
                            () => {
                                removeUserFromGroupMembership();
                            },
                            (error: any) => {
                                this.setState({
                                    joinLeaveErrorMessage: error.message.value,
                                    isLeavingGroup: false
                                });
                            });
                    } else {
                        removeUserFromGroupMembership();
                    }
                }
            };

            if (this._groupsProvider.currentUser) {
                userId = this._groupsProvider.currentUser.userId;
                leaveGroup();
            } else {
                this._groupsProvider.getCurrentUser().then((currentUser: IPerson) => {
                    userId = currentUser.userId;
                    leaveGroup();
                });
            }
        }

        if (this._params.leaveGroupOnClick) {
            this._params.leaveGroupOnClick(ev);
        }

        if (ev) {
            ev.stopPropagation();
            ev.preventDefault();
        }
    }

    @autobind
    private _onJoinedButtonClick(ev: React.MouseEvent<HTMLElement>): void {
        Engagement.logData({ name: 'SiteHeader.JoinedButton.Click' });

        if (this._params.joinedButtonOnClick) {
            this._params.joinedButtonOnClick(ev);
        }

        if (ev) {
            ev.stopPropagation();
            ev.preventDefault();
        }
    }

    @autobind
    private _onFollowClick(ev: React.MouseEvent<HTMLElement>) {
        Engagement.logData({ name: 'SiteHeader.Follow.Click' });
        let followState = this._params.siteHeader.state.followState;
        this.setState({ followState: FollowState.transitioning });
        if (followState === FollowState.followed) {
            this._followDataSource.unfollowSite(this._hostSettings.webAbsoluteUrl).done(() => {
                this.setState({ followState: FollowState.notFollowing });
            }, (error: any) => {
                // on error, revert to followed (could also just set to notfollowing instead
                // and allow user to attempt to unfollow)
                this.setState({ followState: FollowState.followed });
            });
        } else {
            this._followDataSource.followSite(this._hostSettings.webAbsoluteUrl).done(() => {
                this.setState({ followState: FollowState.followed });
            }, (error: any) => {
                // on error, revert to notfollowing (could also just set to following instead
                // and allow user to attempt to follow)
                this.setState({ followState: FollowState.notFollowing });
            });
        }
    }

    // If navigateOnLeaveGroup has been passed navigate to the customized place by navigateOnLeaveGroup, otherwise navigate to SharePoint home page by default.
    private _navigateOnLeaveGroup(ev: React.MouseEvent<HTMLElement>) {
        if (this._params.navigateOnLeaveGroup) {
            this._params.navigateOnLeaveGroup(ev);
        } else {
            this._navigate({
                url: this._getSharePointHomePageUrl(),
                target: '_self'
            }, ev);
        }

        if (ev) {
            ev.stopPropagation();
            ev.preventDefault();
        }
    }

    /**
     * Sets up the horizontal nav with top nav nodes.
     */
    private _setupHorizontalNav() {
        if (this._isAnonymousGuestUser()) {
            return undefined;
        }
        return this._transformToNavItems(this._getHorizontalNavNode());
    }

    private _getHorizontalNavNode(): INavNode[] {
        const hostSettings = this._hostSettings;
        if (hostSettings.PublishingFeatureOn) {
            // publishing navigation provider
            this._asyncFetchTopNav = true;
        } else if ((this._params.horizontalNavType === HorizontalNavTypes.topNav || this._params.horizontalNavType === undefined) &&
            hostSettings.navigationInfo.topNav) {
            // has topNav nodes or type is not defined default to TopNav as backward compatibility
            return hostSettings.navigationInfo.topNav;
        } else if (this._params.horizontalNavType === HorizontalNavTypes.quickLaunch && hostSettings.navigationInfo.quickLaunch) {
            // has quickLaunch
            return hostSettings.navigationInfo.quickLaunch;
        }
        return [];
    }

    private _fetchTopNavigation() {
        // null for PageTitle param indicates no need to add Pages node.  Don't manually add any node for publishing site navigation data.
        if (this._params.getViewNavDataSource !== undefined) {
            this._params.getViewNavDataSource().then((navDataSource: ViewNavDataSource) => {
                return navDataSource.getMenuState();
            }).then((topNavLinkGroups: INavLinkGroup[]) => {
                this._setTopNavLinks(topNavLinkGroups);
            });
        } else {
            let viewNavDataSource = new ViewNavDataSource(this._hostSettings, null, TOPSWITCHABLE_PROVIDER);
            viewNavDataSource.getMenuState().then((topNavLinkGroups: INavLinkGroup[]) => {
                this._setTopNavLinks(topNavLinkGroups);
            });
        }
    }

    private _setTopNavLinks(topNavLinkGroups: INavLinkGroup[]) {
        if (topNavLinkGroups && topNavLinkGroups[0] && topNavLinkGroups[0].links) {
            this.setState({ horizontalNavItems: topNavLinkGroups[0].links });
        }
    }

    private _transformToNavItems(nodes?: INavNode[]): INavLink[] {
        let horizontalNavItems: INavLink[] = [];

        if (nodes && nodes.length > 0) {
            const navClick = ((ev: React.MouseEvent<HTMLElement>, item?: INavLink) => {
                this._params.topNavNodeOnClick(ev, item);
                ev.stopPropagation();
                ev.preventDefault();
            });
            horizontalNavItems = nodes
                .filter((node: INavNode) =>
                    node.Id !== HORIZONTAL_NAV_HOME_NODE_ID ||
                    this._params.horizontalNavType !== HorizontalNavTypes.topNav &&
                    node.Id !== NAV_RECENT_NODE_ID) // remove the home link from the topnav, Recent node if quickLaunch
                .map((node: INavNode) => ({
                    name: node.Title,
                    key: node.Id.toString(),
                    url: node.Url,
                    onClick: navClick,
                    links: (node.Children && node.Children.length) ?
                        node.Children.map((childNode: INavNode) => ({
                            name: childNode.Title,
                            url: childNode.Url,
                            key: childNode.Id.toString(),
                            onClick: navClick
                        })) : undefined
                }));
        }
        return horizontalNavItems;
    }

    private _processGroups() {
        if (this._isGroup) {
            this._params.getGroupsProvider().then((groupsProvider: IGroupsProvider) => {
                if (groupsProvider) {
                    this._groupsProvider = groupsProvider;
                    if (!this._groupsProvider.group) {
                        throw new Error('SiteHeaderContainerStateManager fatal error: Groups provider does not have an observed group.');
                    }
                    // Due to perf issue, didn't import the enum MembershipLoadOptions, use number directly as temporary solution.
                    this._groupsProvider.group.membership.loadWithOptions(2 /* MembershipLoadOptions.ownershipInformation */);
                    this._updateGroupsInfo();
                }
            });
        }
    }

    private _updateGroupsInfo(): void {
        let outlookUrl: string;
        let membersUrl: string;
        let groupInfoString: string;
        let enableJoinLeaveGroup: boolean;

        if (this._isGroup) {
            const group = this._groupsProvider.group;
            const updateGroupMember = (newValue: SourceType) => {
                if (newValue !== SourceType.None && group.membership && this._totalNumberOfMembers != group.membership.totalNumberOfMembers) {
                    // *********** Facepile ***********
                    let facepilePersonas = this._updateFacepilePersonas(group.membership);

                    // *********** Number of Members ***********
                    let membersText = this._getMembersText(group.membership);

                    this._totalNumberOfMembers = group.membership.totalNumberOfMembers;

                    this.setState({
                        membersText: membersText,
                        facepilePersonas: facepilePersonas
                    });
                }
            };

            let updateGroupBasicProperties = (newValue: SourceType) => {
                if (newValue !== SourceType.None && !this._hasParsedMembers) {
                    this._hasParsedMembers = true;
                    groupInfoString = this._determineGroupInfoStringForGroup(group.classification);
                    outlookUrl = this._isAnonymousGuestUser() ? undefined : group.inboxUrl;
                    membersUrl = this._isAnonymousGuestUser() ? undefined : group.membersUrl;
                    let groupCardLinks = this._groupCardLinksFromGroupCardLinkParams(this._params.groupCardInfo, group);
                    this.setState({
                        groupInfoString: groupInfoString,
                        outlookUrl: outlookUrl,
                        membersUrl: membersUrl,
                        groupLinks: groupCardLinks
                    });
                    this._groupsProvider.isUserInGroup(group.id).then((isMemberOfCurrentGroup: boolean) => {
                        if (this._isJoinLeaveGroupFeatureEnabled) {
                            if (!isMemberOfCurrentGroup && this._hostSettings.groupType !== GROUP_TYPE_PUBLIC) {
                                enableJoinLeaveGroup = false;
                            } else {
                                enableJoinLeaveGroup = true;
                            }
                        } else {
                            enableJoinLeaveGroup = false;
                        }

                        this.setState({
                            isMemberOfCurrentGroup: isMemberOfCurrentGroup,
                            enableJoinLeaveGroup: enableJoinLeaveGroup
                        });
                    });

                    // For groups, the acronym service has never been initialized so start initializing now.
                    this._loadSiteAcronym();

                    // Compares the Group properties stored/cached locally in SharePoint with the corresponding group properties from a Group object.
                    // If the titles are different, Calls the /_api/GroupService/SyncGroupProperties endpoint to sync the Group properties.
                    if (this._groupsProvider.doesCachedGroupPropertiesDiffer(group)) {
                        this._groupsProvider.syncGroupProperties();
                    }
                }
            };

            this._ensureEventGroup();
            this._eventGroup.on(group, 'source', updateGroupBasicProperties);
            updateGroupBasicProperties(group.source);

            this._eventGroup.on(group.membership, 'source', updateGroupMember);
            updateGroupMember(group.membership.source);
        }
    }

    private _ensureEventGroup() {
        if (!this._eventGroup) {
            this._eventGroup = new EventGroup(this);
        }
    }

    /* tslint:disable:member-ordering */
    /**
     * This function uses the linkType parameter to map to the appropriate property.
     */
    private _getUrlFromEnum: (linkType: GroupCardLinkTypes, group: Group) => string =
    (() => {
        return ((linkType: GroupCardLinkTypes, group: Group) => {
            let url = group[GROUP_CARD_LINK_TYPES_MAP[linkType].name];
            if (!url && linkType === GroupCardLinkTypes.site) {
                // If no site URL is provided on the group, use the host settings URL.
                url = this._params.hostSettings.webAbsoluteUrl;
            }
            return url;
        });
    })();
    /* tslint:enable:member-ordering */

    /**
     * Checks to see if the user is an anonymous guest uers or external guest user.
     */
    private _isAnonymousGuestUser() {
        let hostSettings = this._hostSettings;
        return hostSettings.isAnonymousGuestUser || (<any>hostSettings).isExternalGuestUser;
    }

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
                let linkType = groupLinks[i].linkType;
                let url = this._getUrlFromEnum(linkType, group);
                if (url) {
                    if ((!this._isAnonymousGuestUser()) || (!GROUP_CARD_LINK_TYPES_MAP[linkType].trimIfAnonymous)) {
                        // only display the link if the current user is not anonymous or, we've marked the link to display
                        // even if the user is anonymous.
                        let engagementID = GROUP_EID_PREFIX + GROUP_CARD_LINK_TYPES_MAP[linkType].eid + CLICK;
                        ret.push({
                            title: groupLinks[i].title,
                            icon: groupLinks[i].icon,
                            href: url,
                            engagementId: engagementID
                        });
                    }
                }
            }
            return ret;
        }
        return null;
    }

    /**
     * Logic for determining the string that displays under the site title in the Header during initial load and after get usageGuidelineUrl.
     * This is for both regular site and group site, the method is named _determineGroupInfoString due to the property groupInfoString.
     */
    private _determineGroupInfoString(): string {
        const strings = this._params.strings;
        const hostSettings = this._hostSettings;

        if (!this._isGroup) {
            let classificationString: string;
            if (hostSettings.siteClassification) {
                classificationString = this._setupUsageGuidelineLink(hostSettings.siteClassification);
            }
            // if teamsite
            if (hostSettings.guestsEnabled && this._isWithGuestsFeatureEnabled) {
                if (classificationString) {
                    return StringHelper.format(strings.groupInfoWithClassificationAndGuestsForTeamsites, classificationString);
                } else {
                    return strings.groupInfoWithGuestsForTeamsites;
                }
            } else {
                // if no guests, just display hostSettings's siteClassification (which might be empty string).
                return classificationString;
            }
        } else {
            // this is a group, use group related strings and logic.
            return this._determineGroupInfoStringForGroup();
        }
    }

    /**
     * Determine group info string for a group.
     * Optionally pass in argument for group classification string, intended for being from actual group object.
     * If not, will attempt to fallback to hostSettings.siteClassification.
     */
    private _determineGroupInfoStringForGroup(groupClassification?: string): string {
        const strings = this._params.strings;
        const hostSettings = this._hostSettings;
        const groupType = hostSettings.groupType === GROUP_TYPE_PUBLIC ? strings.publicGroup : strings.privateGroup;
        const guestSharingPermitted = hostSettings.guestsEnabled && this._isWithGuestsFeatureEnabled;

        if (!groupClassification) {
            // if we don't have a group classification, try falling back to site classification.
            groupClassification = hostSettings.siteClassification;
        }

        groupClassification = this._setupUsageGuidelineLink(groupClassification);

        let changeSpacesToNonBreakingSpace = (str: string) => str.replace(/ /g, ' ');
        if (groupClassification) {
            if (guestSharingPermitted) {
                return changeSpacesToNonBreakingSpace(StringHelper.format(
                    strings.groupInfoWithClassificationAndGuestsFormatString,
                    groupType,
                    groupClassification
                ));
            }

            return changeSpacesToNonBreakingSpace(StringHelper.format(
                strings.groupInfoWithClassificationFormatString,
                groupType,
                groupClassification
            ));
        } else {
            // at this point, we neither have group classification from argument or from hostSettings.siteClassification.
            if (guestSharingPermitted) {
                return changeSpacesToNonBreakingSpace(StringHelper.format(
                    strings.groupInfoWithGuestsFormatString,
                    groupType
                ));
            }

            return groupType;
        }
    }

    /**
     * Get usageGuidelinesUrl from GroupSiteProvider.
     */
    private _updateUsageGuidelineUrl() {
        if (this._params.getGroupSiteProvider) {
            this._params.getGroupSiteProvider().then((groupSiteProvider: IGroupSiteProvider) => {
                this._groupSiteProvider = groupSiteProvider;
            }).then(() => {
                let groupCreationContextPromise;
                if (this._groupSiteProvider) {
                    groupCreationContextPromise = this._groupSiteProvider.getGroupCreationContext();
                }
                return groupCreationContextPromise;
            }).then((groupCreationContext: IGroupCreationContext) => {
                let usageGuidelineUrl = groupCreationContext.usageGuidelineUrl;
                if (usageGuidelineUrl) {
                    this._usageGuidelineUrl = usageGuidelineUrl;
                    this.setState({
                        usageGuidelineUrl: this._usageGuidelineUrl
                    });
                }
            }).then(() => {
                let groupInfoString = this._determineGroupInfoString();
                this.setState({
                    groupInfoString: groupInfoString
                });
            });
        }
    }

    @autobind
    private _openHoverCard(evt: React.MouseEvent<HTMLElement>, persona: IFacepilePersona): void {
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

    @autobind
    private _clearHover(): void {
        this._async.clearTimeout(this._hoverTimeoutId);
        this._hoverTimeoutId = -1;
        this._lastMouseMove = null;
    }

    @autobind
    private _onMouseMove(evt: React.MouseEvent<HTMLElement>, persona: IFacepilePersona) {
        this._lastMouseMove = evt;
        this._lastMouseMove.persist();
        if (this._hoverTimeoutId === -1) {
            this._hoverTimeoutId = this._async.setTimeout(() => this._openHoverCard(null, persona), PEOPLE_CARD_HOVER_DELAY);
        }
    }

    private _setupFollowButton() {
        // assume enabled initially
        let followFeatureEnabled = true;

        if (!this._isAnonymousGuestUser()) {
            const setStateBasedOnIfSiteIsAlreadyFollowed = (isSiteFollowed: boolean) => {
                if (followFeatureEnabled) {
                    // only change state if follow feature is enabled.
                    this.setState({
                        followState: isSiteFollowed ? FollowState.followed : FollowState.notFollowing
                    });
                }
            };

            this._followDataSource = this._params.followDataSource || new FollowDataSource(this._hostSettings);

            this._followDataSource.isFollowFeatureEnabled().then((result: boolean) => {
                // update captured flag with result.
                followFeatureEnabled = result;
                if (!result) {
                    this.setState({
                        followState: undefined
                    });
                }
            });

            let isSiteFollowedFromFirstCall: boolean = undefined;

            this._followDataSource.isSiteFollowed(this._hostSettings.webAbsoluteUrl, true /*onlycache*/).then((isSiteFollowed: boolean) => {
                isSiteFollowedFromFirstCall = isSiteFollowed;
                if (isSiteFollowed !== undefined) {
                    setStateBasedOnIfSiteIsAlreadyFollowed(isSiteFollowed);
                }

                return this._followDataSource.isSiteFollowed(this._hostSettings.webAbsoluteUrl, false, true)
            }).done((isSiteFollowed2ndCall: boolean) => {
                if (isSiteFollowedFromFirstCall !== isSiteFollowed2ndCall) {
                    // only update state if it changed as a result of the second call.
                    setStateBasedOnIfSiteIsAlreadyFollowed(isSiteFollowed2ndCall);
                }
            });
        }
    }

    private _setupSiteStatusBar() {
        if (this._params.getSiteDataSource) {
            this._params.getSiteDataSource().then((siteDataSource: SiteDataSource) => {
                // SiteStatusBar flight
                const siteStatusBarFeature: IFeature = { ODB: 7, ODC: null, Fallback: false };

                if (Features.isFeatureEnabled(siteStatusBarFeature)) {
                    siteDataSource.getStatusBarInfo().then((statusBarInfo: StatusBarInfo) => {
                        if (statusBarInfo.StatusBarText) {
                            const messageProps: IExtendedMessageBarProps = {
                                message: statusBarInfo.StatusBarText,
                                linkText: statusBarInfo.StatusBarLinkText,
                                linkTarget: statusBarInfo.StatusBarLinkTarget
                            };

                            this.setState({ messageBarState: messageProps });
                        }
                    });
                }
            });
        }
    }

    private _setupSitePolicyBar() {
        // SitePolicyBar flight
        const sitePolicyBarFeature: IFeature = { ODB: 749, ODC: null, Fallback: false };

        if (Features.isFeatureEnabled(sitePolicyBarFeature)) {
            if (this._hostSettings.blockDownloadsExperienceEnabled || this._hostSettings.viewOnlyExperienceEnabled) {
                let messageProps: IExtendedMessageBarProps = undefined;
                if (!this._params.strings.authPolicyEnabledString || !this._params.strings.messageBarMoreInfoString) {
                    messageProps = {
                        message: undefined,
                        linkText: undefined,
                        linkTarget: undefined
                    };
                } else {
                    messageProps = {
                        message: this._params.strings.authPolicyEnabledString,
                        linkText: this._params.strings.messageBarMoreInfoString,
                        linkTarget: AUTH_POLICY_FWDLINK
                    };
                }
                this.setState({ policyBarState: messageProps });
            }
        }
    }

    private _setupSiteReadOnlyBar() {
        if (this._params.getSiteDataSource) {
            this._params.getSiteDataSource().then((siteDataSource: SiteDataSource) => {
                // ReadOnlyStatusBar flight
                const siteReadOnlyBarFeature: IFeature = { ODB: 8, ODC: null, Fallback: false };

                if (Features.isFeatureEnabled(siteReadOnlyBarFeature)) {
                    siteDataSource.getReadOnlyState().then((readOnly: boolean) => {
                        if (readOnly) {
                            this.setState({ isSiteReadOnly: true });
                        }
                    });

                    // set the full read only state
                    if (!Killswitch.isActivated('C713B050-6A8C-4BCD-8074-A93416417233')) {
                        this.setState({ siteReadOnlyState: siteDataSource.getFullSiteReadOnlyState() });
                    }
                }
            });
        }
    }
    /**
     * Setup the usage guideline link for siteClassification, if the usageGuidelineUrl exist, setup the archor element in string,
     * otherwise, direactly return the siteClassification.
     * Because groupInfoString (a combination of group type and site calssification) is passed to SiteHeader as a whole string,
     * we can't render the siteClassification as usageGuideline link seperately in SiteHeader control.
     *
     * @private
     * @param siteClassification - siteClassification string.
     */
    private _setupUsageGuidelineLink(siteClassification: string): string {
        if (siteClassification && this._usageGuidelineUrl) {
            // encodeURI method encodes special characters, except: , / ? : @ & = + $ #
            let usageGuidelineUrl = encodeURI(this._usageGuidelineUrl);
            // Encodes a string for use in HTML text
            let siteClassificationText = HtmlEncoding.encodeText(siteClassification);

            const usageGuidelineLinkFormatString: string =
                `<a//class='ms-siteHeaderGroupInfoUsageGuidelineLink'href='${usageGuidelineUrl}'target='_blank'data-logging-id='SiteHeader.GroupInfoUsageGuideline'data-automationid='siteHeaderGroupInfoUsageGuidelineLink'>${siteClassificationText}</a>`
            return usageGuidelineLinkFormatString;
        } else {
            return siteClassification;
        }
    }

    /**
     * Get localized members count text.
     *
     * @param membership - a membership object.
     */
    private _getMembersText(membership: IMembership): string {
        let totalMembers = membership.totalNumberOfMembers;
        if (totalMembers) {
            const strings = this._params.strings;
            const localizedCountFormat = StringHelper.getLocalizedCountValue(strings.membersCount, strings.membersCountIntervals, totalMembers);
            return StringHelper.format(localizedCountFormat, totalMembers);
        } else {
            return undefined;
        }
    }

    /**
     * Update the facepilePersonas with top three members.
     *
     * @param membership - a membership object.
     * @return Array of facepile personas.
     */
    private _updateFacepilePersonas(membership: IMembership): IFacepilePersona[] {
        // Use only top three members even if more members were previously cached
        let facepilePersonas = membership.membersList.members.slice(0, 3).map((member, index: number) => {
            return {
                personaName: member.name,
                imageUrl: member.image,
                onClick: this._openHoverCard,
                onMouseMove: this._onMouseMove,
                onMouseOut: this._clearHover,
                data: {
                    groupPerson: member
                },
                'data-automationid': 'SiteHeaderFacepilePersona_' + index.toString()
            } as IFacepilePersona;
        });

        return facepilePersonas;
    }

    private _navigate(params: { url: string, target?: string }, ev: React.MouseEvent<HTMLElement>): void {
        if (params.target) {
            window.open(params.url, params.target);
        } else {
            window.open(params.url);
        }
    }

    // TODO: Using SuiteNavDataSource to get this url after msilver moved the SuiteNavDataSource to odsp-datasources.
    private _getSharePointHomePageUrl(): string {
        const layoutString = '/_layouts/15/sharepoint.aspx';
        const webAbsoluteUrl = this._hostSettings.webAbsoluteUrl;
        const webServerRelativeUrl = this._hostSettings.webServerRelativeUrl;

        if (webAbsoluteUrl && webServerRelativeUrl) {
            return webAbsoluteUrl.replace(webServerRelativeUrl, '') + layoutString;
        } else {
            return undefined;
        }
    }
}

export default SiteHeaderContainerStateManager;
