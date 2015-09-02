// OneDrive:CoverageThreshold(75)

import { EventBase, ClonedEventType } from './EventBase';
import { Manager } from "./Manager";
import { IEvent } from './IEvent';
import Promise from '../async/Promise';
import { ResultTypeEnum } from './events/ResultTypeEnum';
import { IQosStartSchema, IQosEndSchema } from './events/Qos.event';
import ErrorHelper = require("./ErrorHelper");
import Async = require("../async/Async");

import ObjectUtil = require("../object/ObjectUtil");

export class PairedEventBase<StartDataType, EndDataType> extends EventBase {
    public static fullName = 'PairedEventBase,';
    public static shortName = 'PairedEventBase';
    private static schemaExceptionErrorCode = 'GetSchemaException';
    private static promiseCreationFailureErrorCode = 'PromiseCreationFailed';
    private static timeoutErrorCode = 'Timeout';
    private async: Async;
    private timeoutId: number;

    constructor(eventName: string, data?: StartDataType, parent?: IEvent) {
        super(eventName, parent);
        // Make sure data has a value
        if (!this.data) {
            this.data = {};
        }

        // Set the data if we have it
        if (data) {
            this.setStartData(data);
        }

        // Send the start event
        this._logEvent(ClonedEventType.Start);
    }

    protected static _instrumentPromise<T, StartDataType, EndDataType>(
        eventConstructor: { new (dataValue?: StartDataType, parent?: IEvent): PairedEventBase<StartDataType, EndDataType> },
        startSchema: StartDataType,
        createPromise: () => Promise<T>,
        getCompleteSchema?: (result?: T) => EndDataType,
        getErrorSchema?: (error?: any) => EndDataType,
        timeoutMs?: number,
        timeoutSchema?: EndDataType,
        parent?: IEvent): Promise<T> {

        var _promise: Promise<T>;
        var _event = new eventConstructor(startSchema, parent);
        if (timeoutMs) {
            _event._setTimeout(timeoutMs, timeoutSchema);
        }

        var _onComplete = (result?: T) => {
            var schema;
            if (getCompleteSchema) {
                try {
                    schema = getCompleteSchema(result);
                } catch (e) {
                    schema = _event._generateQosResult(ResultTypeEnum.Failure, this.schemaExceptionErrorCode, e.toString());
                }
            } else {
                schema = _event._generateQosResult(ResultTypeEnum.Success);
            }
            _event._end(schema);
        };

        var _onError = (errorArgs?: any) => {
            var schema;
            if (getErrorSchema) {
                try {
                    schema = getErrorSchema(errorArgs);
                } catch (e) {
                    schema = _event._generateQosResult(ResultTypeEnum.Failure, this.schemaExceptionErrorCode, e.toString());
                }
            } else {
                if (errorArgs) {
                    var failureResultType: ResultTypeEnum = (errorArgs instanceof Error && errorArgs.name === "Canceled") ?
                        ResultTypeEnum.ExpectedFailure : ResultTypeEnum.Failure;
                    schema = _event._generateQosResult(failureResultType, null, ObjectUtil.safeSerialize(errorArgs));
                } else {
                    schema = _event._generateQosResult(ResultTypeEnum.Failure);
                }
            }
            _event._end(schema);
        };

        try {
            _promise = createPromise();
        } catch (e) {
            _event._end(_event._generateQosResult(ResultTypeEnum.Failure, this.promiseCreationFailureErrorCode, e.toString()));
            throw e;
        }
        _promise.then(_onComplete, _onError);

        return _promise;
    }

    protected setStartData(data: StartDataType) {
        // The start event to copy data that will be overridden
    }

    protected setEndData(data: EndDataType) {
        // The end event to copy data that will be overridden
    }

    protected _setTimeout(ms: number, data?: EndDataType) {
        if (!this.async) {
            this.async = new Async(this);
        }

        this._clearTimeout();

        if (!data) {
            data = this._generateQosResult(ResultTypeEnum.Failure, PairedEventBase.timeoutErrorCode);
        }
        this.async.setTimeout(this._end.bind(this, data), ms);
    }

    protected _verbose(message: string) {
        if (this.endTime) {
            // event already ended, no need to log anymore
            return;
        }

        if (this._isQosEvent) {
            var qosSchema: IQosStartSchema = this.data;
            ErrorHelper.verbose(message, qosSchema.name);
        }
    }

    protected _end(data?: EndDataType) {
        // Make sure end can only be called once
        if (!this.endTime) {
            if (data) {
                this.setEndData(data);
            }

            // Set the end time
            this.endTime = Manager.getTime();

            // Log the event end
            this._logEvent(ClonedEventType.End);

            // If this is a QOS event log and contains an error message trigger the upload of logs by calling
            // the ErrorHelper
            if (this._isQosEvent) {
                var qosSchema: IQosStartSchema = this.data;
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

    private get _isQosEvent(): boolean {
        return this.eventName.indexOf('Qos,') >= 0;
    }

    private _generateQosResult(resultType: ResultTypeEnum, resultCode?: string, error?: string): any {
        var schema = <IQosEndSchema> {
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
}