
import { IComponentDependencies } from '@ms/odsp-utilities/lib/component/Component';
import EventGroup from '@ms/odsp-utilities/lib/events/EventGroup';
import Async from '@ms/odsp-utilities/lib/async/Async';
import ObservablesFactory from '../utilities/knockout/ObservablesFactory';

interface IBaseModelDependencies extends IComponentDependencies {
    /**
     * An override for the event group type constructed by the base model.
     * Used for testing only.
     *
     * @type {typeof EventGroup}
     */
     EventGroup?: typeof EventGroup;

    /**
     * An override for the async type constructed by the base model.
     * Used for testing only.
     *
     * @type {typeof Async}
     */
    Async?: typeof Async;

    /**
     * An override for the observables factory type constructed by the base model.
     * Used for testing only.
     *
     * @type {typeof ObservablesFactory}
     */
    ObservablesFactory?: typeof ObservablesFactory;

    /**
     * Previous name for the EventGroup field.
     * Deprecated.
     *
     * @type {typeof EventGroup}
     */
    events?: typeof EventGroup;

    /**
     * Previous name for the Async field.
     * Deprecated.
     *
     * @type {typeof Async}
     */
    async?: typeof Async;
}

export default IBaseModelDependencies;
