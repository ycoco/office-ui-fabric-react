﻿/**
 * Bugs often appear in async code when stuff gets disposed, but async operations don't get canceled.
 * This Async helper class solves these issues by tying async code to the lifetime of a disposable object.
 *
 * Usage: Anything class extending from BaseModel can access this helper via this.async. Otherwise create a
 * new instance of the class and remember to call dispose() during your code's dispose handler.
 */

function noop() {
    // Do nothing.
}

export default class Async {
    private _timeoutIds: {
        [id: number]: boolean;
    };
    private _immediateIds: {
        [id: number]: boolean;
    };
    private _intervalIds: {
        [id: number]: boolean;
    };
    private _animationFrameIds: {
        [id: number]: boolean;
    };
    private _isDisposed: boolean;
    private _parent: any;
    private _onErrorHandler: (e: Error) => void;

    constructor(parent?: any, onError?: (e: Error) => void) {
        this._isDisposed = false;
        this._parent = parent || null;
        this._onErrorHandler = onError;

        this._timeoutIds = null;
        this._immediateIds = null;
        this._animationFrameIds = null;
        this._intervalIds = null;
    }

    /**
     * Dispose function, clears all async operations.
     */
    public dispose() {
        if (this._isDisposed) {
            return;
        }

        this._isDisposed = true;
        this._parent = null;
        // Clear timeouts.
        if (this._timeoutIds) {
            for (let id of Object.keys(this._timeoutIds)) {
                this.clearTimeout(Number(id));
            }

            this._timeoutIds = null;
        }

        // Clear immediates.
        if (this._immediateIds) {
            for (let id of Object.keys(this._immediateIds)) {
                this.clearImmediate(Number(id));
            }

            this._immediateIds = null;
        }

        // Clear intervals.
        if (this._intervalIds) {
            for (let id of Object.keys(this._intervalIds)) {
                this.clearInterval(Number(id));
            }
            this._intervalIds = null;
        }

        // Clear animation frames.
        if (this._animationFrameIds) {
            for (let id of Object.keys(this._animationFrameIds)) {
                this.cancelAnimationFrame(Number(id));
            }

            this._animationFrameIds = null;
        }
    }

    /**
     * SetTimeout override, which will auto cancel the timeout during dispose.
     * @param callback Callback to execute.
     * @param duration Duration in milliseconds.
     * @return The setTimeout id.
     */
    public setTimeout(callback: () => void, duration: number): number {
        let timeoutId = 0;

        if (!this._isDisposed) {
            const timeoutIds = this._timeoutIds || (this._timeoutIds = {});

            /* tslint:disable:ban-native-functions */
            timeoutId = setTimeout(
                () => {
                    // Time to execute the timeout, enqueue it as a foreground task to be executed.

                    try {
                        // Now delete the record and call the callback.
                        delete timeoutIds[timeoutId];
                        callback.apply(this._parent);
                    } catch (e) {
                        this._logError(e);
                    }
                },
                duration);
            /* tslint:enable:ban-native-functions */

            timeoutIds[timeoutId] = true;
        }

        return timeoutId;
    }

    /**
     * Clears the timeout.
     * @param id Id to cancel.
     */
    public clearTimeout(id: number) {
        const timeoutIds = this._timeoutIds;
        if (timeoutIds && timeoutIds[id]) {
            /* tslint:disable:ban-native-functions */
            clearTimeout(id);
            /* tslint:enable:ban-native-functions */
            delete timeoutIds[id];
        }
    }

    /**
     * SetImmediate override, which will auto cancel the immediate during dispose.
     * @param callback Callback to execute.
     * @return The setTimeout id.
     */
    public setImmediate(callback: () => void): number {
        let immediateId = 0;

        if (!this._isDisposed) {
            const immediateIds = this._immediateIds || (this._immediateIds = {});

            let setImmediateCallback = () => {
                // Time to execute the timeout, enqueue it as a foreground task to be executed.

                try {
                    // Now delete the record and call the callback.
                    delete immediateIds[immediateId];
                    callback.apply(this._parent);
                } catch (e) {
                    this._logError(e);
                }
            };

            /* tslint:disable:ban-native-functions */
            immediateId = window.setImmediate ? window.setImmediate(setImmediateCallback) : window.setTimeout(setImmediateCallback, 0);
            /* tslint:enable:ban-native-functions */

            immediateIds[immediateId] = true;
        }

        return immediateId;
    }

