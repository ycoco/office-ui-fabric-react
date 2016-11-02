import chai = require("chai");
import { Qos as QosEvent, ResultTypeEnum } from '../../../odsp-utilities/logging/events/Qos.event';
import { Verbose as VerboseEvent } from '../../../odsp-utilities/logging/events/Verbose.event';
import DataStore from "../../../odsp-utilities/models/store/BaseDataStore";
import DataStoreCachingType from "../../../odsp-utilities/models/store/DataStoreCachingType";
import { loadModule } from '../../../odsp-utilities/modules/Modules';
import IBeaconHandlers from "../../../odsp-utilities/logging/odb/IBeaconHandlers";
import IClonedEvent from "../../../odsp-utilities/logging/IClonedEvent";
import BeaconCache from '../../../odsp-utilities/logging/odb/BeaconCache';

var expect = chai.expect;
var STORE_KEY = "SPCacheLogger";
var STORE_SIZE_KEY = "Size";
var EVENT_PREFIX = "ODBTest";
var store = new DataStore(STORE_KEY, DataStoreCachingType.session);
var lastKey = 0;

describe('OdbBeacon', function() {
    before((done: MochaDone) => {
        window["DEBUG"] = false;
        var handlers = <IBeaconHandlers>{
            ignoredEventsHandler: (event: IClonedEvent) => { return false; },
            qosEventNameHandler: (event: IClonedEvent, currentName: string) => { return currentName; },
            qosEventExtraDataHandler: (event: IClonedEvent, qosData: any) => { return; }
        };
        loadModule<typeof BeaconCache>({
            require: require,
            path: 'odsp-utilities/logging/odb/BeaconCache'
        }).done((beaconCache: typeof BeaconCache) => {
            try {
                beaconCache.addToLoggingManager(EVENT_PREFIX, handlers);
            } catch (e) {
                done(e);
            }
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