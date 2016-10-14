 // OneDrive:CoverageThreshold(80)

import { EventBase, ClonedEventType } from './EventBase';
import { IEvent } from './IEvent';

var callingFromInside = false;

export class SingleEventBase<SingleDataType> extends EventBase {
    public static fullName = 'SingleEventBase,';
    public static shortName = 'SingleEventBase';

    constructor(eventName: string, shortEventName: string, parent?: IEvent) {
        if (!callingFromInside) {
            throw "Use logData method for single events";
        }
        super(eventName, shortEventName, parent);
        // Make sure data has a value
        if (!this.data) {
            this.data = {};
        }
    }

    protected static _logData<SingleDataType>(eventConstructor: { new (parent?: IEvent): SingleEventBase<SingleDataType> }, data: SingleDataType, parent?: IEvent) {
        callingFromInside = true;

        try {
            var event = new eventConstructor(parent);
            event.setSingleData(data);
            event._logEvent(ClonedEventType.Single);
        }
        finally {
            callingFromInside = false;
        }

        return event;
    }

    protected setSingleData(data: SingleDataType) {
        // The single event to copy data that will be overridden
    }
}