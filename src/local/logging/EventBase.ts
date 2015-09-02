// OneDrive:CoverageThreshold(96)

import { Manager } from './Manager';
import { IEvent, IEventMetadata } from './IEvent';

var _id = 0;

export enum ClonedEventType {
    Single,
    Start,
    End
}

export class EventBase implements IEvent {
    public static eventNameDelimeter = ',';
    public static fullName = 'EventBase,';
    public static shortName = 'EventBase';

    id: number;
    parentId: number;
    eventName: string;
    startTime: number;
    endTime: number;
    enabled: boolean;
    critical: boolean;
    data: any;
    metadata: { [key: string]: IEventMetadata };

    constructor(eventName: string, parent?: IEvent) {
        this.eventName = eventName;

        this.id = _id++;

        this.enabled = this.isEnabled();
        this.critical = this.isCritical();

        // Set the parent id if needed
        if (parent) {
            this.parentId = parent.id;
        }

        // Set the start time
        this.startTime = Manager.getTime();
    }

    /**
     * This will return true if the event is of this type
     * @param event {IEvent} The event to compare
     */
    public static isTypeOf(event: IEvent) {
        return event.eventName.indexOf(this.shortName + this.eventNameDelimeter) >= 0;
    }

    /** This is called on all string data to clean it */
    protected cleanString(str: string) {
        return Manager.cleanString(str);
    }

    protected isEnabled() {
        // All events are enabled by default
        return true;
    }

    protected isCritical() {
        // All events are not critical by default
        return false;
    }

    protected _logEvent(eventType: ClonedEventType) {
        Manager.logEvent(this, eventType);
    }
}