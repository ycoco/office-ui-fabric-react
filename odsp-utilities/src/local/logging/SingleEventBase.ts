 // OneDrive:CoverageThreshold(72)

import { addEventProps, EventBase, ClonedEventType, IEventProps, IEventType } from './EventBase';
import { IEvent, IEventMetadataDeclarationTable, IEventMetadataTable } from './IEvent';

export interface ISingleEvent<DataType> extends IEvent {
    data: DataType;
}

export interface ISingleEventType<DataType> extends IEventType<DataType> {
    prototype: ISingleEvent<DataType>;
    logData<T extends ISingleEvent<DataType>, DataType>(this: { prototype: T }, data: DataType, parent?: IEvent): T;
}

export interface ISingleEventNoDataType extends IEventType<{}> {
    prototype: ISingleEvent<{}>;
    logData<T extends ISingleEvent<{}>>(this: { prototype: T }, parent?: IEvent): T;
}

function logData<T extends EventBase<DataType, DataType>, DataType>(this: { prototype: T }, data: DataType, parent?: IEvent): T {
    return new (<any>this)(data, ClonedEventType.Single, parent);
}

function logEmptyData<T extends EventBase<{}, {}>>(this: { prototype: T }, parent?: IEvent): T {
    return new (<any>this)(null, ClonedEventType.Single, parent);
}

export function createSingleEvent<SingleDataType>(props: IEventProps): ISingleEventNoDataType;
export function createSingleEvent<SingleDataType>(
    props: IEventProps,
    metadata: IEventMetadataDeclarationTable,
    baseClass?: {
        prototype: {
            metadata: IEventMetadataTable
        }
    }): ISingleEventType<SingleDataType>;
export function createSingleEvent<SingleDataType>(
    props: IEventProps,
    metadata?: IEventMetadataDeclarationTable,
    baseClass?: {
        prototype: {
            metadata: IEventMetadataTable
        }
    }): ISingleEventType<SingleDataType> | ISingleEventNoDataType {
    class SingleEvent extends EventBase<SingleDataType, SingleDataType> {
        public static readonly logData = metadata ? logData : logEmptyData;
    }
    addEventProps(SingleEvent.prototype, props, metadata || {}, baseClass);

    return SingleEvent;
}