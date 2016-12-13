import CorrelationVector from './CorrelationVector';

export const enum EventFieldType {
    String = 1,
    Number = 2,
    Boolean = 3,
    Object = 4,
    Array = 5,
    Enum = 6
}

export interface IEventMetadataDeclaration {
    isKey?: boolean;
    type: EventFieldType;
    typeRef?: any;
    isPrefixingDisabled?: boolean;
}

export interface IEventMetadata extends IEventMetadataDeclaration {
    definedInName: string;
    definedInFullName?: string;
    isMetric?: boolean;
}

export interface IEventMetadataDeclarationTable {
    [key: string]: EventFieldType | IEventMetadataDeclaration;
}

export interface IEventMetadataTable {
    [key: string]: IEventMetadata;
}

export interface IEvent {
    readonly id: number;
    readonly parentId: number;
    readonly eventName: string;
    readonly shortEventName: string;
    readonly startTime: number;
    readonly endTime: number;
    readonly enabled: boolean;
    readonly critical: boolean;
    readonly data: any;
    readonly vector: CorrelationVector;
    readonly metadata: IEventMetadataTable;
    readonly validationErrors: number;
}