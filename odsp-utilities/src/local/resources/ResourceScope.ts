
import Promise from '../async/Promise';
import Signal from '../async/Signal';
import Scope from '../scope/Scope';
import { hook, IDisposable } from '../disposable/Disposable';

let lastId: number = 0;

export interface IResourceKeyOptions<TInstance> {
    /**
     * The friendly name for this key, used for debugging.
     */
    readonly name: string;
    /**
     * An optional factory for use instantiating this resource.
     */
    readonly factory?: IResourceFactory<TInstance, {}, {}>;
    /**
     * An optional loader for use asynchronously initializing this resource.
     */
    readonly loader?: IResourceLoader<TInstance>;
}

export class ResourceKey<TInstance> {
    /**
     * The id of the key, used for indexing.
     *
     * @memberOf ResourceKey
     */
    public readonly id: number;
    /**
     * The friendly name for this key, used for debugging.
     *
     * @memberOf ResourceKey
     */
    public readonly name: string;

    /**
     * An optional factory for use instantiating this resource.
     *
     * @memberof ResourceKey
     */
    public readonly factory: IResourceFactory<TInstance, {}, {}>;

    /**
     * An optional loader for use asynchronously initializing this resource.
     */
    public readonly loader: IResourceLoader<TInstance>;

    /**
     * The type exposed by this resource key. Used for type information only; has no value.
     */
    public readonly type: TInstance;

    /**
     * Creates an instance of ResourceKey.
     *
     * @param {string} name
     *
     * @memberOf ResourceKey
     */
    constructor(name: string);
    /**
     * Creates an instance of ResourceKey.
     *
     * @param {IResourceKeyOptions<TResource>} options
     *
     * @memberOf ResourceKey
     */
    constructor(options: IResourceKeyOptions<TInstance>);
    constructor(nameOrOptions: string | IResourceKeyOptions<TInstance>) {
        this.id = ++lastId;
        if (typeof nameOrOptions === 'string') {
            this.name = nameOrOptions;
        } else {
            this.name = nameOrOptions.name;
            this.factory = nameOrOptions.factory;
            this.loader = nameOrOptions.loader;
        }
    }

    /**
     * Gets an identifier for this {ResourceKey} as a lazy dependency (wrap in a function for deferred evaluation)
     */
    public get lazy(): ResourceDependency.ILazy<TInstance> {
        return new ResourceDependency<() => TInstance>(this, DependencyFlags.lazy);
    }

    /**
     * Gets an identifier for this {ResourceKey} as a local dependency (resolved in the local ResourceScope)
     */
    public get local(): ResourceDependency.ILocal<TInstance> {
        return new ResourceDependency<TInstance>(this, DependencyFlags.local);
    }

    /**
     * Gets an identifier for this {ResourceKey} as an optional dependency
     */
    public get optional(): ResourceDependency.IOptional<TInstance> {
        return new ResourceDependency<TInstance | undefined>(this, DependencyFlags.optional);
    }

    /**
     * Provides information about this resource key
     */
    public toString(): string {
        return `Resource #${this.id} "${this.name}"`;
    }
}

export namespace ResourceDependency {
    export interface IDependency<TKey, TResource> {
        readonly type: TResource;
        readonly key: ResourceKey<TKey>;
    }

    export interface INormal<T> extends IDependency<T, T> {
        readonly lazy: ILazy<T>;
        readonly local: ILocal<T>;
        readonly optional: IOptional<T>;
    }

    export interface ILazy<T> extends IDependency<T, () => T> {
        readonly local: ILazyLocal<T>;
        readonly optional: IOptionalLazy<T>;
    }

    export interface ILocal<T> extends IDependency<T, T> {
        readonly lazy: ILazyLocal<T>;
        readonly optional: IOptionalLocal<T>;
    }

    export interface IOptional<T> extends IDependency<T, T | undefined> {
        readonly lazy: IOptionalLazy<T>;
        readonly local: IOptionalLocal<T>;
    }

    export interface ILazyLocal<T> extends IDependency<T, () => T> {
        readonly optional: IOptionalLazyLocal<T>;
    }

    export interface IOptionalLazy<T> extends IDependency<T, (() => T) | undefined> {
        readonly local: IOptionalLazyLocal<T>;
    }

    export interface IOptionalLocal<T> extends IDependency<T, T | undefined> {
        readonly lazy: IOptionalLazyLocal<T>;
    }

    export interface IOptionalLazyLocal<T> extends IDependency<T, (() => T) | undefined> {
        // No more options available
    }
}

const enum DependencyFlags {
    none = 0,
    lazy = 1,
    local = 2,
    optional = 4
}

class ResourceDependency<T> implements ResourceDependency.IDependency<any, T> {
    public readonly type: T;
    public readonly flags: DependencyFlags;
    public readonly key: ResourceKey<any>;

