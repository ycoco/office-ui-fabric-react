// OneDrive:IgnoreCodeCoverage

import IThemeData from './IThemeData';
import DataStore from '../models/store/BaseDataStore';
import DataStoreCachingType from '../models/store/DataStoreCachingType';

const THEME_CACHE_VERSION = '1.7';
const THEME_CACHE_PREFIX = 'odTheme';
const DATA_KEY = 'Data';
const TOKEN_KEY = 'CacheToken';
const VERSION_KEY = 'CacheVersion';

/**
 * Utility methods for caching theme data.
 */
export default class ThemeCache {
    /**
     * Clears the theme cache.
     */
    public static clearThemeCache() {
        "use strict";
        let ds = ThemeCache.getThemeDataStore();
        ds.remove(DATA_KEY);
        ds.remove(TOKEN_KEY);
        ds.remove(VERSION_KEY);
    }

    /**
     * Reads the cached theme, if the cacheToken is compatible.
     * @param {string} cacheToken The cached value will only be returned if it has the same cache token.
     */
    public static getCachedTheme(cacheToken: string): IThemeData {
        "use strict";
        let cachedTheme: IThemeData;
        let ds = ThemeCache.getThemeDataStore();
        try {
            // Make sure the data was cached with the expected version and
            // the current theme cache token. Otherwise, return undefined.
            if (cacheToken === ds.getValue<string>(TOKEN_KEY) &&
                THEME_CACHE_VERSION === ds.getValue<string>(VERSION_KEY)) {
                cachedTheme = ds.getValue<IThemeData>(DATA_KEY);
            }
        } catch (exReadCache) {
            // Ignore.
        }

        return cachedTheme;
    }

    /**
     * Updates the theme data in the cache.
     * @param {IThemeData} themeData The new theme data to cache.
     */
    public static updateThemeCache(themeData: IThemeData, cacheToken?: string) {
        "use strict";
        let ds = ThemeCache.getThemeDataStore();
        ds.setValue(DATA_KEY, themeData);
        ds.setValue(TOKEN_KEY, cacheToken || themeData.cacheToken);
        ds.setValue(VERSION_KEY, THEME_CACHE_VERSION);
    }

    /**
     * Returns an instance of the supporting data store for this cache.
     */
    private static getThemeDataStore(): DataStore {
        "use strict";
        return new DataStore(THEME_CACHE_PREFIX, DataStoreCachingType.local);
    }
}
