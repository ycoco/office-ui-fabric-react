
import IDisposable from '../disposable/IDisposable';
import Scope, { IScope } from '../scope/Scope';
import { ResourceScope } from '../resources/Resources';
import IConstructor from '../interfaces/IConstructor';

export interface IComponentParams {
    /**
     * A resource scope to use when not using a wrapper constructor.
     *
     * @type {ResourceScope}
     */
    resources?: ResourceScope;
}

export interface IComponentDependencies {
    // None needed.
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
 *      DataRequestor?: typeof DataRequestor;
 *  }
 *
 *  export default class SearchService extends Component {
 *      private _dataRequestor: DataRequestor;
 *      private _context: IContext;
 *      private _searchMode: SearchMode;
 *
 *      constructor(params: ISearchServiceParams) {
 *          super(params);
 *
 *          let {
 *              searchMode
 *          } = params;
 *
 *          let {
 *              DataRequestor: dataRequestorType
 *          } = dependencies;
 *
 *           this._searchMode = searchMode;
 *
 *          this._context = this.resources.consume(contextKey);
 *
 *          this._dataRequestor = new (this.child(DataRequestor))();
 *      }
 *
 *      public search(options: ISearchOptions): Promise<ISearchResult> {
 *          return this._dataRequestor.getData(...).then((data: ISearchResponse) => {
 *              return this._processResponse(data);
 *          });
 *      }
 *  }
 */
export default class Component implements IDisposable {
    /**
     * The resource scope from which this component pulls resources.
     *
     * @type {ResourceScope}
     */
    public resources: ResourceScope;

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
    private _Component_scope: Scope;

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
        let resources: ResourceScope;

        ({
            resources = ({ resources } = params, resources)
        } = this);

        this.resources = resources;

        let wrap: <T extends IConstructor>(type: T) => T;

        if (resources) {
            wrap = <T extends IConstructor>(type: T) => {
                let resources = new ResourceScope(this.resources);

                return resources.injected(type);
            };
        }

        this._Component_scope = new Scope({
            wrap: wrap
        });
    }

    public dispose() {
        this._Component_scope.dispose();
    }

    /**
     * Produces a constructor for a type which injects instances
     * with this component's current resources and binds them
     * to this component's lifetime.
     *
     * @protected
     * @template T
     * @param {T} type
     * @returns {T}
     */
    protected managed<T extends IConstructor>(type: T): T {
        let scope = this.scope;

        let Injected = this.resources && this.resources.injected(type) || type;

        let managedConstructor = function Managed(...args: any[]) {
            let instance = Injected.apply(this, args) || this;

            scope.attach(instance);

            return instance;
        };

        if (DEBUG) {
            let {
                name
            } = <{ name?: string; }>managedConstructor;

            if (name) {
                let {
                    name: typeName = 'Managed'
                } = <{ name?: string; }>type;

                let managedDefinition = managedConstructor.toString().replace(name, typeName);

                /* tslint:disable:no-eval */
                managedConstructor = eval(`(${managedDefinition})`);
                /* tslint:enable:no-eval */
            }
        }

        let Managed: T = <any>managedConstructor;

        Managed.prototype = Injected.prototype;

        return Managed;
    }

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
    protected child<T extends IConstructor>(type: T): T {
        return this.scope.attached(type);
    }
}