    constructor(key: ResourceKey<any>, flags: DependencyFlags) {
        this.key = key;
        this.flags = flags;
    }

    public get lazy() {
        return new ResourceDependency<() => T>(this.key, this.flags | DependencyFlags.lazy);
    }
    public get local() {
        return new ResourceDependency<T>(this.key, this.flags | DependencyFlags.local);
    }
    public get optional() {
        return new ResourceDependency<T | undefined>(this.key, this.flags | DependencyFlags.optional);
    }
}

export type IResourceDependency<TKey, TResource> = ResourceKey<TResource> | ResourceDependency.IDependency<TKey, TResource>;

/**
 * Dependencies of a type that injects resources.
 */
export type IResourceDependencies<TDependencies> = {
    readonly[P in keyof TDependencies]: IResourceDependency<any, TDependencies[P]>
};

export interface IResourced {
    resources?: ResourceScope;
}

export interface IResolvableConstructor<TInstance, TParams, TDependencies> {
    new (params: TParams, dependencies: TDependencies): TInstance;
}

export interface IResolvable<TDependencies, TResources extends IResourceDependencies<TDependencies>> {
    readonly dependencies: TResources;
}

export type IResolvedConstructor<TInstance, TParams> = new (params: TParams) => TInstance;

export interface IResource<TInstance> {
    readonly instance: TInstance;
    readonly disposable?: TInstance | IDisposable;
}

export interface IResourceFactory<TInstance, TDependencies, TResources extends IResourceDependencies<TDependencies>> {
    readonly dependencies: TResources;
    create(dependencies: TDependencies): IResource<TInstance>;
}

export interface IResourceLoader<TInstance> {
    load(): Promise<IResourceFactory<TInstance, {}, {}>>;
}

export interface IChildResourceScopeOptions {
    readonly owner?: string;
}

export interface IRootResourceScopeOptions extends IChildResourceScopeOptions {
    readonly noDoubleExpose?: boolean;
    readonly lockResourcesForChildren?: boolean;
    readonly useFactoriesOnKeys?: boolean;
}

export interface IInjectedOptions extends IChildResourceScopeOptions {
    injectChildResourceScope?: boolean;
}

export class ConstantResourceFactory<T> implements IResourceFactory<T, {}, {}> {
    public readonly dependencies: {};

    private _value;

    constructor(value: T) {
        this._value = value;
        this.dependencies = {};
    }

    public create(): IResource<T> {
        return { instance: this._value };
    }
}

export const resourceScopeKey = new ResourceKey<ResourceScope>({
    name: 'resources'
});

export interface IAsyncLoadBarrier {
    wait(): Promise<void>;
}

export const asyncLoadBarrierKey = new ResourceKey<IAsyncLoadBarrier>({
    name: 'asyncLoadBarrier'
});

interface IResourceTraceState {
    stack: Array<string>;
    log: Array<string | Error>;
    types: {
        [name: string]: {
            [id: string]: string
        };
    };
    exposed: {
        [owner: string]: Array<{
            id: number;
            name: string;
            type: string;
        }>
    };
}

interface IResourceSource<TInstance, TDependencies, TResources extends IResourceDependencies<TDependencies>> {
    loader?: IResourceLoader<TInstance>;
    factory?: IResourceFactory<TInstance, TDependencies, TResources>;
}

interface IResourceEntry<TInstance, TDependencies, TResources extends IResourceDependencies<TDependencies>> extends IResourceSource<TInstance, TDependencies, TResources> {
    readonly manager: HandleManager;
}

class CacheOnSuccessLoader<TInstance> implements IResourceLoader<TInstance> {
    private _loader: IResourceLoader<TInstance>;

    constructor(loader: IResourceLoader<TInstance>) {
        this._loader = loader;
    }

    public load(): Promise<IResourceFactory<TInstance, {}, {}>> {
        const load = preventCancellation(this._loader.load());

        load.done(undefined, () => {
            // On error, reset the cache so the next load can try again.
            delete this.load;
        });

        this.load = () => load;

        return load;
    }
}

class Handle<TKey, TDependencies, TResources extends IResourceDependencies<TDependencies>> {
    public readonly entry: IResourceEntry<TKey, TDependencies, TResources>;
    public readonly manager: HandleManager;

    constructor(entry: IResourceEntry<TKey, TDependencies, TResources>, instanceManager?: HandleManager) {
        this.entry = entry;
        this.manager = instanceManager;
    }

    public getInstance(key: ResourceKey<TKey>, resourceScopeOptions?: IChildResourceScopeOptions): TKey {
        const {
            manager
        } = this;

        const factory = this.entry.factory;
        const resource = factory.create(manager.resolve<TDependencies>(factory.dependencies, resourceScopeOptions));
        const instance = resource.instance;
        if (resource.disposable) {
            manager.scope.attach(resource.disposable);
        }
        this.getInstance = () => instance;
        return instance;
    }

