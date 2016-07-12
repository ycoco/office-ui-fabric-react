import chai = require('chai');
var assert = chai.assert;
chai.config['truncateThreshold'] = 0;

/* tslint:disable:ban-native-functions */
import { CaughtError } from '../../../odsp-utilities/logging/events/CaughtError.event';
import EventTestWatcher from './EventTestWatcher';
import IClonedEvent from '../../../odsp-utilities/logging/IClonedEvent';
import ErrorHelper from '../../../odsp-utilities/logging/ErrorHelper';
import Promise from '../../../odsp-utilities/async/Promise';

describe('Error Helper', () => {
    beforeEach(() => {
        EventTestWatcher.beforeEach();
    });

    afterEach(() => {
        EventTestWatcher.afterEach();
    });

    it('doesnt log promise cancels', () => {
        EventTestWatcher.addLogCallback((e: IClonedEvent) => {
            assert.equal(e.eventName, CaughtError.fullName, "Event name is not UnitTestOnly");
            assert.isObject(e.data, "Data should be an object always");
        });

        let promise = new Promise((c: (result: string) => void, e: (error: any) => void) => {
            //do nothing
        });

        promise.then(() => {
            //do nothing
        },
            (error: any) => {
                ErrorHelper.log(error);
            });

        promise.cancel();

        assert.equal(EventTestWatcher.getEventCounts(), 0, "Expected 0 handler event callbacks");
        EventTestWatcher.throwIfHandlerErrors();
    });

    it('does log promise errors that are not canceled', () => {
        EventTestWatcher.addLogCallback((e: IClonedEvent) => {
            assert.equal(e.eventName, CaughtError.fullName, "Event name is not UnitTestOnly");
            assert.isObject(e.data, "Data should be an object always");
        });

        let promise = new Promise((c: (result: string) => void, e: (error: any) => void) => {
            //do nothing
            e(new Error("Cancled"));
        });

        promise.then(() => {
            //do nothing
        },
            (error: any) => {
                ErrorHelper.log(error);
            });

        assert.equal(EventTestWatcher.getEventCounts(), 1, "Expected 1 handler event callbacks");
        EventTestWatcher.throwIfHandlerErrors();
    });
});