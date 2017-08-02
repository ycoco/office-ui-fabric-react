
import Promise from '@ms/odsp-utilities/lib/async/Promise';
import DataStore from '@ms/odsp-utilities/lib/models/store/BaseDataStore';
import DataStoreCachingType from '@ms/odsp-utilities/lib/models/store/DataStoreCachingType';
import { ISpPageContext } from './../../interfaces/ISpPageContext';

const DEFAULT_CACHE_TIMEOUT_TIME = 300000;

// sp-home oil uses "ms-oil-datasource-" as prefix.
const DEFAULT_CACHE_ID_PREFIX = 'odsp-ds-';

/**
 * This has the same params as DataSource.getData.
 * @see DataSource.getData
 */
export interface IGetDataUsingCacheParams<T> {
    /**
     * String that keys this request in the cache, for purposes of cache operations
     * (such as lookup).
     */
    cacheRequestKey: string;
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
    /**
     * Function to load the data fresh if the cache hit fails.
     */
    getData(): Promise<T>;
}

type ICache = { [key: string]: Internal.ICacheItem<any> };

export interface IRequestCacheParams {
    id: string;
    cacheType?: DataStoreCachingType;
    cacheTimeoutTime?: number;
}

export interface IRequestCacheDependencies {
    cacheIdPrefix?: string;
    pageContext?: ISpPageContext;
}

/**
 * A special version of the base DataSource that comes with a built-in cache.
 *
 * Cache operates in a similar fashion to  sp-home 'oil.ds' and should be compatible if given
 * the same prefix.
 */
export class RequestCache {
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
     *
     * @param params The configuration params specific to the given cache.
     * @param dependencies Dependencies expected to be shared across all cache instances.
     */
    constructor(params: IRequestCacheParams, dependencies: IRequestCacheDependencies) {
        const {
            id,
            cacheType = DataStoreCachingType.session,
            cacheTimeoutTime = DEFAULT_CACHE_TIMEOUT_TIME
        } = params;

        const {
            cacheIdPrefix = DEFAULT_CACHE_ID_PREFIX,
            pageContext
        } = dependencies;

        this._cacheTimeoutTime = cacheTimeoutTime;
        this._id = id;
        this._version = pageContext ? (pageContext.siteClientTag + '_' + pageContext.userDisplayName) : '';

        this._store = new DataStore(cacheIdPrefix, cacheType);

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
    public getDataUtilizingCache<T>({
        cacheRequestKey,
        useStale = false,
        bypassCache = false,
        onlyCache = false,
        getData
    }: IGetDataUsingCacheParams<T>): Promise<T> {
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
            return getData().then((value: T) => {
                cache[cacheRequestKey] = <Internal.ICacheItem<T>>{
                    _fetched: new Date().valueOf(),
                    _value: value
                };
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
    public getRequestKey(url: string, method: string, additionalPostData?: string) {
        const keyParts: string[] = [];
        keyParts.push(url);
        keyParts.push(method);
        if (additionalPostData) {
            keyParts.push(additionalPostData);
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
    public get cacheId(): string {
        return this._id;
    }

    /**
     * Name for session storage entry storing the version number/partition for this cache.
     *
     * @readonly
     * @protected
     * @type {string}
     */
    public get cacheVersionId(): string {
        return this._id + '-version';
    }

    /**
     * Flushes the cache entry with the specified cache request key.
     */
    public flushCache(cacheRequestKey: string) {
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

export default RequestCache;
