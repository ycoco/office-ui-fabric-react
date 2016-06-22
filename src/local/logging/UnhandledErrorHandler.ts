// OneDrive:IgnoreCodeCoverage

import { UnhandledError } from "./events/UnhandledError.event";

/* tslint:disable:use-strict */
/* tslint:disable:no-arg */
const MAXCALLSTACKLEVELS = 10;
const MAXCHARACTEROFANONYMOUSFUNCTION = 50;
export const MAXERRORS = 100;

let errorCount = 0;

/**
 * Takes a string and, if it is longer than maxLength, truncates it and adds ellipsis
 * @param The string to shorten
 * @param The maximum length of the string returned by this function
 * @return A string of length &lt;= maxLength, with "..." appended if there was truncation
 */
function shortenStringAddEllipsis(str: string, maxLength: number) {
    if (str && str.length > maxLength) {
        str = str.substr(0, maxLength - 3) + "...";
    }
    return str;
}

/**
 * Given a function object, return the name of the function
 * For anonymous or minified functions, take the first few characters of the body
 * @param The function object
 * @return The name of the function
 */
function getMethodName(method: any) {
    var methodSignature;
    if (method) {
        // Pull out the method signature.
        var methodStr = (method && method.toString) ? method.toString() : "InvalidMethod()";
        var functionNameStartIndex = methodStr.indexOf(" ") === 8 ? 9 : 0; // If the format is "function <name>(...", leave "function" out of our returned string
        var functionNameEndIndex = methodStr.indexOf(")") + 1;
        methodSignature = methodStr.substring(functionNameStartIndex, functionNameEndIndex);

        // Anonymous or minified function, include 50 characters of the body so we can identify the function
        if (methodSignature.indexOf("function") === 0 || methodSignature.indexOf("(") < 3) {
            var totalLength = functionNameEndIndex + MAXCHARACTEROFANONYMOUSFUNCTION;
            methodStr = methodStr.replace(/\s\s*/g, " ");
            methodSignature = shortenStringAddEllipsis(methodStr, totalLength) + (totalLength < methodStr.length ? "}" : "");
        }
    }
    return methodSignature;
}

/**
 * Get the current call stack as an array of strings, each element being one level of the stack
 */
function getStackAsArray() {
    // Try to get the stack from a partner callback
    var stack = [];

    // Skip any callers that we don't care about
    var callstackFunction;
    try {
        callstackFunction = arguments.callee;
        while (callstackFunction === handleOnError || callstackFunction === getStackAsArray) {
            callstackFunction = callstackFunction ? callstackFunction.caller : callstackFunction;
        }
    } catch (ex) {
        // Some browsers throw when accessing callstackFunction.callee in strict mode. Ignore exceptions.
        callstackFunction = null;
    }

    // Walk up the callstack and add the method name to the stack array
    var callstackDepth = 0;
    try {
        while (callstackFunction && callstackDepth < MAXCALLSTACKLEVELS) {
            stack.push(getMethodName(callstackFunction));
            callstackFunction = callstackFunction.caller;
            callstackDepth++;
        }
    } catch (ex) {
        // Some browsers throw when accessing callstackFunction.caller in strict mode. Ignore exceptions.
    }

    return stack;
}


/**
 * Collect data about the error and send it off to the server
 * @param The error message the browser assigned to the Error
 * @param The URL to the js file that caused the error, or the page if the JS file is unavailable
 * @param The the js line number
 * @param The the js column number
 * @param The error object
 */
export function handleOnError(message: any, jsUrl: string, jsLine: number, jsCol: number, errorObject: any) {
    // This is to support TAB test framework catching product exceptions during test runs
    try {
        if (window.parent && window.parent.opener && 'LogOnError' in window.parent.opener) {
            Function.prototype.apply.call(window.parent.opener['LogOnError'], window.parent.opener, [message, jsUrl, jsLine, jsCol, errorObject]);
        }
    } catch (e) {
        // don't do anything
    }

    // Get the callstack from the error object and using the arguments.callee.caller method
    // (second will only work in IE)
    var stack = errorObject && errorObject.stack;
    var builtStack = getStackAsArray().join('\n');
    // Remove >1 consecutive whitespace to shorten our callstack
    stack = stack ? stack.replace(/[ \t]{2,}/g, ' ') : '';
    builtStack = builtStack.replace(/[ \t]{2,}/g, ' ');

    // Build our array of arguments
    var data = {
        message: message,
        url: jsUrl,
        line: jsLine,
        col: jsCol,
        stack: stack,
        builtStack: builtStack
    };

    if (errorCount < MAXERRORS) {
        // Write the unhandled error data
        UnhandledError.logData(data);
    } else if (errorCount === MAXERRORS) {
        UnhandledError.logData({
            message: `Hit max error limit of ${MAXERRORS}`,
            url: 'NA',
            line: 0,
            col: 0,
            stack: '',
            builtStack: ''
        });
    }

    errorCount++;
}

// Wire up window onerror to catch unhandled exceptions
window.onerror = <ErrorEventHandler><any>handleOnError;