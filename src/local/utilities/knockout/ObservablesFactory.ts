
import Component, { IComponentParams, IComponentDependencies } from '@ms/odsp-utilities/lib/component/Component';
import Async from '@ms/odsp-utilities/lib/async/Async';
import ko = require('knockout');

export interface IKnockoutFactoryParams extends IComponentParams {
    /**
     * The owner of all provided callbacks.
     * All callbacks provided for computed observables or subscriptions
     * will be evaluated in the context of this object.
     *
     * @type {*}
     */
    owner?: any;
}

export interface IKnockoutFactoryDependencies extends IComponentDependencies {
    /**
     * An override for the async helper type constructed by this class.
     *
     * @type {typeof Async}
     */
    Async?: typeof Async;
}

/**
 * Component which acts as a factory and registry for Knockout observables.
 * All observables, computed observables, and subscriptions created by this component
 * will be bound to this component's lifetime.
 *
 * @export
 * @class ObservablesFactory
 * @extends {Component}
 *
 * @example
 *  let scope = new Scope();
 *  let observables = new (scope.attached(ObservablesFactory))();
 *  let value = observables.create<string>('test');
 *  let length = observables.compute(() => value.length);
 *  ...
 *  scope.dispose(); // Cleans up the scope and all computed subscriptions.
 */
export default class ObservablesFactory extends Component {
    /**
     * A queue of pending initialization calls for background tasks.
     *
     * @private
     */
    private _backgroundTasks: (() => void)[];

    /**
     * The owner of all provided callbacks.
     * All callbacks provided for computed observables or subscriptions
     * will be evaluated in the context of this object.
     *
     * @private
     * @type {*}
     */
    private _owner: any;

    /**
     * An id for a scheduled timeout to execute the queue of background tasks.
     *
     * @private
     * @type {number}
     */
    private _backgroundTasksTimeoutId: number;

    /**
     * A helper for async tasks.
     *
     * @private
     * @type {Async}
     */
    private _async: Async;

    /**
     * Creates an instance of ObservablesFactory.
     *
     * @param {IKnockoutFactoryParams} [params={}]
     * @param {IKnockoutFactoryDependencies} [dependencies={}]
     */
    public constructor(params: IKnockoutFactoryParams = {}, dependencies: IKnockoutFactoryDependencies = {}) {
        super(params, dependencies);

        let {
            owner
        } = params;

        this._owner = owner;

        let {
            Async: asyncType = Async
        } = dependencies;

        this._async = new (this.scope.attached(asyncType))();
    }

    /**
     * Creates a subscription to an observable with the specified callback.
     * The subscription will be bound to the lifetime of this factory.
     *
     * @template T
     * @param {KnockoutSubscribable<T>} thing
     * @param {(value: T) => void} callback
     * @param {boolean} [isBeforeChange=false]
     * @returns {KnockoutSubscription}
     */
    public subscribe<T>(subscribable: KnockoutSubscribable<T>, callback: (value: T) => void, {
        isBeforeChange = false
    }: {
        isBeforeChange?: boolean;
    } = {}): KnockoutSubscription {
        let eventName: string;

        if (isBeforeChange) {
            eventName = 'beforeChange';
        }

        return this.scope.attach(subscribable.subscribe(callback, this, eventName));
    }

    /**
     * Creates a ko.computed value that gets disposed with 'this'.
     * @param callback - the computed callback.
     */
    public compute<T>(options?: KnockoutComputedDefine<T>): KnockoutComputed<T>;
    public compute<T>(callback: () => T, options?: KnockoutComputedOptions<T>): KnockoutComputed<T>;
    public compute<T>(optionsOrCallback: (() => T) | KnockoutComputedDefine<T>, options?: KnockoutComputedOptions<T>) {
        let definition: KnockoutComputedDefine<T>;

        if (isKnockoutComputedOptions(optionsOrCallback)) {
            options = {
                owner: this._owner
            };

            definition = ko.utils.extend(options, optionsOrCallback);
        } else {
            definition = {
                read: optionsOrCallback,
                owner: this._owner
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
    public pureCompute<T>(callback: () => T, options?: KnockoutComputedOptions<T>): KnockoutComputed<T> {
        let pureOptions: KnockoutComputedOptions<T> = {
            pure: true
        };

        if (options) {
            ko.utils.extend(pureOptions, options);
        }

        return this.compute(callback, pureOptions);
    }

    /**
     * Creates a deferred ko.computed value that gets disposed with 'this'.
     * @param callback - the computed callback.
     */
    public backgroundCompute(callback: () => void, options?: KnockoutComputedOptions<void>): KnockoutComputed<void> {
        let deferredOptions: KnockoutComputedOptions<void> = {
            deferEvaluation: true
        };

        if (options) {
            ko.utils.extend(deferredOptions, options);
        }

        return this._BaseModel_setupBackgroundTask(this.compute(callback, deferredOptions));
    }

    /**
     * Creates an observable if needed around the raw value passed in, or returns the
     * value if it is already observable.
     */
    public wrap<T>(value: T | KnockoutObservable<T>): KnockoutObservable<T> {
        return this.isObservable(value) ? value : this.create(value);
    }

    /**
     * Returns the peeked value of the possible observable, or just the raw value if
     * the parameter is not an observable.
     */
    public peekUnrap<T>(value: T | KnockoutObservable<T>): T {
        return this.isObservable(value) ? value.peek() : value;
    }

    /**
     * A wrapper around ko.observable
     */
    public create<T>(value?: T): KnockoutObservable<T> {
        return ko.observable(value);
    }

    /**
     * A wrapper around ko.unwrap (which itself is just a wrapper around ko.utils.unwrapObservable)
     */
    public unwrap<T>(value: T | KnockoutObservable<T>) {
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
    public isObservable<T>(value: T | KnockoutObservable<T>): value is KnockoutObservable<T> {
        return ko.isObservable(value);
    }

    /**
     * Defers evaluation of the given task to the end of the execution queue.
     */
    private _BaseModel_setupBackgroundTask<T extends () => void>(task: T): T {
        this._backgroundTasks.unshift(task);

        if (!this._backgroundTasksTimeoutId) {
            this._backgroundTasksTimeoutId = this._async.setImmediate(() => {
                while (this._backgroundTasks.length) {
                    this._backgroundTasks.pop()();
                }

                delete this._backgroundTasksTimeoutId;
            });
        }

        return task;
    }
}

function isKnockoutComputedOptions<T>(optionsOrCallback: (() => T) | KnockoutComputedDefine<T>): optionsOrCallback is KnockoutComputedDefine<T> {
    'use strict';

    return typeof optionsOrCallback === 'object';
}
