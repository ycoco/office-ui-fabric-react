import CorrelationVector from './CorrelationVector';

export interface IEventMetadata {
    type: string;
    isMetric: boolean;
}

export interface IEvent {
    id: number;
    parentId: number;
    eventName: string;
    startTime: number;
    endTime: number;
    enabled: boolean;
    critical: boolean;
    data: any;
    vector: CorrelationVector;
    metadata: { [key: string]: IEventMetadata };
}