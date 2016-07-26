
import IBaseModelParams = require('./IBaseModelParams');
import IBaseModelDependencies from './IBaseModelDependencies';
import EventGroup from '@ms/odsp-utilities/lib/events/EventGroup';
import Async from '@ms/odsp-utilities/lib/async/Async';
import ObservablesFactory from '../utilities/knockout/ObservablesFactory';
import { IDisposable } from '@ms/odsp-utilities/lib/interfaces/IDisposable';
import Promise from '@ms/odsp-utilities/lib/async/Promise';
import Component from '@ms/odsp-utilities/lib/component/Component';

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
    protected get async(): Async {
        return this._BaseModel_getAsync();
    }

    /**
     * Gets an event registry attached to the lifetime of this model.
     * Event callbacks will be bound to this model by default.
     */
    protected get events(): EventGroup {
        return this._BaseModel_getEvents();
    }

    /**
     * Gets a factory and registry for Knockout observables
     * which will be bound to the lifetime of this model.
     *
     * @readonly
     * @protected
     * @type {ObservablesFactory}
     */
    protected get observables(): ObservablesFactory {
        return this._BaseModel_getObservables();
    }

    private _BaseModel_getEvents: () => EventGroup;
    private _BaseModel_getAsync: () => Async;
    private _BaseModel_getObservables: () => ObservablesFactory;

    constructor(params: IBaseModelParams = {}, dependencies: IBaseModelDependencies = {}) {
        super(params, dependencies);

        let {
            id = ''
        } = params;

        this.id = id;

        let asyncType: typeof Async;
        let eventGroupType: typeof EventGroup;
        let observablesFactoryType: typeof ObservablesFactory;

        ({
            Async: asyncType = ({
                async: asyncType = Async
            } = dependencies, asyncType),
            EventGroup: eventGroupType = ({
                events: eventGroupType = EventGroup
            } = dependencies, eventGroupType),
            ObservablesFactory: observablesFactoryType = ObservablesFactory
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

        this._BaseModel_getObservables = () => {
            let observables = new (this.scope.attached(observablesFactoryType))({
                owner: this
            });

            this._BaseModel_getObservables = () => observables;

            return observables;
        };
    }

    /**
     * Creates a subscription to an observable with the specified callback.
     *
     * @protected
     * @template T
     * @param {KnockoutSubscribable<T>} subscribable
     * @param {(value: T) => void} callback
     * @param {boolean} [isBeforeChange]
     * @returns {KnockoutSubscription}
     */
    protected subscribe<T>(subscribable: KnockoutSubscribable<T>, callback: (value: T) => void, isBeforeChange?: boolean): KnockoutSubscription {
        return this.observables.subscribe(subscribable, callback, isBeforeChange);
    }

    /**
     * Creates a ko.computed value that gets disposed with 'this'.
     * @param callback - the computed callback.
     */
    protected createComputed<T>(options?: KnockoutComputedDefine<T>): KnockoutComputed<T>;
    protected createComputed<T>(callback: () => T, options?: KnockoutComputedOptions<T>): KnockoutComputed<T>
    protected createComputed<T>(optionsOrCallback?: any, options?: any) {
        return this.observables.compute(optionsOrCallback, options);
    }

    /**
     * Creates a ko.pureComputed value that gets disposed with 'this'.
     * @param callback - the computed callback.
     */
    protected createPureComputed<T>(callback: () => T, options?: KnockoutComputedOptions<T>): KnockoutComputed<T> {
        return this.observables.pureCompute(callback, options);
    }

    /**
     * Creates a deferred ko.computed value that gets disposed with 'this'.
     * @param callback - the computed callback.
     */
    protected createBackgroundComputed(callback: () => void, options?: KnockoutComputedOptions<void>): KnockoutComputed<void> {
        return this.observables.backgroundCompute(callback, options);
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
        return this.observables.wrap(value);
    }

    /**
     * Returns the peeked value of the possible observable, or just the raw value if
     * the parameter is not an observable.
     */
    protected peekUnwrapObservable<T>(value: T | KnockoutObservable<T>): T {
        return this.observables.peekUnrap(value);
    }

    /**
     * A wrapper around ko.observable
     */
    protected createObservable<T>(value?: T): KnockoutObservable<T> {
        return this.observables.create(value);
    }

    /**
     * A wrapper around ko.unwrap (which itself is just a wrapper around ko.utils.unwrapObservable)
     */
    protected unwrapObservable<T>(value: T | KnockoutObservable<T>) {
        return this.observables.unwrap(value);
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
        return this.observables.isObservable(value);
    }
}

export = BaseModel;