    public promote(targetHandleManager: HandleManager): Handle<TKey, TDependencies, TResources> {
        const {
            entry
        } = this;

        return new Handle({
            manager: targetHandleManager,
            loader: entry.loader,
            factory: entry.factory
        });
    }
}

let logBeginConstruction: <T extends new (...args: any[]) => any>(type: T, wrapperType: string) => void;
let logEndConstruction: <T extends new (...args: any[]) => any>(type: T, wrapperType: string) => void;
let logConsume: <TKey>(dependency: IResourceDependency<any, TKey>) => void;
let logExpose: <TKey, TInstance extends TKey>(key: ResourceKey<TKey>, owner: string, instance: TInstance) => void;
let log: (message: string) => void;

export function getResolvedConstructor<TInstance, TParams, TDependencies>(
    resolvableConstructor: IResolvableConstructor<TInstance, TParams, TDependencies>,
    resolvedDependencies: TDependencies): IResolvedConstructor<TInstance, TParams> {
    let Resolved = function (this: TInstance, params: TParams) {
        const instance = resolvableConstructor.call(this, params, resolvedDependencies) || this;
        return instance;
    };

    if (DEBUG) {
        // This pattern results in the correct type being displayed in the debugger
        const wrappedConstructor = Resolved;
        Resolved = function (params: TParams) {
            logBeginConstruction(resolvableConstructor, 'Resources.resolved');
            const instance = wrappedConstructor.call(Object.create(resolvableConstructor.prototype), params);
            logEndConstruction(resolvableConstructor, 'Resources.resolved');
            return instance;
        };
    }

    Resolved.prototype = resolvableConstructor.prototype;
    return <any>Resolved;
}

class HandleManager {
    public readonly options: IRootResourceScopeOptions;
    public readonly scope: Scope;
    public get isDisposed() {
        return this.scope.isDisposed;
    }

    private _handles: { [keyId: number]: Handle<any, {}, {}> };
    private readonly _parent: HandleManager;
    private readonly _level: number;
    private _isLocked: boolean;

    constructor(parent: HandleManager);
    constructor(options: IRootResourceScopeOptions);
    constructor(parentOrOptions: HandleManager | IRootResourceScopeOptions) {
        this._handles = {};
        this._isLocked = false;

        let options: IRootResourceScopeOptions;

        if (parentOrOptions instanceof HandleManager) {
            if (parentOrOptions.isDisposed) {
                throw new Error('Parent ResourceScope has already been disposed!');
            }
            options = parentOrOptions.options;
            this._parent = parentOrOptions;
            this._level = parentOrOptions._level + 1;
        } else {
            options = parentOrOptions || {};
            this._level = 0;
            if (DEBUG) {
                // Check for setting and enable tracing if set
                if (!('__ResourceTraceState' in window) && (localStorage && localStorage['EnableResourceTracing'])) {
                    window['__ResourceTraceState'] = {
                        log: [],
                        stack: [],
                        types: {},
                        exposed: {}
                    } as IResourceTraceState;
                }

                log('Created new root level Resource Scope');
            }
        }

        this.scope = new Scope();
        this.options = options;
    }

    public block<TKey>(key: ResourceKey<TKey>): HandleManager {
        return this._expose(key);
    }

    public isDescendantOf(manager: HandleManager): boolean {
        return this._level > manager._level;
    }

    public getHandle<TKey>(key: ResourceKey<TKey>): Handle<TKey, {}, {}> {
        let manager: HandleManager = this;
        const keyId = key.id;

        // Starting with this scope, attempt to find the first scope with an entry (may be undefined)
        // for the given key. Stop when there are no more ancestor scopes.
        while (!(keyId in manager._handles) && manager._parent) {
            manager = manager._parent;
        }

        const handles = manager._handles;

        return handles[keyId] || this.options.useFactoriesOnKeys &&
            (key.factory && (handles[keyId] = new Handle({
                factory: key.factory,
                manager: manager
            })) || (key.loader && (handles[keyId] = new Handle({
                loader: new CacheOnSuccessLoader(key.loader),
                manager: manager
            }))));
    }

    public expose<TKey, TDependencies, TResources extends IResourceDependencies<TDependencies>>(key: ResourceKey<TKey>, source: IResourceSource<TKey, TDependencies, TResources>, instance?: TKey): HandleManager {
        return this._expose(key, (handleManager: HandleManager) => new Handle<TKey, TDependencies, TResources>({
            factory: source.factory,
            loader: source.loader,
            manager: handleManager
        }, instance && handleManager));
    }

    public getLoader(): ResourceLoader {
        this.lock();
        const loader = new ResourceLoader(this);
        this.getLoader = () => loader;
        return loader;
    }

    public dispose(): void {
        this.scope.dispose();
        this._handles = {};
        this.consume = this.resolve = onConsumeAfterDispose;
        this.getLoader = onLoadAfterDispose;
    }

