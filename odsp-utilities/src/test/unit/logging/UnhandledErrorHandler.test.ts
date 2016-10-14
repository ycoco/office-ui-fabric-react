import '../../../odsp-utilities/logging/RequireJSErrorHandler';

import chai = require('chai');
let assert = chai.assert;

/* tslint:disable:ban-native-functions */
import { Manager } from '../../../odsp-utilities/logging/Manager';
import IClonedEvent from '../../../odsp-utilities/logging/IClonedEvent';
import * as UnhandledErrorHandler from '../../../odsp-utilities/logging/UnhandledErrorHandler';

let handlerEventCounts = 0;
let handlerCallbacks: Array<(e: IClonedEvent) => void> = [];
let handlerError: Error = null;

let logHandler = (e: IClonedEvent) => {
    handlerEventCounts++;

    for (let x = 0; x < handlerCallbacks.length; x++) {
        try {
            handlerCallbacks[x](e);
        } catch (e) {
            // Only keep the first error
            if (!handlerError) {
                handlerError = e;
            }
        }
    }
};

let throwIfHandlerErrors = () => {
    if (handlerError) {
        throw handlerError;
    }
};

describe('UnhandledErrorHandler', () => {
    before(() => {
        Manager.addLogHandler(logHandler);
    });

    after(() => {
        Manager.removeLogHandler(logHandler);
    });

    beforeEach(() => {
        handlerEventCounts = 0;
        handlerCallbacks = [];
        handlerError = null;
    });

    it('verify max errors', () => {

        for (let x = 0; x < UnhandledErrorHandler.MAXERRORS + 10; x++) {
            UnhandledErrorHandler.handleOnError('test', 'http://test/', 0, 0, null);
        }

        assert.equal(handlerEventCounts, UnhandledErrorHandler.MAXERRORS + 1, `Expected ${UnhandledErrorHandler.MAXERRORS + 1} handler event callbacks`);
        throwIfHandlerErrors();
    });
});