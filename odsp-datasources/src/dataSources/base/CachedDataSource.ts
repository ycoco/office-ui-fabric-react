import Promise from '@ms/odsp-utilities/lib/async/Promise';
import DataSource from './DataSource';
import DataStore from '@ms/odsp-utilities/lib/models/store/BaseDataStore';
import DataStoreCachingType from '@ms/odsp-utilities/lib/models/store/DataStoreCachingType';
import { ISpPageContext } from './../../interfaces/ISpPageContext';

const DEFAULT_CACHE_TIMEOUT_TIME = 300000;

// sp-home oil uses "ms-oil-datasource-" as prefix.
const DEFAULT_CACHE_ID_PREFIX = 'odsp-ds-';

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

type ICache = { [key: string]: Internal.ICacheItem<any> };

/**
 * A special version of the base DataSource that comes with a built-in cache.
 *
 * Cache operates in a similar fashion to  sp-home 'oil.ds' and should be compatible if given
 * the same prefix.
 */
export class CachedDataSource extends DataSource {
    /** The instance of the datastore used for the cache. */
    private _store: DataStore;

    /** How long in milliseconds before cache times out. */
    private _cacheTimeoutTime: number;
    /** Id of the current datasource instance. */
    private _id: string;
    /** Version number derived from pageContext (uses same algo as of 8/11/2016 as SP Home). */
    private _version: string;
    /** Object representing cache value. */
    private _cache: ICache;

    /**
     * @constructor
     *
     * @param {ISpPageContext} pageContext - ISpPageContext needed by BaseDataSource.
     * @param {string} id - The id of the current datasource instance, used as the id of the cache as well.
     * @param {ICacheOptions} cacheOptions - Provides options to overwrite default settings of the cache.
     */
    constructor(pageContext: ISpPageContext, id: string, cacheOptions: ICacheOptions = {}) {
        super(pageContext);
        this._cacheTimeoutTime = cacheOptions.cacheTimeoutTime || DEFAULT_CACHE_TIMEOUT_TIME;
        this._id = id;
        this._version = pageContext ? (pageContext.siteClientTag + '_' + pageContext.userDisplayName) : '';
        let cacheIdPrefix = cacheOptions.cacheIdPrefix || DEFAULT_CACHE_ID_PREFIX;
        this._store = new DataStore(cacheIdPrefix, DataStoreCachingType.session);
        this._initSessionCache();
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

        const cache = this._cache;
        const cacheItem = cache[cacheRequestKey];

        if (onlyCache) {
            if (cacheItem) {
                return Promise.wrap(cacheItem._value);
            } else {
                return Promise.wrap(undefined);
            }
        }

        const stale: boolean = cacheItem && this._isCacheExpired(cacheItem);
        const shouldFetch: boolean = bypassCache || !cacheItem || (stale && !useStale);

        if (shouldFetch) {
            const response = this.getData<T>(
                getUrl,
                parseResponse,
                qosName,
                getAdditionalPostData,
                method,
                additionalHeaders,
                contentType,
                maxRetries,
                noRedirect,
                crossSiteCollectionCall);

            return response.then((value: T) => {
                cache[cacheRequestKey] = <Internal.ICacheItem<T>>{ _fetched: new Date().valueOf(), _value: value };
                this._updateSessionCache();
                return value;
            });
        } else {
            return Promise.wrap(cacheItem._value);
        }
    }

    /**
     * Serializes a key for the request. Override this method to use your own serialization
     * or naming scheme.
     *
     * @protected
     */
    protected getRequestKey(url: string, method: string, getAdditionalPostData: () => string) {
        let keyParts: string[] = [];
        keyParts.push(url);
        keyParts.push(method);
        if (getAdditionalPostData) {
            keyParts.push(getAdditionalPostData());
        }

        return keyParts.join(',');
    }

    /**
     * Name for session storage entry storing the data for this cache.
     *
     * @readonly
     * @protected
     * @type {string}
     */
    protected get cacheId(): string {
        return this._id;
    }

    /**
     * Name for session storage entry storing the version number/partition for this cache.
     *
     * @readonly
     * @protected
     * @type {string}
     */
    protected get cacheVersionId(): string {
        return this._id + '-version';
    }

    /**
     * Flushes the cache entry with the specified cache request key.
     */
    protected flushCache(cacheRequestKey: string) {
        delete this._cache[cacheRequestKey];
        this._updateSessionCache();
    }

    /**
     * Initializes and loads the cache. If the cache is no longer valid, flush the cache first.
     */
    private _initSessionCache(): void {
        if (this._version !== this._store.getValue(this.cacheVersionId, undefined, false)) {
            this._clearSessionCache();

            // update the version
            this._store.setValue(this.cacheVersionId, this._version, undefined, false);
        } else {
            this._cache = this._store.getValue<ICache>(this.cacheId, undefined, false) || {};
        }
    }

    /**
     * Save to session storage the state of the in-memory cache.
     */
    private _updateSessionCache() {
        this._store.setValue(this.cacheId, this._cache, undefined, false);
    }

    /**
     * Clear/flush the cache.
     */
    private _clearSessionCache() {
        this._cache = {};
        this._updateSessionCache();
    }

    /**
     * Given a cache item, indicates whether the cache is expired.
     */
    private _isCacheExpired<T>(cacheItem: Internal.ICacheItem<T>) {
        const refreshThreshold = new Date().valueOf() - this._cacheTimeoutTime;
        return cacheItem._fetched <= refreshThreshold;
    }
}

namespace Internal {
    /**
     * This
     */
    export interface ICacheItem<T> {
        /**
         * When the data was last fetched from the server (in unix timestamp, Date.valueOf)
         */
        _fetched: number;

        /**
         * Item stored in cache.
         */
        _value: T;
    }
}

export default CachedDataSource;
