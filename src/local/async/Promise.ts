/**
 * This file was originally ported from WinJS.
 */

import Async from './Async';
import EventGroup from '../events/EventGroup';

const async = new Async();

function doneHandler(value: any) {
    "use strict";
    async.setImmediate(() => {
        throw value;
    });
}

const errorET = "error";
const canceledName = "Canceled";

let events: EventGroup;

//
// Global error counter, for each error which enters the system we increment this once and then
// the error number travels with the error as it traverses the tree of potential handlers.
//
// When someone has registered to be told about error [using EventGroup.on(Promise, 'error')] promises
// which are in error will get tagged with a ._errorId field. This tagged field is the
// contract by which nested promises with errors will be identified as chaining for the
// purposes of the callonerror semantics. If a nested promise in error is encountered without
// a ._errorId it will be assumed to be foreign and treated as an interop boundary and
// a new error id will be minted.
//
let error_number = 1;

//
// The state machine has a interesting hiccup in it with regards to notification, in order
// to flatten out notification and avoid recursion for synchronous completion we have an
// explicit set of *_notify states which are responsible for notifying their entire tree
// of children. They can do this because they know that immediate children are always
// ThenPromise instances and we can therefore reach into their state to access the
// _listeners collection.
//
// So, what happens is that a Promise will be fulfilled through the _completed or _error
// messages at which point it will enter a *_notify state and be responsible for to move
// its children into an (as appropriate) success or error state and also notify that child's
// listeners of the state transition, until leaf notes are reached.
//

interface IState {
    name: string;
    enter(promise: any): void;
    cancel(promise: any): void;
    done(promise: any, onComplete: any, onError: any): void;
    then(promise: any, onComplete: any, onError: any): void;
    _completed(promise: any, value: any): void;
    _error(promise: any, value: any, onerrorDetails: any, context: any): void;
    _notify(promise: any, queue: any): void;
    _setCompleteValue(promise: any, value: any): void;
    _setErrorValue(promise: any, value: any, onerrorDetails: any, context: any): void;
};

let state_created: IState,              // -> working
    state_working: IState,              // -> error | error_notify | success | success_notify | canceled | waiting
    state_waiting: IState,              // -> error | error_notify | success | success_notify | waiting_canceled
    state_waiting_canceled: IState,     // -> error | error_notify | success | success_notify | canceling
    state_canceled: IState,             // -> error | error_notify | success | success_notify | canceling
    state_canceling: IState,            // -> error_notify
    state_success_notify: IState,       // -> success
    state_success: IState,              // -> .
    state_error_notify: IState,         // -> error
    state_error: IState;                // -> .

// Noop function, used in the various states to indicate that they don't support a given
// message. Named with the somewhat cute name '_' because it reads really well in the states.

function _() { "use strict"; }

// Initial state
//
state_created = {
    name: "created",
    enter: function (promise: any) {
        promise._setState(state_working);
    },
    cancel: _,
    done: _,
    then: _,
    _completed: _,
    _error: _,
    _notify: _,
    _setCompleteValue: _,
    _setErrorValue: _
};

// Ready state, waiting for a message (completed/error), able to be canceled
//
state_working = {
    name: "working",
    enter: _,
    cancel: function (promise: any) {
        promise._setState(state_canceled);
    },
    done: done,
    then: then,
    _completed: completed,
    _error: error,
    _notify: _,
    _setCompleteValue: setCompleteValue,
    _setErrorValue: setErrorValue
};

