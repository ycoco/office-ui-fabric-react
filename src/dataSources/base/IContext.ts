import IDouble from './IDouble';
import INavNode from './INavNode';

/**
 * Context information that's available from _spPageContextInfo on page load and is applicable
 * for the life of the page (or at least applicable as long as the same list is loaded).
 * Therefore, instances should be thought of as READ-ONLY.
 *
 * Get a properly initialized instance using DataContext.getContext.
 *
 * !!!!!!!!!!!!!!!!!!!!!!!!!!
 * IMPORTANT:
 * Do not add properties to this interface unless they are applicable for the lifetime of
 * the page (or at least applicable for the first list loaded).
 * !!!!!!!!!!!!!!!!!!!!!!!!!!
 */
interface IContext {
    //////////////// Server, site and web ////////////////
    /** ID of the current site */
    siteId?: string;
    /** Environment (like EDog; null for devbox) */
    env: string;
    /** Layouts URL, like "_layouts/15" */
    layoutsUrl: string;
    /** the CDN prefix */
    cdnPrefix?: string;
    /**
     * Absolute URL of the web. The base DataSource ensures it will NOT have a trailing slash.
     * Will NOT be encoded and could contain spaces (an XHR will automatically encode the spaces).
     */
    webUrl?: string;
    /**
     * Server-relative URL of the web. The base DataSource ensures it will NOT have a trailing slash.
     * Will NOT be encoded and could contain spaces (an XHR will automatically encode the spaces).
     */
    webServerRelativeUrl: string;
    /** Absolute web URL */
    webAbsoluteUrl: string;
    /** Current web ID */
    webId?: string;
    /** The web template id of the web e.g. 21 for ODB, 64 Groups, 1 for teamsites. */
    webTemplate: string;
    /** The title of the web. */
    webTitle: string;
    /** The permissions mask for the current web. Use with PermissionMask utility functions. */
    webPermsMask?: IDouble;
    /** Culture name, like "en-US" */
    cultureName?: string;
    /** Language ID, like 1033 */
    currentLanguage: number;
    /** Like en-US */
    currentUICultureName: string;
    /** Like "4$$16.0.4524.1200". Part before $$ is used to tell if theme has been updated. */
    siteClientTag: string;
    /** Whether user is site collection admin */
    isSiteAdmin: boolean;
    /** Id of the group. */
    groupId: string;
    /** Type of the group: Public or Private. */
    groupType: string;
    /** Alias of the group. Null if not a group site. */
    groupAlias: string;
    /** Cache token for the current web theme */
    themeCacheToken?: string;
    /** URL of the current web theme */
    themedCssFolderUrl?: string;
    /** Site Pages feature (WEX) enabled on the site */
    sitePagesEnabled?: boolean;
    /** Whether guest sharing is enabled (on the site level - might still be disabled globally at the tenant level) */
    guestsEnabled?: boolean;
    /** The URL of the current request */
    serverRequestPath: string;
    /** system user key */
    systemUserKey: string;
    /** URL to the site logo (defaults to _layouts/15/images/siteicon.png) */
    webLogoUrl: string;
    /** Has NoScript enabled on the site, which prevents site admins from running abritrary script on the site to prevent XSS attacks. */
    isNoScriptEnabled?: boolean;
    /** top navigation and quick launch nodes */
    navigationInfo?: { quickLaunch: INavNode[], topNav: INavNode[] };

    //////////////// User info ////////////////
    /** User display name like "Jon Doe" */
    userDisplayName: string;
    /** User identifier like "i:0h.f|membership|100300008aff61c1@live.com" */
    userKey?: string;
    /** Numeric user ID */
    userId: string;
    /** User login name, like user@microsoft.com */
    userLoginName: string;
    /** True when the user is anonymous guest */
    isAnonymousGuestUser?: boolean;

    ///////////////// List level settings /////////////
    // These will never be set in ODBNext, since onedrive.aspx is outside of a list context
    // and thus SPContext.Current.List is always null. These should only be used in SPList
    // and other apps where you can depend on SPContext.Current.List.
    /** The id of the current list view being rendered */
    viewId: string;
    /** Whether this is a custom (non-ODB/groups) list/library  */
    isCustomList: boolean;
    /** Template id of the context list, if any */
    listBaseTemplate?: number;
    /** Id of the context list, if any */
    listId?: string;
    /** The permissions mask for the current list.
     * Use with PermissionMask utility functions.
     */
    listPermsMask?: IDouble;
    /** True if this view should render the Files title */
    listShouldRenderFilesTitle?: boolean;
    /** The display name of the list */
    listTitle?: string;
    /** True if the list items should open in client */
    openInClient?: boolean;
    /** True if the sync button should be hidden in ODB */
    hideSyncButtonOnODB?: boolean;
    /** True if the MGSC dialof should be shown in ODB */
    showNGSCDialogForSyncOnODB?: boolean;
    /** The default list URL for this app. On ODB, this is manually set in ODBOneDrive.ts */
    listUrl?: string;
    /** URL of the default list for this app */
    defaultListUrl?: string;
}

export default IContext;