// OneDrive:IgnoreCodeCoverage

import ErrorHelper from './ErrorHelper';
import Async from '../async/Async';
import Promise from '../async/Promise';
import EventGroup from '../events/EventGroup';
import IPromiseErrorEvent from '../async/IPromiseErrorEvent';
import { safeSerialize } from '../object/ObjectUtil';
import { UnhandledPromise as UnhandledPromiseEvent } from '../logging/events/UnhandledPromise.event';

class PromiseErrorHandler {
    private _outstandingPromiseErrors: any = {};
    private _async = new Async();

    public log(e: IPromiseErrorEvent) {
        var id = e.id;

        // If the error has a parent promise then this is not the origination of the
        //  error so we check if it has a handler, and if so we mark that the error
        //  was handled by removing it from outstandingPromiseErrors
        if (e.parent) {
            if (e.handler) {
                delete this._outstandingPromiseErrors[id];
            }
            return;
        }

        // Indicate that this error was originated and needs to be handled
        this._outstandingPromiseErrors[id] = e;

        // The first time the queue fills up this iteration, schedule a timeout to
        // check if any errors are still unhandled.
        if (Object.keys(this._outstandingPromiseErrors).length === 1) {
            // use setTimeout instead of setImmediate so all pending functions are called first
            this._async.setTimeout(() => {
                var errors = this._outstandingPromiseErrors;
                this._outstandingPromiseErrors = {};
                Object.keys(errors).forEach((errorId: string) => {
                    var error = errors[errorId];
                    var errorValue = error.exception ? error.exception : error.error;
                    if (errorValue instanceof Error || (errorValue && errorValue.stack)) {
                        if (!Promise.isCanceled(error)) {
                            ErrorHelper.log(errorValue);
                        }
                    } else {
                        UnhandledPromiseEvent.logData({
                            message: 'Promise with no error callback',
                            extraData: safeSerialize(errorValue)
                        });
                    }
                    if (window['console'] && console.log) {
                        var warning = "Promise with no error callback:" + error.id;
                        if (console.warn) {
                            console.warn(warning);
                        } else {
                            console.log(warning);
                        }
                        console.log(error);
                        if (errorValue && errorValue.stack) {
                            console.log(errorValue.stack);
                        }
                    }
                });
            }, 0);
        }
    }
}

var promiseErrorHandler = new PromiseErrorHandler();
var events = new EventGroup(promiseErrorHandler);
events.on(Promise, 'error', promiseErrorHandler.log);
