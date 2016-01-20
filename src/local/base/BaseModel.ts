// OneDrive:IgnoreCodeCoverage

/// <reference path='../../knockout/knockout.d.ts' />

import IBaseModelDependencies from './IBaseModelDependencies';
import ko = require('knockout');
import EventGroup = require('odsp-utilities/events/EventGroup');
import Async = require('odsp-utilities/async/Async');
import ResourceScope = require('../utilities/resources/ResourceScope');
import IBaseModelParams = require('./IBaseModelParams');
import IDisposable = require('./IDisposable');
import Disposable from './Disposable';
import Promise from 'odsp-utilities/async/Promise';

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
class BaseModel implements IDisposable {
    /**
     * Gets the resources injected into this model.
     */
    public resources: ResourceScope;

    /**
     * Gets a deterministic unique identifier for this model.
     */
    protected id: string;

    /**
     * Gets an async helper attached to the lifetime of this model.
     * Async callbacks will be bound to this model by default.
     */
    protected async: Async;

    /**
     * Gets an event registry attached to the lifetime of this model.
     * Event callbacks will be bound to this model by default.
     */
    protected events: EventGroup;

    /**
     * Whether or not this model is diposed.
     */
    protected isDisposed: boolean;

    /**
     * A map tracking disposable child components.
     */
    private _disposables: {
        [id: string]: IDisposable;
    };

    /**
     * The last id assigned to a disposable child.
     */
    private _lastDisposableIdOrdinal: number;

    /**
     * A list of scheduled tasks to run
     */
    private _backgroundTasks: (() => void)[];

    constructor(params?: IBaseModelParams, dependencies?: IBaseModelDependencies) {
        this.isDisposed = false;

        this._disposables = {};
        this._lastDisposableIdOrdinal = 0;

        this.id = params && params.id || '';
        this.resources = this.resources || params && params.resources;

        this.async = new (this.managed(dependencies && dependencies.async || Async))(this);
        this.events = new (this.managed(dependencies && dependencies.events || EventGroup))(this);
    }

    public dispose() {
        if (!this.isDisposed) {
            this.isDisposed = true;

            if (this._backgroundTasks) {
                this._backgroundTasks.length = 0;
            }

            for (let id of Object.keys(this._disposables)) {
                let disposable = this._disposables[id];

                if (disposable && disposable.dispose) {
                    disposable.dispose();
                }

                delete this._disposables[id];
            }
        }
    }

    protected subscribe<T>(thing: KnockoutSubscribable<T>, callback: (value: T) => void, isBeforeChange?: boolean): KnockoutSubscription {
        let subscription: KnockoutSubscription;

        if (isBeforeChange) {
            subscription = thing.subscribe(callback, this, 'beforeChange');
        } else {
            subscription = thing.subscribe(callback, this);
        }

        this.addDisposable(subscription);

        return subscription;
    }

    /**
     * Creates a ko.computed value that gets disposed with 'this'.
     * @param callback - the computed callback.
     */
    protected createComputed<T>(options?: KnockoutComputedDefine<T>): KnockoutComputed<T>;
    protected createComputed<T>(callback: () => T, options?: KnockoutComputedOptions<T>): KnockoutComputed<T>
    protected createComputed<T>(optionsOrCallback: (() => T) | KnockoutComputedDefine<T>, options?: KnockoutComputedOptions<T>) {
        let definition: KnockoutComputedDefine<T>;

        if (typeof optionsOrCallback === 'object') {
            options = {
                owner: this
            };

            definition = ko.utils.extend(options, <KnockoutComputedDefine<T>>optionsOrCallback);
        } else {
            definition = {
                read: <() => T>optionsOrCallback,
                owner: this
            };

            if (options) {
                ko.utils.extend(definition, options);
            }
        }

        /* tslint:disable:ban */
        let computed = ko.computed(definition);
        /* tslint:enable:ban */

        return this.addDisposable(computed);
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

        let computed = this.createComputed(callback, deferredOptions);
        this._setupBackgroundTask(computed);
        return computed;
    }

    /**
     * Creates a constructor for instances of the given type which will inherit the resources
     * from this model and hook up to the disposal chain.
     * Within a class derived from BaseModel, use BaseModel.managed to create child objects
     * instead of ResourceScope.managed. It will ensure that child objects are properly
     * disposed with the parent.
     * @param type - a constructable type.
     * @returns a new version of the constructor for the given type.
     * @example
     * // Construct an instance of MyModel using the arguments normally passed to MyModel's constructor.
     * let action = new (this.managed(MyModel))(arg1, arg2, arg3);
     */
    protected managed<T extends new (...args: any[]) => any>(type: T): T {
        let _this = this;

        // Obtain the proxy type for a resourced version of the original type.
        let injected = this.resources && this.resources.injected(type) || type;

        // Create a proxy constructor which registers disposal after invoking the real constructor.
        let creator = function (...args: any[]) {
            let instance = injected.apply(this, args);

            _this.addDisposable(this);

            return instance;
        };

        // Set the prototype of the proxy constructor to real prototype.
        creator.prototype = injected.prototype;

        return <any>creator;
    }

    /**
     * Adds the given instance to the disposal chain for this model.
     */
    protected addDisposable<T extends IDisposable>(disposable: T): T;
    protected addDisposable<T>(instance: T): T & IDisposable;
    protected addDisposable(instance: any): IDisposable {
        let id = '' + (++this._lastDisposableIdOrdinal);

        let disposable = Disposable.hook(instance, () => {
            delete this._disposables[id];
        });

        this._disposables[id] = disposable;

        return disposable;
    }

    /**
     * Tracks a promise which should be bound to the lifetime of this model.
     * @returns {Promise} - the original promise
     */
    protected trackPromise<T>(promise: Promise<T>): Promise<T> {
        let isPromiseDone = false;

        let disposable = this.addDisposable({
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
     * Defers evaluation of the given task to the end of the execution queue.
     */
    private _setupBackgroundTask<T extends () => void>(task: T) {
        if (!this._backgroundTasks) {
            this._backgroundTasks = [];

            this.async.setImmediate(() => {
                while (this._backgroundTasks.length) {
                    this._backgroundTasks.pop()();
                }
            });
        }

        this._backgroundTasks.unshift(task);
    }
}

export = BaseModel;