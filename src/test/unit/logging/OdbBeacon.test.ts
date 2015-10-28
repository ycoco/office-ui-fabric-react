/// <reference path="../../../chai/chai.d.ts" />
/// <reference path="../../../mocha/mocha.d.ts" />
/// <reference path='../../../requirejs/require.d.ts' />

import chai = require("chai");
import { Qos as QosEvent, ResultTypeEnum } from '../../../local/logging/events/Qos.event';
import { Verbose as VerboseEvent } from '../../../local/logging/events/Verbose.event';
import DataStore = require("../../../local/models/store/BaseDataStore");
import DataStoreCachingType = require("../../../local/models/store/DataStoreCachingType");
import RequireHelper = require("../../../local/async/RequireHelper");

var expect = chai.expect;
var STORE_KEY = "SPCacheLogger";
var STORE_SIZE_KEY = "Size";
var EVENT_PREFIX = "ODBTest";
var store = new DataStore(STORE_KEY, DataStoreCachingType.session);
var lastKey = 0;

describe('OdbBeacon', function() {
    before((done: MochaDone) => {
        window["DEBUG"] = false;
        RequireHelper.promise<any>(require, "../../../local/logging/odb/BeaconCache").done((beaconCache: any) => {
            beaconCache.addToLoggingManager(EVENT_PREFIX);
            done();
        }, (error: any) => done(error));
    });

    beforeEach(() => {
        lastKey = store.getValue<number>(STORE_SIZE_KEY);
        if (!lastKey) {
            lastKey = 0;
        }
    });

    it("adds event name prefix for UserEngagement stream", () => {
        var event = new QosEvent({
            name: "TestQos"
        });
        event.end({
            resultType: ResultTypeEnum.Success
        });
        var length = store.getValue<number>(STORE_SIZE_KEY);
        expect(length - lastKey).to.equal(2);
        for (var i = lastKey; i < length; i++) {
            var item = store.getValue<any>(i.toString());
            expect(item.props.EngagementName.substr(0, EVENT_PREFIX.length)).to.equal(EVENT_PREFIX);
        }
    });

    it("adds event name prefix for ReliabilityLog stream", () => {
        VerboseEvent.logData({ message: "Test log" });
        var length = store.getValue<number>(STORE_SIZE_KEY);
        expect(length - lastKey).to.equal(1);
        for (var i = lastKey; i < length; i++) {
            var item = store.getValue<any>(i.toString());
            expect(item.props.Tag.substr(0, EVENT_PREFIX.length)).to.equal(EVENT_PREFIX);
        }
    });
});