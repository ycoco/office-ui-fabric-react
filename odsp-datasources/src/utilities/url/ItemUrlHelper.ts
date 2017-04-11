
import SimpleUri from '@ms/odsp-utilities/lib/uri/SimpleUri';
import ISpPageContext from '../../interfaces/ISpPageContext';
import { equalsCaseInsensitive as equals } from '@ms/odsp-utilities/lib/string/StringHelper';

export interface IGetUrlPartsOptions {
    /**
     * Fully qualified (or server-relative) URL to the item.
     *
     * @type {string}
     *
     * @example
     *  https://contoso.sharepoint.com/teams/finance/Shared_Documents/reports/Yearly.xlsx
     * @example
     *  /teams/finance/Shared%20Documents/reports/Yearly.xlsx
     */
    path?: string;
    /**
     * Fully-qualified (or server-relative) URL to the list root.
     *
     * @type {string}
     * @example
     *  https://contoso-my.sharepoint.com/personal/me_contoso_com/Documents
     * @example
     *  /personal/me_contoso_com/Documents
     * @example
     *  /teams/finance/Shared%20Documents
     */
    listUrl?: string;
    /**
     * Fully-qualified (or server-relative) URL to the site root.
     *
     * @type {string}
     *
     * @example
     *  https://contoso-my.sharepoint.com/personal/me_contoso_com
     * @example
     *  https://contoso.sharepoint.com/teams/finance
     * @example
     *  /teams/finance
     * @example
     *  /personal/me_contoso_com
     */
    webUrl?: string;
}

/**
 * Specifies how the default site relates to the site specified in the item URL.
 */
export enum SiteRelation {
    /** Unable to determine if the default site and the item are on different sites. */
    unknown = 0,
    /** The default site and the item exist on the same site (SPWeb) */
    sameSite = 1,
    /** The default site and the item exist on a different site (SPWeb) */
    crossSite = 2
}

/**
 * Represents the available URL parts extractable for an item.
 *
 * @export
 * @interface IItemUrlParts
 */
export interface IItemUrlParts {
    /**
     * Gets the fully-qualified path to the item.
     *
     * @type {string}
     */
    fullItemUrl: string;
    /**
     * Gets the server-relative path to the item.
     * If no path was provided, this will be undefined.
     *
     * Will be '/' for the server-relative root.
     * Otherwise, presence of a trailing '/' depends on the input path.
     *
     * @type {string}
     */
    serverRelativeItemUrl: string;
    /**
     * Gets the fully-qualified path to the list containing the item.
     *
     * @type {string}
     */
    fullListUrl: string;
    /**
     * Gets the normalized list URL for the item.
     * If the list is on the current server domain, this will be server-relative.
     * If the list is the current default list or no list is available, this will be undefined.
     *
     * Will be '/' for the server-relative root.
     * Otherwise, presence of a trailing '/' depends on the input path.
     *
     * @type {string}
     */
    normalizedListUrl: string;

    /**
     * Gets the server-relative path to the list.
     *
     * Will be '/' for the server-relative root.
     * Otherwise, presence of a trailing '/' depends on the input path.
     *
     * @type {string}
     */
    serverRelativeListUrl: string;

    /**
     * Gets the fully-qualified path to the item if on an alternate domain.
     * Gets the server-relative path to the item if on the same domain.
     *
     * Will be '/' for the server-relative root.
     * Otherwise, presence of a trailing '/' depends on the input path.
     *
     * @type {string}
     */
    normalizedItemUrl: string;

    /**
     * Gets the path to the item relative to the list.
     */
    listRelativeItemUrl: string;

    /**
     * Gets the path to the item relative to is web.
     *
     * @type {string}
     * @memberOf IItemUrlParts
     */
    webRelativeItemUrl: string;

    /**
     * Determines whether or not the item is on a different domain than the current app.
     *
     * @type {boolean}
     */
    isCrossDomain: boolean;

    /**
     * Determines the relation of the target web to the current web.
     *
     * @type {SiteRelation}
     */
    siteRelation: SiteRelation;

    /**
     * Determines whether or not the item is on a different list than the current app.
     *
     * @type {boolean}
     * @memberOf IItemUrlParts
     */
    isCrossList: boolean;
}

