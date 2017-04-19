
import {
    IResolvable,
    IResolvableConstructor,
    IResolvedConstructor,
    IResource,
    IResourceFactory,
    IResourceLoader,
    IResourceDependencies,
    getResolvedConstructor,
    ResourceKey,
    IResourceDependency
} from './ResourceScope';
import { isDisposable } from '../disposable/Disposable';
import Promise from '../async/Promise';

/**
 * An implementation of IResourceLoader that constructs a {ResolvedResourceFactory} from the type that the load function resolves to.
 */
export class ResolvedResourceLoader<TInstance, TDependencies, TResources extends IResourceDependencies<TDependencies>> implements IResourceLoader<TInstance> {
    private readonly _dependencies: TResources;

    private _load: () => Promise<IResolvableConstructor<TInstance, {}, TDependencies>>;

    constructor(load: () => Promise<IResolvableConstructor<TInstance, {}, TDependencies> & IResolvable<TDependencies, TResources>>);
    constructor(load: () => Promise<IResolvableConstructor<TInstance, {}, TDependencies>>, dependencies: TResources);

    constructor(load: () => Promise<IResolvableConstructor<TInstance, {}, TDependencies> & {
        dependencies?: TResources;
    }>, dependencies?: TResources) {
        this._load = load;
        this._dependencies = dependencies;
    }

    public load(): Promise<IResourceFactory<TInstance, TDependencies, TResources>> {
        const promise = this._load().then((type: IResolvableConstructor<TInstance, {}, TDependencies>) => {
            return new ResolvedResourceFactory(type, this._dependencies);
        });

        this.load = () => promise;

        return promise;
    }
}

/**
 * An implementation of IResourceFactory that instantiates the passed type, resolving any dependencies from resources.
 */
export class ResolvedResourceFactory<TInstance, TDependencies, TResources extends IResourceDependencies<TDependencies>> implements IResourceFactory<TInstance, TDependencies, TResources> {
    public readonly dependencies: TResources;

    private _type: IResolvableConstructor<TInstance, {}, TDependencies>;

    constructor(type: IResolvableConstructor<TInstance, {}, TDependencies> & IResolvable<TDependencies, TResources>);
    constructor(type: IResolvableConstructor<TInstance, {}, TDependencies>, dependencies: TResources);

    constructor(type: IResolvableConstructor<TInstance, {}, TDependencies> & {
        dependencies?: TResources;
    }, dependencies?: TResources) {
        this._type = type;

        this.dependencies = <TResources>{
            ...(type.dependencies || {}),
            ...(dependencies || {})
        };
    }

    public create(dependencies: TDependencies): IResource<TInstance> {
        const instance = new this._type({}, dependencies);

        return {
            instance: instance,
            disposable: instance
        };
    }
}

/**
 * An implementation of IResourceFactory that provides a constructor for the passed type with dependencies resolved from resources.
 */
export class ResolvedResourceTypeFactory<TInstance, TParams, TDependencies, TResources extends IResourceDependencies<TDependencies>> implements IResourceFactory<IResolvedConstructor<TInstance, TParams>, TDependencies, TResources> {
    public readonly dependencies: TResources;

    private _type: IResolvableConstructor<TInstance, TParams, TDependencies>;

    constructor(type: IResolvableConstructor<TInstance, TParams, TDependencies> & IResolvable<TDependencies, TResources>);
    constructor(type: IResolvableConstructor<TInstance, TParams, TDependencies>, dependencies: TResources);

    constructor(type: IResolvableConstructor<TInstance, TParams, TDependencies> & {
        dependencies?: TResources;
    }, dependencies?: TResources) {
        this._type = type;

        this.dependencies = <TResources>{
            ...(type.dependencies || {}),
            ...(dependencies || {})
        };
    }

    public create(dependencies: TDependencies): IResource<IResolvedConstructor<TInstance, TParams>> {
        return {
            instance: getResolvedConstructor(this._type, dependencies)
        };
    }
}

/**
 * An implementation of IResourceFactory for classes that have no dependencies and take no parameters.
 */
export class SimpleResourceFactory<TInstance> implements IResourceFactory<TInstance, {}, {}> {
    public readonly dependencies: {};

    private _type: new () => TInstance;

