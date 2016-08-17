import chai = require('chai');
import * as Sinon from 'sinon';

import { CachedDataSource } from './CachedDataSource';
import { MockSpPageContext } from './../../mocks/MockSpPageContext';
import Promise from '@ms/odsp-utilities/lib/async/Promise';

const expect = chai.expect;

class TestCacheDataSource extends CachedDataSource {
    private _calls = 0;

    public sendRequest({
        url = `/test${this._calls++}`,
        key,
        useStale = false,
        bypassCache = false
    }: { url?: string, key?: string, useStale?: boolean, bypassCache?: boolean }
    ): Promise<any> {
        return this.getDataUtilizingCache({
            getUrl: () => url,
            parseResponse: (resp: string) => resp,
            qosName: 'test',
            noRedirect: true,
            cacheRequestKey: key,
            useStale: useStale,
            bypassCache: bypassCache
        });
    }

    public sendRequestWhichFlushesCache(key: string): Promise<any> {
        let promise = this.sendRequest({});
        this.flushCache(key);
        return promise;
    }

    public needsRequestDigest(url: string) {
        return false;
    }
}

describe('CachedDataSource', () => {
    const CACHE_TIMEOUT = 4000;
    let cacheDS: TestCacheDataSource;
    let requests = [];
    let clock: Sinon.SinonFakeTimers;
    let server: Sinon.SinonFakeServer;
    let responseVal: any;
    let pageContext: MockSpPageContext;
    before(() => {
        clock = sinon.useFakeTimers();
        pageContext = new MockSpPageContext();
        server = sinon.fakeServer.create();
        server.autoRespond = true;
        server.respondImmediately = true;
        responseVal = 'OK';
        server.respondWith((req) => {
            requests.push(req);
            let toResponse = typeof responseVal === 'object' ? JSON.stringify(responseVal) : responseVal;
            req.respond(200, { 'Content-Type': 'application/text' }, toResponse);
        });
    });

    describe('basic tests', () => {
        before(() => {
            cacheDS = new TestCacheDataSource(pageContext, 'test', { cacheTimeoutTime: CACHE_TIMEOUT });
        });

        afterEach(() => {
            requests = [];
        });

        it('should use cache if 2 of the same requests', (done) => {
            cacheDS.sendRequest({ url: '/test' }).then(() => {
                return cacheDS.sendRequest({ url: '/test' });
            }, done).then((val: string) => {
                expect(val).to.equal(responseVal);
                expect(requests.length).to.equal(1, 'Only 1 request should be made.');
                done();
            }).done(undefined, done);
        });

        it('should use cache for 2 diff requests with same keys', (done) => {
            cacheDS.sendRequest({ key: 'a' }).then(() => {
                return cacheDS.sendRequest({ key: 'a' });
            }).then((val: string) => {
                expect(requests.length).to.equal(1, 'Only 1 request should be made.');
                expect(val).to.equals(responseVal, 'Value returned from cache');
                done();
            }).done(undefined, done);
        });

        it('should not use cache for 2 diff requests', (done) => {
            cacheDS.sendRequest({}).then(() => {
                return cacheDS.sendRequest({});
            }).then((val: string) => {
                expect(requests.length).to.equal(2, 'Both requests should be made and use cache.');
                done();
            }).done(undefined, done);
        });

        it('should use cache for when time has passed and cache is fresh', (done) => {

            cacheDS.sendRequest({ url: '/stale1' }).then(() => {
                clock.tick(CACHE_TIMEOUT - 1);
                return cacheDS.sendRequest({ url: '/stale1' });
            }).then((val: string) => {
                expect(requests.length).to.equal(1, `Only ${CACHE_TIMEOUT} ms has passed, should still use cache.`);
                return cacheDS.sendRequest({ url: '/stale1_2' });
            }).then((val: string) => {
                expect(requests.length).to.equal(2, 'call to diff api should generate 1 more request');
                done();
            }).done(undefined, done);
        });

        it('should not use cache for when cache becomes stale', (done) => {
            cacheDS.sendRequest({ url: '/stale2' }).then(() => {
                clock.tick(CACHE_TIMEOUT + 1);
                return cacheDS.sendRequest({ url: '/stale2' });
            }).then((val: string) => {
                expect(requests.length).to.equal(2, 'Cache has become stale, should make 2 requests.');
                done();
            }).done(undefined, done);
        });

        it('should use cache if explicitly asked to use stale cache after cache expires', (done) => {
            cacheDS.sendRequest({ url: '/stale3' }).then(() => {
                clock.tick(CACHE_TIMEOUT + 1);
                return cacheDS.sendRequest({ url: '/stale3', useStale: true });
            }).then((val: string) => {
                expect(requests.length).to.equal(1, '# Requests');
                done();
            }).done(undefined, done);
        });

        it('should bypass cache when bypassCache option is used', (done) => {
            cacheDS.sendRequest({ url: '/bypass' }).then(() => {
                return cacheDS.sendRequest({ url: '/bypass', bypassCache: true });
            }).then((val: string) => {
                expect(requests.length).to.equal(2, '# Requests');
                done();
            }).done(undefined, done);
        });

        it('should not use cache if a call flushes cache', (done) => {
            let responseValCopy = responseVal;
            cacheDS.sendRequest({ url: '/flushCacheTest', key: 'flushCacheTest' }).then(() => {
                expect(requests.length).to.equal(1);
                return cacheDS.sendRequestWhichFlushesCache('flushCacheTest');
            }).then((val: string) => {
                expect(requests.length).to.equal(2, '# Requests (flushing request)');
                responseVal = 'somethingElse';
                return cacheDS.sendRequest({ url: '/flushCacheTest', key: 'flushCacheTest' });
            }).then((val: string) => {
                expect(val).to.equal(responseVal);
                responseVal = responseValCopy;
                expect(requests.length).to.equal(3, '# Requests (request flushed)');
                done();
            }).done(undefined, (err) => {
                responseVal = responseValCopy;
                done(err);
            });
        });
    });

    describe('meta tests', () => {
        afterEach(() => {
            requests = [];
        });

        it('should operate on the same cache for two different DS instances with same cacheKey ', (done) => {
            let responseValCopy = responseVal;
            responseVal = { 'val': 'sameCacheVal' };
            let expectedOutput = JSON.stringify(responseVal);
            cacheDS = new TestCacheDataSource(pageContext, 'samecache');
            cacheDS.sendRequest({ url: '/test' }).then((val) => {
                expect(val).to.equal(expectedOutput);
                cacheDS = new TestCacheDataSource(pageContext, 'samecache');
                return cacheDS.sendRequest({ url: '/test' });
            }, done).then((val: any) => {
                expect(val).to.equal(expectedOutput);
                expect(requests.length).to.equal(1, 'Only 1 server call should be made.');
                responseVal = responseValCopy;
                done();
            }).done(undefined, (err) => {
                responseVal = responseValCopy;
                done(err);
            });
        });

        it('should flush cache for two different DS instances with two different users even with same cachekey ', (done) => {
            cacheDS = new TestCacheDataSource(pageContext, 'samecache2');
            cacheDS.sendRequest({ url: '/test' }).then((val) => {
                expect(val).to.equal(responseVal);
                let pageContext2 = new MockSpPageContext();
                pageContext2.userDisplayName = 'Diff test user';
                cacheDS = new TestCacheDataSource(pageContext2, 'samecache2');

                return cacheDS.sendRequest({ url: '/test' });
            }, done).then((val: string) => {
                expect(val).to.equal(responseVal);
                expect(requests.length).to.equal(2, 'Server calls made');
                done();
            }).done(undefined, done);
        });

        it('should flush cache for two different DS instances with two siteClientTag even with same cachekey ', (done) => {
            cacheDS = new TestCacheDataSource(pageContext, 'samecache3');
            cacheDS.sendRequest({ url: '/test' }).then((val) => {
                expect(val).to.equal(responseVal);
                let pageContext2 = new MockSpPageContext();
                pageContext2.siteClientTag = '0$$16.0.4800.0000';
                cacheDS = new TestCacheDataSource(pageContext2, 'samecache3');
                return cacheDS.sendRequest({ url: '/test' });
            }, done).then((val: string) => {
                expect(val).to.equal(responseVal);
                expect(requests.length).to.equal(2, 'Server calls made');
                return cacheDS.sendRequest({ url: '/test' });
            }).then((val: string) => {
                expect(requests.length).to.equal(2, 'Server calls made (should now use cache)');
                done();
            }).done(undefined, done);
        });
    });
});
