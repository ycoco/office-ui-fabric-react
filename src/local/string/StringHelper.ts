// OneDrive:IgnoreCodeCoverage

    // Regex that finds {string} so it can be replaced by the arguments in string item format
    var FORMAT_ITEM_REGEX = /\{[a-z|A-Z|\.|\$|\:]+\}/g;

    // Regex that finds { and } so they can be removed on a lookup for string format
    var FORMAT_ARGS_REGEX = /[\{\}]/g;

    // Regex that finds {#} so it can be replaced by the arguments in string format
    var FORMAT_REGEX = /\{\d+\}/g;

class StringHelper {

    /** Concatenate an arbitrary number of strings. */
    public static concatStrings() {
      var args = Array.prototype.slice.call(arguments, 0);
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
    public static format(s: string, ...values: any[]) {
        var args = values;
        // Callback match function
        function replace_func(match: string) {
            // looks up in the args
            var replacement = args[match.replace(FORMAT_ARGS_REGEX, "")];

            // catches undefined in nondebug and null in debug and nondebug
            if (replacement === null) {
                replacement = '';
            }
            return replacement;
        }
        return (s.replace(FORMAT_REGEX, replace_func));
    }

    /** Return bool if string ends with suffix. */
    public static doesStringEndWith(s: string, suffix: String): boolean {
        return (s.substr(s.length - suffix.length) === suffix);
    }

    /** Return bool if string starts with prefix. */
    public static doesStringStartWith(s: string, prefix: String): boolean {
        return (s.substr(0, prefix.length) === prefix);
    }

    /** Left trim a given string and return a string. */
    public static lTrim(s: String) {
        return s.replace(/^\s*/, "");
    }

    /** Right trim a given string and return a string. */
    public static rTrim(s: String) {
        return s.replace(/\s+$/, "");
    }

    /** Find the node in object and return it. */
    public static findNodeInObject(path: string, object: any) {
        var pathArray = path.split('.');
        var currentNode = object;
        for (var x = 0; x < pathArray.length; x++) {
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
    public static itemFormat(s: string, object: any, functionObject: any, functionArgs: any) {
        // make sure we have a function object
        functionObject = functionObject || {};
        // make sure we have arguments
        functionArgs = functionArgs || [];

        var replaceFunc = (match: string) => {

            //looks up in the args
            var path = match.replace(FORMAT_ARGS_REGEX, '');

            var processValueFunction;
            var operations = path.split(':');
            var output = '';

            var objectNode = StringHelper.findNodeInObject(operations[0], object);
            if (objectNode != null) {
                output = objectNode;
            } else {
                var functionNode = StringHelper.findNodeInObject(operations[0], functionObject);
                if (functionNode != null) {
                    output = functionNode.apply(this, functionArgs);
                }
              }

            //  Test if we have a post processing operation
            if (operations.length === 2) {
                processValueFunction = StringHelper.findNodeInObject(operations[1], functionObject);
            }

            // process the value if there is a process value function
            return processValueFunction ? processValueFunction(output) : output;
        };

        return (s.replace(FORMAT_ITEM_REGEX, replaceFunc));
    }

    /**
     * Selects a string based on plurality
     * @param {number} count - The value to base selection on
     * @param {string} single - The string to select when it's a singular value
     * @param {string} multiple - The string to select when it's a plural value
     * @returns {string}
     */
    public static pluralSelect(count: number, single: string, plural: string) {
        return count === 1 ? single : plural;
    }

    /**
     * Return a string of the given length, using 0s to pad in from the right.
     */
    public static rightPad(data: any, length: number): string {
        var result = data.toString();
        while (result.length < length) {
            result = result + "0";
        }
        return result;
    }

    /**
     * Look for any of the chars in searchValues in str.
     * Returns the index of the char found or -1 if nothing is found.
     */
    public static findOneOf(str: string, searchValues: string): number {
        for (var idx = 0; idx < str.length; idx++) {
            var ch = str[idx];
            if (searchValues.indexOf(ch) !== -1) {
                return idx;
            }
        }
        return -1;  //none of the searchValues exist in string
    }

    /**
     * Determines if two strings are equal when both converted to lowercase.
     */
    public static equalsCaseInsensitive(a: string, b: string): boolean {
        if (a && b) {
            return a.toLowerCase() === b.toLowerCase();
        }
        return a === b;
    }

    public static getLocalizedCountValue(locText: string, intervals: string, count: number) {
        // !!!IMPORTANT!!! changes in this function need to be in sync with
        // the methods with the same name located at:
        // otools/inc/sts/stsom/utilities/SPLocUtility.cs
        // sts/Client/Script/Init/LocUtility.cs

        if (locText === undefined || intervals === undefined || count === undefined) {
            return null;
        }

        var ret = '';
        var locIndex = -1;
        var intervalsArray = intervals.split('||');
        for (var i = 0, lenght = intervalsArray.length; i < lenght; i++) {
            var interval = intervalsArray[i];
            if (interval === null || interval === "") {
                continue;
            }

            var subIntervalsArray = interval.split(',');

            for (var k = 0, subLength = subIntervalsArray.length; k < subLength; k++) {
                var subInterval: string = subIntervalsArray[k];
                if (subInterval === null || subInterval === "") {
                    continue;
                }

                if (isNaN(Number(subInterval))) {
                    var range = subInterval.split('-');
                    if (range === null || range.length !== 2) {
                        continue;
                    }
                    var min;
                    var max;
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
                    var exactNumber = parseInt(subInterval, 10);
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
            var locValues = locText.split('||');
            if (locValues !== null && locValues[locIndex] !== null && locValues[locIndex] !== "") {
                ret = locValues[locIndex];
            }
        }
        return ret;
    }

    public static isNullOrEmpty(str: string) {
        return !str || str.length === 0;
    }
}

export = StringHelper;