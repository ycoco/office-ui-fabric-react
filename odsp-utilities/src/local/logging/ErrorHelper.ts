﻿// OneDrive:IgnoreCodeCoverage

import { CaughtError } from "./events/CaughtError.event";
import { ResultTypeEnum, QosError } from "./events/QosError.event";
import { Verbose, IVerboseSingleSchema } from "./events/Verbose.event";
import CircularBuffer from "../store/CircularBuffer";
import ObjectUtil from '../object/ObjectUtil';

const MAX_VERBOSE_LOGS = 50;

export interface IQosErrorData {
    eventName: string;
    resultCode: string;
    resultType: ResultTypeEnum;
}

export default class ErrorHelper {
    private static _verboseLogs: CircularBuffer<IVerboseSingleSchema> = new CircularBuffer<IVerboseSingleSchema>(MAX_VERBOSE_LOGS);

    public static verbose(message: string, eventName?: string) {
        ErrorHelper._verboseLogs.push({
            name: eventName,
            message: message
        });
    }

    public static logError(error: any, extraData?: any, qosData?: IQosErrorData) {
        if (!error || error._handled) {
            return;
        }

        let message = this.getErrorMessage(error);
        let stack = error && error.stack ? error.stack : "";

        let schema: IVerboseSingleSchema;
        while (Boolean(schema = ErrorHelper._verboseLogs.popOldest())) {
            Verbose.logData(schema);
        }

        if (qosData && qosData.eventName) {
            QosError.logData({
                name: qosData.eventName,
                resultCode: qosData.resultCode,
                resultType: qosData.resultType,
                extraData: extraData || undefined,
                message: message,
                stack: stack
            });
        } else {
            CaughtError.logData({
                extraData: extraData || undefined,
                message: message,
                stack: stack
            });
        }
    }

    public static log(error: any, eventName?: string, resultCode?: string, resultType?: ResultTypeEnum) {
        this.logError(error, null, { eventName, resultCode, resultType });
    }

    /**
     * Extract the error message from the error
     */
    public static getErrorMessage(error: any): string {
        let message = '';
        if (error) {
            if (error.message) {
                message = error.message;
            } else if (error.description) {
                message = error.description;
            } else if (typeof (error) === 'object') {
                message = ObjectUtil.safeSerialize(error);
            } else if (error.toString) {
                message = error.toString();
            }
        }
        return message;
    }
}