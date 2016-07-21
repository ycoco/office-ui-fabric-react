
import IDisposable from '../disposable/IDisposable';
import { isDisposable, hook } from '../disposable/Disposable';
import ResourceScope = require('../resources/ResourceScope');

export interface IScopeParams {
    /**
     * Resources to provide within the scope.
     * Optional.
     * Generally, Scope instances should be constructed using `new (this.resources.injected(Scope))()`.
     * Only pass this parameter to Scope if the `ResourceScope.injected` wrapper is not used.
     *
     * @type {ResourceScope}
     */
    resources?: ResourceScope;
}

export interface IScopeDependencies {
    // None needed.
}

interface IDisposablesById {
    [id: string]: IDisposable;
}

export default class Scope implements IDisposable {
    /**
     * Whether or not this scope has been disposed.
     *
     * @type {boolean}
     */
    public isDisposed: boolean;

    /**
     * The resources available to this scope.
     *
     * @type {ResourceScope}
     */
    public resources: ResourceScope;

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
     * Generally, this constructor should not be used directly.
     * Instead, Scope instances should be created using the `ResourceScope.injected` wrapper.
     *
     * @param {IScopeParams} [params={}]
     * @param {IScopeDependencies} [dependencies={}]
     */
    constructor(params: IScopeParams = {}, dependencies: IScopeDependencies = {}) {
        let resources: ResourceScope;

        // Order of precedence: this.resources, params.resources, new ResourceScope()
        ({
            resources = ({
                resources = new ResourceScope()
            } = params, resources)
        } = this);

        if (!resources) {
            throw new Error('A Scope must have a valid ResourceScope');
        }

        this.resources = resources;

        this._disposables = {};

        this._lastDisposableId = 0;
    }

    /**
     * Produces a constructor for instances of a type which will be bound to the lifetime
     * and resources of this scope.
     *
     * @template T the type of object to be created.
     * @param {T} the original constructor for the type.
     * @returns {T} a new constructor to invoke to create the object.
     */
    public attached<T extends new (...args: any[]) => any>(type: T): T {
        let scope = this;

        let injected = this.resources.injected(type);

        let attachedConstructor = function Attached (...args: any[]) {
            let instance = injected.apply(this, args) || this;

            scope.attach(instance);

            return instance;
        };

        if (DEBUG) {
            // Rename the function to be more clear in the debugger.
            let {
                name = 'Attached'
            } = <{ name?: string; }>type;
            let attached = attachedConstructor.toString().replace('Attached', name);
            /* tslint:disable:no-eval */
            attachedConstructor = eval(attached);
            /* tslint:enable:no-eval */
        }

        let Attached: T = <any>attachedConstructor;

        Attached.prototype = injected.prototype;

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
}
