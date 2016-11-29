import './Projections';

import Scope, { IScope } from '@ms/odsp-utilities/lib/scope/Scope';
import Async from '@ms/odsp-utilities/lib/async/Async';
import ko = require('knockout');

export interface IKnockoutFactoryParams {
    /**
     * The owner of all provided callbacks.
     * All callbacks provided for computed observables or subscriptions
     * will be evaluated in the context of this object.
     *
     * @type {*}
     */
    owner?: any;
}

export interface IKnockoutFactoryDependencies {
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
 * In general, web layer code should endeavor to use only this class to create
 * and manage observables and computed observables from the Knockout library.
 * This component provides automatic support for many best-practices when working
 * with Knockout and observables.
 *
 * @export
 * @class ObservablesFactory
 *
 * @example
 *  let scope = new Scope();
 *  let observables = new (scope.attached(ObservablesFactory))();
 *  let value = observables.create<string>('test');
 *  let length = observables.compute(() => value.length);
 *  ...
 *  scope.dispose(); // Cleans up the scope and all computed subscriptions.
 */
export default class ObservablesFactory {
    /**
     * A scope to manage the lifetime of observables.
     *
     * @protected
     * @type {IScope}
     */
    protected get scope(): IScope {
        return this._scope || (this._scope = new Scope());
    };

    private _scope: Scope;

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
     * The type of the async helper that will be used for background tasks.
     *
     * @private
     * @type {typeof Async}
     */
    private _asyncType: typeof Async;

    /**
     * Creates an instance of ObservablesFactory.
     *
     * @param {IKnockoutFactoryParams} [params={}]
     * @param {IKnockoutFactoryDependencies} [dependencies={}]
     */
    public constructor(params: IKnockoutFactoryParams = {}, dependencies: IKnockoutFactoryDependencies = {}) {
        const {
            owner
        } = params;

        this._owner = owner;

        const {
            Async: asyncType
        } = dependencies;

        if (asyncType) {
            this._asyncType = asyncType;
        }
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

        return this.scope.attach(subscribable.subscribe(callback, this._owner, eventName));
    }

    /**
     * Creates a new observable, with an optional initial value.
     * This returns a vanilla Knockout observable. Use this wrapper method
     * to ensure future-compatibility with future Knockout changes.
     *
     * @template T
     * @param {T} [value]
     * @returns {KnockoutObservable<T>}
     *
     * @example
     *  class ButtonViewModel extends ViewModel {
     *      public isActive: KnockoutObservable<boolean>;
     *
     *      constructor(...) {
     *          this.isActive = this.observables.create(false);
     *      }
     *  }
     */
    public create<T>(value?: T): KnockoutObservable<T> {
        return ko.observable(value);
    }

    /**
     * Creates an observable array with the given initial array.
     * This method produces an observable array, which is a wrapper around
     * an underlying Array instance that fires change notifications.
     * A Knockout observable array provides wrapper methods which modify the underlying
     * array and then fire update notifications, even though the actual value within the
     * observable is the same (same array instance).
     * An observable array also provides an 'arrayChange' event, which provides information
     * about change deltas to subscribers.
     *
     * @template T
     * @param {T[]} [value]
     * @returns {KnockoutObservableArray<T>}
     *
     * @example
     *  let items = this.observables.createArray<IItem>();
     *
     *  let length = this.observables.pureCompute(() => items().length);
     *
     *  expect(length()).to.equal(0);
     *
     *  items.push({ name: 'A' });
     *
     *  expect(items.peek()[0].name).to.equal('A');
     *
     *  expect(length()).to.equal(1);
     */
    public createArray<T>(value?: T[]): KnockoutObservableArray<T> {
        return ko.observableArray(value);
    }