// Waiting state, if a promise is completed with a value which is itself a promise
// (has a then() method) it signs up to be informed when that child promise is
// fulfilled at which point it will be fulfilled with that value.
//
state_waiting = {
    name: "waiting",
    enter: function (promise: any) {
        let waitedUpon = promise._value;
        // We can special case our own intermediate promises which are not in a
        //  terminal state by just pushing this promise as a listener without
        //  having to create new indirection functions
        if (waitedUpon instanceof ThenPromise &&
            waitedUpon._state !== state_error &&
            waitedUpon._state !== state_success) {
            pushListener(waitedUpon, { promise: promise });
        } else {
            let error: any = function (value: any) {
                if (waitedUpon._errorId) {
                    promise._chainedError(value, waitedUpon);
                } else {
                    // Because this is an interop boundary we want to indicate that this
                    //  error has been handled by the promise infrastructure before we
                    //  begin a new handling chain.
                    //
                    callonerror(promise, value, detailsForHandledError, waitedUpon, error);
                    promise._error(value);
                }
            };
            error.handlesOnError = true;
            waitedUpon.then(
                promise._completed.bind(promise),
                error
            );
        }
    },
    cancel: function (promise: any) {
        promise._setState(state_waiting_canceled);
    },
    done: done,
    then: then,
    _completed: completed,
    _error: error,
    _notify: _,
    _setCompleteValue: setCompleteValue,
    _setErrorValue: setErrorValue
};

// Waiting canceled state, when a promise has been in a waiting state and receives a
// request to cancel its pending work it will forward that request to the child promise
// and then waits to be informed of the result. This promise moves itself into the
// canceling state but understands that the child promise may instead push it to a
// different state.
//
state_waiting_canceled = {
    name: "waiting_canceled",
    enter: function (promise: any) {
        // Initiate a transition to canceling. Triggering a cancel on the promise
        // that we are waiting upon may result in a different state transition
        // before the state machine pump runs again.
        promise._setState(state_canceling);
        let waitedUpon = promise._value;
        if (waitedUpon.cancel) {
            waitedUpon.cancel();
        }
    },
    cancel: _,
    done: done,
    then: then,
    _completed: completed,
    _error: error,
    _notify: _,
    _setCompleteValue: setCompleteValue,
    _setErrorValue: setErrorValue
};

// Canceled state, moves to the canceling state and then tells the promise to do
// whatever it might need to do on cancelation.
//
state_canceled = {
    name: "canceled",
    enter: function (promise: any) {
        // Initiate a transition to canceling. The _cancelAction may change the state
        // before the state machine pump runs again.
        promise._setState(state_canceling);
        promise._cancelAction();
    },
    cancel: _,
    done: done,
    then: then,
    _completed: completed,
    _error: error,
    _notify: _,
    _setCompleteValue: setCompleteValue,
    _setErrorValue: setErrorValue
};

// Canceling state, commits to the promise moving to an error state with an error
// object whose 'name' and 'message' properties contain the string "Canceled"
//
state_canceling = {
    name: "canceling",
    enter: function (promise: any) {
        let error = new Error(canceledName);
        error.name = error.message;
        error["_handled"] = true;
        promise._value = error;
        promise._setState(state_error_notify);
    },
    cancel: _,
    done: _,
    then: _,
    _completed: _,
    _error: _,
    _notify: _,
    _setCompleteValue: _,
    _setErrorValue: _
};

// Success notify state, moves a promise to the success state and notifies all children
//
state_success_notify = {
    name: "complete_notify",
    enter: function (promise: any) {
        promise.done = CompletePromise.prototype.done;
        promise.then = CompletePromise.prototype.then;
        if (promise._listeners) {
            let queue = [promise];
            let p;
            while (queue.length) {
                p = queue.shift();
                p._state._notify(p, queue);
            }
        }
        promise._setState(state_success);
    },
    cancel: _,
    done: null, /*error to get here */
    then: null, /*error to get here */
    _completed: _,
    _error: _,
    _notify: notifySuccess,
    _setCompleteValue: _,
    _setErrorValue: _
};

// Success state, moves a promise to the success state and does NOT notify any children.
// Some upstream promise is owning the notification pass.
//
state_success = {
    name: "success",
    enter: function (promise: any) {
        promise.done = CompletePromise.prototype.done;
        promise.then = CompletePromise.prototype.then;
        promise._cleanupAction();
    },
    cancel: _,
    done: null, /*error to get here */
    then: null, /*error to get here */
    _completed: _,
    _error: _,
    _notify: notifySuccess,
    _setCompleteValue: _,
    _setErrorValue: _
};

