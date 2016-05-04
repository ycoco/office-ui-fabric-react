/* This file SHOULD NEVER have any big dependendies or use knockout */

// OneDrive:IgnoreCodeCoverage

export function extend(target: any, source: any) {
    "use strict";

    if (source) {
        for (var prop in source) {
            if (source.hasOwnProperty(prop)) {
                target[prop] = source[prop];
            }
        }
    }
    return target;
}