    /**
     * Clears the immediate.
     * @param id Id to cancel.
     */
    public clearImmediate(id: number) {
        const immediateIds = this._immediateIds;
        if (immediateIds && immediateIds[id]) {
            /* tslint:disable:ban-native-functions */
            window.clearImmediate ? window.clearImmediate(id) : window.clearTimeout(id);
            delete immediateIds[id];
            /* tslint:enable:ban-native-functions */
        }
    }

    /**
     * SetInterval override, which will auto cancel the timeout during dispose.
     * @param callback Callback to execute.
     * @param duration Duration in milliseconds.
     * @return The setTimeout id.
     */
    public setInterval(callback: () => void, duration: number): number {
        let intervalId = 0;

        if (!this._isDisposed) {
            if (!this._intervalIds) {
                this._intervalIds = {};
            }

            /* tslint:disable:ban-native-functions */
            intervalId = setInterval(
                () => {
                    // Time to execute the interval callback, enqueue it as a foreground task to be executed.
                    try {
                        callback.apply(this._parent);
                    } catch (e) {
                        this._logError(e);
                    }
                },
                duration);
            /* tslint:enable:ban-native-functions */

            this._intervalIds[intervalId] = true;
        }

        return intervalId;
    }

    /**
     * Clears the interval.
     * @param id Id to cancel.
     */
    public clearInterval(id: number) {
        if (this._intervalIds && this._intervalIds[id]) {
            /* tslint:disable:ban-native-functions */
            clearInterval(id);
            delete this._intervalIds[id];
            /* tslint:enable:ban-native-functions */
        }
    }

    /**
     * Creates a function that, when executed, will only call the func function at most once per
     * every wait milliseconds. Provide an options object to indicate that func should be invoked
     * on the leading and/or trailing edge of the wait timeout. Subsequent calls to the throttled
     * function will return the result of the last func call.
     *
     * Note: If leading and trailing options are true func will be called on the trailing edge of
     * the timeout only if the the throttled function is invoked more than once during the wait timeout.
     *
     * @param func The function to throttle.
     * @param wait The number of milliseconds to throttle executions to. Defaults to 0.
     * @param options The options object.
     * @param options.leading Specify execution on the leading edge of the timeout.
     * @param options.trailing Specify execution on the trailing edge of the timeout.
     * @return The new throttled function.
     */
    public throttle<T extends Function>(func: T, wait?: number, options: {
        leading?: boolean;
        trailing?: boolean;
    } = {}): T {
        if (this._isDisposed) {
            return <T><any>noop;
        }

        let waitMS = wait || 0;
        const {
            leading = true,
            trailing = true
        } = options;
        let lastExecuteTime = 0;
        let lastResult;
        let lastArgs: any[];
        let timeoutId: number = null;

        let callback = (userCall?: boolean) => {
            let now = (new Date()).getTime();
            let delta = now - lastExecuteTime;
            let waitLength = leading ? waitMS - delta : waitMS;
            if (delta >= waitMS && (!userCall || leading)) {
                lastExecuteTime = now;
                if (timeoutId) {
                    this.clearTimeout(timeoutId);
                    timeoutId = null;
                }
                lastResult = func.apply(this._parent, lastArgs);
            } else if (timeoutId === null && trailing) {
                timeoutId = this.setTimeout(callback, waitLength);
            }

            return lastResult;
        };

        let resultFunction: any = (...args: any[]) => {
            lastArgs = args;
            return callback(true);
        };

        return resultFunction;
    }