// Error notify state, moves a promise to the error state and notifies all children
//
state_error_notify = {
    name: "error_notify",
    enter: function (promise: any) {
        promise.done = ErrorPromise.prototype.done;
        promise.then = ErrorPromise.prototype.then;
        if (promise._listeners) {
            let queue = [promise];
            let p;
            while (queue.length) {
                p = queue.shift();
                p._state._notify(p, queue);
            }
        }
        promise._setState(state_error);
    },
    cancel: _,
    done: null, /*error to get here*/
    then: null, /*error to get here*/
    _completed: _,
    _error: _,
    _notify: notifyError,
    _setCompleteValue: _,
    _setErrorValue: _
};

// Error state, moves a promise to the error state and does NOT notify any children.
// Some upstream promise is owning the notification pass.
//
state_error = {
    name: "error",
    enter: function (promise: any) {
        promise.done = ErrorPromise.prototype.done;
        promise.then = ErrorPromise.prototype.then;
        promise._cleanupAction();
    },
    cancel: _,
    done: null, /*error to get here*/
    then: null, /*error to get here*/
    _completed: _,
    _error: _,
    _notify: notifyError,
    _setCompleteValue: _,
    _setErrorValue: _
};

//
// The statemachine implementation follows a very particular pattern, the states are specified
// as static stateless bags of functions which are then indirected through the state machine
// instance (a Promise). As such all of the functions on each state have the promise instance
// passed to them explicitly as a parameter and the Promise instance members do a little
// dance where they indirect through the state and insert themselves in the argument list.
//
// We could instead call directly through the promise states however then every caller
// would have to remember to do things like pumping the state machine to catch state transitions.
//

//
// Implementations of shared state machine code.
//

function completed(promise: any, value: any) {
    "use strict";
    let targetState;
    if (value && typeof value === "object" && typeof value.then === "function") {
        targetState = state_waiting;
    } else {
        targetState = state_success_notify;
    }
    promise._value = value;
    promise._setState(targetState);
}

function createErrorDetails(exception: any, error: any, promise: any, id: number, parent?: any, handler?: any) {
    "use strict";
    return {
        exception: exception,
        error: error,
        promise: promise,
        handler: handler,
        id: id,
        parent: parent
    };
}

function detailsForHandledError(promise: any, errorValue: any, context: any, handler: any) {
    "use strict";
    let exception = context._isException;
    let errorId = context._errorId;
    return createErrorDetails(
        exception ? errorValue : null,
        exception ? null : errorValue,
        promise,
        errorId,
        context,
        handler
    );
}

function detailsForChainedError(promise: any, errorValue: any, context: any) {
    "use strict";
    let exception = context._isException;
    let errorId = context._errorId;
    setErrorInfo(promise, errorId, exception);
    return createErrorDetails(
        exception ? errorValue : null,
        exception ? null : errorValue,
        promise,
        errorId,
        context
    );
}

function detailsForError(promise: any, errorValue: any) {
    "use strict";
    let errorId = ++error_number;
    setErrorInfo(promise, errorId);
    return createErrorDetails(
        null,
        errorValue,
        promise,
        errorId
    );
}

function detailsForException(promise: any, exceptionValue: any) {
    "use strict";
    let errorId = ++error_number;
    setErrorInfo(promise, errorId, true);
    return createErrorDetails(
        exceptionValue,
        null,
        promise,
        errorId
    );
}

function done(promise: any, onComplete: any, onError: any) {
    "use strict";
    pushListener(promise, { c: onComplete, e: onError});
}

function error(promise: any, value: any, onerrorDetails: any, context: any) {
    "use strict";
    promise._value = value;
    callonerror(promise, value, onerrorDetails, context);
    promise._setState(state_error_notify);
}

