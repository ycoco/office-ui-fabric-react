
import IDisposable from '../disposable/IDisposable';
import Scope, { IScope } from '../scope/Scope';
import { IResourceDependencies, ResourceScope, ResourceKey, resourceScopeKey } from '../resources/Resources';
import IConstructor from '../interfaces/IConstructor';

export interface IComponentParams {
    /**
     * A resource scope to use when not using a wrapper constructor.
     * This value should be passed in dependencies instead.
     *
     * @type {ResourceScope}
     */
    resources?: ResourceScope;
}

export interface IComponentDependencies {
    /**
     * A resource scope to use when not using a wrapper constructor.
     * This value is preferred over using params.
     *
     * @type {ResourceScope}
     */
    resources?: ResourceScope;
}

/**
 * Base class for lifetime-managed, scoped components.
 *
 * Many web components ultimately need to set up subscriptions to events,
 * manage HTML elements, wait on asychronous activities, and clean up
 * loaded state. The `Component` base class provides a way to create a hierarchy
 * of objects with lifetime management and automatic resource scoping.
 *
 * `Component` combines the benefits of `ResourceScope` and `Scope` into a single
 *  package for convenience.
 *
 * If a component-like class needs the benefits of lifetime management but cannot
 * extend `Component`, consider wrapping a `Scope` and a `ResourceScope` in order
 * to create child components.
 *
 * @export
 * @class Component
 * @implements {IDisposable}
 *
 * @example
 *  export interface ISearchServiceParams extends IComponentParams {
 *      searchMode: SearchMode;
 *  }
 *
 *  export interface ISearchDependencies extends IComponentDependencies {
 *      context: IContext
 *      DataRequestor?: typeof DataRequestor;
 *  }
 *
 *  export default class SearchService extends Component {
 *      public static readonly dependencies = ObjectUtil.extend({
 *          context: contextKey
 *      }, Component.dependencies);
 *
 *      private _dataRequestor: DataRequestor;
 *      private _context: IContext;
 *      private _searchMode: SearchMode;
 *
 *      constructor(params: ISearchServiceParams, dependencies: ISearchServiceDependencies) {
 *          super(params, dependencies);
 *
 *          const {
 *              searchMode
 *          } = params;
 *
 *          const {
 *              context
 *              DataRequestor: dataRequestorType // This parameter is only used in unit tests
 *          } = dependencies;
 *
 *          this._searchMode = searchMode;
 *
 *          this._context = context;
 *
 *          this._dataRequestor = new (this.child(dataRequestorType))();
 *      }
 *
 *      public search(options: ISearchOptions): Promise<ISearchResult> {
 *          return this._dataRequestor.getData(...).then((data: ISearchResponse) => {
 *              return this._processResponse(data);
 *          });
 *      }
 *  }
 */
export class Component implements IDisposable {
    public static readonly dependencies: IResourceDependencies<IComponentDependencies> = {
        resources: resourceScopeKey
    };

    /**
     * The resource scope from which this component pulls resources.
     *
     * @type {ResourceScope}
     */
    public readonly resources: ResourceScope;

    /**
     * Gets the lifetime scope manager for this component.
     * In general, use `new (this.child(Type))()` to create child components
     * with proper lifetime management.
     * However, `this.scope` can be used to
     *
     * @protected
     * @type {Scope}
     */
    protected get scope(): IScope {
        return this._Component_scope;
    }

    /**
     * Determines whether or not this component has been disposed.
     *
     * @readonly
     * @protected
     * @type {boolean}
     */
    protected get isDisposed(): boolean {
        return this.scope.isDisposed;
    }

    /**
     * The lifetime scope manager for this component.
     * This is private to prevent premature disposal.
     *
     * @private
     * @type {Scope}
     */
    private readonly _Component_scope: Scope;

    /**
     * Creates an instance of Component.
     * In general, derived classes should invoke `super(params, dependencies)`, supplying both
     * `params` and `dependencies` to the `Component` class.
     * When creating a new instance of a derived component, use either
     * `new (resources.injected(MyComponent))()`
     * when outside a `Component` or
     * `new (this.child(MyComponent))()`
     * when inside a `Component`. This will ensure that resources are properly passed and lifetimes
     * are properly managed.
     *
     * @param {IComponentParams} [params={}] Optional params to control behaviors of this class.
     * In general, classes which extend components
     * @param {IComponentDependencies} [dependencies={}] Optional dependencies to override types consumed by this class.
     * `dependencies` is intended for use during unit testing, to override types consumed outside of resourcing.
     * Most dependency injection should be done using `ResourceScope`.
     */
    constructor(params: IComponentParams = {}, dependencies: IComponentDependencies = {}) {
        const {
            resources = (dependencies.resources || params.resources)
        } = this;

        this.resources = resources;

        this._Component_scope = new Scope();
    }

    public dispose() {
        this._Component_scope.dispose();
    }

    /**
     * Produces a constructor for a type which injects instances
     * with this component's current resources and binds them
     * to this component's lifetime. New code should prefer `this.child`.
     *
     * @protected
     * @template T
     * @param {T} type
     * @returns {T}
     */
    protected managed<T extends IConstructor>(type: T): T {
        if (this.resources) {
            type = this.resources.injected(type);
        }
        return this.scope.attached(type);
    }

    /**
     * Produces a constructor for the type described by the specified resource that binds
     * instances to this component's lifetime.
     *
     * @protected
     * @template T the type of the constructor
     * @param {ResourceKey} key the resource key for the type
     * @returns {T}
     */
    protected child<T extends IConstructor>(key: ResourceKey<T>): T;
    /**
     * Produces a constructor for a type which injects instances
     * with a child resource scope and binds them to this component's
     * lifetime.
     *
     * @protected
     * @template T
     * @param {T} type
     * @returns {T}
     */
    protected child<T extends IConstructor>(type: T): T;
    protected child<T extends IConstructor>(keyOrType: T | ResourceKey<T>): T {
        let type: T;
        if (keyOrType instanceof ResourceKey) {
            type = this.resources.consume(keyOrType);
        } else if (this.resources) {
            type = this.resources.injected(keyOrType, {
                injectChildResourceScope: true
            });
        } else {
            type = keyOrType;
        }
        return this.scope.attached(type);
    }
}

export default Component;