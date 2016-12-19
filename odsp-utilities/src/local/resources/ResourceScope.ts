
import Promise from '../async/Promise';
import ObjectUtil from '../object/ObjectUtil';
import Scope from '../scope/Scope';
import { hook, IDisposable } from '../disposable/Disposable';

let lastId: number = 0;

export interface IResourceKeyOptions<TResource, TDependencies> {
    /**
     * The friendly name for this key, used for debugging.
     */
    readonly name: string;
    /**
     * An optional factory for use instantiating this resource.
     */
    readonly factory?: IResourceFactory<TResource, TDependencies>;
    /**
     * Whether or not this resource should always be instantiated at the narrowest scope possible.
     * Defaults to `false`.
     */
    readonly useNarrowestScope?: boolean;
}

export class ResourceKey<TResource> {
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
    public readonly factory: IResourceFactory<TResource, any>;
    /**
     * Whether or not this resource should always be instantiated at the narrowest scope possible.
     *
     * @memberof ResourceKey
     */
    public readonly useNarrowestScope: boolean;

    protected readonly _ResourceKeyBrand: TResource;

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
    constructor(options: IResourceKeyOptions<TResource, any>);
    constructor(nameOrOptions: string | IResourceKeyOptions<TResource, any>) {
        this.id = ++lastId;
        if (typeof nameOrOptions === 'string') {
            this.name = nameOrOptions;
        } else {
            this.name = nameOrOptions.name;
            this.factory = nameOrOptions.factory;
            this.useNarrowestScope = nameOrOptions.useNarrowestScope;
        }
    }

    /**
     * Provides information about this resource key
     */
    public toString(): string {
        return `Resource #${this.id} "${this.name}"`;
    }
}

export interface IResourceKeyWithOptions<T> {
    key: ResourceKey<T>;
    isOptional?: boolean;
}

export type IResourceDependency<T> = ResourceKey<T> | IResourceKeyWithOptions<T>;
/**
 * Dependencies of a type that injects resources.
 */
export type IResourceDependencies<TDependencies> = {
    readonly[P in keyof TDependencies]: IResourceDependency<TDependencies[P]>
};

export interface IResourced {
    resources?: ResourceScope;
}

export interface IResolvableConstructor<TInstance, TParams, TDependencies> {
    new (params: TParams, dependencies: TDependencies): TInstance;
}

export interface IResolvable<TInstance, TParams, TDependencies> extends IResolvableConstructor<TInstance, TParams, TDependencies> {
    readonly dependencies: IResourceDependencies<TDependencies>;
}

export type IResolvedConstructor<TInstance, TParams> = new (params: TParams) => TInstance;

export interface IResource<TInstance> {
    readonly instance: TInstance;
    readonly disposable?: TInstance | IDisposable;
}

export interface IResourceFactory<TInstance, TDependencies> {
    readonly dependencies: IResourceDependencies<TDependencies>;
    create(dependencies: TDependencies): IResource<TInstance>;
}

export interface IResourceLoader<TInstance, TDependencies> {
    load(): Promise<IResourceFactory<TInstance, TDependencies>>;
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

export class ConstantResourceFactory<T> implements IResourceFactory<T, {}> {
    public get dependencies() {
        return {};
    }

    private _value;
    constructor(value: T) {
        this._value = value;
    }

