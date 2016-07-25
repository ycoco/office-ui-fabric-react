
import { IComponentDependencies } from '@ms/odsp-utilities/lib/component/Component';
import EventGroup from '@ms/odsp-utilities/lib/events/EventGroup';
import Async from '@ms/odsp-utilities/lib/async/Async';

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
     * Deprecated.
     *
     * @type {typeof EventGroup}
     */
    events?: typeof EventGroup;
    /**
     * Deprecated.
     *
     * @type {typeof Async}
     */
    async?: typeof Async;
}

export default IBaseModelDependencies;