    public bind<TKey>(key: ResourceKey<TKey>): HandleManager {
        const handle = this.getHandle(key);

        if (handle) {
            return this._expose(key, (handleManager: HandleManager) => handle.promote(handleManager));
        }
        return this;
    }

    public lock(): void {
        this._isLocked = !!this.options.lockResourcesForChildren;
    }

    public consume<TKey, TResource>(dependency: IResourceDependency<TKey, TResource>, scopeOptions?: IChildResourceScopeOptions): TResource {
        this.lock();
        const key = ((dependency as ResourceDependency<TResource>).key || dependency as ResourceKey<TResource>);
        const options = (dependency as ResourceDependency<TResource>).flags;

        let thunk: () => TKey;
        if (key === resourceScopeKey) {
            let resourceScope: ResourceScope;

            thunk = () => {
                if (!resourceScope) {
                    resourceScope = this.scope.attach(new ResourceScope(<any>this, scopeOptions || { owner: `${key}` }));
                }

                return <any>resourceScope;
            };
        } else {
            const handle = this._getValidHandle(dependency, []);
            if (!(handle instanceof Error)) {
                thunk = () => handle.getInstance(key, scopeOptions || { owner: `${key}` });
            } else if (!(options & DependencyFlags.optional)) {
                throw handle;
            }
        }

        return <any>((options & DependencyFlags.lazy) ? thunk : (thunk && thunk()));
    }

    public isExposed<TKey, TResource>(dependency: IResourceDependency<TKey, TResource>): boolean {
        return !(this._getValidHandle(dependency, []) instanceof Error);
    }

    public resolve<TDependencies>(dependencies: IResourceDependencies<TDependencies>, scopeOptions?: IChildResourceScopeOptions): TDependencies {
        const result: TDependencies = <TDependencies>{};
        for (const id of <(keyof TDependencies)[]>Object.keys(dependencies)) {
            const dependency = dependencies[id];

            if (!dependency) {
                continue;
            }

            result[id] = this.consume(dependencies[id], scopeOptions);
        }
        return result;
    }

    private _getValidHandle<TKey, TResource>(resourceDependency: IResourceDependency<TKey, TResource>, stack: ResourceKey<any>[]): Handle<TKey, {}, {}> | Error {
        const key = ((resourceDependency as ResourceDependency<TResource>).key || resourceDependency as ResourceKey<TResource>);
        const keyId = key.id;
        if (stack.indexOf(key) >= 0) {
            // Circular reference will *always* throw, even on isExposed.
            throw new Error(`${key} has a circular dependency.`);
        }

        // If we have a handle with a manager cached, return it.
        const localHandle = this._handles[keyId];
        if (localHandle && localHandle.manager) {
            return localHandle;
        }

        let handle = this.getHandle(key);
        if (!handle) {
            return new Error(`${key} is being consumed, but has not been exposed by a parent scope.`);
        }

        const entry = handle.entry;
        const factory = entry.factory;
        if (!factory) {
            return new Error(`${key} is being consumed synchronously, but was exposed asynchronously and has not been loaded.`);
        }

        // Find the highest possible scope at which an instance of T can be stored.
        stack.push(key);
        const instanceManager = handle.manager;
        let targetManager = ((resourceDependency as ResourceDependency<TResource>).flags & DependencyFlags.local)
            ? this : instanceManager || entry.manager;

        const dependencies = factory.dependencies || {};
        for (const id of Object.keys(dependencies)) {
            const dependency = dependencies[id];

            // Dependency on resourceScopeKey does not affect targeting
            if (!dependency || ((dependency as ResourceDependency<any>).key || dependency as ResourceKey<any>) === resourceScopeKey) {
                continue;
            }

            // Recurse on dependencies.
            const dependencyHandle = this._getValidHandle(dependency, stack);
            if (dependencyHandle instanceof Error) {
                if (!((dependency as ResourceDependency<any>).flags & DependencyFlags.optional)) {
                    stack.pop();
                    return dependencyHandle;
                }
            } else if (dependencyHandle.manager.isDescendantOf(targetManager)) {
                targetManager = dependencyHandle.manager;
            }
        }
        stack.pop();

        if (!instanceManager || instanceManager !== targetManager) {
            // Need a new handle.
            handle = new Handle<TKey, {}, {}>(entry, targetManager);
            // Place on targetManager, so that other levels can reuse
            targetManager._handles[keyId] = handle;
        }
        return this._handles[keyId] = handle;
    }

