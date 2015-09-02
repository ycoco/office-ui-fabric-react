// OneDrive:IgnoreCodeCoverage

import { UnhandledError } from "./events/UnhandledError.event";

/* tslint:disable:use-strict */
/* tslint:disable:no-arg */
var MAXCALLSTACKLEVELS = 10;
var MAXCHARACTEROFANONYMOUSFUNCTION = 50;

/**
 * Takes a string and, if it is longer than maxLength, truncates it and adds ellipsis
 * @param The string to shorten
 * @param The maximum length of the string returned by this function
 * @return A string of length &lt;= maxLength, with "..." appended if there was truncation
 */
function shortenStringAddEllipsis(str: string, maxLength: number) {
    if ( /* @static_cast(Boolean) */str && str.length > maxLength) {
        str = str.substr(0, maxLength - 3) + "...";
    }
    return str;
}

/**
 * Given a function object, return the name of the function
 * This also uses the GetMethodName callback to see if the page owner has more data than us
 * For anonymous functions, take the first 20 characters of the body
 * @param The function object
 * @return The name of the function
 */
function getMethodName(method: any) {
    var /* @type(String) */methodSigniture;
    if (method) {
        // Pull out the method signiture.
        var methodStr = (method && method.toString) ? method.toString() : "InvalidMethod()";
        var functionNameEndIndex = methodStr.indexOf(")") + 1;
        var functionNameStartIndex = methodStr.indexOf(" ") === 8 ? 9 : 0; // If the format is "function <name>(...", leave "function" out of our returned string
        methodSigniture = methodStr.substring(functionNameStartIndex, functionNameEndIndex);

        // Anonymous function, include 50 characters of the body so we can identify the function
        if ((methodSigniture.indexOf("function") === 0)) {
            var totalLength = functionNameEndIndex + MAXCHARACTEROFANONYMOUSFUNCTION;
            methodStr = methodStr.replace(/\s\s*/ig, " ");
            methodSigniture = shortenStringAddEllipsis(methodStr, totalLength) + (totalLength < methodStr.length ? "}" : "");
        }
    }
    return methodSigniture;
}

/**
 * Get the current call stack as an array of strings, each element being one level of the stack
 * This also uses the GetStack() callback to see if partners will be providing the stack for us
 * @param Whether or not argument values should be added to the callstack. Recommend false in https, true otherwise
 * @param If we are trying to build the callstack, how many levels should we ignore (because they are part of watson or other error handling code
 */
function getStackAsArray() {
    // Try to get the stack from a partner callback
    var /* @type(Array) */stack = [];

    // Skip any callers that we don't care about (extraLevelsToSkip)
    var callstackFunction = arguments.callee;
    while (callstackFunction === handleOnError || callstackFunction === getStackAsArray) {
        try {
            callstackFunction = callstackFunction ? callstackFunction.caller : callstackFunction;
        } catch (ex) {
            // Bug 861727: Some browsers throw when accessing callstackFunction.caller in strict mode. Ignore
            // exceptions.
            callstackFunction = null;
        }
    }

    // Walk up the callstack and add the method name and arguments to the stack array
    var callstackDepth = 0;
    while (/* @static_cast(Boolean) */callstackFunction && callstackDepth < MAXCALLSTACKLEVELS) {
        stack.push(callstackFunction);

        /* @disable(0092) */
        try {
            callstackFunction = callstackFunction.caller;
        } catch (ex) {
            // Bug 861727: Some browsers throw when accessing callstackFunction.caller in strict mode. Ignore
            // exceptions.
            callstackFunction = null;
        }
        /* @restore(0092) */
        callstackDepth++;
    }

    // The stack has now been filled in, either by us or by the partner.  Convert the objects to readable strings of function name + arguments
    var stackLength = stack.length;
    var formattedStack = [];
    for (var depth = 0; depth < stackLength && depth < MAXCALLSTACKLEVELS; depth++) {
        // Get the current method as a string
        var /* @dynamic */currentStackLevel = stack[depth];
        var argumentValues = "";

        // Add the method name and argument values to the stack
        formattedStack.push(getMethodName(currentStackLevel) + "(" + argumentValues + ")");
    }

    return formattedStack;
}


/**
 * Determine if the current user is in the sample and WebWatson is enabled
 * If so, collect data about the error and send it off to the server
 * @param The error message the browser assigned to the Error
 * @param The URL to the js file that caused the error, or the page if the JS file is unavailable
 * @param The the js line number
 * @param The the js column number
 * @param The error object
 */
function handleOnError(message: any, jsUrl: string, jsLine: number, jsCol: number, errorObject: any) {
    // This is to support TAB test framework catching product exceptions during test runs
    try {
        if (window.parent && window.parent.opener && 'LogOnError' in window.parent.opener) {
            Function.prototype.apply.call(window.parent.opener['LogOnError'], window.parent.opener, [message, jsUrl, jsLine, jsCol, errorObject]);
        }
    } catch (e) {
        // don't do anything
    }

    let stack: string = null;
    if (errorObject && errorObject.stack) {
        stack = errorObject.stack;
    } else {
        // Get the callstack, we know need to skip at least 2 levels in the stack: getStackAsArray(), handleError()
        // If we have a givenStackTrace we don't need to generate a stack.
        let stackArray = getStackAsArray();
        stack = (stackArray ? stackArray.join('\n') : "");
        // Remove >1 consecutive whitespace to shorten our callstack
        stack = stack.replace(/[ \t]+/ig, " ");
    }



    // Build our array of arguments
    var data = {
        message: message,
        url: jsUrl,
        line: jsLine,
        col: jsCol,
        stack: stack
    };

    // Write the unhandled error data
    UnhandledError.logData(data);
}

// Wire up window onerror to catch unhandled exceptions
window.onerror = <ErrorEventHandler><any>handleOnError;