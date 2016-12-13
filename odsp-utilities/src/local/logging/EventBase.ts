// OneDrive:CoverageThreshold(96)

import { Manager } from './Manager';
import { EventFieldType, IEvent, IEventMetadata, IEventMetadataDeclarationTable, IEventMetadataTable } from './IEvent';
import CorrelationVector from './CorrelationVector';
import ObjectUtil from '../object/ObjectUtil';
import Features from '../features/Features';
import IFeature = require('../features/IFeature');

let _id = 0;

export enum ClonedEventType {
    Single,
    Start,
    End
}

export enum ValidationErrorType {
    NoParent = 1 << 0
}

export enum AccountType {
    Consumer,
    ConsumerAnonymous,
    Business,
    BusinessAnonymous,
    Unknown
}

export interface IEventProps {
    eventName: string;
    shortEventName: string;
    critical?: boolean;
    requiresParent?: boolean;
    samplingFeature?: IFeature;
}

export interface IEventType<DataType> {
    enabled(this: { prototype: IEvent }): boolean;
    isTypeOf(this: { prototype: IEvent & { data: DataType } }, event: IEvent): event is IEvent & { data: DataType };
}

export function addEventProps(
    eventPrototype: EventBase<any, any>,
    props: IEventProps,
    metadata: IEventMetadataDeclarationTable,
    baseClass?: { prototype: { metadata: IEventMetadataTable } }): void {
    ObjectUtil.extend(eventPrototype, props);

    const resultMetadata: IEventMetadataTable = <IEventMetadataTable>{};
    for (const key in metadata) {
        let item = metadata[key];
        const result = resultMetadata[key] = <IEventMetadata>(typeof item === 'number' ? { type: item } : item);
        result.definedInName = props.shortEventName;
        if (result.type === EventFieldType.Number) {
            result.isMetric = true;
        }
    }

    eventPrototype.metadata = baseClass ? ObjectUtil.extend(ObjectUtil.extend({}, baseClass.prototype.metadata), resultMetadata) : resultMetadata;
}

export class EventBase<StartDataType, DataType extends StartDataType> implements IEvent, IEventProps {
    public readonly id: number;
    public readonly parentId: number;
    public eventName: string;
    public shortEventName: string;
    public readonly startTime: number;
    public endTime: number;
    public readonly enabled: boolean;
    public critical: boolean;
    public readonly vector: CorrelationVector;
    public readonly data: DataType;
    public validationErrors: number;
    public metadata: IEventMetadataTable;
    public requiresParent: boolean;
    public readonly samplingFeature: IFeature;

    protected constructor(data: StartDataType, startType: ClonedEventType, parent?: IEvent) {
        this.validationErrors = 0;
        this.data = <DataType>{};

        this.id = _id++;

        this.enabled = this._isEnabled();
        // Set the parent id if needed
        if (parent) {
            this.parentId = parent.id;
        } else if (this.requiresParent) {
            this.addValidationError(ValidationErrorType.NoParent);
        }

        // Set the start time
        this.startTime = Manager.getTime();

        this.vector = new CorrelationVector(parent ? parent.vector : CorrelationVector.RootVector);

        // Set the data if we have it
        if (data) {
            this._setData(data);
        }

        // Send the start event
        this._logEvent(startType);
    }

    /**
     * This will return true if the event is enabled
     */
    public static enabled(this: { prototype: EventBase<any, any> }) {
        return this.prototype._isEnabled();
    }

    /**
     * This will return true if the event is of this type
     * @param event {IEvent} The event to compare
     */
    public static isTypeOf<DataType>(this: { prototype: IEvent }, event: IEvent): event is IEvent & { data: DataType } {
        return event.eventName.indexOf(this.prototype.shortEventName + ',') >= 0;
    }

    protected _isEnabled() {
        // All events are enabled by default
        return !this.samplingFeature || Features.isFeatureEnabled(this.samplingFeature);
    }

    protected _setData(data: {}) {
        const stored = this.data;
        for (const key of Object.keys(data)) {
            if (key in this.metadata) {
                const value = data[key];
                switch (typeof value) {
                    case 'string':
                        stored[key] = Manager.cleanString(value);
                        break;
                    case 'undefined':
                        break;
                    default:
                        stored[key] = value;
                        break;
                }
            }
        }
    }

    protected _logEvent(eventType: ClonedEventType) {
        Manager.logEvent(this, eventType);
    }

    private addValidationError(type: ValidationErrorType) {
        this.validationErrors = this.validationErrors | type;
        Manager.logValidationError(this, type);
    }
}

const proto = EventBase.prototype;
proto.eventName = 'EventBase,';
proto.shortEventName = 'EventBase';
// All events are not critical by default
proto.critical = false;
// All events require parents by default
proto.requiresParent = true;
