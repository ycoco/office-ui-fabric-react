import { expect, assert, AssertionError } from 'chai';
import { IValidViewInfo, validDefs } from './SampleViewInfo';
import IView from '../../../interfaces/view/IView';
import { IViewArrangeInfo, IFilter } from '../../../interfaces/view/IViewArrangeInfo';
import * as CamlParsing from '../../../utilities/caml/CamlParsing';

/**
 * Try running some tests. If any exceptions besides AssertionErrors occur, catch them and
 * print a more granular error message based on objectPath. (This is useful for it() blocks
 * that cover multiple cases.)
 */
export function tryTests(objectPath: string, runTests: () => void) {
    'use strict';

    try {
        runTests();
    } catch (ex) {
        if (ex instanceof AssertionError) {
            throw ex;
        } else {
            assert(false, `Uncaught exception at ${objectPath}: + ${ex.stack}`);
        }
    }
}

/**
 * Compare the properties of actual and expected one by one.
 * Comparing properties individually results in more helpful error messages.
 */
export function expectEqualProps(params: {
    /** actual IViewArrangeInfo or IFilter */
    actual: IViewArrangeInfo | IFilter;
    /** expected IViewArrangeInfo or IFilter */
    expected: IViewArrangeInfo | IFilter;
    /** SampleViewInfo.validDefs object path + description (used for errors) */
    objectPath: string;
    /** Original XML (used only for error messages) */
    xml: string;
    /** If true, empty arrays and null/undefined are considered equal (default true) */
    emptyArraysOkay?: boolean;
    /**
     * List of property names to compare (defaults to union of Object.keys(info) and
     * Object.keys(valid), with certain "internal" properties excluded)
     */
    props?: string[];
}) {
    'use strict';

    let {
        actual,
        expected,
        objectPath,
        xml,
        emptyArraysOkay = true,
        props = unionKeys(params.actual, params.expected)
    } = params;

    if (!actual || !expected) {
        expect(JSON.stringify(actual)).to.equal(JSON.stringify(expected),
            `only one of actual/expected is falsey at ${objectPath}. \nOriginal XML: ${xml}`);
        return;
    }

    for (let prop of props) {
        let actualValue = actual[prop];
        let expectedValue = expected[prop];

        if (prop === 'filters') {
            // Compare filters one by one to get better error messages.
            expectMatchingFilters(actualValue, expectedValue, 'filters from ' + objectPath, xml);
        } else {
            try {
                if (emptyArraysOkay && onlyOneIsEmptyArray(actualValue, expectedValue)) {
                    continue;
                } else {
                    expect(actualValue).to.eql(expectedValue);
                }
            } catch (ex) {
                // Catch the error if the expect fails then stringify to get a good message...
                // This is more efficient than always building the message.
                assert(false, `Issue with ${objectPath}: ` +
                    `actual ${prop} ${JSON.stringify(actualValue)} does not equal ${JSON.stringify(expectedValue)}. ` +
                    `\nOriginal XML: ${xml}`);
            }
        }
    }
}

/**
 * Read-only friendly representation of current sort/filter/group/fields settings according to
 * the current view XML. Does NOT take into account modifications made solely via query params.
 *
 * Could throw if the view's baseViewXml is invalid XML.
 * Returns undefined if the view's baseViewXml is unknown.
 */
export function getEffectiveArrangeInfo(view: IView): IViewArrangeInfo {
    'use strict';

    let viewDom = view.getDomParts();
    return viewDom && CamlParsing.parseView(viewDom);
}

/** Gets a string of the path to an object within SampleViewInfo.validDefs. */
export function getObjectPath(category: string, i?: number, description?: string): string {
    'use strict';
    let result = 'SampleViewInfo.validDefs.' + category;
    if (typeof i === 'number') {
        result += `[${i}]`;
    }
    if (typeof description === 'string') {
        result += ` (${description})`;
    }
    return result;
}

/**
 * Gets the index of the view definition with the given description from SampleViewInfo.validDefs[category]
 * or asserts if it doesn't exist.
 */
export function indexOfDef(category: string, description: string): number {
    'use strict';

    let defs = validDefs[category];
    expect(defs).to.not.equal(undefined, `${getObjectPath(category)} does not exist`);

    for (let i = 0; i < defs.length; i++) {
        if (defs[i].description === description) {
            return i;
        }
    }

    assert(false, `Nothing found in ${getObjectPath(category)} with description "${description}"`);
    return null;
}

export function getDef(category: string, description: string): IValidViewInfo {
    'use strict';
    let i = indexOfDef(category, description);
    return validDefs[category][i];
}

/**
 * Returns true if one of v1 and v2 is an empty array, and the other is undefined.
 * These are considered equal because the definitions from SampleViewInfo don't include sorts,
 * fieldNames, or filters when none are present in the XML, but getEffectiveArrangeInfo
 * returns empty arrays for those in this case.
 */
function onlyOneIsEmptyArray(v1: any, v2: any): boolean {
    'use strict';
    if ((v1 && v2) || (!v1 && !v2)) {
        return false;
    }
    return (Array.isArray(v1) && !v1.length) || (Array.isArray(v2) && !v2.length);
}

/** Combine the keys from v1 and v2, excluding certain "internal" keys that don't matter */
function unionKeys(v1: any, v2: any) {
    'use strict';

    let keys = Object.keys(v1 || {}).concat(Object.keys(v2 || {}));
    let obj = {};
    for (let key of keys) {
        obj[key] = key;
    }
    // Also get rid of some common keys we don't care about...
    // TODO: add back id (used for filters only) if CamlParsing starts supporting it
    for (let key of ['xml', 'description', 'expectSerializedOperator', 'skipSerializationTest', 'id']) {
        delete obj[key];
    }
    return Object.keys(obj);
}

function expectMatchingFilters(actual: IFilter[], expected: IFilter[], objectPath: string, xml: string) {
    'use strict';

    if (!actual || !expected) {
        expect(JSON.stringify(actual)).to.equal(JSON.stringify(expected),
            `only one of actual/expected is falsey at ${objectPath}. \nOriginal XML: ${xml}`);
        return;
    }

    expect(actual).to.have.length(expected.length, `actual/expected filters length discrepancy at ${objectPath}`);

    // Check the filters one at a time so we can have better error messages.
    for (let i = 0; i < actual.length; i++) {
        expectEqualProps({
            actual: actual[i],
            expected: expected[i],
            objectPath: objectPath,
            emptyArraysOkay: false,
            xml: xml
        });
    }
}
