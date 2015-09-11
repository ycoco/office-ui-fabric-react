/// <reference path="../../../mocha/mocha.d.ts" />
/// <reference path="../../../chai/chai.d.ts" />

import chai = require('chai');
var assert = chai.assert;
chai.config['truncateThreshold'] = 0;

/* tslint:disable:ban-native-functions */
import { UnitTestOnly as  UnitTestOnlyEvent, IUnitTestOnlyStartSchema, IUnitTestOnlyEndSchema, UnitTestOnlyEnum } from './events/UnitTestOnly.event';
import { UnitTestOnlySingle as UnitTestOnlySingleEvent, IUnitTestOnlySingleSingleSchema } from './events/UnitTestOnlySingle.event';
import { UnitTestOnlyExtended as UnitTestOnlyExtendedEvent, IUnitTestOnlyExtendedStartSchema } from './events/UnitTestOnlyExtended.event';
import IClonedEvent = require('../../../local/logging/IClonedEvent');
import CorrelationVector from '../../../local/logging/CorrelationVector';
import { ClonedEventType as ClonedEventTypeEnum } from '../../../local/logging/EventBase';
import EventTestWatcher = require('./EventTestWatcher');
import Promise from '../../../local/async/Promise';

describe('EventBase', () => {
    beforeEach(() => {
        EventTestWatcher.beforeEach();
    });

    afterEach(() => {
        EventTestWatcher.afterEach();
    });

    it('ends', () => {

        EventTestWatcher.addLogCallback((e: IClonedEvent) => {
            assert.equal(e.eventName, UnitTestOnlyEvent.fullName, "Event name is not UnitTestOnly");
            assert.isObject(e.data, "Data should be an object always");
        });

        var myEvent = new UnitTestOnlyEvent({ name: 'test' });

        myEvent.end({ resultType: UnitTestOnlyEnum.Default });

        assert.isNumber(myEvent.id, "id should be a number");
        assert.equal(EventTestWatcher.getEventCounts(), 2, "Expected 2 handler event callbacks");
        EventTestWatcher.throwIfHandlerErrors();
    });

    it('can add data at start', () => {

        var dataToLog: IUnitTestOnlyStartSchema = {
            name: 'test',
            resultCode: 'Error',
            extraData: { specailData: 'special' }
        };

        EventTestWatcher.addLogCallback((e: IClonedEvent) => {
            assert.isNumber(e.id, "id should be a number");
            assert.equal(e.eventName, UnitTestOnlyEvent.fullName, "Event name is not UnitTestOnly");

            if (e.eventType === ClonedEventTypeEnum.Start) {
                assert.deepEqual(e.data, dataToLog, "Start data and data to log should be the same");
            } else if (e.eventType === ClonedEventTypeEnum.End) {
                assert.deepEqual(e.data, {
                    name: 'test',
                    resultCode: 'Error',
                    extraData: { specailData: 'special' },
                    resultType: UnitTestOnlyEnum.NotDefault
                }, "End data and data to log should be the same");
            }
        });

        // Log data (with duration)
        var myEvent = new UnitTestOnlyEvent(dataToLog);

        // do something
        myEvent.end({ resultType: UnitTestOnlyEnum.NotDefault });

        assert.isNumber(myEvent.id, "id should be a number");
        assert.equal(EventTestWatcher.getEventCounts(), 2, "Expected 2 handler event callbacks");
        EventTestWatcher.throwIfHandlerErrors();
    });

    it('can do single log event', () => {
        var dataToLog: IUnitTestOnlySingleSingleSchema = {
            name: 'test',
            extraData: { specialData: 'special' }
        };

        EventTestWatcher.addLogCallback((e: IClonedEvent) => {
            assert.isNumber(e.id, "id should be a number");
            assert.equal(e.eventName, UnitTestOnlySingleEvent.fullName, "Event name is not UnitTestOnlySingle");
            assert.deepEqual(e.data, dataToLog, "Data and data to log should be the same");
        });

        // Log data (without duration)
        UnitTestOnlySingleEvent.logData(dataToLog);

        assert.equal(EventTestWatcher.getEventCounts(), 1, "Expected 1 handler event callbacks");
        EventTestWatcher.throwIfHandlerErrors();
    });

    it('can do single log event', () => {
        assert.throws(() => {
            var event = new UnitTestOnlySingleEvent();
            assert.equal(event.enabled, true);
        });
    });

    it('can add data at end', () => {
        var dataToLog: IUnitTestOnlyEndSchema = {
            resultCode: 'Error',
            resultType: UnitTestOnlyEnum.NotDefault,
            extraData: { specailData: 'special' }
        };

        EventTestWatcher.addLogCallback((e: IClonedEvent) => {
            assert.equal(e.eventName, UnitTestOnlyEvent.fullName, "Event name is not UnitTestOnly");

            if (EventTestWatcher.getEventCounts() === 1) {
                assert.isObject(e.data, "Data should be an object on start event");
            } else {
                assert.deepEqual(e.data, {
                    name: 'test',
                    resultCode: 'Error',
                    resultType: UnitTestOnlyEnum.NotDefault,
                    extraData: { specailData: 'special' }
                }, "End data is not set correctly");
            }
        });

        // Log data in end event
        var myEvent = new UnitTestOnlyEvent({ name: 'test' }); // Starts the event

        myEvent.end(dataToLog);

        assert.equal(EventTestWatcher.getEventCounts(), 2, "Expected 2 handler event callbacks");
        EventTestWatcher.throwIfHandlerErrors();
    });

    it('only calls end once', () => {

        var dataToLog: IUnitTestOnlyEndSchema = {
            resultCode: 'Error',
            resultType: UnitTestOnlyEnum.NotDefault,
            extraData: { specailData: 'special' }
        };

        EventTestWatcher.addLogCallback((e: IClonedEvent) => {
            assert.equal(e.eventName, UnitTestOnlyEvent.fullName, "Event name is not UnitTestOnly");

            if (EventTestWatcher.getEventCounts() === 1) {
                assert.isObject(e.data, "Data should be an object on start event");
            } else {
                assert.deepEqual(e.data, {
                    name: 'test',
                    resultCode: 'Error',
                    resultType: UnitTestOnlyEnum.NotDefault,
                    extraData: { specailData: 'special' }
                }, "Data and data to log should be the same");
            }
        });

        // Log data in end event
        var myEvent = new UnitTestOnlyEvent({ name: 'test' }); // Starts the event

        myEvent.end(dataToLog);

        myEvent.end({
            name: 'test2',
            resultCode: 'Error',
            resultType: UnitTestOnlyEnum.NotDefault,
            extraData: { specailData: 'special' },
            test: 'test' // wont make it to cosmos but wont error in logging call
        });

        assert.isNumber(myEvent.id, "id should be a number");
        assert.equal(EventTestWatcher.getEventCounts(), 2, "Expected 2 handler event callbacks");
        EventTestWatcher.throwIfHandlerErrors();
    });

    it('can end async', (done: () => void) => {
        // Async Log
        var myEvent = new UnitTestOnlyEvent({ name: 'test' }); // Starts the event

        setTimeout(function() {
            myEvent.end({
                resultCode: 'Error',
                resultType: UnitTestOnlyEnum.NotDefault,
                extraData: { specailData: 'special' },
                test: 'test' // wont make it to cosmos but wont error in logging call
            });

            assert.isNumber(myEvent.id, "id should be a number");
            assert.equal(EventTestWatcher.getEventCounts(), 2, "Expected 2 handler event callbacks");
            EventTestWatcher.throwIfHandlerErrors();
            done();
        }, 100);
    });

    it('can have a parent event', (done: () => void) => {
        // Log with a parent event
        var myParentEvent = new UnitTestOnlyEvent({ name: 'testParent' }); // Starts the event

        EventTestWatcher.addLogCallback((e: IClonedEvent) => {
            assert.equal(e.eventName, UnitTestOnlyEvent.fullName, "Event name is not UnitTestOnly");

            if (EventTestWatcher.getEventCounts() === 2) {
                assert.isNumber(e.id, "id should be a number");
                assert.isNumber(e.parentId, "Parent id should be a number");
                assert.equal(e.parentId, myParentEvent.id, "Parent id should equal the parent events id");
            }
        });

        var myEvent = new UnitTestOnlyEvent({ name: 'test' }, myParentEvent); // Starts the event

        setTimeout(function() {
            myEvent.end({
                resultCode: 'Error',
                resultType: UnitTestOnlyEnum.NotDefault,
                extraData: { specailData: 'special' },
                test: 'test' // wont make it to cosmos but wont error in logging call
            });

            assert.equal(EventTestWatcher.getEventCounts(), 4, "Expected 4 handler event callbacks");
            EventTestWatcher.throwIfHandlerErrors();
            done();
        }, 100);

        myParentEvent.end({
            name: 'parentTest',
            resultCode: 'Error',
            resultType: UnitTestOnlyEnum.NotDefault,
            extraData: { specailData: 'special' },
            test: 'test' // wont make it to cosmos but wont error in logging call
        });
    });

    it('only copies passed in data', () => {
        var dataToLog: IUnitTestOnlyEndSchema = {
            resultCode: 'Error',
            resultType: UnitTestOnlyEnum.NotDefault
        };

        EventTestWatcher.addLogCallback((e: IClonedEvent) => {
            assert.equal(e.eventName, UnitTestOnlyEvent.fullName, "Event name is not UnitTestOnly");

            if (EventTestWatcher.getEventCounts() === 1) {
                assert.deepEqual(e.data, {
                    name: 'test'
                }, "Only name should be logged in start event");
            } else {
                assert.deepEqual(e.data, {
                    name: 'test',
                    resultCode: 'Error',
                    resultType: UnitTestOnlyEnum.NotDefault
                }, "Only name, resultCode and resultType should be logged in end event");
            }
        });

        // Log data in end event
        var myEvent = new UnitTestOnlyEvent({ name: 'test' }); // Starts the event

        myEvent.end(dataToLog);

        assert.equal(EventTestWatcher.getEventCounts(), 2, "Expected 2 handler event callbacks");
        EventTestWatcher.throwIfHandlerErrors();
    });

    it('only copies falsy values correctly in start', () => {
        var dataToLog: IUnitTestOnlyStartSchema = {
            name: 'test',
            resultCode: 'Error',
            resultType: UnitTestOnlyEnum.Default,
            numberValue: 0,
            stringValue: ''
        };

        EventTestWatcher.addLogCallback((e: IClonedEvent) => {
            assert.equal(e.eventName, UnitTestOnlyEvent.fullName, "Event name is not UnitTestOnly");

            if (EventTestWatcher.getEventCounts() === 1) {
                assert.deepEqual(e.data, dataToLog, "Falsy values are not copied correctly in start event");
            } else {
                assert.equal(e.data.resultType, UnitTestOnlyEnum.NotDefault, "Result type in end not updated correctly");
            }
        });

        // Log data in end event
        var myEvent = new UnitTestOnlyEvent(dataToLog); // Starts the event

        myEvent.end({ resultType: UnitTestOnlyEnum.NotDefault });

        assert.equal(EventTestWatcher.getEventCounts(), 2, "Expected 2 handler event callbacks");
        EventTestWatcher.throwIfHandlerErrors();
    });

    it('only copies falsy values correctly in end', () => {
        var dataToLog: IUnitTestOnlyStartSchema = {
            name: 'test'
        };

        EventTestWatcher.addLogCallback((e: IClonedEvent) => {
            assert.equal(e.eventName, UnitTestOnlyEvent.fullName, "Event name is not UnitTestOnly");

            if (EventTestWatcher.getEventCounts() === 1) {
                assert.deepEqual(e.data, dataToLog, "Start data was not populated correctly");
            } else {
                assert.deepEqual(e.data, {
                    name: 'test',
                    resultCode: 'Error',
                    resultType: UnitTestOnlyEnum.Default,
                    numberValue: 0,
                    stringValue: ''
                }, "End was not updated correctly");
            }
        });

        // Log data in end event
        var myEvent = new UnitTestOnlyEvent(dataToLog); // Starts the event

        myEvent.end({
            resultCode: 'Error',
            resultType: UnitTestOnlyEnum.Default,
            numberValue: 0,
            stringValue: ''
        });

        assert.equal(EventTestWatcher.getEventCounts(), 2, "Expected 2 handler event callbacks");
        EventTestWatcher.throwIfHandlerErrors();
    });

    it('handles isTypeOf properly', () => {
        var dataToLog: IUnitTestOnlyExtendedStartSchema = {
            name: 'test',
            extendedName: 'test2'
        };

        EventTestWatcher.addLogCallback((e: IClonedEvent) => {
            assert.isTrue(UnitTestOnlyEvent.isTypeOf(e));
            assert.isTrue(UnitTestOnlyExtendedEvent.isTypeOf(e));
        });

        // Log data in end event
        var myEvent = new UnitTestOnlyExtendedEvent(dataToLog); // Starts the event

        myEvent.end({
            resultCode: 'Error',
            resultType: UnitTestOnlyEnum.Default,
            numberValue: 0,
            stringValue: ''
        });

        assert.equal(EventTestWatcher.getEventCounts(), 2, "Expected 2 handler event callbacks");
        EventTestWatcher.throwIfHandlerErrors();
    });

    it('instruments success Promise properly', () => {
        EventTestWatcher.addLogCallback((e: IClonedEvent) => {
            assert.isNumber(e.id, "id should be a number");
            assert.equal(e.eventName, UnitTestOnlyEvent.fullName, "Event name is not UnitTestOnly");
        });

        UnitTestOnlyEvent.instrumentPromise<string>(
            { name: 'TestEvent' },
            () => {
                return new Promise<string>(
                    (c: (result: string) => void, e: (error: any) => void) => {
                        c('TestResult');
                    });
            });

        assert.equal(EventTestWatcher.getEventCounts(), 2, "Expected 2 handler event callbacks for start and end");
        EventTestWatcher.throwIfHandlerErrors();
    });

    it('instruments failure Promise properly', () => {
        EventTestWatcher.addLogCallback((e: IClonedEvent) => {
            assert.isNumber(e.id, "id should be a number");
            assert.equal(e.eventName, UnitTestOnlyEvent.fullName, "Event name is not UnitTestOnly");
        });

        UnitTestOnlyEvent.instrumentPromise<string>(
            { name: 'TestEvent' },
            () => {
                return new Promise<string>(
                    (c: (result: string) => void, e: (error: any) => void) => {
                        e('TestError');
                    });
            });

        assert.equal(EventTestWatcher.getEventCounts(), 2, "Expected 2 handler event callbacks for start and end");
        EventTestWatcher.throwIfHandlerErrors();
    });

    it('instruments Promise properly with custom complete data', () => {
        var hadStart = false;
        var hadEnd = false;

        var resultString = 'TestResult';

        var startData: IUnitTestOnlyStartSchema = {
            name: 'test',
            resultType: UnitTestOnlyEnum.Default,
            stringValue: 'Start'
        };

        var endData: IUnitTestOnlyEndSchema = {
            name: 'test',
            resultType: UnitTestOnlyEnum.NotDefault,
            stringValue: 'End'
        };

        EventTestWatcher.addLogCallback((e: IClonedEvent) => {
            assert.isNumber(e.id, "id should be a number");
            assert.equal(e.eventName, UnitTestOnlyEvent.fullName, "Event name is not UnitTestOnly");
            if (e.eventType === ClonedEventTypeEnum.Start) {
                hadStart = true;
                assert.deepEqual(e.data, startData);
            } else if (e.eventType === ClonedEventTypeEnum.End) {
                hadEnd = true;
                assert.deepEqual(e.data, endData);
            }
        });

        UnitTestOnlyEvent.instrumentPromise<string>(
            startData,
            () => {
                return new Promise<string>(
                    (c: (result: string) => void, e: (error: any) => void) => {
                        c(resultString);
                    });
            },
            (result: string) => {
                assert.equal(result, resultString, "Result handler got proper result from Promise");
                return endData;
            },
            (error: string) => {
                return null;
            });

        assert.equal(EventTestWatcher.getEventCounts(), 2, "Expected 2 handler event callbacks for start and end");
        assert.isTrue(hadStart, "Start event logged");
        assert.isTrue(hadEnd, "End event logged");
        EventTestWatcher.throwIfHandlerErrors();
    });

    it('instruments Promise properly with custom error data', () => {
        var hadStart = false;
        var hadEnd = false;

        var errorString = 'TestError';

        var startData: IUnitTestOnlyStartSchema = {
            name: 'test',
            resultType: UnitTestOnlyEnum.Default,
            stringValue: 'Start'
        };

        var endData: IUnitTestOnlyEndSchema = {
            name: 'test',
            resultType: UnitTestOnlyEnum.NotDefault,
            stringValue: 'End'
        };

        EventTestWatcher.addLogCallback((e: IClonedEvent) => {
            assert.isNumber(e.id, "id should be a number");
            assert.equal(e.eventName, UnitTestOnlyEvent.fullName, "Event name is not UnitTestOnly");
            if (e.eventType === ClonedEventTypeEnum.Start) {
                hadStart = true;
                assert.deepEqual(e.data, startData);
            } else if (e.eventType === ClonedEventTypeEnum.End) {
                hadEnd = true;
                assert.deepEqual(e.data, endData);
            }
        });

        UnitTestOnlyEvent.instrumentPromise<string>(
            startData,
            () => {
                return new Promise<string>(
                    (c: (result: string) => void, e: (error: any) => void) => {
                        e(errorString);
                    });
            },
            (result: string) => {
                return null;
            },
            (error: string) => {
                assert.equal(error, errorString, "Error handler got proper result from Promise");
                return endData;
            });

        assert.equal(EventTestWatcher.getEventCounts(), 2, "Expected 2 handler event callbacks for start and end");
        assert.isTrue(hadStart, "Start event logged");
        assert.isTrue(hadEnd, "End event logged");
        EventTestWatcher.throwIfHandlerErrors();
    });

    it('ends with timeout', (done: () => void) => {
        EventTestWatcher.addLogCallback((e: IClonedEvent) => {
            assert.isNumber(e.id, "id should be a number");
            assert.equal(e.eventName, UnitTestOnlyEvent.fullName, "Event name is not UnitTestOnly");
        });

        var startData: IUnitTestOnlyStartSchema = {
            name: 'test',
            resultType: UnitTestOnlyEnum.Default,
            stringValue: 'Start'
        };

        var timeoutData: IUnitTestOnlyEndSchema = {
            name: 'test',
            resultType: UnitTestOnlyEnum.NotDefault,
            stringValue: 'Timeout'
        };

        var ev = new UnitTestOnlyEvent(startData);
        ev.setTimeout(100, timeoutData);

        setTimeout(function() {
            assert.equal(EventTestWatcher.getEventCounts(), 2, "Expected 2 handler event callbacks");
            EventTestWatcher.throwIfHandlerErrors();
            done();
        }, 200);
    });

    it('instruments timed out Promise properly', (done: () => void) => {
        EventTestWatcher.addLogCallback((e: IClonedEvent) => {
            assert.isNumber(e.id, "id should be a number");
            assert.equal(e.eventName, UnitTestOnlyEvent.fullName, "Event name is not UnitTestOnly");
        });

        var timeoutData: IUnitTestOnlyEndSchema = {
            name: 'test',
            resultType: UnitTestOnlyEnum.NotDefault,
            stringValue: 'Timeout'
        };

        UnitTestOnlyEvent.instrumentPromise<string>(
            { name: 'TestEvent' },
            () => {
                return new Promise<string>(
                    (c: (result: string) => void, e: (error: any) => void) => {
                        //do nothing
                    });
            },
            null,
            null,
            100,
            timeoutData
            );

        setTimeout(function() {
            assert.equal(EventTestWatcher.getEventCounts(), 2, "Expected 2 handler event callbacks");
            EventTestWatcher.throwIfHandlerErrors();
            done();
        }, 200);
    });

    it('generates correlation vectors properly', () => {
        let myEvent: UnitTestOnlyEvent;
        let myEvent2: UnitTestOnlyExtendedEvent;

        EventTestWatcher.addLogCallback((e: IClonedEvent) => {
            assert.isNotNull(e.vector);

            if (e.eventName === UnitTestOnlyEvent.fullName) {
                assert.equal(e.vector.root, CorrelationVector.RootVector.root);
                assert.equal(e.vector.parent, CorrelationVector.RootVector.current);
            } else {
                assert.equal(e.vector.root, CorrelationVector.RootVector.root);
                assert.equal(e.vector.root, myEvent.vector.root);
                assert.equal(e.vector.parent, myEvent.vector.current);

                assert.equal(e.eventName, UnitTestOnlyExtendedEvent.fullName, "Event name is not UnitTestOnly");
            }
        });

        myEvent = new UnitTestOnlyEvent({ name: 'test' });

        myEvent.end({ resultType: UnitTestOnlyEnum.Default });

        myEvent2 = new UnitTestOnlyExtendedEvent({ name: 'test2', extendedName: 'test2' }, myEvent);
        myEvent2.end({ resultType: UnitTestOnlyEnum.Default });


        assert.equal(EventTestWatcher.getEventCounts(), 4, "Expected 4 handler event callbacks");
        EventTestWatcher.throwIfHandlerErrors();
    });
});