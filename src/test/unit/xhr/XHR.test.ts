/// <reference path="../../../chai/chai.d.ts" />
/// <reference path="../../../mocha/mocha.d.ts" />

import chai = require('chai');
var assert = chai.assert;

import XHR from 'odsp-utilities/xhr/XHR';
import MockXMLHttpRequest from './MockXMLHttpRequest';
import MockXHREventType from './MockXHREventType';
import EventTestWatcher from '../logging/EventTestWatcher';

describe('XHR', () => {
    beforeEach(() => {
        EventTestWatcher.beforeEach();
        MockXMLHttpRequest.beforeEach();
    });

    afterEach(() => {
        EventTestWatcher.afterEach();
        MockXMLHttpRequest.afterEach();
    });

    it('catches handler exceptions', () => {

        var lastRequest;
        MockXMLHttpRequest.addCallback((mockXMLHttpRequest: MockXMLHttpRequest, eventType: MockXHREventType) => {
            if (eventType === MockXHREventType.Send) {
                lastRequest = mockXMLHttpRequest;
                mockXMLHttpRequest.endRequest();
            }
        });

        var xhr = new XHR({
            url: '/xhrtest',
            headers: {},
            requestTimeoutInMS: 100,
            json: null
        });

        xhr.start((xhr: XMLHttpRequest, status: number) => {
            throw Error('failure');
        },
            (xhr: XMLHttpRequest, status: number, timeout: boolean) => {
                throw Error('failure');
            });

        assert.equal(EventTestWatcher.getEventCounts(), 1, "Expect one exception to be logged");
        assert.isFalse(MockXMLHttpRequest.hasErrors(), "No errors should be thrown in the mock xml http request");
        MockXMLHttpRequest.throwErrors();
    });

    it('returns proper status', () => {
        var lastRequest;
        MockXMLHttpRequest.addCallback((mockXMLHttpRequest: MockXMLHttpRequest, eventType: MockXHREventType) => {
            if (eventType === MockXHREventType.Send) {
                lastRequest = mockXMLHttpRequest;
                mockXMLHttpRequest.status = 200;
                mockXMLHttpRequest.endRequest();
            }
        });

        var xhr = new XHR({
            url: '/xhrtest',
            headers: {},
            requestTimeoutInMS: 100,
            json: null
        });

        xhr.start((xhr: XMLHttpRequest, status: number) => {
            assert.equal(status, 200, "Status shoudl be 200");
        },
            (xhr: XMLHttpRequest, status: number, timeout: boolean) => {
                assert.fail("Request should not fail");
            });

        assert.equal(EventTestWatcher.getEventCounts(), 0, "Expect no exceptions to be logged");
        assert.isFalse(MockXMLHttpRequest.hasErrors(), "No errors should be thrown in the mock xml http request");
        MockXMLHttpRequest.throwErrors();
    });
});