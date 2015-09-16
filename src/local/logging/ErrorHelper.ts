// OneDrive:IgnoreCodeCoverage

import { CaughtError } from "./events/CaughtError.event";
import { ResultTypeEnum, QosError } from "./events/QosError.event";
import { Verbose, IVerboseSingleSchema } from "./events/Verbose.event";
import CircularBuffer = require("../store/CircularBuffer");
import ObjectUtil = require('../object/ObjectUtil');

var MAX_VERBOSE_LOGS = 50;

class ErrorHelper {
    private static _verboseLogs: CircularBuffer<IVerboseSingleSchema> = new CircularBuffer<IVerboseSingleSchema>(MAX_VERBOSE_LOGS);

    public static verbose(message: string, eventName?: string) {
        ErrorHelper._verboseLogs.push({
            name: eventName,
            message: message
        });
    }

    public static log(error: any, eventName?: string, resultCode?: string, resultType?: ResultTypeEnum) {
        var message = "";
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
        var stack = error && error.stack ? error.stack : "";

        var schema: IVerboseSingleSchema;
        while (Boolean(schema = ErrorHelper._verboseLogs.popOldest())) {
            Verbose.logData(schema);
        }

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

export = ErrorHelper;