export interface IItemUrlHelperParams {
    // Nothing
}

export interface IItemUrlHelperDependencies {
    pageContext: ISpPageContext;
}

/**
 * Component which consumes known information about SharePoint item URLs and constructs
 * normalized URLs for use in item keys and API calls.
 *
 * Different SharePoint API methods return URLs to items, lists, and sites with different formats.
 * This component can be used to extract the necessary information from these URLs and construct
 * invariant versions.
 *
 * The logic in this component codifies all the assumptions made about the format of SharePoint URLs
 * by the web layer.
 *
 * Note, URLs passed in as '/' are assumed to mean the server-relative root. These are internally treated
 * as '' but any URL which evaluates back to the server-relative root will be returned as '/'.
 *
 * @export
 * @class ItemUrlHelper
 *
 * @example
 *  import ItemUrlHelper, { resourceKey as itemUrlHelperKey } from '../dataSources/url/odb/ItemUrlHelper';
 *
 *  let itemUrlHelper = this.resources.consume(itemUrlHelperKey);
 *
 *  // Given only a webUrl and a path, extract a list URL and a server-relative URL.
 *  let {
 *      serverRelativeItemUrl,
 *      normalizedListUrl
 *  } = itemUrlHelper.getUrlParts({
 *      path: 'https://contoso.sharepoint.com/teams/finance/Shared_Documents/reports/Yearly.xlsx',
 *      webUrl: '/teams/finance'
 *  });
 *
 *  let itemKey = this._urlDataSource.getKey({
 *      [UrlQueryKeys.idParamKey]: serverRelativeItemUrl,
 *      [UrlQueryKeys.listUrlKey]: normalizedListUrl
 *  });
 */
export class ItemUrlHelper {
    private _pageContext: ISpPageContext;

    constructor(params: IItemUrlHelperParams, dependencies: IItemUrlHelperDependencies) {
        this._pageContext = dependencies.pageContext;
    }

    /**
     * Extracts the available URL parts for an item given available information.
     * Any or all of the inputs may be provided, though the outputs may be undefined
     * if insufficient information is provided.
     *
     * @param {IGetUrlPartsOptions} [params={}]
     * @returns {IItemUrlParts}
     */
    public getUrlParts(params: IGetUrlPartsOptions = {}): IItemUrlParts {
        return new ItemUrlParts({
            defaultFullWebUrl: this._pageContext.webAbsoluteUrl,
            defaultListUrl: this._pageContext.listUrl,
            ...params
        });
    }
}

interface IItemUrlPartsParams {
    defaultFullWebUrl: string;
    defaultListUrl: string;
}

/**
 * Backing implementation of the result from a call to ItemUrlHelper.getUrlParts.
 * This class relies heavily on lazy-initialization of values in order to improve performance.
 *
 * @class ItemUrlParts
 * @implements {IItemUrlParts}
 */
class ItemUrlParts implements IItemUrlParts {
    public get serverRelativeItemUrl(): string {
        return this._convertToRootUrl(this._getServerRelativeItemUrl());
    }

    public get serverRelativeListUrl(): string {
        return this._convertToRootUrl(this._getServerRelativeListUrl());
    }

    public get fullListUrl(): string {
        return this._getFullListUrl();
    }

    public get normalizedListUrl(): string {
        return this._convertToRootUrl(this._getNormalizedListUrl());
    }

    public get fullItemUrl(): string {
        return this._getFullItemUrl();
    }

    public get normalizedItemUrl(): string {
        return this._convertToRootUrl(this._getNormalizedItemUrl());
    }

    public get listRelativeItemUrl(): string {
        return this._getListRelativeItemUrl();
    }

    public get webRelativeItemUrl(): string {
        return this._getWebRelativeItemUrl();
    }

    public get isCrossDomain(): boolean {
        return this._getIsCrossDomain();
    }

    public get isCrossList(): boolean {
        return this._getIsCrossList();
    }

    public get siteRelation(): SiteRelation {
        return this._getSiteRelation();
    }

    private _path: string;
    private _listUrl: string;
    private _webUrl: string;

