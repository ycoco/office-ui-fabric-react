// OneDrive:IgnoreCodeCoverage

import ko = require('knockout');

export function objectStrictEquality(a: any, b: any) {
    return a === b;
}

export function arrayStrictEquality(a: Array<any>, b: Array<any>) {
    return ko.utils.compareArrays(a, b, {
        sparse: true,
        dontLimitMoves: true
    }).length === 0;
}
