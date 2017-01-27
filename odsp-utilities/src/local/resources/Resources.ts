import { IResolvable, IResolvableConstructor, IResolvedConstructor, IResource, IResourceFactory, IResourceLoader, IResourceDependencies, getResolvedConstructor, ResourceKey } from './ResourceScope';
import { isDisposable } from '../disposable/Disposable';
import Promise from '../async/Promise';

/**
 * An implementation of IResourceLoader that constructs a {ResolvedResourceFactory} from the type that the load function resolves to.
 */
export class ResolvedResourceLoader<TInstance, TDependencies> implements IResourceLoader<TInstance, TDependencies> {
    private readonly _dependencies: IResourceDependencies<TDependencies>;
    private _load: () => Promise<IResolvableConstructor<TInstance, {}, TDependencies>>;

    constructor(load: () => Promise<IResolvable<TInstance, {}, TDependencies>>);
    constructor(load: () => Promise<IResolvableConstructor<TInstance, {}, TDependencies>>, dependencies: IResourceDependencies<TDependencies>);
    constructor(
        load: () => Promise<IResolvable<TInstance, {}, TDependencies> | IResolvableConstructor<TInstance, {}, TDependencies>>,
        dependencies?: IResourceDependencies<TDependencies>) {
        this._load = load;
        this._dependencies = dependencies;
    }

    public load(): Promise<IResourceFactory<TInstance, TDependencies>> {
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
export class ResolvedResourceFactory<TInstance, TDependencies> implements IResourceFactory<TInstance, TDependencies> {
    public readonly dependencies: IResourceDependencies<TDependencies>;

    private _type: IResolvableConstructor<TInstance, {}, TDependencies>;
    constructor(type: IResolvable<TInstance, {}, TDependencies>);
    constructor(type: IResolvableConstructor<TInstance, {}, TDependencies>, dependencies: IResourceDependencies<TDependencies>);
    constructor(type: IResolvable<TInstance, {}, TDependencies> | IResolvableConstructor<TInstance, {}, TDependencies>, dependencies?: IResourceDependencies<TDependencies>) {
        this._type = type;
        this.dependencies = dependencies || (type as IResolvable<TInstance, {}, TDependencies>).dependencies;
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
export class ResolvedResourceTypeFactory<TInstance, TParams, TDependencies> implements IResourceFactory<IResolvedConstructor<TInstance, TParams>, TDependencies> {
    public readonly dependencies: IResourceDependencies<TDependencies>;

    private _type: IResolvableConstructor<TInstance, TParams, TDependencies>;
    constructor(type: IResolvable<TInstance, TParams, TDependencies>);
    constructor(type: IResolvableConstructor<TInstance, TParams, TDependencies>, dependencies: IResourceDependencies<TDependencies>);
    constructor(type: IResolvable<TInstance, TParams, TDependencies> | IResolvableConstructor<TInstance, TParams, TDependencies>, dependencies?: IResourceDependencies<TDependencies>) {
        this._type = type;
        this.dependencies = dependencies || (type as IResolvable<TInstance, TParams, TDependencies>).dependencies;
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
export class SimpleResourceFactory<TInstance> implements IResourceFactory<TInstance, {}> {
    public get dependencies() {
        return {};
    }

    private _type: new () => TInstance;
    constructor(type: new () => TInstance) {
        this._type = type;
    }

    public create(): IResource<TInstance> {
        const instance = new this._type();
        return {
            instance: instance,
            disposable: isDisposable(instance) && instance
        };
    }
}

/**
 * An implementation of IResourceFactory which wraps an existing resource key.
 */
export class AliasResourceFactory<TInstance> implements IResourceFactory<TInstance, {
    value: TInstance;
}> {
    public readonly dependencies: IResourceDependencies<{
        value: TInstance;
    }>;

    constructor(key: ResourceKey<TInstance>) {
        this.dependencies = {
            value: key
        };
    }

    public create(dependencies: {
        value: TInstance;
    }): IResource<TInstance> {
        return {
            instance: dependencies.value
        };
    }
}

/**
 * Shorthand for creating a {ResourceKey} with attached factory that gets its name from the containing module.
 */
export function createDefaultResourceKey<TInstance, TDependencies>(
    require: <T>(path: string) => T,
    type: IResolvable<TInstance, {}, TDependencies>): ResourceKey<TInstance>;
export function createDefaultResourceKey<TInstance, TDependencies>(
    require: <T>(path: string) => T,
    type: IResolvableConstructor<TInstance, {}, TDependencies>,
    dependencies: IResourceDependencies<TDependencies>): ResourceKey<TInstance>;
export function createDefaultResourceKey<TInstance, TDependencies>(
    require: <T>(path: string) => T,
    type: IResolvable<TInstance, {}, TDependencies> | IResolvableConstructor<TInstance, {}, TDependencies>,
    dependencies?: IResourceDependencies<TDependencies>): ResourceKey<TInstance> {
    return new ResourceKey({
        name: require<{ id: string }>('module').id,
        factory: new ResolvedResourceFactory(type, dependencies)
    });
}

/**
 * Shorthand for creating a {ResourceKey} with attached type factory that gets its name from the containing module.
 */
export function createDefaultTypeResourceKey<TInstance, TParams, TDependencies>(
    require: <T>(path: string) => T,
    type: IResolvable<TInstance, TParams, TDependencies>): ResourceKey<IResolvedConstructor<TInstance, TParams>>;
export function createDefaultTypeResourceKey<TInstance, TParams, TDependencies>(
    require: <T>(path: string) => T,
    type: IResolvableConstructor<TInstance, TParams, TDependencies>,
    dependencies: IResourceDependencies<TDependencies>): ResourceKey<IResolvedConstructor<TInstance, TParams>>;
export function createDefaultTypeResourceKey<TInstance, TParams, TDependencies>(
    require: <T>(path: string) => T,
    type: IResolvable<TInstance, TParams, TDependencies> | IResolvableConstructor<TInstance, TParams, TDependencies>,
    dependencies?: IResourceDependencies<TDependencies>): ResourceKey<IResolvedConstructor<TInstance, TParams>> {
    return new ResourceKey({
        name: require<{ id: string }>('module').id,
        factory: new ResolvedResourceTypeFactory(type, dependencies)
    });
}

export * from './ResourceScope';
