
import IResourceKey = require("./IResourceKey");

interface IHandle<T> {
    scope: ResourceScope;
    instance: T;
}

class ResourceScope {

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
    public consume<T>(key: IResourceKey<T>): T {
        let keyId = key.id;
        let handle = this._getHandle<T>(keyId);

        // Prefer an existing instance, followed by a new instance created from the factory and injected into this scope.
        let value: T;
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
    public expose<T>(key: IResourceKey<T>, instance: T): T {
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
    public isExposed<T>(key: IResourceKey<T>): boolean {
        let handle = this._getHandle<T>(key.id);
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
    public injected<T extends new (...args: any[]) => any>(type: T): T {
        let resources = this;

        let Injected: T = <any>function(...args: any[]) {
            this.resources = resources;

            return type.apply(args);
        };

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

    private _getHandle<T>(keyId: string): IHandle<T> {
        let scope: ResourceScope = this;
        let handle: IHandle<T>;

        // Starting with this scope, attempt to find the first scope with an available instance for a source
        // for the given key. Stop when there are no more ancestor scopes.
        while (!(handle = scope._handles[keyId]) && scope._parent) {
            scope = scope._parent;
        }

        return handle;
    }
}

/**
 * Debug stub for ResourceScope.
 */
class DebugResourceScope extends ResourceScope {
    public injected<T extends new (...args: any[]) => any>(type: T): T {
        /* tslint:disable:no-unused-variable */
        let resources = this;
        /* tslint:enable:no-unused-variable */
        let name = type['name'] || 'Injected';

        /* tslint:disable:no-eval */
        // Use of eval ensures that objects are properly named in a browser debugger.
        let Injected: T = eval(`(
            function ${name} () {
                var args = [];
                for (var i = 0; i < arguments.length; i++) {
                    args[i] = arguments[i];
                }
                this.resources = resources;
                return type.apply(this, args);
            }
        )`);
        /* tslint:enable:no-eval */

        // Set the prototype of the proxy constructor to the real prototype.
        Injected.prototype = type.prototype;

        return Injected;
    }
}

if (DEBUG) {
    // Since eval is slower, only use the debug version upon request.
    ResourceScope.prototype.injected = DebugResourceScope.prototype.injected;
}

export = ResourceScope;
