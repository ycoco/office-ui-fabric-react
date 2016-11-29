
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
 *  const scope = new Scope();
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
     */
    constructor() {
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
        const scope = this;
        let Attached = function (this: T) {
            return scope.attach(type.apply(this, arguments) || this);
        };

        if (DEBUG) {
            // This pattern results in the correct type being displayed in the debugger
            const wrappedConstructor = Attached;
            Attached = function (this: T) {
                return wrappedConstructor.apply(Object.create(type.prototype), arguments);
            };
        }

        Attached.prototype = type.prototype;
        return <any>Attached;
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
        const id = `${++this._lastDisposableId}`;

        const disposable = hook(instance, () => {
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

        const disposables = this._disposables;
        for (const id of Object.keys(disposables)) {
            const disposable = disposables[id];

            if (disposable && isDisposable(disposable)) {
                disposable.dispose();
            }

            delete disposables[id];
        }
    }
}