    private _expose<TKey, TDependencies, TResources extends IResourceDependencies<TDependencies>>(key: ResourceKey<TKey>, createHandle?: (handleManager: HandleManager) => Handle<TKey, TDependencies, TResources>): HandleManager {
        if (this.isDisposed) {
            throw new Error('Cannot expose a resource on a ResourceScope that has been disposed.');
        }
        if (key as ResourceKey<any> === resourceScopeKey) {
            throw new Error('It is illegal to expose the ResourceScope key');
        }
        const keyId = key.id;

        const handleManager = this._isLocked ? this.scope.attach(new HandleManager(this)) : this;

        const handles = handleManager._handles;
        if (handles[keyId]) {
            if (this.options.noDoubleExpose) {
                throw new Error(`${key} has already been exposed/consumed at this scope.`);
            } else if (DEBUG) {
                log(`Duplicate exposure of ${key}.`);
            }
        }

        handles[keyId] = createHandle ? createHandle(handleManager) : void 0;

        return handleManager;
    }
}

function onConsumeAfterDispose(): never {
    throw new Error('Cannot consume a resource from a ResourceScope that has been disposed.');
}

function onLoadAfterDispose(): never {
    throw new Error('Cannot load a resource from a ResourceScope that has been disposed.');
}

function voidify() {
    // Do nothing
}

function getFirstError(errors: { [key: string]: Error }): Promise<void> {
    for (const key in errors) {
        if (errors[key]) {
            return Promise.wrapError(errors[key]);
        }
    }
    return Promise.wrapError(new Error('A dependency could not be loaded.'));
}

class ResourceLoader {
    private readonly _handleManager: HandleManager;
    private readonly _loadState: { [keyId: number]: Promise<void> };
    private readonly _root: IAsyncLoadBarrier;

    constructor(handleManager: HandleManager) {
        this._handleManager = handleManager;
        this._loadState = {};
        this._root = handleManager.consume(asyncLoadBarrierKey.optional);
    }

    /**
     * Performs an async load of the specified resource. Should return a successful result if the value is optional or loads.
     * Should return an error result if the value is non-optional and fails to load.
     * Should return the same promise for multiple requests to the same key.
     */
    public loadAsync<TKey>(dependency: IResourceDependency<TKey, any>): Promise<void> {
        // Loading the ResourceScope key is always successful.
        const key: ResourceKey<any> = (dependency as ResourceDependency<TKey>).key || dependency as ResourceKey<any>;
        if (key === resourceScopeKey) {
            return Promise.as<void>();
        }

        const options = (dependency as ResourceDependency<TKey>).flags;
        const promise = this._loadAsync(key);

        return (options & DependencyFlags.optional) ? promise.then(null, voidify) : promise;
    }

    public loadAllAsync<TResources extends IResourceDependencies<{}>>(dependencies: TResources): Promise<void> {
        if (dependencies) {
            const dependencyNames = Object.keys(dependencies);
            let length = dependencyNames.length;
            if (length > 0) {
                const promises: { [key: string]: Promise<void>; } = {};
                while (length--) {
                    const name = dependencyNames[length];
                    const dependency = dependencies[name];

                    if (!dependency) {
                        continue;
                    }

                    promises[name] = this.loadAsync(dependency);
                }
                return Promise.all(promises).then(voidify, getFirstError);
            }
        }
        return Promise.as<void>();
    }

    private _loadAsync<TKey>(key: ResourceKey<TKey>): Promise<void> {
        // Check the cache
        const keyId = key.id;
        const loadStateMap = this._loadState;
        const cached = loadStateMap[keyId];
        if (cached) {
            return cached;
        }

        // Validate that there is a valid handle for the key
        const handleManager = this._handleManager;
        const handle = handleManager.getHandle(key);
        if (!handle) {
            return loadStateMap[keyId] = Promise.wrapError(new Error(`${key} is being loaded, but has no factory/loader.`));
        }

        // Mark possible circular reference
        loadStateMap[keyId] = Promise.as<void>();

        // If we have a synchronously available factory, load its dependencies
        const entry = handle.entry;
        const factory = entry.factory;
        if (factory) {
            return loadStateMap[keyId] = this.loadAllAsync(factory.dependencies);
        }

        // Finally, fall back to the loader
        const loader = entry.loader;
        if (!loader) {
            return loadStateMap[keyId] = Promise.wrapError(new Error(`${key} is being loaded, but no loader was defined.`));
        }

        const root = this._root;
        const rootPromise = root && root.wait() || Promise.as<void>();

        return loadStateMap[keyId] = rootPromise.then(() => loader.load()).then((value: IResourceFactory<TKey, {}, {}>) => {
            if (DEBUG) {
                log(`Loaded ${key}`);
            }
            entry.factory = value;
            const factoryDependencies = value.dependencies;
            if (factoryDependencies) {
                return this.loadAllAsync(factoryDependencies);
            }
        });
    }
}

export class ResourceScope {
    private _handleManager: HandleManager;
    private readonly _owner: string;
    private readonly _scope: Scope;

