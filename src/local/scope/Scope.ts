
import IDisposable from '../disposable/IDisposable';
import { isDisposable, hook } from '../disposable/Disposable';
import IConstructor from '../interfaces/IConstructor';

/**
 * Represents a scope which can be used to manage component lifetime.
 *
 * @export
 * @interface IScope
 */
export interface IScope {
    /**
     * Whether or not this scope is in a disposed state.
     *
     * @type {boolean}
     */
    isDisposed: boolean;

    /**
     * Produces a constructor for instances of a type which will be bound to the lifetime
     * of this scope.
     *
     * @template T the type of object to be created.
     * @param {T} the original constructor for the type.
     * @returns {T} a new constructor to invoke to create the object.
     */
    attached<T extends IConstructor>(type: T): T;

    /**
     * Attaches an object to the lifetime of this scope.
     * Disposing this scope will subsequently dispose the object.
     *
     * @template T the type of the object.
     * @param {T} disposable the object to be attached to this scope.
     * @returns {T} the object, now marked as disposable
     */
    attach<T extends IDisposable>(disposable: T): T;
    attach<T>(instance: T): T & IDisposable;
}

export interface IScopeParams {
    /**
     * A constructor wrapper to use for types created within the scope.
     *
     * @template T
     * @param {T} type
     * @returns {T}
     */
    wrap?<T extends IConstructor>(type: T): T;
}

export interface IScopeDependencies {
    // None needed.
}

interface IDisposablesById {
    [id: string]: IDisposable;
}

/**
 * Lifetime manager for scoping components.
 *
 * @export
 * @class Scope
 * @implements {IDisposable}
 *
 * @example
 *  let scope = new Scope({
 *      wrap: <T extends IConstructor>(type: T) => this.resources.injected(type)
 *  });
 *
 *  let instance = new (scope.attached(MyComponent))();
 *
 *  scope.dispose();
 */
export default class Scope implements IScope, IDisposable {
    /**
     * Whether or not this scope has been disposed.
     *
     * @type {boolean}
     */
    public isDisposed: boolean;

    /**
     * A mapping of objects to be disposed within this scope.
     *
     * @private
     * @type {IDisposablesById}
     */
    private _disposables: IDisposablesById;

    /**
     * The last id assigned to a disposable.
     *
     * @private
     * @type {number}
     */
    private _lastDisposableId: number;

    /**
     * Creates an instance of Scope.
     *
     * @param {IScopeParams} [params={}]
     * @param {IScopeDependencies} [dependencies={}]
     */
    constructor(params: IScopeParams = {}, dependencies: IScopeDependencies = {}) {
        let {
            wrap = this._wrap
        } = params;

        this._wrap = wrap;

        this._disposables = {};

        this._lastDisposableId = 0;
    }

    /**
     * Produces a constructor for instances of a type which will be bound to the lifetime
     * of this scope.
     *
     * @template T the type of object to be created.
     * @param {T} the original constructor for the type.
     * @returns {T} a new constructor to invoke to create the object.
     */
    public attached<T extends IConstructor>(type: T): T {
        let scope = this;

        let {
            _wrap: wrap
        } = this;

        let Wrapped = wrap(type);

        let attachedConstructor = function Attached (...args: any[]) {
            let instance = Wrapped.apply(this, args) || this;

            scope.attach(instance);

            return instance;
        };

        if (DEBUG) {
            let {
                name
            } = <{ name?: string; }>attachedConstructor;

            if (name) {
                let {
                    name: typeName = name
                } = <{ name?: string; }>type;

                let attachedDefinition = attachedConstructor.toString().replace(name, typeName);

                /* tslint:disable:no-eval */
                attachedConstructor = eval(`(${attachedDefinition})`);
                /* tslint:enable:no-eval */
            }
        }

        let Attached: T = <any>attachedConstructor;

        Attached.prototype = Wrapped.prototype;

        return Attached;
    }

    /**
     * Attaches an object to the lifetime of this scope.
     * Disposing this scope will subsequently dispose the object.
     *
     * @template T the type of the object.
     * @param {T} disposable the object to be attached to this scope.
     * @returns {T} the object, now marked as disposable
     */
    public attach<T extends IDisposable>(disposable: T): T;
    public attach<T>(instance: T): T & IDisposable;
    public attach(instance: any): IDisposable {
        let id = `${++this._lastDisposableId}`;

        let disposable = hook(instance, () => {
            delete this._disposables[id];
        });

        this._disposables[id] = disposable;

        return disposable;
    }

    /**
     * Disposes this scope and any attached objects.
     */
    public dispose(): void {
        if (!this.isDisposed) {
            this.isDisposed = true;
        }

        for (let id of Object.keys(this._disposables)) {
            let disposable = this._disposables[id];

            if (disposable && isDisposable(disposable)) {
                disposable.dispose();
            }

            delete this._disposables[id];
        }
    }

    private _wrap<T extends IConstructor>(type: T): T {
        return type;
    }
}
