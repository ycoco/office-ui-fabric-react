// OneDrive:IgnoreCodeCoverage

import IBaseModelParams = require('./IBaseModelParams');
import IBaseModelDependencies from './IBaseModelDependencies';
import EventGroup from '@ms/odsp-utilities/lib/events/EventGroup';
import Async from '@ms/odsp-utilities/lib/async/Async';
import { IDisposable } from '@ms/odsp-utilities/lib/interfaces/IDisposable';
import Promise from '@ms/odsp-utilities/lib/async/Promise';
import Component from '@ms/odsp-utilities/lib/component/Component';
import ko = require('knockout');

/**
 * BaseModel provides basic common functionality for all of our model classes, including dispose
 * management, async helpers, etc.
 * Instances of BaseModel should not be constructed directly from the type, e.g. new MyModel(params).
 * Instead, use a constructor wrapper such as ResourceScope.injected or BaseModel.managed.
 * @example
 *  // From outside any existing model
 *  let resources = new ResourceScope();
 *  let myModel = new (resources.injected(MyModel))(params);
 * @example
 *  // From within MyModel
 *  constructor(params: ...) {
 *      this.mySubModel = new (this.managed(MySubModel))(subModelParams);
 *  }
 */
class BaseModel extends Component {
    /**
     * Gets a deterministic unique identifier for this model.
     */
    protected id: string;

    /**
     * Gets an async helper attached to the lifetime of this model.
     * Async callbacks will be bound to this model by default.
     */
    get async(): Async {
        return this._BaseModel_getAsync();
    }

    /**
     * Gets an event registry attached to the lifetime of this model.
     * Event callbacks will be bound to this model by default.
     */
    get events(): EventGroup {
        return this._BaseModel_getEvents();
    }

    /**
     * A list of scheduled tasks to run
     */
    private _backgroundTasks: (() => void)[];

    /**
     * An id for a task to execute the background tasks.
     */
    private _backgroundTasksId: number;

    private _BaseModel_getEvents: () => EventGroup;
    private _BaseModel_getAsync: () => Async;

    constructor(params: IBaseModelParams = {}, dependencies: IBaseModelDependencies = {}) {
        super(params, dependencies);

        let {
            id = ''
        } = params;

        this.id = id;

        this._backgroundTasks = [];

        let asyncType: typeof Async;
        let eventGroupType: typeof EventGroup;

        ({
            Async: asyncType = ({
                async: asyncType = Async
            } = dependencies, asyncType),
            EventGroup: eventGroupType = ({
                events: eventGroupType = EventGroup
            } = dependencies, eventGroupType)
        } = dependencies);

        this._BaseModel_getAsync = () => {
            let async = new (this.scope.attached(asyncType))(this);

            this._BaseModel_getAsync = () => async;

            return async;
        };

        this._BaseModel_getEvents = () => {
            let events = new (this.scope.attached(eventGroupType))(this);

            this._BaseModel_getEvents = () => events;

            return events;
        };
    }

    protected subscribe<T>(thing: KnockoutSubscribable<T>, callback: (value: T) => void, isBeforeChange: boolean = false): KnockoutSubscription {
        let eventName: string;

        if (isBeforeChange) {
            eventName = 'beforeChange';
        }

        return this.scope.attach(thing.subscribe(callback, this, eventName));
    }

    /**
     * Creates a ko.computed value that gets disposed with 'this'.
     * @param callback - the computed callback.
     */
    protected createComputed<T>(options?: KnockoutComputedDefine<T>): KnockoutComputed<T>;
    protected createComputed<T>(callback: () => T, options?: KnockoutComputedOptions<T>): KnockoutComputed<T>
    protected createComputed<T>(optionsOrCallback: (() => T) | KnockoutComputedDefine<T>, options?: KnockoutComputedOptions<T>) {
        let definition: KnockoutComputedDefine<T>;

        if (isKnockoutComputedOptions(optionsOrCallback)) {
            options = {
                owner: this
            };

            definition = ko.utils.extend(options, optionsOrCallback);
        } else {
            definition = {
                read: optionsOrCallback,
                owner: this
            };

            if (options) {
                ko.utils.extend(definition, options);
            }
        }

        /* tslint:disable:ban */
        let computed = ko.computed(definition);
        /* tslint:enable:ban */

        return this.scope.attach(computed);
    }