    /**
     * Constructs a new resource scope, with the specified options
     * A resource scope with no parent is a root scope.
     * @param options {IRootResourceScopeOptions} - options governing the behavior of this resource scope
     */
    constructor(options?: IRootResourceScopeOptions);
    /**
     * Constructs a new resource scope with a parent scope and options for diagnostics.
     * A resource scope will check the parent for resources not found in the current scope.
     * @param parent {ResourceScope} - a parent resource scope from which to pull resources
     * @param options {IChildResourceScopeOptions} - optional information for diagnostics.
     */
    constructor(parent: ResourceScope, options?: IChildResourceScopeOptions);
    constructor(parentOrOptions?: ResourceScope | IRootResourceScopeOptions, options?: IChildResourceScopeOptions) {
        let parentOwner: string;
        let handleManager: HandleManager;
        if (parentOrOptions instanceof ResourceScope) {
            handleManager = parentOrOptions._handleManager;
            parentOwner = parentOrOptions._owner;
        } else if (parentOrOptions instanceof HandleManager) {
            handleManager = parentOrOptions;
        } else {
            options = parentOrOptions || options;
        }

        const scope = new Scope();

        if (handleManager) {
            if (handleManager.scope.isDisposed) {
                throw new Error('Parent ResourceScope has already been disposed.');
            }
            handleManager.lock();
            if (!handleManager.options.lockResourcesForChildren) {
                this._prepareWrite = this._fork;
            }
        }
        this._handleManager = handleManager || (handleManager = scope.attach(new HandleManager(options)));

        this._scope = scope;
        const owner = options ? options.owner : '';
        this._owner = parentOwner ? `${parentOwner} > ${owner}` : owner;
        if (DEBUG) {
            log(`new ResourceScope: '${owner}'`);
        }
    }

    /**
     * Obtains an instance of a resource with the given key exposed by either this scope
     * or a parent. Throws if the resource is not found and isOptional is not set.
     * @param key {ResourceKey} - a shared resource key corresponding to a specific named resource.
     * @returns an instance of the resource, if available in this scope or a parent.
     */
    public consume<TResource>(dependency: IResourceDependency<any, TResource>): TResource {
        if (DEBUG) {
            logConsume(dependency);
        }
        return this._handleManager.consume(dependency);
    }

    /**
     * Obtains an instance of a resource with the given key exposed by either this scope
     * or a parent. Throws if the resource is not found and isOptional is not set.
     * @param key {ResourceKey} - a shared resource key corresponding to a specific named resource.
     * @returns a promise for an instance of the resource, if available in this scope or a parent.
     */
    public consumeAsync<TResource>(dependency: IResourceDependency<any, TResource>): Promise<TResource> {
        if (DEBUG) {
            logConsume(dependency);
        }

        const handleManager = this._handleManager;
        return preventCancellation(handleManager.getLoader().loadAsync(dependency).then(() => {
            return handleManager.consume(dependency);
        }));
    }

    /**
     * Ensures that the specified dependencies have been loaded for synchronous consumption.
     * @param dependencies {IResourceDependencies} - the dependencies to load.
     * @returns a promise that will complete when the specified resources are available.
     */
    public load<TResources extends IResourceDependencies<{}>>(dependencies: TResources): Promise<void> {
        return preventCancellation(this._handleManager.getLoader().loadAllAsync(dependencies));
    }

    /**
     * Exposes an asynchronous loader for a resource with the given type-safe key.
     * @param key {ResourceKey} - a shared resource key corresponding to a specific named resource.
     * @param loader - the object that can asynchronously load a factory of the desired type
     */
    public exposeAsync<TKey, TFactory extends TKey>(key: ResourceKey<TKey>, loader: IResourceLoader<TFactory>): void {
        this._expose(key, {
            loader: new CacheOnSuccessLoader(loader)
        });
    }

    /**
     * Exposes a factory for a resource with the given type-safe key.
     * @param key {ResourceKey} - a shared resource key corresponding to a specific named resource.
     * @param factory - the factory that will construct instances when required by this or any child scope.
     */
    public exposeFactory<TKey, TFactory extends TKey>(key: ResourceKey<TKey>, factory: IResourceFactory<TFactory, {}, {}>): void {
        this._expose(key, {
            factory: factory
        });
    }

    /**
     * Exposes a resource with the given type-safe key.
     * @param key {ResourceKey} - a shared resource key corresponding to a specific named resource.
     * @param instance - the instance of the resource to use within this scope.
     */
    public expose<TKey, TInstance extends TKey>(key: ResourceKey<TKey>, instance: TInstance): TInstance {
        if (DEBUG) {
            logExpose(key, this._owner, instance);
        }
        this._expose(key, {
            factory: new ConstantResourceFactory(instance)
        }, instance);

        return instance;
    }

    /**
     * Hides any resources exposed by parent scopes for the specified key.
     * @param key {ResourceKey} - a shared resource key corresponding to a specific named resource.
     */
    public block<TKey>(key: ResourceKey<TKey>): void {
        this._handleManager = this._prepareWrite().block(key);
    }