    public create(): IResource<T> {
        return { instance: this._value };
    }
}

export const resourceScopeKey = new ResourceKey<ResourceScope>({
    name: 'resources'
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

interface IResourceFactoryInfo<TInstance, TDependencies> {
    loader?: IResourceLoader<TInstance, TDependencies>;
    value?: IResourceFactory<TInstance, TDependencies>;
}

interface IResourceFactoryEntry<TInstance, TDependencies> extends IResourceFactoryInfo<TInstance, TDependencies> {
    readonly manager: HandleManager;
}

interface ILoadMap {
    [keyId: number]: IResourceFactoryInfo<any, any>;
}

class Handle<TKey, TDependencies> {
    public readonly factory: IResourceFactoryEntry<TKey, TDependencies>;
    public readonly manager: HandleManager;

    constructor(factory: IResourceFactoryEntry<TKey, TDependencies>, instanceManager?: HandleManager) {
        this.factory = factory;
        this.manager = instanceManager;
    }

    public getInstance(key: ResourceKey<TKey>, resourceScopeOptions?: IChildResourceScopeOptions): TKey {
        const factory = this.factory.value;
        const resource = factory.create(this.manager.getConsumer().resolve(factory.dependencies, resourceScopeOptions));
        const instance = resource.instance;
        if (resource.disposable) {
            this.manager.scope.attach(resource.disposable);
        }
        this.getInstance = () => instance;
        return instance;
    }

    public promote(targetHandleManager: HandleManager): Handle<TKey, TDependencies> {
        return new Handle<TKey, TDependencies>({
            manager: targetHandleManager,
            loader: this.factory.loader,
            value: this.factory.value
        });
    }
}

let logBeginConstruction: <T extends new (...args: any[]) => any>(type: T, wrapperType: string) => void;
let logEndConstruction: <T extends new (...args: any[]) => any>(type: T, wrapperType: string) => void;
let logConsume: <TKey>(key: ResourceKey<TKey>, isOptional: boolean) => void;
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
    public handles: { [keyId: number]: Handle<any, any> };
    public readonly options: IRootResourceScopeOptions;
    public readonly scope: Scope;
    public get isDisposed() {
        return this.scope.isDisposed;
    }

    private readonly _parent: HandleManager;
    private readonly _level: number;

    constructor(parent: HandleManager);
    constructor(options: IRootResourceScopeOptions);
    constructor(parentOrOptions: HandleManager | IRootResourceScopeOptions) {
        this.handles = {};

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
                if (!('__ResourceTraceState' in window) && localStorage['EnableResourceTracing']) {
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

    public getResourceScope(options?: IChildResourceScopeOptions): ResourceScope {
        // Bypass type check in order to pass non-exported class to public constructor
        return this.scope.attach(new ResourceScope(<any>this, options));
    }

    public getHandle<TKey>(key: ResourceKey<TKey>): Handle<TKey, any> {
        let manager: HandleManager = this;
        const keyId = key.id;

        // Starting with this scope, attempt to find the first scope with an entry (may be undefined)
        // for the given key. Stop when there are no more ancestor scopes.
        while (!(keyId in manager.handles) && manager._parent) {
            manager = manager._parent;
        }

        return manager.handles[keyId] || (this.options.useFactoriesOnKeys && key.factory && (manager.handles[keyId] = new Handle({
            value: key.factory,
            manager: manager
        })));
    }

    public getLocalInstanceHandle<TKey>(keyId: number): Handle<TKey, any> {
        const handle = this.handles[keyId];
        // If we have a handle with a manager, return it.
        return handle && handle.manager && handle;
    }

    public expose<TKey, TDependencies>(key: ResourceKey<TKey>, factory: IResourceFactoryInfo<TKey, TDependencies>, instance?: TKey): HandleManager {
        return this._expose(key, (handleManager: HandleManager) => new Handle<TKey, TDependencies>({
            value: factory.value,
            loader: factory.loader,
            manager: handleManager
        }, instance && handleManager));
    }

    public getConsumer(): ResourceConsumer {
        this.lock();
        const consumer = new ResourceConsumer(this);
        this.getConsumer = () => consumer;
        return consumer;
    }

    public getLoader(): ResourceLoader {
        this.lock();
        const loader = new ResourceLoader(this);
        this.getLoader = () => loader;
        return loader;
    }

    public dispose(): void {
        this.scope.dispose();
        this.handles = {};
        this.getConsumer = onConsumeAfterDispose;
        this.getLoader = onLoadAfterDispose;
    }

    public bind<TKey>(key: ResourceKey<TKey>): HandleManager {
        const handle = this.getHandle(key);

        if (handle) {
            return this._expose(key, (handleManager: HandleManager) => handle.promote(handleManager));
        }
        return this;
    }

    public getWritableHandleManager(): HandleManager {
        return this;
    }

    public lock(): void {
        this.getWritableHandleManager = this._fork;
    }

    private _fork(): HandleManager {
        if (this.options.lockResourcesForChildren) {
            return this.scope.attach(new HandleManager(this));
        } else if (DEBUG) {
            log(`Expose after consume/child at ${this._level}`);
        }

        return this;
    }

    private _expose<TKey, TDependencies>(key: ResourceKey<TKey>, createHandle?: (handleManager: HandleManager) => Handle<TKey, TDependencies>): HandleManager {
        if (this.isDisposed) {
            throw new Error('Cannot expose a resource on a ResourceScope that has been disposed.');
        }
        if (key as ResourceKey<any> === resourceScopeKey) {
            throw new Error('It is illegal to expose the ResourceScope key');
        }
        const keyId = key.id;

        const handleManager = this.getWritableHandleManager();

        const handles = handleManager.handles;
        if (handles[keyId]) {
            if (this.options.noDoubleExpose) {
                throw new Error(`${key.toString()} has already been exposed/consumed at this scope.`);
            } else if (DEBUG) {
                log(`Duplicate exposure of ${key.toString()}.`);
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

class ResourceLoader {
    private readonly _handleManager: HandleManager;
    private readonly _loadState: { [keyId: number]: boolean };

    constructor(handleManager: HandleManager) {
        this._handleManager = handleManager;
        this._loadState = {};
    }

    public loadAllAsync(dependencies: IResourceDependencies<any>): Promise<void> {
        const unloadedDependencies = this._getAllUnloadedDependencies(dependencies);
        if (unloadedDependencies instanceof Error) {
            return Promise.wrapError(unloadedDependencies);
        } else {
            const loadPromises: Array<Promise<void>> = [];
            for (const keyId in unloadedDependencies) {
                const factory = unloadedDependencies[keyId];
                // Protect against duplicate loads due to timing bugs
                const rawPromise = factory.loader.load();
                factory.loader = {
                    load: () => rawPromise
                };
                loadPromises.push(rawPromise.then((value: IResourceFactory<any, any>) => {
                    if (DEBUG) {
                        log(`Loaded Resource #${keyId}`);
                    }
                    factory.value = value;
                    const factoryDependencies = value.dependencies;
                    if (factoryDependencies) {
                        return this.loadAllAsync(factoryDependencies);
                    }
                }));
            }

            return Promise.all(loadPromises).then(() => {
                // Return void;
            }, (errors: any[]) => errors[0] || errors);
        }
    }

    private _getAllUnloadedDependencies(dependencies: IResourceDependencies<any>): ILoadMap | Error {
        const loadStateMap = this._loadState;
        const unloaded: ILoadMap = {};
        for (const id in dependencies) {
            const dependency = dependencies[id];
            const key: ResourceKey<any> = (dependency as IResourceKeyWithOptions<any>).key || dependency as ResourceKey<any>;
            if (key as ResourceKey<any> === resourceScopeKey) {
                continue;
            }
            const keyId = key.id;
            if (!(keyId in loadStateMap)) {
                loadStateMap[keyId] = true;
                const isOptional = (dependency as IResourceKeyWithOptions<any>).isOptional;
                const handle = this._handleManager.getHandle(key);
                if (handle) {
                    const factory = handle.factory;
                    if (factory.value) {
                        const factoryDependencies = factory.value.dependencies;
                        const unloadedDependencies = factoryDependencies ? this._getAllUnloadedDependencies(factoryDependencies) : {};
                        if (!(unloadedDependencies instanceof Error)) {
                            ObjectUtil.extend(unloaded, unloadedDependencies);
                        } else if (!isOptional) {
                            return unloadedDependencies;
                        }
                    } else if (!factory.loader) {
                        return new Error(`${key.toString()} is being loaded, but no loader was defined.`);
                    } else {
                        unloaded[keyId] = factory;
                    }
                } else if (!isOptional) {
                    return new Error(`${key.toString()} is being loaded, but has not been exposed by a parent scope.`);
                }
            }
        }

        return unloaded;
    }
}

class ResourceConsumer {
    private readonly _handleManager: HandleManager;

    constructor(handleManager: HandleManager) {
        this._handleManager = handleManager;
    }

    public consume<TKey>(key: ResourceKey<TKey>, isOptional?: boolean, scopeOptions?: IChildResourceScopeOptions): TKey {
        const result = this._getValidHandle(key, []);
        if (!(result instanceof Error)) {
            return result.getInstance(key, scopeOptions);
        } else if (!isOptional) {
            throw result;
        }
    }

    public resolve<TDependencies>(dependencies: IResourceDependencies<TDependencies>, scopeOptions?: IChildResourceScopeOptions): TDependencies {
        const result: TDependencies = <TDependencies>{};
        for (const id in dependencies) {
            const dependency = dependencies[id];
            if (((dependency as IResourceKeyWithOptions<any>).key || dependency as ResourceKey<any>) === resourceScopeKey) {
                result[id] = <any>this._handleManager.getResourceScope(scopeOptions);
                continue;
            }

            const handle = this._getValidHandle(dependency, []);
            if (!(handle instanceof Error)) {
            result[id] = handle.getInstance(
                (dependency as IResourceKeyWithOptions<any>).key || dependency as ResourceKey<any>,
                scopeOptions);
            } else if (!(dependency as IResourceKeyWithOptions<any>).isOptional) {
                throw handle;
            }
        }
        return result;
    }

    public isExposed<TKey>(key: ResourceKey<TKey>): boolean {
        return !(this._getValidHandle(key, []) instanceof Error);
    }

    private _getValidHandle<TKey>(resourceDependency: IResourceDependency<TKey>, stack: ResourceKey<any>[]): Handle<TKey, any> | Error {
        const key = (resourceDependency as IResourceKeyWithOptions<TKey>).key || resourceDependency as ResourceKey<TKey>;
        const keyId = key.id;
        if (stack.indexOf(key) >= 0) {
            // Circular reference will *always* throw, even on isExposed.
            throw new Error(`${key.toString()} has a circular dependency.`);
        }
        // Check the cache first
        const handleManager = this._handleManager;
        const localHandle = handleManager.getLocalInstanceHandle<TKey>(keyId);
        if (localHandle) {
            return localHandle;
        }

        let handle = localHandle || handleManager.getHandle(key);
        if (!handle) {
            return new Error(`${key.toString()} is being consumed, but has not been exposed by a parent scope.`);
        }

        const factoryEntry = handle.factory;
        const factory = factoryEntry.value;
        if (!factory) {
            return new Error(`${key.toString()} is being consumed synchronously, but was exposed asynchronously and has not been loaded.`);
        }

        // Find the highest possible scope at which an instance of T can be stored.
        stack.push(key);
        const instanceManager = handle.manager;
        let targetManager = key.useNarrowestScope ? handleManager : instanceManager || factoryEntry.manager;
        const dependencies = factory.dependencies || {};
        for (const id in dependencies) {
            const dependency = dependencies[id];
            if (((dependency as IResourceKeyWithOptions<any>).key || dependency as ResourceKey<any>) === resourceScopeKey) {
                continue;
            }
            // Recurse on dependencies.
            const dependencyHandle = this._getValidHandle(dependency, stack);
            if (dependencyHandle instanceof Error) {
                if (!(dependency as IResourceKeyWithOptions<any>).isOptional) {
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
            handle = new Handle<TKey, any>(factoryEntry, targetManager);
            // Place on targetManager, so that other levels can reuse
            targetManager.handles[keyId] = handle;
        }
        return handleManager.handles[keyId] = handle;
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
                this._getWritableHandleManager = this._fork;
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
     * @param isOptional {boolean} - if true, consuming an unexposed resource will return undefined
     * @returns an instance of the resource, if available in this scope or a parent.
     */
    public consume<TKey>(key: ResourceKey<TKey>, isOptional?: boolean): TKey {
        if (DEBUG) {
            logConsume(key, isOptional);
        }
        return this._handleManager.getConsumer().consume(key, isOptional, { owner: key.toString() });
    }

    /**
     * Obtains an instance of a resource with the given key exposed by either this scope
     * or a parent. Throws if the resource is not found and isOptional is not set.
     * @param key {ResourceKey} - a shared resource key corresponding to a specific named resource.
     * @param isOptional {boolean} - if true, consuming an unexposed resource will return undefined
     * @returns a promise for an instance of the resource, if available in this scope or a parent.
     */
    public consumeAsync<TKey>(key: ResourceKey<TKey>, isOptional?: boolean): Promise<TKey> {
        if (DEBUG) {
            logConsume(key, isOptional);
        }
        const handleManager = this._handleManager;
        return handleManager.getLoader().loadAllAsync({
            resource: {
                key: key,
                isOptional: isOptional
            }
        }).then(() => {
            return handleManager.getConsumer().consume(key, isOptional, { owner: key.toString() });
        });
    }

    /**
     * Ensures that the specified dependencies have been loaded for synchronous consumption.
     * @param dependencies {IResourceDependencies} - the dependencies to load.
     * @returns a promise that will complete when the specified resources are available.
     */
    public load<TKeys>(dependencies: IResourceDependencies<TKeys>): Promise<void> {
        return this._handleManager.getLoader().loadAllAsync(dependencies);
    }

    /**
     * Exposes an asynchronous loader for a resource with the given type-safe key.
     * @param key {ResourceKey} - a shared resource key corresponding to a specific named resource.
     * @param loader - the object that can asynchronously load a factory of the desired type
     */
    public exposeAsync<TKey, TFactory extends TKey>(key: ResourceKey<TKey>, loader: IResourceLoader<TFactory, any>): void {
        this._expose(key, {
            loader: loader
        });
    }

    /**
     * Exposes a factory for a resource with the given type-safe key.
     * @param key {ResourceKey} - a shared resource key corresponding to a specific named resource.
     * @param factory - the factory that will construct instances when required by this or any child scope.
     */
    public exposeFactory<TKey, TFactory extends TKey>(key: ResourceKey<TKey>, factory: IResourceFactory<TFactory, any>): void {
        this._expose(key, {
            value: factory
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
            value: new ConstantResourceFactory(instance)
        }, instance);

        return instance;
    }

    /**
     * Hides any resources exposed by parent scopes for the specified key.
     * @param key {ResourceKey} - a shared resource key corresponding to a specific named resource.
     */
    public block<TKey>(key: ResourceKey<TKey>): void {
        this._handleManager = this._getWritableHandleManager().block(key);
    }

    /**
     * Re-exposes the currently exposed resource at the specified key at the current resource scope.
     * The effect of this is that the lifetime of instances created by the resource system that depend on the
     * specific key will not exceed the lifetime of this resource scope.
     * @param key {ResourceKey} - a shared resource key corresponding to a specific named resource.
     */
    public bind<TKey>(key: ResourceKey<TKey>): void {
        this._handleManager = this._getWritableHandleManager().bind(key);
    }

    /**
     * Checks if a given resource key is exposed in the resource scope (including in parent scopes).
     * @param key {ResourceKey} - a shared resource key corresponding to a specific named resource.
     * @return {boolean}
     */
    public isExposed<TKey>(key: ResourceKey<TKey>): boolean {
        if (DEBUG) {
            logConsume(key, true);
        }
        const handleManager = this._handleManager;
        return !handleManager.isDisposed && handleManager.getConsumer().isExposed(key);
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

        let Injected = function (this: TInstance) {
            this.resources = resources;
            const instance = type.apply(this, arguments) || this;
            if (injectChildResourceScope) {
                hook(instance, disposeInstanceResources);
            }
            return instance;
        };

        if (DEBUG) {
            // This pattern results in the correct type being displayed in the debugger
            const wrappedConstructor = Injected;
            Injected = function (this: TInstance) {
                logBeginConstruction(type, 'Resources.injected');
                const instance = wrappedConstructor.apply(Object.create(type.prototype), arguments);
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
        return this._handleManager.getConsumer().resolve(dependencies);
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
    public resolved<TInstance, TParams, TDependencies>(
        type: IResolvable<TInstance, TParams, TDependencies>): new (params: TParams) => TInstance;

    /**
     * Produces a version of the provided constructor in which the dependencies have been resolved using resources.
     *
     * @param type - the type of object for which to create a resolved constructor.
     * @param dependencies - an object that maps names to {ResourceKey} instances.
     * @returns a version of the original constructor for the type with dependencies resolved.
     */
    public resolved<TInstance, TParams, TDependencies>(
        type: IResolvableConstructor<TInstance, TParams, TDependencies>,
        dependencies: IResourceDependencies<TDependencies>): new (params: TParams) => TInstance;

    public resolved<TInstance, TParams, TDependencies>(
        type: IResolvable<TInstance, TParams, TDependencies> | IResolvableConstructor<TInstance, TParams, TDependencies>,
        dependencies?: IResourceDependencies<TDependencies>): new (params: TParams) => TInstance {
        const finalDependencies = ObjectUtil.extend(ObjectUtil.extend({}, (type as IResolvable<TInstance, TParams, TDependencies>).dependencies), dependencies);
        const resolvedDependencies = this.resolve(finalDependencies);

        return getResolvedConstructor(type, resolvedDependencies);
    }

    /**
     * Produces a promise for a version of the provided constructor in which the dependencies have been resolved using resources.
     *
     * @param type - the type of object for which to create a resolved constructor. The type must have a public static readonly property
     * dependencies that maps names to {ResourceKey} instances
     * @returns a promise for a version of the original constructor for the type with dependencies resolved.
     */
    public resolvedAsync<TInstance, TParams, TDependencies>(
        type: IResolvable<TInstance, TParams, TDependencies>): Promise<new (params: TParams) => TInstance>;

    /**
     * Produces a promise for a version of the provided constructor in which the dependencies have been resolved using resources.
     *
     * @param type - the type of object for which to create a resolved constructor.
     * @param dependencies - an object that maps names to {ResourceKey} instances.
     * @returns a promise for a version of the original constructor for the type with dependencies resolved.
     */
    public resolvedAsync<TInstance, TParams, TDependencies>(
        type: IResolvableConstructor<TInstance, TParams, TDependencies>,
        dependencies: IResourceDependencies<TDependencies>): Promise<new (params: TParams) => TInstance>;

    public resolvedAsync<TInstance, TParams, TDependencies>(
        type: IResolvable<TInstance, TParams, TDependencies> | IResolvableConstructor<TInstance, TParams, TDependencies>,
        dependencies?: IResourceDependencies<TDependencies>): Promise<new (params: TParams) => TInstance> {
        dependencies = (type as IResolvable<TInstance, TParams, TDependencies>).dependencies || dependencies;
        return this.load(dependencies).then(() => this.resolved(type, dependencies));
    }

    /**
     * Disposes this resource scope and any resources bound to this scope's lifetime.
     */
    public dispose() {
        this._scope.dispose();
    }

    private _expose<TKey, TDependencies>(key: ResourceKey<TKey>, factoryInfo: IResourceFactoryInfo<TKey, TDependencies>, instance?: TKey): void {
        this._handleManager = this._getWritableHandleManager().expose(key, factoryInfo, instance);
    }

    // These methods are to support legacy call patterns by imitating old behavior
    private _getWritableHandleManager(): HandleManager {
        return this._handleManager;
    }

    private _fork(): HandleManager {
        delete this._getWritableHandleManager;
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
    const getTraceState = function (): IResourceTraceState {
        return window['__ResourceTraceState'] as IResourceTraceState;
    };

    logBeginConstruction = function <T extends new (...args: any[]) => any>(type: T, wrapperType: string): void {
        const traceState = getTraceState();
        if (traceState) {
            const typeName = type['name'];
            const {
                stack,
                types
            } = traceState;
            const parent = stack[stack.length - 1] || '_root';
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

    logConsume = function <TKey>(key: ResourceKey<TKey>, isOptional: boolean): void {
        const traceState = getTraceState();
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

export default ResourceScope;