// OneDrive:IgnoreCodeCoverage
/// <reference path='../../../knockout/knockout.d.ts' />

import DataStoreCachingType from 'odsp-utilities/models/store/DataStoreCachingType';
import BaseDataStore from 'odsp-utilities/models/store/BaseDataStore';
import BaseModel = require('../../base/BaseModel');

// DataStore class is used for transparent caching of data in memory and/or browser storage
// - Parameter defaultCachingType defines whether you want to use browser storage for all operations
// and which type of storage - session or local
// - Parameter dataStoreKey is used to prefix every key in browser storage. Actual key for browser storage
// will be dataStoreKey + key used in setValue method.
// - If DataStore is instantiated with some type of browser caching enabled - it will test if browser storage
// is available and use it. If it's not it will fall back to in-memory cache.
// - If DataStore is instantiated from two different places with same dataStoreKey and some type of
// browser storage caching, the memory storage will be shared as well as browser storage.
export default class KnockoutDataStore extends BaseModel {
    private dataStore: BaseDataStore;

    constructor(dataStoreKey: string, defaultCachingType: DataStoreCachingType = DataStoreCachingType.none) {
        super();

        this.dataStore = new BaseDataStore(dataStoreKey, defaultCachingType);
    }

    public persistBoolean(observable: KnockoutObservable<boolean>, key: string) {
        let value = this.getValue<string>(key);

        if (value !== undefined) {
            observable(value === 'true');
        }

        this.subscribe(observable, (value: boolean) => this.setValue(key, String(value)));
    }

    public persistNumber(observable: KnockoutObservable<number>, key: string) {
        let value = this.getValue<string>(key);

        if (value !== undefined) {
            observable(Number(value));
        }

        this.subscribe(observable, (value: number) => this.setValue(key, String(value)));
    }

    public persistString(observable: KnockoutObservable<string>, key: string) {
        let value = this.getValue<string>(key);

        if (value !== undefined) {
            observable(value);
        }

        this.subscribe(observable, (value: string) => this.setValue(key, value));
    }

    public setValue<T>(key: string, value: T, cachingTypeOverride?: DataStoreCachingType): void {
        this.dataStore.setValue<T>(key, value, cachingTypeOverride);
    }

    public getValue<T>(key: string, cachingTypeOverride?: DataStoreCachingType): T {
        return this.dataStore.getValue<T>(key, cachingTypeOverride);
    }

    public remove(key: string, cachingTypeOverride?: DataStoreCachingType) {
        this.dataStore.remove(key, cachingTypeOverride);
    }
}