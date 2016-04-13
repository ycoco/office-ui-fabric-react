import DataStoreCachingType from './DataStoreCachingType';

// DataStore class is used for transparent caching of data in memory and/or browser storage
// - Parameter defaultCachingType defines whether you want to use browser storage for all operations
// and which type of storage - session or local
// - Parameter dataStoreKey is used to prefix every key in browser storage. Actual key for browser storage
// will be dataStoreKey + key used in setValue method.
// - If DataStore is instantiated with some type of browser caching enabled - it will test if browser storage
// is available and use it. If it's not it will fall back to in-memory cache.
// - If DataStore is instantiated from two different places with same dataStoreKey and some type of
// browser storage caching, the memory storage will be shared as well as browser storage.
class DataStore {
    private static _sessionStorage: Storage = null;
    private static _localStorage: Storage = null;
    private static _dataStore: { [dataStoreKey: string]: { [key: string]: any } } = {};
    private static _initialized = false;

    private dataStore: { [key: string]: any };
    private dataStoreKey: string;
    private defaultCachingType: DataStoreCachingType;

    constructor(dataStoreKey: string, defaultCachingType: DataStoreCachingType = DataStoreCachingType.none) {

        DataStore.init();

        this.dataStoreKey = dataStoreKey;
        this.defaultCachingType = defaultCachingType;

        if (defaultCachingType === DataStoreCachingType.none) {
            this.dataStore = {};
        } else {
            var store = DataStore._dataStore[this.dataStoreKey];
            if (store === undefined) {
                DataStore._dataStore[this.dataStoreKey] = {};
            }
            this.dataStore = DataStore._dataStore[this.dataStoreKey];
        }
    }

    public static hasStorageType(storageType: DataStoreCachingType) {
        DataStore.init();
        switch (storageType) {
            case DataStoreCachingType.none:             return true;
            case DataStoreCachingType.sharedMemory:     return true;
            case DataStoreCachingType.session:          return !!DataStore._sessionStorage;
            case DataStoreCachingType.local:            return !!DataStore._localStorage;
        }
        return false;
    }

    private static init() {
        if (DataStore._initialized) {
            return;
        }

        // Need a try/catch since window.localStorage can throw.
        try {
            if ('localStorage' in window && window.localStorage && DataStore.testStorage(window.localStorage)) {
                DataStore._localStorage = window.localStorage;
            }
        } catch (exUsingLocalStorage) {
                // do nothing
        }

        try {
            if ('sessionStorage' in window && window.sessionStorage && DataStore.testStorage(window.sessionStorage)) {
                DataStore._sessionStorage = window.sessionStorage;
            }
        } catch (exUsingSessionStorage) {
                // do nothing
        }

        // Fallback logic
        if (DataStore._localStorage == null) {
            DataStore._localStorage = DataStore._sessionStorage;
        }

        DataStore._initialized = true;
    }

    /** Need to check whether the value in localStorage is of the correct type.
     * In Private Browsing in Safari, for example, localStorage is accessible,
     * but all of the non-built-in properties return undefined, and setting
     * such a property causes an exception.
     */
    private static testStorage(storage: Storage): boolean {
        var _testKey = "BrowserStorageTest";
        var _testValue = "1";
        var result = false;

        try {
            storage.setItem(_testKey, _testValue);
            if (storage.getItem(_testKey) === _testValue) {
                result = true;
            }
            storage.removeItem(_testKey);
        } catch (e) { /* no-op, return false */ }

        return result;
    }

    public setValue<T>(key: string, value: T, cachingTypeOverride?: DataStoreCachingType): void {
        key = this.normalizeKey(key);

        this.dataStore[key] = value;

        var storage = this.getStorage(cachingTypeOverride);
        if (storage) {
            try {
                var objectsFound = [];
                var s: string = JSON.stringify(value, function(key: any, value: any) {
                    if (typeof value === 'object' && value !== null) {
                        if (objectsFound.indexOf(value) !== -1) {
                            // discard the key if circular dependency was found
                            return;
                        }

                        if (key[0] === '_') {
                            // discard private objects
                            return;
                        }

                        // Otherwise store value in the cache
                        objectsFound.push(value);
                    }
                    return value;
                });
                // empty cache
                objectsFound = null;
                storage.setItem(this.dataStoreKey + key, s);
            } catch (e) {
                // do nothing
            }
        }
    }

    public getValue<T>(key: string, cachingTypeOverride?: DataStoreCachingType): T {
        key = this.normalizeKey(key);

        var value = this.dataStore[key];
        var storage = this.getStorage(cachingTypeOverride);
        if (value === undefined && storage) {
            var s = storage.getItem(this.dataStoreKey + key);

            if (s) {
                try {
                    value = JSON.parse(s);
                    this.dataStore[key] = value;
                } catch (e) {
                    value = undefined;
                }
            }
        }

        return value;
    }

    public remove(key: string, cachingTypeOverride?: DataStoreCachingType) {
        key = this.normalizeKey(key);

        var storage = this.getStorage(cachingTypeOverride);
        if (storage) {
            storage.removeItem(this.dataStoreKey + key);
        }

        delete this.dataStore[key];
    }

    private getStorage(cachingTypeOverride?: DataStoreCachingType): Storage {
        var cachingType = cachingTypeOverride ? cachingTypeOverride : this.defaultCachingType;

        switch (cachingType) {
            case DataStoreCachingType.none:
                return null;
            case DataStoreCachingType.sharedMemory:
                return null;
            case DataStoreCachingType.session:
                return DataStore._sessionStorage;
            case DataStoreCachingType.local:
                return DataStore._localStorage;
        }

        return null;
    }

    private normalizeKey(key: string) {
        return key && key.toLowerCase() || '';
    }
}

export default DataStore;
