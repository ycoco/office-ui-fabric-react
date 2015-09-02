import UriEncoding = require('../encoding/UriEncoding');

module ObjectUtil {
    "use strict";

    export var DEFAULT_DELIMITER = '&';
    export var KEYVALUE_DELIMITER = '=';

    // Returns a copy of the specified object by deeply cloning all of its properties.
    export function deepCopy<T>(object: T): T {
        var refsCopied = [];
        var copyRecurse = function (obj: any): any {
            var result = null;

            if (obj) {
                if (Array.isArray(obj)) {
                    result = [];
                } else {
                    // create clone of the object with same prototype chain
                    result = Object.create(Object.getPrototypeOf(obj));
                }

                // iterate over all the properties in the object
                Object.keys(obj).forEach((key: string) => {
                    // recursively copy the object's properties if the property is an object
                    var value = obj[key];
                    if (typeof value === "object") {
                        if (refsCopied.indexOf(value) !== -1) {
                            throw new Error("Cannot perform DeepCopy() because a circular reference was encountered, object: " + String(obj) + ", property: " + String(key));
                        }
                        refsCopied.push(value);
                        result[key] = copyRecurse(value);
                        refsCopied.pop();
                    } else {
                        result[key] = value;
                    }
                });
            }
            return result;
        };

        return copyRecurse(object);
    }

    // Deeply compares the objects by recursively comparing all their properties, objects with circular references are not supported, prototype members and functions are ignored
    export function deepCompare(objA: any, objB: any, equivalent?: (a: any, b: any) => boolean): boolean {
        // keep track of references that have been compared to find circular references while walking down either object
        var refsComparedA = [];
        var refsComparedB = [];
        var compare = Boolean(equivalent) ? equivalent : function (a: any, b: any): boolean { return (a === b); };
        var equals = function (a: any, b: any) {
            // try a simple equality test first
            if (a === b) {
                return true;
            }

            if ((a === null) || (b === null)) {
                return false;
            }

            // if both are objects, then further comparison is required
            if ((typeof(a) === "object") && (typeof(b) === "object")) {
                // perform deep comparison over object's properties
                var aKeys = Object.keys(a).sort();
                var bKeys = Object.keys(b).sort();
                // does one object have a different number of properties?
                if (aKeys.length !== bKeys.length) {
                    return false;
                }
                var keysMatch = aKeys.every((key: string, index: number) => {
                    // key names should match
                    if (key !== bKeys[index]) {
                        return false;
                    } else if (typeof(a[key]) === 'function' || typeof(b[key]) === 'function') {
                        //skip comparison of function properties
                        return true;
                    } else if (!compare(a[key], b[key])) {
                        // if this is an Object then recursive testing is needed on its properties
                        if (typeof a[key] === "object") {
                            // if this property was encountered before then we're going in circles, give up
                            if (refsComparedA.indexOf(a[key]) !== -1) {
                                throw new Error("Cannot perform DeepCompare() because a circular reference was encountered, object: " + String(a) + ", property: " + key);
                            }
                            refsComparedA.push(a[key]);
                            if (refsComparedB.indexOf(b[key]) !== -1) {
                                throw new Error("Cannot perform DeepCompare() because a circular reference was encountered, object: " + String(b) + ", property: " + key);
                            }
                            refsComparedB.push(b[key]);

                            // recursive compare object's properties
                            if (!equals(a[key], b[key])) {
                                return false;
                            }

                            refsComparedA.pop();
                            refsComparedB.pop();
                            return true;
                        } else {
                            // properties don't match
                            return false;
                        }
                    } else {
                        return true;
                    }
                });
                if (!keysMatch) {
                    return false;
                }
            } else {
                // parameters aren't equal, and at least one is not an Object
                return false;
            }

            // everything is equal
            return true;
        };

        return equals(objA, objB);
    }

    /**
     * This is a function you can call to safely serialize anything to JSON.
     * The built-in JSON.stringify() throws an exception for circular references and can't handle
     * many built-ins such as HTMLElements and the global window object.
     */
    export function safeSerialize(obj: any) {
        var str;
        try {
            var seenObjects = [];
            str = JSON.stringify(obj, function (key: string, value: any) {
                if (value === window) {
                    return "[window]";
                } else if (value instanceof HTMLElement) {
                    return "[HTMLElement]";
                } else if (typeof value === "function") {
                    return "[function]";
                } else if (typeof value === "object") {
                    if (value === null) {
                        return value;
                    } else if (seenObjects.indexOf(value) === -1) {
                        seenObjects.push(value);
                        return value;
                    } else {
                        return "[circular]";
                    }
                } else {
                    return value;
                }

            });
        } catch (err) {
            // Note: we make this be a JSON string, so that consumers
            // can always call JSON.parse.
            str = JSON.stringify("[object]");
        }
        return str;
    }


    /**
     * Serializes the object Name Values Pairs (Depth of 1).
     * Used for Query Strings and Cookie Values
     * @param {any} obj Object with name value pairs
     * @param {string} delimeter  Delimiter seperates the pairs
     * @param {boolean} skipEncoding True to skip encoding
     */
    export function serialize(obj: any, delimiter?: string, skipEncoding?: boolean) {
        delimiter = delimiter || ObjectUtil.DEFAULT_DELIMITER;

        var values: string[] = Object.keys(obj).map((name: string) => {
            // Get the value and convert it to a string
            var value: string = obj[name];
            value = value ? value.toString() : "";

            if (!skipEncoding) {
                value = UriEncoding.encodeURIComponent(value);
            }

            // Add the encoded value to the array
            return name + ObjectUtil.KEYVALUE_DELIMITER + value;
        });

        return values.join(delimiter);
    }
}

export = ObjectUtil;