    private _defaultFullWebUrl: string;
    private _defaultListUrl: string;

    constructor(params: IGetUrlPartsOptions & IItemUrlPartsParams) {
        let {
            path,
            listUrl,
            webUrl,
            defaultFullWebUrl,
            defaultListUrl
        } = params;

        this._defaultFullWebUrl = this._convertFromRootUrl(defaultFullWebUrl);
        this._defaultListUrl = this._convertFromRootUrl(defaultListUrl);

        this._path = this._convertFromRootUrl(path);
        this._listUrl = this._convertFromRootUrl(listUrl);
        this._webUrl = this._convertFromRootUrl(webUrl);
    }

    private _getCurrentAuthority(): string {
        let currentAuthority = new SimpleUri(this._defaultFullWebUrl).authority;

        this._getCurrentAuthority = () => currentAuthority;

        return currentAuthority;
    }

    private _getIsCrossDomain(): boolean {
        let isCrossDomain: boolean;

        let currentAuthority = this._getCurrentAuthority();

        isCrossDomain = !equals(new SimpleUri(this._getServerUrl()).authority, currentAuthority);

        this._getIsCrossDomain = () => isCrossDomain;

        return isCrossDomain;
    }

    private _getIsCrossList(): boolean {
        let isCrossList: boolean;

         // If _getNormalizedListUrl() returns anything, then this list is not the same as the current default list.
        isCrossList = !!this._getNormalizedListUrl();

        this._getIsCrossList = () => isCrossList;

        return isCrossList;
    }
    private _getSiteRelation(): SiteRelation {
        let siteRelation: SiteRelation = SiteRelation.unknown;

        if (this._webUrl !== void 0 && equals(this._defaultFullWebUrl, this._getFullWebUrl())) {
            siteRelation = SiteRelation.sameSite;
        } else if (this._getIsCrossDomain()) {
            siteRelation = SiteRelation.crossSite;
        } else {
            let serverRelativeCurrentWebUrl = new SimpleUri(this._defaultFullWebUrl).path;

            let serverRelativeUrl =
                this._getServerRelativeListUrl() ||
                this._getServerRelativeItemUrl();

            if (serverRelativeUrl !== void 0) {
                let index: number = this._indexOf(`${serverRelativeUrl}/`, `${serverRelativeCurrentWebUrl}/`);

                if (index !== 0) {
                    // If url doesn't contain default web URL, then it definitely is cross site
                    siteRelation = SiteRelation.crossSite;
                } else if (new SimpleUri(serverRelativeUrl).segments.length - 1 === new SimpleUri(serverRelativeCurrentWebUrl).segments.length) {
                    // We know that the site contains the default web Url, but we need to check if server-relative URL contains any potential web URL
                    // Example: If default web URL is http://server/engineering and list URL is http://server/engineering/workItems, then
                    // it's safe to assume that they are on the same web.
                    siteRelation = SiteRelation.sameSite;
                } else {
                    // Site is on the same domain and contains default web url, but the item URL is not one-level
                    // under the default web URL so we can't say whether it's on the same site or not.
                    // Example: If default web URL is http://server/marketing/ and list URL is
                    // http://server/marketing/sales/Forecast, we don't know if "sales" is a subsite
                    // of "marketing" or just a folder.
                    siteRelation = SiteRelation.unknown;
                }
            }
        }

        this._getSiteRelation = () => siteRelation;

        return siteRelation;
    }

    private _getNormalizedItemUrl(): string {
        let normalizedItemUrl: string;

        let fullItemUrl = this._getFullItemUrl();

        if (fullItemUrl !== void 0) {
            if (equals(new SimpleUri(fullItemUrl).authority, this._getCurrentAuthority())) {
                normalizedItemUrl = this._getServerRelativeItemUrl();
            } else {
                normalizedItemUrl = fullItemUrl;
            }
        }

        this._getNormalizedItemUrl = () => normalizedItemUrl;

        return normalizedItemUrl;
    }