function notifySuccess(promise: any, queue: any) {
    "use strict";
    let value = promise._value;
    let listeners = promise._listeners;
    if (!listeners) {
        return;
    }
    promise._listeners = null;
    let i, len;
    for (i = 0, len = Array.isArray(listeners) ? listeners.length : 1; i < len; i++) {
        let listener = len === 1 ? listeners : listeners[i];
        let onComplete = listener.c;
        let target = listener.promise;

        if (target) {
            try {
                target._setCompleteValue(onComplete ? onComplete(value) : value);
            } catch (ex) {
                target._setExceptionValue(ex);
            }

            if (target._state !== state_waiting && target._listeners) {
                queue.push(target);
            }
        } else {
            CompletePromise.prototype.done.call(promise, onComplete);
        }
    }
}

function notifyError(promise: any, queue: any) {
    "use strict";
    let value = promise._value;
    let listeners = promise._listeners;
    if (!listeners) {
        return;
    }
    promise._listeners = null;
    let i, len;
    for (i = 0, len = Array.isArray(listeners) ? listeners.length : 1; i < len; i++) {
        let listener = len === 1 ? listeners : listeners[i];
        let onError = listener.e;
        let target = listener.promise;

        if (target) {
            let asyncCallbackStarted = false;
            try {
                if (onError) {

                    asyncCallbackStarted = true;
                    if (!onError.handlesOnError) {
                        callonerror(target, value, detailsForHandledError, promise, onError);
                    }
                    target._setCompleteValue(onError(value));
                } else {
                    target._setChainedErrorValue(value, promise);
                }
            } catch (ex) {
                target._setExceptionValue(ex);
            }

            if (target._state !== state_waiting && target._listeners) {
                queue.push(target);
            }
        } else {
            ErrorPromise.prototype.done.call(promise, null, onError);
        }
    }
}

function callonerror(promise: any, value: any, onerrorDetailsGenerator: any, context?: any, handler?: any) {
    "use strict";
    if (value instanceof Error && value.message === canceledName) {
        return;
    }
    events.raise(errorET, onerrorDetailsGenerator(promise, value, context, handler));
}

function pushListener(promise: any, listener: any) {
    "use strict";
    let listeners = promise._listeners;
    if (listeners) {
        // We may have either a single listener (which will never be wrapped in an array)
        // or 2+ listeners (which will be wrapped). Since we are now adding one more listener
        // we may have to wrap the single listener before adding the second.
        listeners = Array.isArray(listeners) ? listeners : [listeners];
        listeners.push(listener);
    } else {
        listeners = listener;
    }
    promise._listeners = listeners;
}

// The difference beween setCompleteValue()/setErrorValue() and complete()/error() is that setXXXValue() moves
// a promise directly to the success/error state without starting another notification pass (because one
// is already ongoing).
function setErrorInfo(promise: any, errorId: number, isException?: boolean) {
    "use strict";
    promise._isException = isException || false;
    promise._errorId = errorId;
}

function setErrorValue(promise: any, value: any, onerrorDetails: any, context: any) {
    "use strict";
    promise._value = value;
    callonerror(promise, value, onerrorDetails, context);
    promise._setState(state_error);
}

function setCompleteValue(promise: any, value: any) {
    "use strict";
    let targetState;
    if (value && typeof value === "object" && typeof value.then === "function") {
        targetState = state_waiting;
    } else {
        targetState = state_success;
    }
    promise._value = value;
    promise._setState(targetState);
}

function then(promise: any, onComplete: any, onError: any) {
    "use strict";
    let result = new ThenPromise(promise);
    pushListener(promise, { promise: result, c: onComplete, e: onError });
    return result;
}

//
// Slim promise implementations for already completed promises, these are created
// under the hood on synchronous completion paths as well as by Promise.wrap
// and Promise.wrapError.
//

