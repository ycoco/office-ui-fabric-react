import { IEvent } from  "./IEvent";
import { ClonedEventType } from  "./EventBase";

interface IClonedEvent extends IEvent {
    eventType: ClonedEventType;
}

export = IClonedEvent;