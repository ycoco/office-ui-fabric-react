
import EventGroup from '@ms/odsp-utilities/lib/events/EventGroup';
import Async from '@ms/odsp-utilities/lib/async/Async';

interface IBaseModelDependencies {
    events?: typeof EventGroup;
    async?: typeof Async;
}

export default IBaseModelDependencies;