class ErrorPromise<T> {
    private _value;
    constructor(value: any, errorFunc: any = detailsForError) {

        this._value = value;
        callonerror(this, value, errorFunc);
    }

    public cancel() {
        /* No-op */
    }

    public done(unused: any, onError: any) {
        let value = this._value;
        if (onError) {
            try {
                if (!onError.handlesOnError) {
                    callonerror(null, value, detailsForHandledError, this, onError);
                }
                let result = onError(value);
                if (result && typeof result === "object" && typeof result.done === "function") {
                    // If a promise is returned we need to wait on it.
                    result.done();
                }
                return;
            } catch (ex) {
                value = ex;
            }
        }
        if (value instanceof Error && value.message === canceledName) {
            // suppress cancel
            return;
        }
        // force the exception to be thrown asyncronously to avoid any try/catch blocks
        //
        doneHandler(value);
    }

    public then(unused: any, onError: any) {
        // If the promise is already in a error state and no error handler is provided
        // we optimize by simply returning the promise instead of creating a new one.
        //
        if (!onError) { return this; }
        let result;
        let value = this._value;
        try {
            if (!onError.handlesOnError) {
                callonerror(null, value, detailsForHandledError, this, onError);
            }
            result = new CompletePromise(onError(value));
        } catch (ex) {
            // If the value throw from the error handler is the same as the value
            // provided to the error handler then there is no need for a new promise.
            //
            if (ex === value) {
                result = this;
            } else {
                result = new ExceptionPromise(ex);
            }
        }
        return result;
    }
}

class ExceptionPromise<T> extends ErrorPromise<T> {
    constructor(value: any) {
        super(value, detailsForException);
    }
}

class CompletePromise<T> {

    private _value;
    constructor(value: any) {

        if (value && typeof value === "object" && typeof value.then === "function") {
            let result: any = new ThenPromise(null);
            result._setCompleteValue(value);
            return result;
        }
        this._value = value;
    }

    public cancel() {
        /* No-op */
    }
    public done(onComplete: any) {
        if (!onComplete) { return; }
        try {
            let result = onComplete(this._value);
            if (result && typeof result === "object" && typeof result.done === "function") {
                result.done();
            }
        } catch (ex) {
            // force the exception to be thrown asynchronously to avoid any try/catch blocks
            doneHandler(ex);
        }
    }
    public then<U>(onComplete: any): Promise<U> {
        let resultPromise: any;
        try {
            // If the value returned from the completion handler is the same as the value
            // provided to the completion handler then there is no need for a new promise.
            //
            let newValue = onComplete ? onComplete(this._value) : this._value;
            resultPromise = newValue === this._value ? this : new CompletePromise(newValue);
        } catch (ex) {
            resultPromise = new ExceptionPromise(ex);
        }
        return resultPromise;
    }
}

function timeout(timeoutMS: number) {
    "use strict";
    let id: number;
    return new Promise(
        function (c: any) {
            if (timeoutMS) {
                id = async.setTimeout(c, timeoutMS);
            } else {
                async.setImmediate(c);
            }
        },
        function () {
            if (id) {
                async.clearTimeout(id);
            }
        }
    );
}

function timeoutWithPromise(timeout: any, promise: any) {
    "use strict";
    let cancelPromise = function () { promise.cancel(); };
    let cancelTimeout = function () { timeout.cancel(); };
    timeout.then(cancelPromise);
    promise.then(cancelTimeout, cancelTimeout);
    return promise;
}

let staticCanceledPromise;

export default class Promise<T> {

    protected _listeners: any;
    protected _listener: any;
    protected _nextState: any;
    protected _state: any;
    protected _value: any;
    protected _oncancel: any;

