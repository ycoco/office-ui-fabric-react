import Promise from './Promise';
import Async = require('./Async');

interface IRetryConfig<T> {
    retries: number;
    callback: () => Promise<T>;
    /**
     * Return true to to call the callback again
     */
    canRetry: (error: any) => boolean;
    async: Async;
    delay: number;
    /**
     * If true and beforeComplete returns true, then reset the current retry count
     */
    resetAttemptsOnRestart?: boolean;
    /**
     * Called before complete to indicate callback should be called again
     */
    shouldRestart?: () => boolean;
    /**
     * Called before trying again, so you can adjust parameters
     */
    beforeRetry?: () => void;
    /**
     * Callback to inspect the error and change the number of retries if necessary
     */
    adjustRetries?: (error: any) => number;
}

export = IRetryConfig;