    constructor(type: new () => TInstance) {
        this._type = type;

        this.dependencies = {};
    }

    public create(): IResource<TInstance> {
        const instance = new this._type();

        return {
            instance: instance,
            disposable: isDisposable(instance) && instance
        };
    }
}

export interface IAliasResourceFactoryDependencies<TInstance> {
    value: () => TInstance;
}

export type IAliasableDependency<TInstance> = { lazy: IResourceDependency<TInstance, () => TInstance>; };

export class AliasResourceLoader<TInstance> implements IResourceLoader<TInstance> {
    private readonly _load: (this: void) => Promise<IAliasableDependency<TInstance>>;

    constructor(load: (this: void) => Promise<IAliasableDependency<TInstance>>) {
        this._load = load;
    }

    public load(): Promise<IResourceFactory<TInstance, {}, {}>> {
        const promise = this._load().then((dependency: IAliasableDependency<TInstance>) => {
            return new AliasResourceFactory(dependency);
        });

        this.load = () => promise;

        return promise;
    }
}

/**
 * An implementation of IResourceFactory which wraps an existing resource key.
 */
export class AliasResourceFactory<TInstance> implements IResourceFactory<TInstance, IAliasResourceFactoryDependencies<TInstance>, IResourceDependencies<IAliasResourceFactoryDependencies<TInstance>>> {
    public readonly dependencies: IResourceDependencies<IAliasResourceFactoryDependencies<TInstance>>;

    constructor(dependency: IAliasableDependency<TInstance>) {
        this.dependencies = {
            value: dependency.lazy
        };
    }

    public create(dependencies: IAliasResourceFactoryDependencies<TInstance>): IResource<TInstance> {
        return {
            instance: dependencies.value()
        };
    }
}

/**
 * Shorthand for creating a {ResourceKey} with attached factory that gets its name from the containing module.
 */
export function createDefaultResourceKey<TInstance, TDependencies, TResources extends IResourceDependencies<TDependencies>>(
    require: <T>(path: string) => T,
    type: IResolvableConstructor<TInstance, {}, TDependencies> & IResolvable<TDependencies, TResources>): ResourceKey<TInstance>;
export function createDefaultResourceKey<TInstance, TDependencies, TResources extends IResourceDependencies<TDependencies>>(
    require: <T>(path: string) => T,
    type: IResolvableConstructor<TInstance, {}, TDependencies>,
    dependencies: TResources): ResourceKey<TInstance>;

export function createDefaultResourceKey<TInstance, TDependencies, TResources extends IResourceDependencies<TDependencies>>(
    require: <T>(path: string) => T,
    type: IResolvableConstructor<TInstance, {}, TDependencies> & {
        dependencies?: TResources;
    },
    dependencies?: TResources): ResourceKey<TInstance> {
    return new ResourceKey({
        name: require<{ id: string }>('module').id,
        factory: new ResolvedResourceFactory(type, dependencies)
    });
}

/**
 * Shorthand for creating a {ResourceKey} with attached type factory that gets its name from the containing module.
 */
export function createDefaultTypeResourceKey<TInstance, TParams, TDependencies, TResources extends IResourceDependencies<TDependencies>>(
    require: <T>(path: string) => T,
    type: IResolvableConstructor<TInstance, TParams, TDependencies> & IResolvable<TDependencies, TResources>): ResourceKey<IResolvedConstructor<TInstance, TParams>>;
export function createDefaultTypeResourceKey<TInstance, TParams, TDependencies, TResources extends IResourceDependencies<TDependencies>>(
    require: <T>(path: string) => T,
    type: IResolvableConstructor<TInstance, TParams, TDependencies>,
    dependencies: TResources): ResourceKey<IResolvedConstructor<TInstance, TParams>>;

export function createDefaultTypeResourceKey<TInstance, TParams, TDependencies, TResources extends IResourceDependencies<TDependencies>>(
    require: <T>(path: string) => T,
    type: IResolvableConstructor<TInstance, TParams, TDependencies> & {
        dependencies?: TResources;
    },
    dependencies?: TResources): ResourceKey<IResolvedConstructor<TInstance, TParams>> {
    return new ResourceKey({
        name: require<{ id: string }>('module').id,
        factory: new ResolvedResourceTypeFactory(type, dependencies)
    });
}

export * from './ResourceScope';
