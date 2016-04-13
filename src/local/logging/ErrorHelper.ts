// OneDrive:IgnoreCodeCoverage

import { CaughtError } from "./events/CaughtError.event";
import { ResultTypeEnum, QosError } from "./events/QosError.event";
import { Verbose, IVerboseSingleSchema } from "./events/Verbose.event";
import CircularBuffer from "../store/CircularBuffer";
import ObjectUtil from '../object/ObjectUtil';

const MAX_VERBOSE_LOGS = 50;

export default class ErrorHelper {
    private static _verboseLogs: CircularBuffer<IVerboseSingleSchema> = new CircularBuffer<IVerboseSingleSchema>(MAX_VERBOSE_LOGS);

    public static verbose(message: string, eventName?: string) {
        ErrorHelper._verboseLogs.push({
            name: eventName,
            message: message
        });
    }

    public static log(error: any, eventName?: string, resultCode?: string, resultType?: ResultTypeEnum) {
        let message = "";
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
        let stack = error && error.stack ? error.stack : "";

        let schema: IVerboseSingleSchema;
        while (Boolean(schema = ErrorHelper._verboseLogs.popOldest())) {
            Verbose.logData(schema);
        }

        if (error && !error._handled) {
            if (eventName) {
                QosError.logData({
                    name: eventName,
                    resultCode: resultCode,
                    resultType: resultType,
                    message: message,
                    stack: stack
                });
            } else {
                CaughtError.logData({
                    message: message,
                    stack: stack
                });
            }
        }
    }
}