    /**
     * Creates a function that will delay the execution of func until after wait milliseconds have
     * elapsed since the last time it was invoked. Provide an options object to indicate that func
     * should be invoked on the leading and/or trailing edge of the wait timeout. Subsequent calls
     * to the debounced function will return the result of the last func call.
     *
     * Note: If leading and trailing options are true func will be called on the trailing edge of
     * the timeout only if the the debounced function is invoked more than once during the wait
     * timeout.
     *
     * @param func The function to debounce.
     * @param wait The number of milliseconds to delay.
     * @param options The options object.
     * @param options.leading Specify execution on the leading edge of the timeout.
     * @param options.maxWait The maximum time func is allowed to be delayed before it's called.
     * @param options.trailing Specify execution on the trailing edge of the timeout.
     * @return The new debounced function.
     */
    public debounce<T extends Function>(func: T, wait?: number, options: {
        leading?: boolean;
        maxWait?: number;
        trailing?: boolean;
    } = {}): T {
        if (this._isDisposed) {
            return <T><any>noop;
        }

        let waitMS = wait || 0;
        const {
            leading = false,
            trailing = true,
            maxWait = NaN
        } = options;
        let lastCallTime = 0;
        let lastExecuteTime = (new Date()).getTime();
        let lastResult;
        let lastArgs: any[];
        let timeoutId: number = null;

        let callback = (userCall?: boolean) => {
            let now = (new Date()).getTime();
            let executeImmediately = false;
            if (userCall) {
                if (leading && now - lastCallTime >= waitMS) {
                    executeImmediately = true;
                }
                lastCallTime = now;
            }
            let delta = now - lastCallTime;
            let waitLength = waitMS - delta;
            let maxWaitDelta = now - lastExecuteTime;
            let maxWaitExpired = false;

            if (!isNaN(maxWait)) {
                // maxWait only matters when there is a pending callback
                if (maxWaitDelta >= maxWait && timeoutId) {
                    maxWaitExpired = true;
                } else {
                    waitLength = Math.min(waitLength, maxWait - maxWaitDelta);
                }
            }

            if (delta >= waitMS || maxWaitExpired || executeImmediately) {
                if (timeoutId) {
                    this.clearTimeout(timeoutId);
                    timeoutId = null;
                }
                lastExecuteTime = now;
                lastResult = func.apply(this._parent, lastArgs);
            } else if ((timeoutId === null || !userCall) && trailing) {
                timeoutId = this.setTimeout(callback, waitLength);
            }

            return lastResult;
        };

        let resultFunction: any = (...args: any[]) => {
            lastArgs = args;
            return callback(true);
        };

        return resultFunction;
    }

    public requestAnimationFrame(callback: () => void): number {
        let animationFrameId = 0;

        if (!this._isDisposed) {
            const animationFrameIds = this._animationFrameIds || (this._animationFrameIds = {});

            const animationFrameCallback = () => {
                try {
                    // Now delete the record and call the callback.
                    delete animationFrameIds[animationFrameId];
                    callback.apply(this._parent);
                } catch (e) {
                    this._logError(e);
                }
            };

            /* tslint:disable:ban-native-functions */
            animationFrameId = window.requestAnimationFrame ? window.requestAnimationFrame(animationFrameCallback) : window.setTimeout(animationFrameCallback, 0);
            /* tslint:enable:ban-native-functions */

            animationFrameIds[animationFrameId] = true;
        }

        return animationFrameId;
    }

    public cancelAnimationFrame(id: number) {
        const animationFrameIds = this._animationFrameIds;
        if (animationFrameIds && animationFrameIds[id]) {
            /* tslint:disable:ban-native-functions */
            window.cancelAnimationFrame ? window.cancelAnimationFrame(id) : window.clearTimeout(id);
            /* tslint:enable:ban-native-functions */
            delete animationFrameIds[id];
        }
    }

    protected _logError(e: Error) {
        if (this._onErrorHandler) {
            this._onErrorHandler(e);
        }
    }
}
