
import BaseDataStore from '../../../../odsp-utilities/models/store/BaseDataStore';
import DataStoreCachingType from '../../../../odsp-utilities/models/store/DataStoreCachingType';
import { assert } from 'chai';

describe('BaseDataStore', () => {
    before(() => {
        this.dataStoreNoCachingKey = "DataStoreNoCachingTest";
        this.dataStoreNoCaching = new BaseDataStore(this.dataStoreNoCachingKey);

        this.dataStoreSessionKey = "DataStoreSessionTest";
        this.dataStoreSession = new BaseDataStore(this.dataStoreSessionKey, DataStoreCachingType.session);

        this.dataStoreLocalKey = "DataStoreLocalTest";
        this.dataStoreLocal = new BaseDataStore(this.dataStoreLocalKey, DataStoreCachingType.local);
    });

    after(() => {
        this.dataStoreNoCaching = null;
        this.dataStoreSession = null;
        this.dataStoreLocal = null;
    });

    it('sets an item in memory cache only', () => {
        var key = 'key1';
        var value = 'adsfsd fsdfsd';
        this.dataStoreNoCaching.setValue(key, value);
        assert.equal(this.dataStoreNoCaching.getValue(key), value);

        assert.notOk(window.localStorage.getItem(this.dataStoreNoCachingKey + key));
        assert.notOk(window.sessionStorage.getItem(this.dataStoreNoCachingKey + key));
    });

    it('removes the added item', () => {
        var key = 'key1';
        this.dataStoreNoCaching.remove(key);
        assert.notOk(this.dataStoreNoCaching.getValue(key));
    });

    it('sets an item in memory cache and local storage', () => {
        var key = 'key2';
        var value = 234;
        this.dataStoreLocal.setValue(key, value);
        assert.equal(this.dataStoreLocal.getValue(key), value, 'test 1');

        assert.equal(window.localStorage.getItem(this.dataStoreLocalKey + key), String(value), 'test 2');
        assert.notOk(window.sessionStorage.getItem(this.dataStoreSessionKey + key));
    });

    it('removes the added item from local storage as well', () => {
        var key = 'key2';
        this.dataStoreLocal.remove(key);
        assert.notOk(this.dataStoreLocal.getValue(key), 'test 1');
        assert.notOk(window.localStorage.getItem(this.dataStoreLocalKey + key), 'test 2');
    });

    it('sets an item in memory cache and session storage', () => {
        var key = 'key3';
        var value = 234;
        this.dataStoreSession.setValue(key, value);
        assert.equal(this.dataStoreSession.getValue(key), value, 'test 1');

        assert.equal(window.sessionStorage.getItem(this.dataStoreSessionKey + key), String(value), 'test 2');
        assert.notOk(window.localStorage.getItem(this.dataStoreLocalKey + key));
    });

    it('removes the added item from session storage as well', () => {
        var key = 'key3';
        this.dataStoreSession.remove(key);
        assert.notOk(this.dataStoreSession.getValue(key), 'test 1');
        assert.notOk(window.sessionStorage.getItem(this.dataStoreSessionKey + key), 'test 2');
    });

    //it('falls back to local storage if enabled', () => {
    //    var key = 'key3';
    //    var value = 'sdsdf';
    //    this.dataStore.setValue(key, value, /*useLocalStorage*/ true);
    //    delete this.dataStore._store[key];

    //    assert.notEqual(this.dataStore.getValue(key), value, 'test 1; no local storage');
    //    assert.equal(this.dataStore.getValue(key, /*useLocalStorage*/ true), value, 'test 2; with local storage');

    //    assert.equal(this.dataStore._store[key], value, 'test 3; adds the value back to memory cache');
    //});
});
