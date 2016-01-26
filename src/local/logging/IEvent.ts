import CorrelationVector from './CorrelationVector';

export interface IEventMetadata {
    baseType?: string;
    isMetric?: boolean;
    isKey?: boolean;
    type: string;
    typeRef?: any;
    definedInName: string;
    definedInFullName: string;
}

export interface IEvent {
    id: number;
    parentId: number;
    eventName: string;
    shortEventName: string;
    startTime: number;
    endTime: number;
    enabled: boolean;
    critical: boolean;
    data: any;
    vector: CorrelationVector;
    metadata: { [key: string]: IEventMetadata };
    validationErrors: number;
}