// OneDrive:IgnoreCodeCoverage

import ko = require('knockout');

class EqualityComparers {
    public static objectStrictEquality(a: any, b: any) {
        return a === b;
    }

    public static arrayStrictEquality(a: Array<any>, b: Array<any>) {
        return ko.utils.compareArrays(a, b, {
            sparse: true,
            dontLimitMoves: true
        }).length === 0;
    }
}

export = EqualityComparers;