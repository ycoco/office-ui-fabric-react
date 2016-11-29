import { IResolvable, IResolvableConstructor, IResource, IResourceFactory, IResourceLoader, IResourceDependencies } from './ResourceScope';
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
        this.dependencies = (type as IResolvable<TInstance, {}, TDependencies>).dependencies || dependencies;
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
 * An implementation of IResourceFactory for classes that have no dependencies and take no parameters.
 */
export class SimpleResourceFactory<TInstance> implements IResourceFactory<TInstance, void> {
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

export * from './ResourceScope';
