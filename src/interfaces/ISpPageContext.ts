import IDouble from './IDouble';
import ISuiteNavLink from '../dataSources/suiteNav/ISuiteNavLink';
import ListTemplateType from '../dataSources/listCollection/ListTemplateType';

/**
 * Context information that's available from _spPageContextInfo on page load and is applicable
 * for the life of the page (or at least as long as the same list is loaded).
 *
 * Instances should be thought of as READ-ONLY (possible exception: early in app boot).
 *
 * Potentially useful helper functions also defined in this file:
 * - getServerUrl() gets the server URL (http://server) from an ISpPageContext
 * - getSafeWebServerRelativeUrl() handles the case of the root web where the server sets
 *   webServerRelativeUrl to "/" (see method comments for more info)
 *
 * Please keep the individual fields alphabetically sorted within each group.
 */
export interface ISpPageContext {
    //////////////// Server, site and web ////////////////
    cdnPrefix?: string;
    /** GUID correlation ID from the request for the aspx page. */
    CorrelationId?: string;
    /** Language ID, like 1033. */
    currentLanguage: number;
    /** Like en-US. */
    currentUICultureName: string;
    /** Environment (like EDog; null for devbox). */
    env: string;
    /** Whether guest sharing is enabled (on the site level - might still be disabled globally at the tenant level). */
    guestsEnabled?: boolean;
    /** Alias of the group. Null if not a group site. */
    groupAlias?: string;
    /** Color associated with the group or site, in #RRGGBB or #AARRGGBB format. */
    groupColor?: string;
    /** Indicates if the homepage has been provisioned for this group or not. */
    groupHasHomepage?: boolean;
    /** GUID of Group. If the site is not a Group Site, this property will be null. */
    groupId?: string;
    /** Type of group: Public or Private. Null if not a group site. */
    groupType?: string;
    /** True if the sync button should be hidden in ODB. */
    hideSyncButtonOnODB?: boolean;
    /**
     * DO NOT USE - This doesn't come from the server, and the code that set it has been removed.
     * @deprecated as of version 5.2.0
     */
    isCustomList?: boolean;
    /** Has NoScript enabled on the site, which prevents site admins from running abritrary script on the site to prevent XSS attacks. */
    isNoScriptEnabled?: boolean;
    /** Whether this server is SharePoint Online (true for SPO, false for on-premises). */
    isSPO?: boolean;
    /** Probably "_layouts/15". */
    layoutsUrl: string;
    /** Contains settings menu items. */
    MenuData?: { SettingsData: ISuiteNavLink[] };
    /** Top navigation and quick launch nodes. */
    navigationInfo?: { quickLaunch: INavNode[], topNav: INavNode[] };
    /** True if the list items should open in client apps (vs. Office Online). */
    openInClient?: boolean;
    /** Indicates whether the preview features switch is enabled at the Tenant level */
    PreviewFeaturesEnabled?: boolean;
    /** For recycle bin page only, number of items in the recycle bin. On other pages it will be -1. */
    RecycleBinItemCount?: number;
    /** The site-relative URL of the initial request. */
    serverRequestPath: string;
    /** True if the NGSC dialog should be shown in ODB. */
    showNGSCDialogForSyncOnODB?: boolean;
    /** Site classification e.g. (MBI). */
    siteClassification?: string;
    /** Like "4$$16.0.4524.1200". Part before $$ is used to tell if theme has been updated. */
    siteClientTag: string;
    siteExternalSharingEnabled?: boolean;
    /** GUID of the current site. */
    siteId?: string;
    /** Site Pages feature (WEX) enabled on the site. */
    sitePagesEnabled?: boolean;
    /** Cache token for the current web theme. */
    themeCacheToken?: string;
    /** URL of the current web theme. */
    themedCssFolderUrl?: string;
    /** Date request digest was last loaded. Probably only relevant to classic pages. */
    updateFormDigestPageLoaded?: Date;
    /**
     * Absolute URL of the current web, like "https://microsoft.sharepoint.com/sites/odsp".
     * Should not have a trailing slash, will not be encoded, and could contain spaces.
     */
    webAbsoluteUrl: string;
    /** GUID of the current web. */
    webId?: string;
    /** URL to the web logo (defaults to /_layouts/15/images/siteicon.png). */
    webLogoUrl: string;
    /**
     * Server-relative URL of the web, like "/sites/odsp", or "/" for the root web.
     * IMPORTANT: When building URLs, use getSafeWebServerRelativeUrl() from this file to handle
     * the root web "/" case properly.
     *
     * Should not have a trailing slash (except in the case of the root web), will not be encoded,
     * and could contain spaces.
     */
    webServerRelativeUrl: string;
    /**
     * The web's template id. See the enum dataSources/web/WebTemplateType for possible values.
     *
     * @example To compare against WebTemplateType enums, convert webTemplate to a number:
     *     Number(pageContext.webTemplate) === WebTemplateType.teamSite
     */
    webTemplate: string;
    /** Display name of the web. */
    webTitle: string;

