// OneDrive:CoverageThreshold(75)

import { addEventProps, EventBase, ClonedEventType, IEventProps, IEventType } from './EventBase';
import { Manager } from "./Manager";
import { IEvent, IEventMetadataDeclarationTable, IEventMetadataTable } from './IEvent';
import Promise from '../async/Promise';
import { ResultTypeEnum } from './events/ResultTypeEnum';
import { IQosStartSchema, IQosEndSchema } from './events/Qos.event';
import ErrorHelper from "./ErrorHelper";
import Async from "../async/Async";
import { safeSerialize } from "../object/ObjectUtil";

const schemaExceptionErrorCode = 'GetSchemaException';
const promiseCreationFailureErrorCode = 'PromiseCreationFailed';
const timeoutErrorCode = 'Timeout';

function generateQosResult(resultType: ResultTypeEnum, resultCode?: string, error?: string): any {
    const schema = <IQosEndSchema> {
        resultType: resultType
    };
    if (resultCode) {
        schema.resultCode = resultCode;
    }
    if (error) {
        schema.error = error;
    }
    return schema;
}

export interface IPairedEvent<StartDataType, EndDataType> extends IEvent {
    data: StartDataType & EndDataType;

    setTimeout(ms: number, data?: EndDataType): void;
    verbose(message: string): void;
    end(data?: EndDataType): void;
}

export interface IPairedEventType<StartDataType, EndDataType> extends IEventType<StartDataType & EndDataType> {
    prototype: IPairedEvent<StartDataType, EndDataType>;
    new (data?: StartDataType, parent?: IEvent): IPairedEvent<StartDataType, EndDataType>;
    instrumentPromise<T, StartDataType extends IQosStartSchema, EndDataType extends IQosEndSchema>(
        this: { new (dataValue?: StartDataType, parent?: IEvent): IPairedEvent<StartDataType, EndDataType> },
        startSchema: StartDataType,
        createPromise: () => Promise<T>,
        getCompleteSchema?: (result?: T) => EndDataType,
        getErrorSchema?: (error?: any) => EndDataType,
        timeoutMs?: number,
        timeoutSchema?: EndDataType,
        parent?: IEvent): Promise<T>;
}

export function createPairedEvent<StartDataType, EndDataType>(
    props: IEventProps,
    metadata: IEventMetadataDeclarationTable,
    baseClass?: {
        prototype: {
            metadata: IEventMetadataTable
        }
    }): IPairedEventType<StartDataType, EndDataType> {
    class PairedEvent extends PairedEventBase<StartDataType, EndDataType> {
    }
    addEventProps(PairedEvent.prototype, props, metadata, baseClass);
    return PairedEvent;
}

class PairedEventBase<StartDataType, EndDataType> extends EventBase<StartDataType, StartDataType & EndDataType> {
    private async: Async;
    private timeoutId: number;

    constructor(data?: StartDataType, parent?: IEvent) {
        super(data, ClonedEventType.Start, parent);
    }

    public static instrumentPromise<T, StartDataType extends IQosStartSchema, EndDataType extends IQosEndSchema>(
        this: { new (dataValue?: StartDataType, parent?: IEvent): IPairedEvent<StartDataType, EndDataType> },
        startSchema: StartDataType,
        createPromise: () => Promise<T>,
        getCompleteSchema?: (result?: T) => EndDataType,
        getErrorSchema?: (error?: any) => EndDataType,
        timeoutMs?: number,
        timeoutSchema?: EndDataType,
        parent?: IEvent): Promise<T> {

        let promise: Promise<T>;
        const event = new this(startSchema, parent);
        if (timeoutMs) {
            event.setTimeout(timeoutMs, timeoutSchema);
        }

        const onComplete = (result?: T) => {
            let schema;
            if (getCompleteSchema) {
                try {
                    schema = getCompleteSchema(result);
                } catch (e) {
                    schema = generateQosResult(ResultTypeEnum.Failure, schemaExceptionErrorCode, e.toString());
                }
            } else {
                schema = generateQosResult(ResultTypeEnum.Success);
            }
            event.end(schema);
        };

        const onError = (errorArgs?: any) => {
            let schema;
            if (getErrorSchema) {
                try {
                    schema = getErrorSchema(errorArgs);
                } catch (e) {
                    schema = generateQosResult(ResultTypeEnum.Failure, schemaExceptionErrorCode, e.toString());
                }
            } else if (errorArgs) {
                const failureResultType: ResultTypeEnum = (errorArgs instanceof Error && errorArgs.name === "Canceled") ?
                    ResultTypeEnum.ExpectedFailure : ResultTypeEnum.Failure;
                schema = generateQosResult(failureResultType, null, safeSerialize(errorArgs));
            } else {
                schema = generateQosResult(ResultTypeEnum.Failure);
            }
            event.end(schema);
        };

        try {
            promise = createPromise();
        } catch (e) {
            event.end(generateQosResult(ResultTypeEnum.Failure, promiseCreationFailureErrorCode, e.toString()));
            throw e;
        }
        promise.then(onComplete, onError);

        return promise;
    }

    public setTimeout(ms: number, data?: EndDataType) {
        if (!this.async) {
            this.async = new Async(this);
        }

        this._clearTimeout();

        if (!data) {
            data = generateQosResult(ResultTypeEnum.Failure, timeoutErrorCode);
        }
        this.async.setTimeout(this.end.bind(this, data), ms);
    }

    public verbose(message: string) {
        if (this.endTime) {
            // event already ended, no need to log anymore
            return;
        }

        if (this._isQosEvent()) {
            const qosSchema: { name?: string } = this.data;
            ErrorHelper.verbose(message, qosSchema.name);
        }
    }

    public end(data?: EndDataType) {
        // Make sure end can only be called once
        if (!this.endTime) {
            if (data) {
                this._setData(data);
            }

            // Set the end time
            this.endTime = Manager.getTime();

            // Log the event end
            this._logEvent(ClonedEventType.End);

            // If this is a QOS event log and contains an error message trigger the upload of logs by calling
            // the ErrorHelper
            if (this._isQosEvent()) {
                const qosSchema: {
                    error?: any,
                    name?: string,
                    resultCode?: string,
                    resultType?: ResultTypeEnum
                } = this.data;
                if (qosSchema.error) {
                    ErrorHelper.log(qosSchema.error, qosSchema.name, qosSchema.resultCode, qosSchema.resultType);
                }
            }

            this._clearTimeout();
        }
    }

    private _clearTimeout() {
        if (this.async && this.timeoutId) {
            this.async.clearTimeout(this.timeoutId);
            this.timeoutId = null;
        }
    }

    private _isQosEvent(): boolean {
        return this.eventName.indexOf('Qos,') >= 0;
    }
}