    /**
     * Creates a ko.pureComputed value that gets disposed with 'this'.
     * @param callback - the computed callback.
     */
    protected createPureComputed<T>(callback: () => T, options?: KnockoutComputedOptions<T>): KnockoutComputed<T> {
        let pureOptions: KnockoutComputedOptions<T> = {
            pure: true
        };

        if (options) {
            ko.utils.extend(pureOptions, options);
        }

        return this.createComputed(callback, pureOptions);
    }

    /**
     * Creates a deferred ko.computed value that gets disposed with 'this'.
     * @param callback - the computed callback.
     */
    protected createBackgroundComputed(callback: () => void, options?: KnockoutComputedOptions<void>): KnockoutComputed<void> {
        let deferredOptions: KnockoutComputedOptions<void> = {
            deferEvaluation: true
        };

        if (options) {
            ko.utils.extend(deferredOptions, options);
        }

        return this._BaseModel_setupBackgroundTask(this.createComputed(callback, deferredOptions));
    }

    /**
     * Adds the given instance to the disposal chain for this model.
     */
    protected addDisposable<T extends IDisposable>(disposable: T): T;
    protected addDisposable<T>(instance: T): T & IDisposable;
    protected addDisposable(instance: any): IDisposable {
        return this.scope.attach(instance);
    }

    /**
     * Tracks a promise which should be bound to the lifetime of this model.
     * @returns {Promise} - the original promise
     */
    protected trackPromise<T>(promise: Promise<T>): Promise<T> {
        let isPromiseDone = false;

        let disposable = this.scope.attach({
            dispose: () => {
                if (!isPromiseDone && promise.cancel) {
                    promise.cancel();
                }
            }
        });

        let complete = () => {
            isPromiseDone = true;
            disposable.dispose();
        };

        promise.done(complete, complete);

        return promise;
    }

    /**
     * Creates an observable if needed around the raw value passed in, or returns the
     * value if it is already observable.
     */
    protected wrapObservable<T>(value: T | KnockoutObservable<T>): KnockoutObservable<T> {
        return this.isObservable(value) ? value : this.createObservable(value);
    }

    /**
     * Returns the peeked value of the possible observable, or just the raw value if
     * the parameter is not an observable.
     */
    protected peekUnwrapObservable<T>(value: T | KnockoutObservable<T>): T {
        return this.isObservable(value) ? value.peek() : value;
    }

    /**
     * A wrapper around ko.observable
     */
    protected createObservable<T>(value?: T): KnockoutObservable<T> {
        return ko.observable(value);
    }

    /**
     * A wrapper around ko.unwrap (which itself is just a wrapper around ko.utils.unwrapObservable)
     */
    protected unwrapObservable<T>(value: T | KnockoutObservable<T>) {
        return ko.unwrap(value);
    }

    /**
     * Determines whether or not a given value is an observable.
     *
     * @protected
     * @template T
     * @param {(T | KnockoutObservable<T>)} value
     * @returns {value is KnockoutObservable<T>}
     */
    protected isObservable<T>(value: T | KnockoutObservable<T>): value is KnockoutObservable<T> {
        return ko.isObservable(value);
    }

    /**
     * Defers evaluation of the given task to the end of the execution queue.
     */
    private _BaseModel_setupBackgroundTask<T extends () => void>(task: T): T {
        this._backgroundTasks.unshift(task);

        if (!this._backgroundTasksId) {
            this._backgroundTasksId = this.async.setImmediate(() => {
                while (this._backgroundTasks.length) {
                    this._backgroundTasks.pop()();
                }

                delete this._backgroundTasksId;
            });
        }

        return task;
    }
}

function isKnockoutComputedOptions<T>(optionsOrCallback: (() => T) | KnockoutComputedDefine<T>): optionsOrCallback is KnockoutComputedDefine<T> {
    'use strict';

    return typeof optionsOrCallback === 'object';
}

export = BaseModel;