    private _getNormalizedListUrl(): string {
        let normalizedListUrl: string;

        let fullListUrl = this._getFullListUrl();

        let defaultListUrl = this._getDefaultListUrl();

        if (fullListUrl !== void 0 && !equals(fullListUrl, defaultListUrl)) {
            if (equals(new SimpleUri(fullListUrl).authority, this._getCurrentAuthority())) {
                // Remove the domain if the list is on the current domain.
                normalizedListUrl = this._getServerRelativeListUrl();
            } else {
                // The list on not on the current server and is not the default.
                normalizedListUrl = fullListUrl;
            }
        }

        this._getNormalizedListUrl = () => normalizedListUrl;

        return normalizedListUrl;
    }

    private _getServerUrl(): string {
        // One of the provided inputs should have a domain.
        // Extract the authority from that input to use as the base for all full URLs.

        let serverUrl =
            this._path && new SimpleUri(this._path).authority ||
            this._listUrl && new SimpleUri(this._listUrl).authority ||
            this._webUrl && new SimpleUri(this._webUrl).authority ||
            this._defaultListUrl && new SimpleUri(this._defaultListUrl).authority ||
            new SimpleUri(this._defaultFullWebUrl).authority;

        this._getServerUrl = () => serverUrl;

        return serverUrl;
    }

    private _getServerRelativeListUrl(): string {
        let serverRelativeListUrl: string;

        if (this._listUrl !== void 0) {
            serverRelativeListUrl = new SimpleUri(this._listUrl).path;
        } else {
            // Since no list URL was provided, we will check if we can use the default list URL
            let defaultListUrl = this._getDefaultListUrl();

            if (defaultListUrl !== void 0) {
                let serverRelativeItemUrl = this._getServerRelativeItemUrl();
                let serverRelativeDefaultListUrl = new SimpleUri(defaultListUrl).path;

                // If defaultListUrl is empty because pageContext.listUrl is empty string, we're going have to try to guess at the list Url
                if (this._defaultListUrl === "") {
                    let serverRelativeWebUrl = this._getServerRelativeWebUrl();
                    if (serverRelativeItemUrl !== void 0 && this._indexOf(`${serverRelativeItemUrl}/`, `${serverRelativeWebUrl}/`) === 0) {
                        // Assume that the list name is the next segment of the path after the webUrl.
                        // NOTE: This is a bug since a list can exist in folders on the web!
                        let listName = new SimpleUri(serverRelativeItemUrl).segments[new SimpleUri(serverRelativeWebUrl).segments.length];
                        serverRelativeListUrl = `${serverRelativeWebUrl}/${listName}`;
                    }
                } else if (serverRelativeItemUrl === void 0 || this._indexOf(`${serverRelativeItemUrl}/`, `${serverRelativeDefaultListUrl}/`) === 0) {
                    // use default list URL if item URL wasn't specified or if item URL has same root path and same domain
                    serverRelativeListUrl = serverRelativeDefaultListUrl;
                }
            }
        }

        this._getServerRelativeListUrl = () => serverRelativeListUrl;

        return serverRelativeListUrl;
    }

    private _getFullWebUrl(): string {
        let fullWebUrl: string;

        let serverUrl = this._getServerUrl();
        let serverRelativeWebUrl = this._getServerRelativeWebUrl();

        if (serverRelativeWebUrl !== void 0) {
            fullWebUrl = `${serverUrl}${serverRelativeWebUrl}`;
        }

        this._getFullWebUrl = () => fullWebUrl;

        return fullWebUrl;
    }

    private _getFullListUrl(): string {
        let fullListUrl: string;

        let serverUrl = this._getServerUrl();
        let serverRelativeListUrl = this._getServerRelativeListUrl();

        if (serverRelativeListUrl !== void 0) {
            fullListUrl = `${serverUrl}${serverRelativeListUrl}`;
        }

        return fullListUrl;
    }

    private _getFullItemUrl(): string {
        let fullItemUrl: string;

        let serverRelativeItemUrl = this._getServerRelativeItemUrl();
        let serverUrl = this._getServerUrl();

        if (serverRelativeItemUrl !== void 0) {
            // Reconstruct the item path from its relative URL and the final server URL.
            fullItemUrl = `${serverUrl}${serverRelativeItemUrl}`;
        } else {
            let serverRelativeListUrl = this._getServerRelativeListUrl();

            if (serverRelativeListUrl !== void 0) {
                fullItemUrl = `${serverUrl}${serverRelativeListUrl}`;
            }
        }

        this._getFullItemUrl = () => fullItemUrl;

        return fullItemUrl;
    }

