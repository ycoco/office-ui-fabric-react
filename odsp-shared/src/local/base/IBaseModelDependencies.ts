
import { IComponentDependencies } from '@ms/odsp-utilities/lib/component/Component';
import EventGroup from '@ms/odsp-utilities/lib/events/EventGroup';
import Async from '@ms/odsp-utilities/lib/async/Async';
import ObservablesFactory, { IKnockoutFactoryParams } from '../utilities/knockout/ObservablesFactory';

interface IBaseModelDependencies extends IComponentDependencies {
    /**
     * An override for the event group type constructed by the base model.
     * Used for testing only.
     *
     * @type {typeof EventGroup}
     */
     EventGroup?: new (owner?: any) => EventGroup;

    /**
     * An override for the async type constructed by the base model.
     * Used for testing only.
     *
     * @type {typeof Async}
     */
    Async?: new (owner?: any) => Async;

    /**
     * An override for the observables factory type constructed by the base model.
     * Used for testing only.
     *
     * @type {typeof ObservablesFactory}
     */
    ObservablesFactory?: new (params?: IKnockoutFactoryParams) => ObservablesFactory;
}

export default IBaseModelDependencies;