    /**
     * Returns a promise that is fulfilled when one of the input promises
     * has been fulfilled.
     */
    public static any<T>(values: Promise<T>[]): Promise<{ key: string; value: Promise<T>; }> {
        return new Promise(
            function (complete: any, error: any) {
                let keys = Object.keys(values);
                if (keys.length === 0) {
                    complete();
                }
                let canceled = 0;
                keys.forEach(function (key: string) {
                    Promise.as(values[key]).then(
                        function () { complete({ key: key, value: values[key] }); },
                        function (e: any) {
                            if (e instanceof Error && e.name === canceledName) {
                                if ((++canceled) === keys.length) {
                                    complete(Promise.cancel);
                                }
                                return;
                            }
                            error({ key: key, value: values[key] });
                        }
                    );
                });
            },
            function () {
                let keys = Object.keys(values);
                keys.forEach(function (key: string) {
                    let promise = Promise.as(values[key]);
                    if (typeof promise.cancel === "function") {
                        promise.cancel();
                    }
                });
            }
        );
    }
    /**
     * Returns a promise. If the object is already a promise it is returned;
     * otherwise the object is wrapped in a promise.
     */
    public static as<T>(value?: T): Promise<T>;
    public static as<P>(value?: Promise<P>): Promise<P> {
        let returnValue: any;
        if (value && typeof value === "object" && typeof value.then === "function") {
            returnValue = value;
        } else {
            returnValue = new CompletePromise(value);
        }
        return returnValue;
    }

    public static get cancel(): Promise<string> {
        return (staticCanceledPromise = staticCanceledPromise || new ErrorPromise(canceledName));
    }

    /**
     * Determines whether a value fulfills the promise contract.
     */
    public static is(value: any): boolean {
        return value && typeof value === "object" && typeof value.then === "function";
    }

    /**
     * Determines whether an error value represents a promise cancellation.
     */
    public static isCanceled(e: any): boolean {
        return (e instanceof Error && e.name === canceledName);
    }

    /**
     * Creates a promise that is fulfilled when all the values are fulfilled.
     */
    public static all<T>(values: (T | Promise<T>)[]): Promise<T[]>;
    public static all<T>(values: Promise<any>[]): Promise<any[]>;
    public static all<T>(values: { [keys: string ]: Promise<T>}): Promise<{ [keys: string]: T }>;
    public static all(values: any): Promise<any> {
        return new Promise(
            function (complete: any, error: any) {
                let keys = Object.keys(values);
                let errors = Array.isArray(values) ? [] : {};
                let results = Array.isArray(values) ? [] : {};
                let undefineds = 0;
                let pending = keys.length;
                let argDone = function (key: string) {
                    if ((--pending) === 0) {
                        let errorCount = Object.keys(errors).length;
                        if (errorCount === 0) {
                            complete(results);
                        } else {
                            let canceledCount = 0;
                            keys.forEach(function (key: string) {
                                let e = errors[key];
                                if (e instanceof Error && e.name === canceledName) {
                                    canceledCount++;
                                }
                            });
                            if (canceledCount === errorCount) {
                                complete(Promise.cancel);
                            } else {
                                error(errors);
                            }
                        }
                    }
                };
                keys.forEach(function (key: string) {
                    let value = values[key];
                    if (value === undefined) {
                        undefineds++;
                    } else {
                        Promise.then(value,
                            function (value: any) { results[key] = value; argDone(key); },
                            function (value: any) { errors[key] = value; argDone(key); }
                        );
                    }
                });
                pending -= undefineds;
                if (pending === 0) {
                    complete(results);
                    return;
                }
            },
            function () {
                Object.keys(values).forEach(function (key: string) {
                    let promise = Promise.as(values[key]);
                    if (typeof promise.cancel === "function") {
                        promise.cancel();
                    }
                });
            }
        );
    }

    public static then<T>(value: any, onComplete: (result: T) => any, onError: (error: any) => any): Promise<T> {
        return Promise.as(value).then(onComplete, onError);
    }

