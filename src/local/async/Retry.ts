
import Promise from './Promise';
import Signal = require('./Signal');
import IRetryConfig = require('./IRetryConfig');


/**
 * Retry allows you to invoke a callback a configurable number of times before giving up.
 */
function Retry<T>(config: IRetryConfig<T>): Promise<T> {
    "use strict";

    var attempts = 0;
    var promise: Promise<T>;
    var signal = new Signal<T>(() => {
        promise.cancel();
    });

    function onSuccess(value: T) {
        if (config.shouldRestart && config.shouldRestart()) {
            if (config.resetAttemptsOnRestart) {
                attempts = 0;
            }
            callCallback();
        } else {
            signal.complete(value);
        }
    }
    function onError(error: any) {
        if (config.adjustRetries) {
            config.retries = config.adjustRetries(error);
        }
        if (attempts < config.retries && config.canRetry(error)) {
            attempts++;
            if (config.beforeRetry) {
                config.beforeRetry();
            }
            config.async.setTimeout(callCallback, config.delay);
        } else {
            signal.error(error);
        }
    }

    function callCallback() {
        promise = config.callback();
        promise.done(onSuccess, onError);
    }

    callCallback();

    return signal.getPromise();
}

export = Retry;