    /**
     * Creates a new computed observable with the specified callback.
     * Unless specified otherwise, the callback will be executed sychronously during
     * creation of the computed observable, and will subscribe to any dependencies.
     *
     * If the callback function is not intended to cause side-effects, use
     * {ObservablesFactory.pureCompute} instead.
     *
     * @template T
     * @param {() => T} callback
     * @param {KnockoutComputedOptions<T>} [options]
     * @returns {KnockoutComputed<T>}
     */
    public compute<T>(callback: () => T, options?: KnockoutComputedOptions<T>): KnockoutComputed<T>;
    /**
     * Creates a new computed observable with the specified options.
     * Unless specified otherwise, the callback will be executed sychronously during
     * creation of the computed observable, and will subscribe to any dependencies.
     *
     * Use this overload optionally to create writeable computed observables, by supplying both
     * {read} and {write} as options.
     *
     * If the callback function is not intended to cause side-effects, use
     * {ObservablesFactory.pureCompute} instead.
     *
     * @template T
     * @param {KnockoutComputedDefine<T>} [options]
     * @returns {KnockoutComputed<T>}
     */
    public compute<T>(options?: KnockoutComputedDefine<T>): KnockoutComputed<T>;
    public compute<T>(optionsOrCallback: (() => T) | KnockoutComputedDefine<T>, options?: KnockoutComputedOptions<T>) {
        const baseOptions = {
            owner: this._owner,
            disposeWhen: () => this.scope.isDisposed
        };

        const extension: KnockoutComputedDefine<T> = isKnockoutComputedOptions(optionsOrCallback) ?
            optionsOrCallback :
            {
                read: optionsOrCallback
            };

        const definition = ko.utils.extend(baseOptions, extension);

        if (options) {
            ko.utils.extend(definition, options);
        }

        /* tslint:disable:ban */
        const computed = ko.computed(definition);
        /* tslint:enable:ban */

        return this.scope.attach(computed);
    }

    /**
     * Creates a new computed observable with a callback function that does not cause side-effects.
     * The resulting computed observable will not re-evaluate unless it is directly read, or has
     * subscribers. It will only re-evaluate in response to dependencies while there are subscribers
     * or if a dependency has changed since the last read.
     *
     * Use this method to create most computed observables. If the callback function only ever
     * reads values and other observables, use {pureCompute} and not {compute}.
     *
     * @template T
     * @param {() => T} callback
     * @param {KnockoutComputedOptions<T>} [options]
     * @returns {KnockoutComputed<T>}
     */
    public pureCompute<T>(callback: () => T, options?: KnockoutComputedOptions<T>): KnockoutComputed<T> {
        const pureOptions: KnockoutComputedOptions<T> = {
            pure: true
        };

        if (options) {
            ko.utils.extend(pureOptions, options);
        }

        return this.compute(callback, pureOptions);
    }

    /**
     * Creates a new computed observable to execute a background task which causes side-effects in response
     * to dependency changes.
     * The callback function will be first evaluated asynchronously, ensuring that it does not execute
     * before the host component is fully constructed.
     * Use this method to perform any activities or setup which is not immediately needed during initial creation.
     * This can help avoid cyclic dependencies between protected callbacks and constructors, and also avoid
     * deep stack traces during initial component construction.
     *
     * @param {() => void} callback
     * @param {KnockoutComputedOptions<void>} [options]
     * @returns {KnockoutComputed<void>}
     *
     * @example
     *  class UserViewModel extends ViewModel {
     *      public userInfo: KnockoutObservable<IUserInfo>;
     *
     *      private _userName: KnockoutObservable<string>;
     *
     *      constructor(...) {
     *          this._userName = this.observables.wrap(params.userName);
     *
     *          // Initialize a background task, which will start running
     *          // asynchronously as soon as possible.
     *          this.observables.backgroundCompute(this._computeLoadUserInfo);
     *      }
     *
     *      private _computeLoadUserInfo() {
     *          // Read and take a dependency on user name.
     *          // Whenever this updates, the background task will re-run.
     *          let userName = this._userName();
     *
     *          this._userInfoProvider.getUserInfo(userName).done((userInfo: IUserInfo) => {
     *              this._userInfo(userInfo);
     *          });
     *      }
     *  }
     */
    public backgroundCompute(callback: () => void, options?: KnockoutComputedOptions<void>): KnockoutComputed<void> {
        const deferredOptions: KnockoutComputedOptions<void> = {
            deferEvaluation: true
        };

        if (options) {
            ko.utils.extend(deferredOptions, options);
        }

        return this._setupBackgroundTask(this.compute(callback, deferredOptions));
    }

