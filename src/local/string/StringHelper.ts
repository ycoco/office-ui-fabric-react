// OneDrive:IgnoreCodeCoverage

// Regex that finds { and } so they can be removed on a lookup for string format
const FORMAT_ARGS_REGEX = /[\{\}]/g;

// Regex that finds {#} so it can be replaced by the arguments in string format
const FORMAT_REGEX = /\{\d+\}/g;

/**
 * String Format is like C# string format.
 * Usage Example: "hello {0}!".format("mike") will return "hello mike!"
 * Calling format on a string with less arguments than specified in the format is invalid
 * Example "I love {0} every {1}".format("CXP") will result in a Debug Exception.
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

/**
 * Returns true if s ends with suffix.
 */
export function doesStringEndWith(s: string, suffix: string): boolean {
    'use strict';

    return s.substr(s.length - suffix.length) === suffix;
}

/**
 * Returns true if s starts with prefix.
 */
export function doesStringStartWith(s: string, prefix: string): boolean {
    'use strict';

    return s.substr(0, prefix.length) === prefix;
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

/**
 * Capitalizes the first letter of str.
 */
export function capitalize(str: string): string {
    'use strict';

    if (str) {
        return str[0].toUpperCase() + str.substr(1);
    }
    return str;
}

/**
 * De-capitalizes the first letter of str.
 */
export function decapitalize(str: string): string {
    'use strict';

    if (str) {
        return str[0].toLowerCase() + str.substr(1);
    }
    return str;
}

/**
 * Selects a string based on plurality.
 *
 * @param count - The value to base selection on
 * @param single - The string to select when it's a singular value
 * @param multiple - The string to select when it's a plural value
 *
 * @deprecated This method does NOT give accurate results for many languages!!
 *             Use getLocalizedCountValue instead.
 */
export function pluralSelect(count: number, single: string, plural: string): string {
    'use strict';

    return count === 1 ? single : plural;
}

/**
 * Given a specially formatted localized text, a set of intervals, and a count,
 * return the localized text which corresponds to the first interval the
 * count falls into.
 *
 * Please see https://microsoft.sharepoint.com/teams/OISGPortal/LocKits/_layouts/15/start.aspx#/Lockit%20Instructions/SharePoint%20Core%20Localization.aspx
 * for more details.
 *
 * @param {string} locText - || deliminated blocks of localized texts, representing
 *  the various singular and plural forms of the string  being localized
 * @param {string} intervals - || deliminated blocks of numeric intervals, defining the ranges
 *  of that interval. Has special support for , * and -.
 * @param {number} count - The count used to determine which interval to return.
 *
 * @return
 * The localized block which corresponds to the first interval the count falls into.
 *
 * @example
 * StringHelper.getLocalizedCountValue('items||item||items', '0||1||2-', 0)
 *   returns items
 * StringHelper.getLocalizedCountValue('items||item||items', '0||1||2-', 1)
 *   returns item
 * StringHelper.getLocalizedCountValue('items||item||items', '0||1||2-', 2)
 *   returns items
 */
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
    for (let i = 0, length = intervalsArray.length; i < length; i++) {
        let interval = intervalsArray[i];
        if (!interval) {
            continue;
        }

        let subIntervalsArray = interval.split(',');
        for (let subInterval of subIntervalsArray) {
            if (!subInterval) {
                continue;
            }

            // there are three possiblities, wildcard, interval, or number
            if (isNaN(Number(subInterval))) {
                if (subInterval.indexOf('-') !== -1) {
                    // if it's an interval the format is Number-Number
                    let range = subInterval.split('-');
                    if (range.length !== 2) {
                        continue;
                    }
                    let min, max;
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
                } else if (subInterval.indexOf('*') !== -1) {
                    // Wildcard
                    let regexExpr = subInterval.trim().replace(/\*/g, '[0-9]*');
                    let regex = new RegExp(`^${ regexExpr }$`);
                    if (regex.test(count.toString())) {
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
        if (locValues[locIndex]) {
            ret = locValues[locIndex];
        }
    }
    return ret;
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