    public static thenEach<T>(values: Promise<T>[], onComplete: (result: T) => any, onError?: (error: any) => any): Promise<T[]>;
    public static thenEach<T>(values: { [keys: string]: Promise<T> }, onComplete: (result: any) => any, onError?: (error: any) => any): Promise<{ [keys: string]: T }>;
    public static thenEach<T>(values: any, onComplete: (result: T) => any, onError?: (error: any) => any): Promise<any> {
        let result: any = Array.isArray(values) ? [] : {};
        Object.keys(values).forEach(function (key: string) {
            result[key] = Promise.as(values[key]).then(onComplete, onError);
        });
        return Promise.all(result);
    }

    /**
     * Execute a series of functions that returns a promise, in order.
     * @param tasks An array of functions that return a promise.
     * @returns A promise that is complete when all tasks are complete.
     */
    public static serial<T>(tasks: (() => Promise<T>)[]): Promise<T>;
    public static serial(tasks: (() => Promise<any>)[]): Promise<any> {
        return tasks.reduce((previous: Promise<any>, task: () => Promise<any>) => {
            return previous.then(task);
        }, Promise.wrap());
    }

    /**
     * Creates a promise that is fulfilled after a timeout.
     */
    public static timeout<T>(time: number, promise?: Promise<T>): Promise<T>;
    public static timeout(time: number, promise?: Promise<any>): Promise<any> {
        let to = timeout(time);
        return promise ? timeoutWithPromise(to, promise) : to;
    }

    /**
     * Wraps a non-promise value in a promise. You can use this function if you need
     * to pass a value to a function that requires a promise.
     */
    public static wrap<T>(value?: Promise<T>): Promise<T>;
    public static wrap<T>(value?: T): Promise<T>;
    public static wrap<T>(value?: any): Promise<T> {
        let cp: any = new CompletePromise(value);
        return cp;
    }

    /**
     * Wraps a non-promise error value in a promise. You can use this function if you need
     * to pass an error to a function that requires a promise.
     */
    public static wrapError(error?: any): Promise<any> {
        let ep: any = new ErrorPromise(error);
        return ep;
    }

    constructor(init?: (c: (result?: T) => void, e: (error?: any) => void) => any, oncancel?: Function) {
        this._init(init, oncancel);
    }

   /**
    * Attempts to cancel the fulfillment of a promised value. If the promise hasn't
    * already been fulfilled and cancellation is supported, the promise enters
    * the error state with a value of Error("Canceled").
    */
    public cancel() {
        this._state.cancel(this);
        this._run();
    }

    /**
     * Allows you to specify the work to be done on the fulfillment of the promised value,
     * the error handling to be performed if the promise fails to fulfill
     * a value.
     *
     * After the handlers have finished executing, this function throws any error that would have been returned
     * from then() as a promise in the error state.
     *
     * @param onComplete The function to be called if the promise is fulfilled successfully with a value. The fulfilled value is passed as the single argument. If the value is null, the fulfilled value is returned. The value returned from the function becomes the fulfilled value of the promise returned by then. If an exception is thrown while executing the function, the promise returned by then moves into the error state.
     * @param onError The function to be called if the promise is fulfilled with an error. The error is passed as the single argument. If it is null, the error is forwarded. The value returned from the function is the fulfilled value of the promise returned by then.
     */
    public done(onComplete?: (value: T) => any, onError?: (error: any) => any): void {
        this._state.done(this, onComplete, onError);
    }