    /**
     * Wraps a value in an observable, or passes through a provided observable.
     * Use this method to ensure that a value can always be tracked as an observable,
     * if provided from input as a bare value.
     *
     * @template T
     * @param {(T | KnockoutObservable<T>)} value
     * @returns {KnockoutObservable<T>}
     */
    public wrap<T>(value: T | KnockoutObservable<T>): KnockoutObservable<T> {
        return this.isObservable(value) ? value : this.create(value);
    }

    /**
     * If the provided value is an observable, peeks (reads but does not subscribe) the value
     * of the observable. If the provided value is not an observable, returns the value.
     *
     * @template T
     * @param {(T | KnockoutObservable<T>)} value
     * @returns {T}
     */
    public peekUnwrap<T>(value: T | KnockoutObservable<T>): T {
        return this.isObservable(value) ? value.peek() : value;
    }

    /**
     * If the provided value is an observable, reads (and subscribes) to the value of the observable.
     * This will register the observable as a dependency of any currently-evaluating computed observable.
     *
     * @template T
     * @param {(T | KnockoutObservable<T>)} value
     * @returns
     */
    public unwrap<T>(value: T | KnockoutObservable<T>): T {
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
     * Executes the given callback in a context which will not subscribe to any observables
     * read within the callback.
     *
     * @template T
     * @param {() => T} callback
     * @returns {T}
     */
    public ignore<T>(callback: () => T): T {
        return ko.ignoreDependencies(callback);
    }

    public dispose(): void {
        if (this._scope) {
            this._scope.dispose();
        }
    }

    /**
     * Defers evaluation of the given task to the end of the execution queue.
     * Typically, this is invoked only during construction of the host component.
     * Once the background tasks have all run, there is no need to continue expecting
     * more background tasks.
     * However, it is possible that execution of a background task may schedule a new one.
     *
     * @private
     * @template T
     * @param {T} task
     * @returns {T}
     */
    private _setupBackgroundTask<T extends () => void>(task: T): T {
        if (!this._backgroundTasks) {
            // If the queue does not exist, create it.
            // Most components which use observables will not need the background task
            // feature.
            this._backgroundTasks = [];
        }

        // Push the task to the end of the queue.
        this._backgroundTasks.push(task);

        if (!this._backgroundTasksTimeoutId) {
            // If the activity to process the tasks has not been scheduled,
            // schedule it now.

            this._backgroundTasksTimeoutId = this._getAsync().setImmediate(() => this._runBackgoundTasks());
        }

        return task;
    }

    private _runBackgoundTasks() {
        while (this._backgroundTasks.length) {
            // Pull the task from the head of the queue.
            this._backgroundTasks.shift()();
        }

        // Clean up the state management for background tasks.
        delete this._backgroundTasksTimeoutId;
        delete this._backgroundTasks;
    }

    /**
     * Lazy-initializes the async helper.
     *
     * @private
     * @returns {Async}
     */
    private _getAsync(): Async {
        const {
            _asyncType: asyncType = Async
        } = this;

        const async = this.scope.attach(new asyncType(this));

        this._getAsync = () => async;

        return async;
    }
}

function isKnockoutComputedOptions<T>(optionsOrCallback: (() => T) | KnockoutComputedDefine<T>): optionsOrCallback is KnockoutComputedDefine<T> {
    'use strict';

    return typeof optionsOrCallback === 'object';
}
