import chai = require('chai');
var assert = chai.assert;
chai.config['truncateThreshold'] = 0;

/* tslint:disable:ban-native-functions */
import QOEHelper, {Stages} from '../../../odsp-utilities/logging/QOEHelper';
import IClonedEvent from '../../../odsp-utilities/logging/IClonedEvent';
import EventTestWatcher from './EventTestWatcher';
import QoeEvent, { IQoeSingleSchema } from '../../../odsp-utilities/logging/events/Qoe.event';
import ValidationError from '../../../odsp-utilities/logging/events/ValidationError.event';
import CaughtError from "../../../odsp-utilities/logging/events/CaughtError.event";
import RequireJSError from "../../../odsp-utilities/logging/events/RequireJSError.event";
import UnhandledError from "../../../odsp-utilities/logging/events/UnhandledError.event";
import PLTEvent from "../../../odsp-utilities/logging/events/PLT.event";
import { Qos, ResultTypeEnum } from "../../../odsp-utilities/logging/events/Qos.event";

interface IMatchData {
    count: number;
    qoeCount: number;
    errorDuringStage: boolean;
    errorBeforeStage: boolean;
    stage: string;
}

describe('QOEHelper', () => {
    beforeEach(() => {
        EventTestWatcher.beforeEach();
        QOEHelper.reset();
    });

    afterEach(() => {
        EventTestWatcher.afterEach();
    });

    it('logs events correctly', () => {
        let count = 0;
        EventTestWatcher.addLogCallback((e: IClonedEvent) => {
            if (!ValidationError.isTypeOf(e)) {
                count++;
                assert.equal(e.eventName, QoeEvent.prototype.eventName, "Event is QOE event");
            }
        });

        QOEHelper.markStage(Stages.AppLoad);
        QOEHelper.markStage(Stages.PLT);
        EventTestWatcher.throwIfHandlerErrors();
        assert.equal(count, 2, "Incorrect number of events fired");
    });

    it('listens to events correctly', () => {
        let count = 0;
        EventTestWatcher.addLogCallback((e: IClonedEvent) => {
            if (!ValidationError.isTypeOf(e)) {
                count++;

                if (PLTEvent.isTypeOf(e)) {
                    assert.equal(e.eventName, PLTEvent.prototype.eventName, "Event is PLT event");
                } else {
                    assert.equal(e.eventName, QoeEvent.prototype.eventName, "Event is QOE event");
                }
            }
        });

        QOEHelper.markStage(Stages.AppLoad);

        // Log a plt event manually
        PLTEvent.logData({
            name: 'test',
            w3cResponseEnd: 0,
            prefetchStart: 0,
            deferredListDataRender: 0,
            appStart: 0,
            preRender: 0,
            dataFetch: 0,
            dataFetchServerTime: 0,
            postRender: 0,
            render: 0,
            plt: 0,
            pltWithUnload: 0,
            httpRequests: 0,
            appCacheHit: false
        });

        EventTestWatcher.throwIfHandlerErrors();
        assert.equal(count, 3, "Incorrect number of events fired");
    });

    let errorEvents: Array<{
        callback: () => void,
        data: IMatchData,
        fireErrorEarlyData: IMatchData,
        name: string
    }> = [
            {
                name: 'CaughtError',
                data: {
                    count: 5,
                    qoeCount: 3,
                    stage: Stages[Stages.SessionError],
                    errorBeforeStage: false,
                    errorDuringStage: true
                },
                fireErrorEarlyData: {
                    count: 6,
                    qoeCount: 3,
                    stage: Stages[Stages.SessionError],
                    errorBeforeStage: true,
                    errorDuringStage: false
                },
                callback: () => {
                    CaughtError.logData({
                        message: "test",
                        stack: "test"
                    });
                }
            },
            {
                name: 'RequireJSError',
                data: {
                    count: 5,
                    qoeCount: 3,
                    stage: Stages[Stages.SessionError],
                    errorBeforeStage: false,
                    errorDuringStage: true
                },
                fireErrorEarlyData: {
                    count: 6,
                    qoeCount: 3,
                    stage: Stages[Stages.SessionError],
                    errorBeforeStage: true,
                    errorDuringStage: false
                },
                callback: () => {
                    RequireJSError.logData({
                        requireModules: ["test"],
                        requireType: "test",
                        message: "test",
                        stack: "test"
                    });
                }
            },
            {
                name: 'UnhandledError',
                data: {
                    count: 5,
                    qoeCount: 3,
                    stage: Stages[Stages.SessionError],
                    errorBeforeStage: false,
                    errorDuringStage: true
                },
                fireErrorEarlyData: {
                    count: 6,
                    qoeCount: 3,
                    stage: Stages[Stages.SessionError],
                    errorBeforeStage: true,
                    errorDuringStage: false
                },
                callback: () => {
                    UnhandledError.logData({
                        message: "test",
                        stack: "test",
                        builtStack: "test",
                        line: 0,
                        col: 0,
                        url: "test"
                    });
                }
            },
            {
                name: 'QosFailure',
                data: {
                    count: 6,
                    qoeCount: 3,
                    stage: Stages[Stages.SessionError],
                    errorBeforeStage: false,
                    errorDuringStage: true
                },
                fireErrorEarlyData: {
                    count: 7,
                    qoeCount: 3,
                    stage: Stages[Stages.SessionError],
                    errorBeforeStage: true,
                    errorDuringStage: false
                },
                callback: () => {
                    let qos = new Qos({ name: 'test' });
                    qos.end({ resultType: ResultTypeEnum.Failure });
                }
            },
            {
                name: 'QosSuccess',
                data: {
                    count: 5,
                    qoeCount: 2,
                    stage: Stages[Stages.PLT],
                    errorBeforeStage: false,
                    errorDuringStage: false
                },
                fireErrorEarlyData: {
                    count: 7,
                    qoeCount: 3,
                    stage: Stages[Stages.SessionError],
                    errorBeforeStage: true,
                    errorDuringStage: false
                },
                callback: () => {
                    let qos = new Qos({ name: 'test' });
                    qos.end({ resultType: ResultTypeEnum.Success });
                }
            },
            {
                name: 'QosExpectedFailure',
                data: {
                    count: 5,
                    qoeCount: 2,
                    stage: Stages[Stages.PLT],
                    errorBeforeStage: false,
                    errorDuringStage: false
                },
                fireErrorEarlyData: {
                    count: 7,
                    qoeCount: 3,
                    stage: Stages[Stages.SessionError],
                    errorBeforeStage: true,
                    errorDuringStage: false
                },
                callback: () => {
                    let qos = new Qos({ name: 'test' });
                    qos.end({ resultType: ResultTypeEnum.ExpectedFailure });
                }
            }
        ];

    let fireErrorEarlyArray: boolean[] = [true, false];

    for (let errorEvent of errorEvents) {
        for (let fireErrorEarly of fireErrorEarlyArray) {
            it(`fires session error after last event - ${errorEvent.name} - early error:${fireErrorEarly}`, () => {
                let count = 0;
                let qoeCount = 0;
                let lastQoeData: IQoeSingleSchema;
                EventTestWatcher.addLogCallback((e: IClonedEvent) => {
                    if (!ValidationError.isTypeOf(e)) {
                        count++;

                        // Log event name for easy debugging
                        console.log(`Saw event - ${e.eventName}`);

                        if (PLTEvent.isTypeOf(e)) {
                            assert.equal(e.eventName, PLTEvent.prototype.eventName, "Event is PLT event");
                        } else if (CaughtError.isTypeOf(e)) {
                            assert.equal(e.eventName, CaughtError.prototype.eventName, "Event is CaughtError event");
                        } else if (RequireJSError.isTypeOf(e)) {
                            assert.equal(e.eventName, RequireJSError.prototype.eventName, "Event is RequireJSError event");
                        } else if (UnhandledError.isTypeOf(e)) {
                            assert.equal(e.eventName, UnhandledError.prototype.eventName, "Event is UnhandledError event");
                        } else if (Qos.isTypeOf(e)) {
                            assert.equal(e.eventName, Qos.prototype.eventName, "Event is Qos event");
                        } else {
                            qoeCount++;
                            assert.equal(e.eventName, QoeEvent.prototype.eventName, "Event is QOE event");
                            lastQoeData = e.data;

                            // Log event name for easy debugging
                            console.log(`Saw qoe event - ${lastQoeData.stage}`);
                        }
                    }
                });

                if (fireErrorEarly) {
                    CaughtError.logData({
                        message: "test",
                        stack: "test"
                    });
                }

                QOEHelper.markStage(Stages.AppLoad);

                // Log a plt event manually
                PLTEvent.logData({
                    name: 'test',
                    w3cResponseEnd: 0,
                    prefetchStart: 0,
                    deferredListDataRender: 0,
                    appStart: 0,
                    preRender: 0,
                    dataFetch: 0,
                    dataFetchServerTime: 0,
                    postRender: 0,
                    render: 0,
                    plt: 0,
                    pltWithUnload: 0,
                    httpRequests: 0,
                    appCacheHit: false
                });

                errorEvent.callback();

                EventTestWatcher.throwIfHandlerErrors();
                let matchData: IMatchData = fireErrorEarly ? errorEvent.fireErrorEarlyData : errorEvent.data;
                assert.equal(qoeCount, matchData.qoeCount, "Incorrect number of qoe events fired");
                assert.equal(count, matchData.count, "Incorrect number of events fired");
                assert.equal(lastQoeData.stage, matchData.stage, "Wrong stage logged");
                assert.equal(lastQoeData.errorBeforeStage, matchData.errorBeforeStage, "Error before stage");
                assert.equal(lastQoeData.errorDuringStage, matchData.errorDuringStage, "Error during stage");
            });
        }
    }
});