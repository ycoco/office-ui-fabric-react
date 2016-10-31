
import ResourceKey from './ResourceKey';
import IConstructor from '../interfaces/IConstructor';

interface IHandle<TKey> {
    scope: ResourceScope;
    instance: TKey;
}

export class ResourceScope {
    private _handles: {
        [keyId: string]: IHandle<any>
    };

    private _parent: ResourceScope;

    /**
     * Constructs a new resource scope, with an optional parent scope.
     * A resource scope with no parent is a root scope.
     * A resource scope will check the parent for resources not found in the current scope.
     * @param parent {ResourceScope} - a parent resource scope from which to pull resources
     */
    constructor(parent?: ResourceScope) {
        this._parent = parent;
        this._handles = {};
    }

    /**
     * Obtains the instance of a resource with the given key exposed by either this scope
     * or a parent. Throws if the resource is not found.
     * @param key {ResourceKey} - a shared resource key corresponding to a specific named resource.
     * @returns an instance of the resource, if available in this scope or a parent.
     */
    public consume<TKey>(key: ResourceKey<TKey>): TKey {
        let keyId = key.id;
        let handle = this._getHandle<TKey>(keyId);

        // Prefer an existing instance, followed by a new instance created from the factory and injected into this scope.
        let value: TKey;
        if (handle) {
            value = handle.instance;
        } else {
            throw new Error(`Resource ID "${keyId}" (${key.name}) is being consumed, but has not been exposed by a parent scope.`);
        }

        // Check for an existing record of the instance in this scope.
        let localHandle = this._handles[keyId];

        if (!localHandle) {
            // The instance has been consumed within this scope.
            // Record the value and the owner scope.
            // This will short-circuit subsequent get operations.

            this._handles[keyId] = {
                scope: handle.scope,
                instance: value
            };
        }

        return value;
    }

    /**
     * Exposes a resource with the given type-safe key.
     * @param key {ResourceKey} - a shared resource key corresponding to a specific named resource.
     * @param instance - the instance of the resource to use within this scope.
     */
    public expose<TKey, TInstance extends TKey>(key: ResourceKey<TKey>, instance: TInstance): TInstance {
        let keyId = key.id;

        // Short-circuit the future lookup of the key.
        this._handles[keyId] = {
            scope: this,
            instance: instance
        };

        return instance;
    }

    /**
     * Checks if a given resource key is exposed in the resource scope (including in parent scopes).
     * @param key {ResourceKey} - a shared resource key corresponding to a specific named resource.
     * @return {boolean}
     */
    public isExposed<TKey>(key: ResourceKey<TKey>): boolean {
        let handle = this._getHandle<TKey>(key.id);
        return !!handle && !!handle.instance;
    }

    /**
     * Produces an alternate constructor for the given type which pre-injects the instance with resources
     * before invoking the real constructor.
     * This function preserves the original argument types for the constructor, allowing validation
     * of arguments.
     * @param type - the type of object for which to create an injected constructor.
     * @returns an injected version of the original constructor for the type.
     */
    public injected<TInstance extends IConstructor>(type: TInstance): TInstance {
        let resources = this;

        let injectedConstructor = function Injected (...args: any[]) {
            this.resources = resources;

            let instance = type.apply(this, args) || this;

            return instance;
        };

        if (DEBUG) {
            let {
                name
            } = <{ name?: string; }>injectedConstructor;

            if (name) {
                let {
                    name: typeName = name
                } = <{ name?: string; }>type;

                let injectedDefinition = injectedConstructor.toString().replace(name, typeName);

                /* tslint:disable:no-eval */
                injectedConstructor = eval(`(${injectedDefinition})`);
                /* tslint:enable:no-eval */
            }
        }

        let Injected: TInstance = <any>injectedConstructor;

        // Set the prototype of the proxy constructor to the real prototype.
        Injected.prototype = type.prototype;

        return Injected;
    }

    /**
     * Disposes this resource scope and any resources bound to this scope's lifetime.
     */
    public dispose() {
        this._handles = {};
    }

    private _getHandle<TKey>(keyId: string): IHandle<TKey> {
        let scope: ResourceScope = this;
        let handle: IHandle<TKey>;

        // Starting with this scope, attempt to find the first scope with an available instance for a source
        // for the given key. Stop when there are no more ancestor scopes.
        while (!(handle = scope._handles[keyId]) && scope._parent) {
            scope = scope._parent;
        }

        return handle;
    }
}

export default ResourceScope;
