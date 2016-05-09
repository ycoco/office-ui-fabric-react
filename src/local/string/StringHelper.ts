// OneDrive:IgnoreCodeCoverage

// Regex that finds {string} so it can be replaced by the arguments in string item format
const FORMAT_ITEM_REGEX = /\{[a-z|A-Z|\.|\$|\:]+\}/g;

// Regex that finds { and } so they can be removed on a lookup for string format
const FORMAT_ARGS_REGEX = /[\{\}]/g;

// Regex that finds {#} so it can be replaced by the arguments in string format
const FORMAT_REGEX = /\{\d+\}/g;

/** Concatenate an arbitrary number of strings. */
export function concatStrings(): string {
    'use strict';

    let args = Array.prototype.slice.call(arguments, 0);
    return args.join('');
}

/**
 * String Format is like C# string format.
 * Usage Example: "hello {0}!".format("mike") will return "hello mike!"
 * Calling format on a string with less arguments than specified in the format is invalid
 * Example "I love {0} every {1}".format("CXP") will result in a Debug Exception.
 * @param {string} s
 * @returns {string}
 */
export function format(s: string, ...values: any[]): string {
    'use strict';

    let args = values;
    // Callback match function
    function replace_func(match: string) {
        // looks up in the args
        let replacement = args[match.replace(FORMAT_ARGS_REGEX, "")];

        // catches undefined in nondebug and null in debug and nondebug
        if (replacement === null) {
            replacement = '';
        }
        return replacement;
    }
    return (s.replace(FORMAT_REGEX, replace_func));
}

/** Return bool if string ends with suffix. */
export function doesStringEndWith(s: string, suffix: String): boolean {
    'use strict';

    return (s.substr(s.length - suffix.length) === suffix);
}

/** Return bool if string starts with prefix. */
export function doesStringStartWith(s: string, prefix: String): boolean {
    'use strict';

    return (s.substr(0, prefix.length) === prefix);
}

/** Left trim a given string and return a string. */
export function lTrim(s: String): string {
    'use strict';

    return s.replace(/^\s*/, "");
}

/** Right trim a given string and return a string. */
export function rTrim(s: String): string {
    'use strict';

    return s.replace(/\s+$/, "");
}

/** Find the node in object and return it. */
export function findNodeInObject(path: string, object: any) {
    'use strict';

    let pathArray = path.split('.');
    let currentNode = object;
    for (let x = 0; x < pathArray.length; x++) {
        currentNode = currentNode[pathArray[x]];
        if (typeof currentNode === "undefined") {
            return null;
        }
    }

    return currentNode;
}

/** String Format that you can use a predefined object and function object used for formating.
 * The code will look into the object first and if node is not it will look into the function object.
 * Example:
 * &#10;'1 - {$Config.mkt} 2 - {test}'.itemFormat({ '$Config': $Config },
 * &#10;{ 'test': function (s)
 * &#10;&#10;{
 * &#10;&#10;&#10;return s;
 * &#10;&#10;}
 * &#10;},
 * &#10;['hello']);
 * @param {string} The string to be worked upon.
 * @param {object} The values passed will be used in the string format
 * @param {object} The values passed will be used in the string format
 * @param {object} This is an array of arguments to pass to a matched function, if found
 */
export function itemFormat(s: string, object: any, functionObject: any, functionArgs: any) {
    'use strict';

    // make sure we have a function object
    functionObject = functionObject || {};
    // make sure we have arguments
    functionArgs = functionArgs || [];

    let replaceFunc = (match: string) => {

        //looks up in the args
        let path = match.replace(FORMAT_ARGS_REGEX, '');

        let processValueFunction;
        let operations = path.split(':');
        let output = '';

        let objectNode = findNodeInObject(operations[0], object);
        if (objectNode != null) {
            output = objectNode;
        } else {
            let functionNode = findNodeInObject(operations[0], functionObject);
            if (functionNode != null) {
                output = functionNode.apply(this, functionArgs);
            }
            }

        //  Test if we have a post processing operation
        if (operations.length === 2) {
            processValueFunction = findNodeInObject(operations[1], functionObject);
        }

        // process the value if there is a process value function
        return processValueFunction ? processValueFunction(output) : output;
    };

    return (s.replace(FORMAT_ITEM_REGEX, replaceFunc));
}