    /**
     * Re-exposes the currently exposed resource at the specified key at the current resource scope.
     * The effect of this is that the lifetime of instances created by the resource system that depend on the
     * specific key will not exceed the lifetime of this resource scope.
     * @param key {ResourceKey} - a shared resource key corresponding to a specific named resource.
     */
    public bind<TKey>(key: ResourceKey<TKey>): void {
        this._handleManager = this._prepareWrite().bind(key);
    }

    /**
     * Checks if a given resource key is defined and known to the system.
     */
    public isDefined<TKey>(key: ResourceKey<TKey>): boolean {
        const handleManager = this._handleManager;
        return !handleManager.isDisposed && !!handleManager.getHandle(key);
    }

    /**
     * Checks if a given resource key is exposed in the resource scope (including in parent scopes).
     * @param key {ResourceKey} - a shared resource key corresponding to a specific named resource.
     * @return {boolean}
     */
    public isExposed<TKey>(dependency: IResourceDependency<any, TKey>): boolean {
        if (DEBUG) {
            logConsume(dependency);
        }
        const handleManager = this._handleManager;
        return !handleManager.isDisposed && handleManager.isExposed(dependency);
    }

    /**
     * Produces an alternate constructor for the given type which pre-injects the instance with resources
     * before invoking the real constructor.
     * This function preserves the original argument types for the constructor, allowing validation
     * of arguments.
     * @param type - the type of object for which to create an injected constructor.
     * @returns an injected version of the original constructor for the type.
     */
    public injected<TInstance extends IResourced, TConstructor extends new (...args: any[]) => TInstance>(
        type: TConstructor,
        options: IInjectedOptions = {}): TConstructor {
        const {
            injectChildResourceScope
        } = options;

        const childOptions = {
            owner: options.owner || (type as { name?: string }).name
        };

        const resources = injectChildResourceScope ? this._scope.attach(new ResourceScope(this, childOptions)) : this;

        let Injected = function (this: TInstance, ...args: any[]) {
            this.resources = resources;
            const instance = type.apply(this, args) || this;
            if (injectChildResourceScope) {
                hook(instance, disposeInstanceResources);
            }
            return instance;
        };

        if (DEBUG) {
            // This pattern results in the correct type being displayed in the debugger
            const wrappedConstructor = Injected;
            Injected = function (this: TInstance, ...args: any[]) {
                logBeginConstruction(type, 'Resources.injected');
                const instance = wrappedConstructor.apply(Object.create(type.prototype), args);
                logEndConstruction(type, 'Resources.injected');
                return instance;
            };
        }

        Injected.prototype = type.prototype;
        return <any>Injected;
    }

    /**
     * Resolves a set of resource keys
     *
     * @param dependencies - an object that maps names to {ResourceKey} instances.
     * @returns an object mapping the original names to the resolved resources.
     */
    public resolve<TDependencies>(dependencies: IResourceDependencies<TDependencies>): TDependencies {
        return this._handleManager.resolve(dependencies);
    }

    /**
     * Resolves a set of resource keys
     *
     * @param dependencies - an object that maps names to {ResourceKey} instances.
     * @returns an object mapping the original names to the resolved resources.
     */
    public resolveAsync<TDependencies>(dependencies: IResourceDependencies<TDependencies>): Promise<TDependencies> {
        return this.load(dependencies).then(() => this.resolve(dependencies));
    }

    /**
     * Produces a version of the provided constructor in which the dependencies have been resolved using resources.
     *
     * @param type - the type of object for which to create a resolved constructor. The type must have a public static readonly property
     * dependencies that maps names to {ResourceKey} instances
     * @returns a version of the original constructor for the type with dependencies resolved.
     */
    public resolved<TInstance, TParams, TDependencies, TResources extends IResourceDependencies<TDependencies>>(
        type: IResolvableConstructor<TInstance, TParams, TDependencies> & IResolvable<TDependencies, TResources>): new (params: TParams) => TInstance;

    /**
     * Produces a version of the provided constructor in which the dependencies have been resolved using resources.
     *
     * @param type - the type of object for which to create a resolved constructor.
     * @param dependencies - an object that maps names to {ResourceKey} instances.
     * @returns a version of the original constructor for the type with dependencies resolved.
     */
    public resolved<TInstance, TParams, TDependencies, TResources extends IResourceDependencies<TDependencies>>(
        type: IResolvableConstructor<TInstance, TParams, TDependencies>,
        dependencies: TResources): new (params: TParams) => TInstance;

    public resolved<TInstance, TParams, TDependencies, TResources extends IResourceDependencies<TDependencies>>(
        type: IResolvableConstructor<TInstance, TParams, TDependencies> & {
            dependencies?: TResources;
        },
        dependencies?: TResources): new (params: TParams) => TInstance {
        return getResolvedConstructor(type, this.resolve(<TResources>{
            ...(type.dependencies || {}),
            ...(dependencies || {})
        }));
    }

