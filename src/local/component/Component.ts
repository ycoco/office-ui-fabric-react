
import IDisposable from '../disposable/IDisposable';
import Scope from '../scope/Scope';
import ResourceScope = require('../resources/ResourceScope');
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

export default class Component implements IDisposable {
    public resources: ResourceScope;

    /**
     * Gets the lifetime scope manager for this component.
     *
     * @protected
     * @type {Scope}
     */
    protected scope: Scope;

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

    constructor(params: IComponentParams = {}, dependencies: IComponentDependencies = {}) {
        let resources: ResourceScope;

        ({
            resources = ({ resources } = params, resources)
        } = this);

        this.resources = resources;

        this.scope = new Scope({
            wrap: <T extends IConstructor>(type: T) => {
                let resources = new ResourceScope(this.resources);

                return resources.injected(type);
            }
        });
    }

    public dispose() {
        this.scope.dispose();
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