/**
 * Return a string of the given length, using 0s to pad in from the right.
 */
export function rightPad(data: any, length: number): string {
    'use strict';

    let result = data.toString();
    while (result.length < length) {
        result = result + "0";
    }
    return result;
}

/**
 * Look for any of the chars in searchValues in str.
 * Returns the index of the char found or -1 if nothing is found.
 */
export function findOneOf(str: string, searchValues: string): number {
    'use strict';

    for (let idx = 0; idx < str.length; idx++) {
        let ch = str[idx];
        if (searchValues.indexOf(ch) !== -1) {
            return idx;
        }
    }
    return -1;  //none of the searchValues exist in string
}

/**
 * Determines if two strings are equal when both converted to lowercase.
 */
export function equalsCaseInsensitive(a: string, b: string): boolean {
    'use strict';

    if (a && b) {
        return a.toLowerCase() === b.toLowerCase();
    }
    return a === b;
}

export function getLocalizedCountValue(locText: string, intervals: string, count: number) {
    'use strict';

    // !!!IMPORTANT!!! changes in this function need to be in sync with
    // the methods with the same name located at:
    // otools/inc/sts/stsom/utilities/SPLocUtility.cs
    // sts/Client/Script/Init/LocUtility.cs

    if (locText === undefined || intervals === undefined || count === undefined) {
        return null;
    }

    let ret = '';
    let locIndex = -1;
    let intervalsArray = intervals.split('||');
    for (let i = 0, lenght = intervalsArray.length; i < lenght; i++) {
        let interval = intervalsArray[i];
        if (interval === null || interval === "") {
            continue;
        }

        let subIntervalsArray = interval.split(',');

        for (let k = 0, subLength = subIntervalsArray.length; k < subLength; k++) {
            let subInterval: string = subIntervalsArray[k];
            if (subInterval === null || subInterval === "") {
                continue;
            }

            if (isNaN(Number(subInterval))) {
                let range = subInterval.split('-');
                if (range === null || range.length !== 2) {
                    continue;
                }
                let min;
                let max;
                if (range[0] === '') {
                    min = 0;
                } else {
                    if (isNaN(Number(range[0]))) {
                        continue;
                    } else {
                        min = parseInt(range[0], 10);
                    }
                }
                if (count >= min) {
                    if (range[1] === '') {
                        locIndex = i;
                        break;
                    } else {
                        if (isNaN(Number(range[1]))) {
                            continue;
                        } else {
                            max = parseInt(range[1], 10);
                        }
                    }
                    if (count <= max) {
                        locIndex = i;
                        break;
                    }
                }
            } else {
                let exactNumber = parseInt(subInterval, 10);
                if (count === exactNumber) {
                    locIndex = i;
                    break;
                }
            }
        }
        if (locIndex !== -1) {
            break;
        }
    }
    if (locIndex !== -1) {
        let locValues = locText.split('||');
        if (locValues !== null && locValues[locIndex] !== null && locValues[locIndex] !== "") {
            ret = locValues[locIndex];
        }
    }
    return ret;
}

export function isNullOrEmpty(str: string): boolean {
    'use strict';

    return !str || str.length === 0;
}

/**
 * Format the locText with the localized count value.
 */
export function formatWithLocalizedCountValue(locText: string, intervals: string, count: number): string {
    'use strict';

    const template: string = getLocalizedCountValue(locText, intervals, count);
    const result: string = format(template, count.toString());
    return result;
}
