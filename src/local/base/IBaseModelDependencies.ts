
import EventGroup = require('odsp-utilities/events/EventGroup');
import Async = require('odsp-utilities/async/Async');

interface IBaseModelDependencies {
    events?: typeof EventGroup;
    async?: typeof Async;
}

export default IBaseModelDependencies;
