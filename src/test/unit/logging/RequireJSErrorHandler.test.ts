/// <reference path="../../../chai/chai.d.ts" />
/// <reference path="../../../mocha/mocha.d.ts" />
/// <amd-dependency path="odsp-utilities/logging/RequireJSErrorHandler" />

import chai = require('chai');
var assert = chai.assert;

/* tslint:disable:ban-native-functions */
import { Manager } from 'odsp-utilities/logging/Manager';
import IClonedEvent = require('odsp-utilities/logging/IClonedEvent');

var handlerEventCounts = 0;
var handlerCallbacks: Array<(e: IClonedEvent) => void> = [];
var handlerError: Error = null;

var logHandler = (e: IClonedEvent) => {
    handlerEventCounts++;

    for (var x = 0; x < handlerCallbacks.length; x++) {
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

var throwIfHandlerErrors = () => {
    if (handlerError) {
        throw handlerError;
    }
};

describe('RequireJSErrorHandler', () => {
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

    it('logs once for non script errors', () => {
        window["requirejs"].onError({ requireType: 'timeout', isTest: true });

        assert.equal(handlerEventCounts, 1, "Expected 1 handler event callbacks");
        throwIfHandlerErrors();
    });

    it('logs twice for script errors', () => {
        window["requirejs"].onError({ requireType: 'define', stack: 'test', requireModules: ['test'], isTest: true });

        assert.equal(handlerEventCounts, 2, "Expected 2 handler event callbacks");
        throwIfHandlerErrors();
    });
});