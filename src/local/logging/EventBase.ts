// OneDrive:CoverageThreshold(96)

import { Manager } from './Manager';
import { IEvent, IEventMetadata } from './IEvent';
import CorrelationVector from './CorrelationVector';

var _id = 0;

export enum ClonedEventType {
    Single,
    Start,
    End
}

export enum ValidationErrorType {
    NoParent = 1 << 0
}

export class EventBase implements IEvent {
    public static eventNameDelimeter = ',';
    public static fullName = 'EventBase,';
    public static shortName = 'EventBase';

    id: number;
    parentId: number;
    eventName: string;
    shortEventName: string;
    startTime: number;
    endTime: number;
    enabled: boolean;
    critical: boolean;
    vector: CorrelationVector;
    data: any;
    validationErrors: number;
    metadata: { [key: string]: IEventMetadata };

    constructor(eventName: string, shortEventName: string, parent?: IEvent) {
        this.eventName = eventName;
        this.shortEventName = shortEventName;
        this.validationErrors = 0;

        this.id = _id++;

        this.enabled = this.isEnabled();
        this.critical = this.isCritical();

        // Set the parent id if needed
        if (parent) {
            this.parentId = parent.id;
        } else if (this.requiresParent()) {
            this.addValidationError(ValidationErrorType.NoParent);
        }

        // Set the start time
        this.startTime = Manager.getTime();

        if (parent) {
            this.vector = new CorrelationVector(parent.vector);
        } else {
            this.vector = new CorrelationVector(CorrelationVector.RootVector);
        }
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

    protected requiresParent() {
        // All events require parents by default
        return true;
    }

    protected isCritical() {
        // All events are not critical by default
        return false;
    }

    protected _logEvent(eventType: ClonedEventType) {
        Manager.logEvent(this, eventType);
    }

    private addValidationError(type: ValidationErrorType) {
        this.validationErrors = this.validationErrors | type;
        Manager.logValidationError(this, type);
    }
}