    /**
     * Produces a promise for a version of the provided constructor in which the dependencies have been resolved using resources.
     *
     * @param type - the type of object for which to create a resolved constructor. The type must have a public static readonly property
     * dependencies that maps names to {ResourceKey} instances
     * @returns a promise for a version of the original constructor for the type with dependencies resolved.
     */
    public resolvedAsync<TInstance, TParams, TDependencies, TResources extends IResourceDependencies<TDependencies>>(
        type: IResolvableConstructor<TInstance, TParams, TDependencies> & IResolvable<TDependencies, TResources>): Promise<new (params: TParams) => TInstance>;

    /**
     * Produces a promise for a version of the provided constructor in which the dependencies have been resolved using resources.
     *
     * @param type - the type of object for which to create a resolved constructor.
     * @param dependencies - an object that maps names to {ResourceKey} instances.
     * @returns a promise for a version of the original constructor for the type with dependencies resolved.
     */
    public resolvedAsync<TInstance, TParams, TDependencies, TResources extends IResourceDependencies<TDependencies>>(
        type: IResolvableConstructor<TInstance, TParams, TDependencies>,
        dependencies: TResources): Promise<new (params: TParams) => TInstance>;

    public resolvedAsync<TInstance, TParams, TDependencies, TResources extends IResourceDependencies<TDependencies>>(
        type: IResolvableConstructor<TInstance, TParams, TDependencies> & {
            dependencies?: TResources;
        },
        dependencies?: IResourceDependencies<TDependencies>): Promise<new (params: TParams) => TInstance> {
        return this.load(<TResources>{
            ...(type.dependencies || {}),
            ...(dependencies || {})
        }).then(() => this.resolved(type, dependencies));
    }

    /**
     * Disposes this resource scope and any resources bound to this scope's lifetime.
     */
    public dispose() {
        this._scope.dispose();
    }

    private _expose<TKey, TDependencies, TResources extends IResourceDependencies<TDependencies>>(key: ResourceKey<TKey>, source: IResourceSource<TKey, TDependencies, TResources>, instance?: TKey): void {
        this._handleManager = this._prepareWrite().expose(key, source, instance);
    }

    // These methods are to support legacy call patterns by imitating old behavior
    private _prepareWrite(): HandleManager {
        return this._handleManager;
    }

    private _fork(): HandleManager {
        delete this._prepareWrite;
        if (DEBUG) {
            log(`Fork: '${this._owner}'`);
        }
        return this._scope.attach(new HandleManager(this._handleManager));
    }
}

function disposeInstanceResources(this: { resources: ResourceScope }) {
    this.resources.dispose();
}

if (DEBUG) {
    let lastTypeNameId = 0;

    const getTraceState = function (): IResourceTraceState {
        return window['__ResourceTraceState'] as IResourceTraceState;
    };

    logBeginConstruction = function <T extends new (...args: any[]) => any>(type: T, wrapperType: string): void {
        const traceState = getTraceState();
        if (traceState) {
            const typeName = `${type['name']}_${++lastTypeNameId}`;
            const {
                stack,
                types
            } = traceState;
            const parent = stack[stack.length - 1] || '_root';
            stack.push(typeName);
            (types[parent] || (types[parent] = {}))[typeName] = wrapperType;
            if (!(typeName in types)) {
                types[typeName] = {};
            }
        }
    };

    logEndConstruction = function <T extends new (...args: any[]) => any>(type: T, wrapperType: string): void {
        const traceState = getTraceState();
        if (traceState) {
            traceState.stack.pop();
        }
    };

    logConsume = function <TKey>(dependency: IResourceDependency<any, TKey>): void {
        const traceState = getTraceState();
        const key = (dependency as ResourceDependency<any>).key || dependency as ResourceKey<TKey>;
        const isOptional = (dependency as ResourceDependency<any>).flags & DependencyFlags.optional;
        if (traceState) {
            const {
                stack,
                types
            } = traceState;
            const parent = stack[stack.length - 1] || '_root';
            (types[parent] || (types[parent] = {}))[isOptional ? `${key.id}?` : key.id] = key.name;
        }
    };

    logExpose = function <TKey, TInstance extends TKey>(key: ResourceKey<TKey>, owner: string, instance: TInstance): void {
        const traceState = getTraceState();
        if (traceState) {
            const typeName = instance && instance.constructor['name'];
            const exposed = traceState.exposed;

            (exposed[owner] || (exposed[owner] = [])).push({
                id: key.id,
                name: key.name,
                type: typeName
            });
        }
    };

    log = function (message: string): void {
        const traceState = getTraceState();
        if (traceState) {
            traceState.log.push(message);
        }
    };
}

function preventCancellation<T>(promise: Promise<T>): Promise<T> {
    const signal = new Signal<T>();

    promise.done((result: T) => signal.complete(result), (error: Error) => signal.error(error));

    return signal.getPromise();
}

export default ResourceScope;
