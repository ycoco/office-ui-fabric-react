
import { IResourceDependencies } from '@ms/odsp-utilities/lib/resources/Resources';
import EventGroup from '@ms/odsp-utilities/lib/events/EventGroup';
import { typeResourceKey as eventGroupTypeKey } from '@ms/odsp-utilities/lib/events/EventGroup.key';
import Async from '@ms/odsp-utilities/lib/async/Async';
import { typeResourceKey as asyncTypeKey } from '@ms/odsp-utilities/lib/async/Async.key';
import ObservablesFactory, { IKnockoutFactoryParams, isObservable, peekUnwrap, unwrap } from '../utilities/knockout/ObservablesFactory';
import { typeResourceKey as observablesFactoryTypeKey } from '../utilities/knockout/ObservablesFactory.key';
import { IDisposable } from '@ms/odsp-utilities/lib/interfaces/IDisposable';
import Promise from '@ms/odsp-utilities/lib/async/Promise';
import Component, { IComponentParams, IComponentDependencies } from '@ms/odsp-utilities/lib/component/Component';

export interface IBaseModelParams extends IComponentParams {
    /**
     * An identitifer to disambiguate this model against other model instances.
     * Optional.
     *
     * @type {string}
     */
    id?: string;
}

export interface IBaseModelDependencies extends IComponentDependencies {
    /**
     * An override for the event group type constructed by the base model.
     * Used for testing only.
     *
     * @type {typeof EventGroup}
     */
    EventGroup?: new (owner?: any) => EventGroup;

    /**
     * An override for the async type constructed by the base model.
     * Used for testing only.
     *
     * @type {typeof Async}
     */
    Async?: new (owner?: any) => Async;

    /**
     * An override for the observables factory type constructed by the base model.
     * Used for testing only.
     *
     * @type {typeof ObservablesFactory}
     */
    ObservablesFactory?: new (params?: IKnockoutFactoryParams) => ObservablesFactory;
}

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
export class BaseModel extends Component {
    public static readonly dependencies: IResourceDependencies<IBaseModelDependencies> = {
        ...Component.dependencies,
        Async: asyncTypeKey,
        ObservablesFactory: observablesFactoryTypeKey,
        EventGroup: eventGroupTypeKey
    };

    /**
     * Gets a deterministic unique identifier for this model.
     */
    protected readonly id: string;

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

    // Note: all private fields and methods in this class are prefixed with '_BaseModel' to minimize
    // conflicts with derived classes.

    private readonly _BaseModel_asyncType: typeof asyncTypeKey.type;
    private readonly _BaseModel_eventGroupType: typeof eventGroupTypeKey.type;
    private readonly _BaseModel_observablesFactoryType: typeof observablesFactoryTypeKey.type;

    constructor(params: IBaseModelParams = {}, dependencies: IBaseModelDependencies = {}) {
        super(params, dependencies);

        const {
            id = ''
        } = params;

        this.id = id;

        // The 'Async' and 'EventGroup' dependencies have legacy names of 'async', and 'events',
        // respectively. Fall back to those fields if the current ones are not defined.
        const {
            Async: asyncType,
            EventGroup: eventGroupType,
            ObservablesFactory: observablesFactoryType
        } = dependencies;

        // Assign fields only if dependency overrides are provided.
        // In normal usage, these will all be undefined, so there is no need to even attach
        // the field to the current object instance.
        if (asyncType) {
            this._BaseModel_asyncType = asyncType;
        }
        if (eventGroupType) {
            this._BaseModel_eventGroupType = eventGroupType;
        }
        if (observablesFactoryType) {
            this._BaseModel_observablesFactoryType = observablesFactoryType;
        }
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
    protected createComputed<T>(optionsOrCallback?: KnockoutComputedDefine<T> | (() => T), options?: KnockoutComputedOptions<T>) {
        return this.observables.compute(optionsOrCallback as (() => T), options);
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
    protected addDisposable<T>(instance: T): T & IDisposable {
        return this.scope.attach(instance);
    }

    /**
     * Tracks a promise which should be bound to the lifetime of this model.
     * @returns {Promise} - the original promise
     */
    protected trackPromise<T>(promise: Promise<T>): Promise<T> {
        let isPromiseDone = false;

        const disposable = this.scope.attach({
            dispose: () => {
                if (!isPromiseDone && promise.cancel) {
                    promise.cancel();
                }
            }
        });

        const complete = () => {
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
        return peekUnwrap<T>(value);
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
    protected unwrapObservable<T>(value: T | KnockoutObservable<T>): T {
        return unwrap(value);
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
        return isObservable(value);
    }

    /**
     * Lazy-initializes the `async` field.
     *
     * @private
     * @returns {Async}
     */
    private _BaseModel_getAsync(): Async {
        const {
            _BaseModel_asyncType: asyncType = Async
        } = this;

        const async = new (this.scope.attached(asyncType))(this);

        this._BaseModel_getAsync = () => async;

        return async;
    }

    /**
     * Lazy-initializes the `events` field.
     *
     * @private
     * @returns {EventGroup}
     */
    private _BaseModel_getEvents(): EventGroup {
        const {
            _BaseModel_eventGroupType: eventGroupType = EventGroup
        } = this;

        const events = new (this.scope.attached(eventGroupType))(this);

        this._BaseModel_getEvents = () => events;

        return events;
    }

    /**
     * Lazy-initializes the `observables` field.
     *
     * @private
     * @returns {ObservablesFactory}
     */
    private _BaseModel_getObservables(): ObservablesFactory {
        const {
            _BaseModel_observablesFactoryType: observablesFactoryType = ObservablesFactory
        } = this;

        const observables = new (this.scope.attached(observablesFactoryType))({
            owner: this
        });

        this._BaseModel_getObservables = () => observables;

        return observables;
    }
}

export default BaseModel;
