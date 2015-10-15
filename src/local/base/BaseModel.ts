// OneDrive:IgnoreCodeCoverage

import ko = require('knockout');
import EventGroup = require('odsp-utilities/events/EventGroup');
import Async = require('odsp-utilities/async/Async');
import ResourceScope = require('../utilities/resources/ResourceScope');
import IBaseModelParams = require('./IBaseModelParams');
import IDisposable = require('./IDisposable');
import IKnockoutComputedOptions = require('./IKnockoutComputedOptions');
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

    constructor(params?: IBaseModelParams) {
        this.isDisposed = false;

        this._disposables = {};
        this._lastDisposableIdOrdinal = 0;

        this.id = params && params.id || '';
        this.resources = this.resources || params && params.resources;

        this.async = new (this.managed(Async))(this);
        this.events = new (this.managed(EventGroup))(this);
    }

    public dispose() {
        if (!this.isDisposed) {
            this.isDisposed = true;

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
    protected createComputed<T>(callback: () => T, options?: IKnockoutComputedOptions): KnockoutComputed<T> {
        /* tslint:disable:ban */
        let computed = ko.computed(callback, this, options);
        /* tslint:enable:ban */

        this.addDisposable(computed);

        return computed;
    }

    /**
     * Creates a ko.pureComputed value that gets disposed with 'this'.
     * @param callback - the computed callback.
     */
    protected createPureComputed<T>(callback: () => T): KnockoutComputed<T> {
        return this.createComputed(callback, { pure: true });
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
     * var action = new (this.managed(MyModel))(arg1, arg2, arg3);
     */
    protected managed<T extends new (...args: any[]) => any>(type: T): T {
        var _this = this;

        // Obtain the proxy type for a resourced version of the original type.
        var injected = this.resources && this.resources.injected(type) || type;

        // Create a proxy constructor which registers disposal after invoking the real constructor.
        var creator = function (...args: any[]) {
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
    protected addDisposable(instance: any): IDisposable;
    protected addDisposable<T extends IDisposable>(disposable: T | IDisposable): IDisposable {
        let id = '' + (++this._lastDisposableIdOrdinal);

        disposable = Disposable.hook(disposable, () => {
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
}

export = BaseModel;