    /**
     * Allows you to specify the work to be done on the fulfillment of the promised value,
     * the error handling to be performed if the promise fails to fulfill
     * a value.
     *
     * @param onComplete The function to be called if the promise is fulfilled successfully with a value. The value is passed as the single argument. If the value is null, the value is returned. The value returned from the function becomes the fulfilled value of the promise returned by then. If an exception is thrown while this function is being executed, the promise returned by then moves into the error state.
     * @param onError The function to be called if the promise is fulfilled with an error. The error is passed as the single argument. In different cases this object may be of different types, so it is necessary to test the object for the properties you expect. If the error is null, it is forwarded. The value returned from the function becomes the value of the promise returned by the then function.
     * @returns The promise whose value is the result of executing the complete or error function.
     */
    public then<U>(onComplete?: (value: T) => Promise<U>, onError?: (error: any) => Promise<U>): Promise<U>;
    public then<U>(onComplete?: (value: T) => Promise<U>, onError?: (error: any) => U): Promise<U>;
    public then<U>(onComplete?: (value: T) => Promise<U>, onError?: (error: any) => void): Promise<U>;
    public then<U>(onComplete?: (value: T) => U, onError?: (error: any) => Promise<U>): Promise<U>;
    public then<U>(onComplete?: (value: T) => U, onError?: (error: any) => U): Promise<U>;
    public then<U>(onComplete?: (value: T) => U, onError?: (error: any) => void): Promise<U>;
    public then<U>(onComplete?: (value: T) => void, onError?: (error: any) => Promise<U>): Promise<U>;
    public then<U>(onComplete?: (value: T) => void, onError?: (error: any) => U): Promise<U>;
    public then<U>(onComplete?: (value: T) => void, onError?: (error: any) => void): Promise<U>;
    public then<U>(onComplete?: any, onError?: any): Promise<U> {
        return this._state.then(this, onComplete, onError);
    }

    protected _init(init?: (c: (result?: T) => void, e: (error?: any) => void) => any, oncancel?: Function) {
        this._oncancel = oncancel;
        this._setState(state_created);
        this._run();

        try {
            let complete = this._completed.bind(this);
            let error = this._error.bind(this);
            init(complete, error);
        } catch (ex) {
            this._setExceptionValue(ex);
        }
    }

    protected _cancelAction() {
        if (this._oncancel) {
            try { this._oncancel(); } catch (ex) { /* ignore */ }
        }
    }

    protected _cleanupAction() {
        this._oncancel = null;
    }

    protected _chainedError(value: any, context: any) {
        let result = this._state._error(this, value, detailsForChainedError, context);
        this._run();
        return result;
    }

    protected _completed(value: any) {
        let result = this._state._completed(this, value);
        this._run();
        return result;
    }

    protected _error(value: any) {
        let result = this._state._error(this, value, detailsForError);
        this._run();
        return result;
    }

    protected _setState(state: any) {
        this._nextState = state;
    }

    protected _setCompleteValue(value: any) {
        this._state._setCompleteValue(this, value);
        this._run();
    }

    protected _setChainedErrorValue(value: any, context: any) {
        let result = this._state._setErrorValue(this, value, detailsForChainedError, context);
        this._run();
        return result;
    }

    protected _setExceptionValue(value: any) {
        let result = this._state._setErrorValue(this, value, detailsForException);
        this._run();
        return result;
    }

    protected _run() {
        while (this._nextState) {
            this._state = this._nextState;
            this._nextState = null;
            this._state.enter(this);
        }
    }
}

events = new EventGroup(Promise);
events.declare(errorET);

//
// Internal implementation detail promise, ThenPromise is created when a promise needs
// to be returned from a then() method.
//
class ThenPromise<T> extends Promise<T> {
    private _creator: any;

    constructor(creator: any) {
        super();

        this._creator = creator;

        this._initThen();
    }

    protected _init() {
        // Override to do nothing.
    }

    protected _cancelAction() {
        if (this._creator) { this._creator.cancel(); }
    }

    protected _cleanupAction() {
        this._creator = null;
    }

    private _initThen() {
        this._setState(state_created);
        this._run();
    }
}

export class SignalPromise<T> extends Promise<T> {
    constructor(cancel: any) {
        super();

        this._oncancel = cancel;

        this._initSignal();
    }

    protected _init() {
        // Override to do nothing.
    }

    protected _cancelAction() {
        if (this._oncancel) {
            this._oncancel();
        }
    }

    protected _cleanupAction() {
        this._oncancel = null;
    }

    private _initSignal() {
        this._setState(state_created);
        this._run();
    }
}