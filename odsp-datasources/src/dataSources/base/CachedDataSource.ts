
import Promise from '@ms/odsp-utilities/lib/async/Promise';
import DataSource from './DataSource';
import { ISpPageContext } from './../../interfaces/ISpPageContext';
import { RequestCache } from './RequestCache';

/**
 * Options you can use to customize the behavior of the cache.
 */
export interface ICacheOptions {
    /**
     * Supply a string here to overwrite the prefix used for id-ing the cache.
     * @default odsp-ds-
     */
    cacheIdPrefix?: string;

    /**
     * Supply a number here in milliseconds to overwrite the default duration
     * the XHR calls are cached by default.
     */
    cacheTimeoutTime?: number;
}

/**
 * This has the same params as DataSource.getData.
 * @see DataSource.getData
 */
export interface IGetDataUsingCacheParams<T> {
    /** @see DataSource.getData */
    getUrl: () => string;
    /** @see DataSource.getData */
    parseResponse: (responseText: string) => T;
    /** @see DataSource.getData */
    qosName: string;
    /** @see DataSource.getData */
    getAdditionalPostData?: () => string;
    /** @see DataSource.getData */
    method?: string;
    /** @see DataSource.getData */
    additionalHeaders?: { [key: string]: string };
    /** @see DataSource.getData */
    contentType?: string;
    /** @see DataSource.getData */
    maxRetries?: number;
    /** @see DataSource.getData */
    noRedirect?: boolean;
    /** @see DataSource.getData */
    crossSiteCollectionCall?: boolean;
    /**
     * String that keys this request in the cache, for purposes of cache operations
     * (such as lookup).
     */
    cacheRequestKey?: string;
    /**
     * Whether to use the cached value even if stale.
     * @default false
     */
    useStale?: boolean;
    /**
     * If true, will bypass the cache and issue a server call but still cache server response.
     * onlyCache takes precedence over this.
     * @default false
     */
    bypassCache?: boolean;
    /**
     * If true, will only use values from cache. If cache value does not exist, return undefined.
     * Takes precedence over bypassCache.
     * @default false
     */
    onlyCache?: boolean;
}

/**
 * A special version of the base DataSource that comes with a built-in cache.
 *
 * Cache operates in a similar fashion to  sp-home 'oil.ds' and should be compatible if given
 * the same prefix.
 */
export class CachedDataSource extends DataSource {
    private _requestCache: RequestCache;

    /**
     * @constructor
     *
     * @param {ISpPageContext} pageContext - ISpPageContext needed by BaseDataSource.
     * @param {string} id - The id of the current datasource instance, used as the id of the cache as well.
     * @param {ICacheOptions} cacheOptions - Provides options to overwrite default settings of the cache.
     */
    constructor(pageContext: ISpPageContext, id: string, cacheOptions: ICacheOptions = {}) {
        super(pageContext);

        this._requestCache = new RequestCache({
            id: id,
            cacheTimeoutTime: cacheOptions.cacheTimeoutTime || undefined
        }, {
            pageContext: pageContext,
            cacheIdPrefix: cacheOptions.cacheIdPrefix || undefined
        });
    }

    /**
     * A special version of getData that will utilize the cache. This takes in mostly the same
     * parameters as DataSource.getData but has the following optional, extra params:
     *
     *   cacheRequestKey, useStale, flushCache
     *
     * @see DataSource.getData
     */
    protected getDataUtilizingCache<T>({
        getUrl,
        parseResponse,
        qosName,
        getAdditionalPostData,
        method = 'POST',
        additionalHeaders,
        contentType, // defaults to application/json;odata=verbose
        maxRetries,
        noRedirect,
        crossSiteCollectionCall,
        cacheRequestKey,
        useStale = false,
        bypassCache = false,
        onlyCache = false
    }: IGetDataUsingCacheParams<T>): Promise<T> {
        cacheRequestKey = cacheRequestKey || this.getRequestKey(getUrl(), method, getAdditionalPostData);

        return this._requestCache.getDataUtilizingCache({
            cacheRequestKey: cacheRequestKey,
            useStale: useStale,
            bypassCache: bypassCache,
            onlyCache: onlyCache,
            getData: () => this.getData<T>(
                getUrl,
                parseResponse,
                qosName,
                getAdditionalPostData,
                method,
                additionalHeaders,
                contentType,
                maxRetries,
                noRedirect,
                crossSiteCollectionCall)
        });
    }

    /**
     * Serializes a key for the request. Override this method to use your own serialization
     * or naming scheme.
     *
     * @protected
     */
    protected getRequestKey(url: string, method: string, getAdditionalPostData: () => string) {
        return this._requestCache.getRequestKey(url, method, getAdditionalPostData && getAdditionalPostData());
    }

    /**
     * Name for session storage entry storing the data for this cache.
     *
     * @readonly
     * @protected
     * @type {string}
     */
    protected get cacheId(): string {
        return this._requestCache.cacheId;
    }

    /**
     * Name for session storage entry storing the version number/partition for this cache.
     *
     * @readonly
     * @protected
     * @type {string}
     */
    protected get cacheVersionId(): string {
        return this._requestCache.cacheVersionId;
    }

    /**
     * Flushes the cache entry with the specified cache request key.
     */
    protected flushCache(cacheRequestKey: string) {
        this._requestCache.flushCache(cacheRequestKey);
    }
}

export default CachedDataSource;
