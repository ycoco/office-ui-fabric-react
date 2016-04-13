import { RequireJSError } from "./events/RequireJSError.event";
import ErrorHelper from './ErrorHelper';

export default class RequireJSErrorHandler {
    public static log(err: any) {
        // Log the error as data an fire log error so it shows up in the error logs
        RequireJSError.logData(err);

        // Only log script errors to log error
        if (err && err.requireType === "define" && err.stack && err.requireModules) {
            ErrorHelper.log(err);
        }
    }
}

var prevOnError = window["requirejs"].onError;
window["requirejs"].onError = (err: any) => {
    RequireJSErrorHandler.log(err);
    if (prevOnError && !err.isTest) {
        prevOnError(err);
    }
};