    //////////////// User info ////////////////
    /** True if the user has the manage web permission level. */
    hasManageWebPermissions: boolean;
    /** True when the user is anonymous guest. */
    isAnonymousGuestUser?: boolean;
    /** Whether the user is the admin of the site. */
    isSiteAdmin: boolean;
    /** User identifier like "i:0h.f|membership|100300008aff61c1@live.com". */
    systemUserKey: string;
    /** User display name like "Jon Doe". */
    userDisplayName: string;
    userId: number;
    /** User login name, like "user@microsoft.com". */
    userLoginName: string;
    /** The user's permission mask for the current web. Use with PermissionMask utility functions. */
    webPermMasks?: IDouble;

    ///////////////// List level settings from SPContext.Current.List /////////////
    // Most of these won't be set in ODBNext, since server-side onedrive.aspx is outside of a
    // list context and thus SPContext.Current.List is always null. These should only be used in
    // lists/doclibs or other aspx pages where SPContext.Current.List is available server-side.
    /** List template from SPContext.Current.List, if any. -1 if unknown. */
    listBaseTemplate?: ListTemplateType;
    /** GUID from SPContext.Current.List, if any. */
    listId?: string;
    /** The user's permission mask for SPContext.Current.List. Use with PermissionMask utility functions. */
    listPermsMask?: IDouble;
    /** The display name of the list from SPContext.Current.List. */
    listTitle?: string;
    /** The default list URL for this app. On ODB, this is manually set in ODBOneDrive.ts. */
    listUrl?: string;
    /** The GUID of the list view associated with this aspx page, from SPContext.Current.List. */
    viewId?: string;
}

/**
 * Interface for a navigation node.
 *
 * Note that the properties here reflect the structure of the JSON blob returned by the server,
 * at the time of writing.
 */
export interface INavNode {
    Id: number;
    Title: string;
    Url: string;
    IsDocLib: boolean;
    IsExternal: boolean;
    ParentId: number;
    Children: INavNode[];
}

/**
 * Gets the absolute URL of the server (like https://microsoft.sharepoint.com).
 * Input can be an ISpPageContext or other object containing absolute and server-relative web URLs.
 *
 * @example
 *  Returns "https://microsoft.sharepoint.com"
 *      getServerUrl({
 *          webAbsoluteUrl: "https://microsoft.sharepoint.com/sites/odsp",
 *          webServerRelativeUrl: "/sites/odsp"
 *      })
 *
 * Returns "http://server"
 *     getServerUrl({
 *          webAbsoluteUrl: "http://server",
 *          webServerRelativeUrl: "/"
 *     })
 */
export function getServerUrl(pageContext: {
    webAbsoluteUrl: string;
    webServerRelativeUrl: string
}): string {
    'use strict';

    let { webAbsoluteUrl, webServerRelativeUrl } = pageContext;

    // Handle cases like http://server site collection, where webServerRelativeUrl will be '/'
    return webServerRelativeUrl === '/' || webServerRelativeUrl === ''
        ? webAbsoluteUrl
        : webAbsoluteUrl.split(webServerRelativeUrl)[0];
}

/**
 * In most cases, returns the webServerRelativeUrl as-is.
 * For the root web (http://server), returns ''.
 *
 * This function is needed because the root web's webServerRelativeUrl will be '/',
 * which is usually not desirable when combining with other paths. For example:
 *    Good:  '/myweb' + '/_api/contextinfo' => '/myweb/_api/contextinfo'
 *    Bad:   '/'      + '/_api/contextinfo' => '//_api/contextinfo'
 *    Fixed: ''       + '/_api/contextinfo' => '/_api/contextinfo'
 *
 * @param pageContext - An ISpPageContext or other object containing the server-relative URL of a web
 */
export function getSafeWebServerRelativeUrl(pageContext: {
    webServerRelativeUrl: string;
}): string {
    'use strict';

    return pageContext.webServerRelativeUrl === '/' ? '' : pageContext.webServerRelativeUrl;
}

export { ISuiteNavLink };
export default ISpPageContext;
