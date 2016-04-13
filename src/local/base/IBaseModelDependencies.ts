
import EventGroup from 'odsp-utilities/events/EventGroup';
import Async from 'odsp-utilities/async/Async';

interface IBaseModelDependencies {
    events?: typeof EventGroup;
    async?: typeof Async;
}

export default IBaseModelDependencies;