    private _getServerRelativeWebUrl(): string {
        let serverRelativeWebUrl: string;

        let serverRelativeListUrl: string;

        if (this._webUrl !== void 0) {
            serverRelativeWebUrl = new SimpleUri(this._webUrl).path;
        // Use list URL to determine web URL. Need to check that we have list info or otherwise we'll get into an infitite loop here.
        } else if ((this._defaultListUrl || this._listUrl) && (serverRelativeListUrl = this._getServerRelativeListUrl()) !== void 0) {
            const serverRelativeListUri = new SimpleUri(serverRelativeListUrl);

            serverRelativeWebUrl = `${serverRelativeListUri.segments.slice(0, -1).join('/')}`;
        } else if (this._defaultFullWebUrl) {
            serverRelativeWebUrl = new SimpleUri(this._defaultFullWebUrl).path;
        }

        this._getServerRelativeWebUrl = () => serverRelativeWebUrl;

        return serverRelativeWebUrl;
    }

    private _getServerRelativeItemUrl(): string {
        let serverRelativeItemUrl: string;

        if (this._path !== void 0) {
            // Path is the only pointer directly to the item.
            serverRelativeItemUrl = new SimpleUri(this._path).path;
        }

        this._getServerRelativeItemUrl = () => serverRelativeItemUrl;

        return serverRelativeItemUrl;
    }

    private _getListRelativeItemUrl(): string {
        let listRelativeItemUrl: string;

        let serverRelativeItemUrl = this._getServerRelativeItemUrl();
        let serverRelativeListUrl = this._getServerRelativeListUrl();

        let serverRelativeListUrlStem: string;

        if (serverRelativeItemUrl !== void 0 &&
            serverRelativeListUrl !== void 0 &&
            this._indexOf(`${serverRelativeItemUrl}/`, serverRelativeListUrlStem = `${serverRelativeListUrl}/`) === 0) {
            listRelativeItemUrl = serverRelativeItemUrl.substring(serverRelativeListUrlStem.length);
        }

        this._getListRelativeItemUrl = () => listRelativeItemUrl;

        return listRelativeItemUrl;
    }

    private _getWebRelativeItemUrl(): string {
        let webRelativeItemUrl: string;

        const serverRelativeItemUrl = this._getServerRelativeItemUrl();
        const serverRelativeWebUrl = this._getServerRelativeWebUrl();

        let serverRelativeWebUrlStem: string;

        if (serverRelativeItemUrl !== void 0 &&
            serverRelativeWebUrl !== void 0 &&
            this._indexOf(`${serverRelativeItemUrl}/`, serverRelativeWebUrlStem = `${serverRelativeWebUrl}/`) === 0) {
            webRelativeItemUrl = serverRelativeItemUrl.substring(serverRelativeWebUrlStem.length);
        }

        this._getWebRelativeItemUrl = () => webRelativeItemUrl;

        return webRelativeItemUrl;
    }

    private _getDefaultListUrl(): string {
        let defaultListUrl: string;

        if (this._defaultListUrl !== void 0) {
            if (new SimpleUri(this._defaultListUrl).authority) {
                // If the default list supplies its own domain, use it instead of the current server domain.
                defaultListUrl = this._defaultListUrl;
            } else {
                // Assume the list is on the current domain.
                defaultListUrl = `${this._getCurrentAuthority()}${this._defaultListUrl}`;
            }
        }

        this._getDefaultListUrl = () => defaultListUrl;

        return defaultListUrl;
    }

    private _convertToRootUrl(url: string) {
        if (url === '') {
            return '/';
        }

        return url;
    }

    private _convertFromRootUrl(url: string) {
        if (url === '/') {
            return '/';
        }

        return url;
    }

    private _indexOf(left: string, right: string): number {
        return left.toUpperCase().indexOf(right && right.toUpperCase());
    }
}
