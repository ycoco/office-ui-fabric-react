// OneDrive:CoverageThreshold(96)

import { CamlConstants, CamlAttributes as Attrs } from './CamlConstants';
import * as CamlUtilities from './CamlUtilities';
import { IFilter } from '@ms/odsp-datasources/lib/interfaces/view/IViewArrangeInfo';
import HtmlEncoding from '@ms/odsp-utilities/lib/encoding/HtmlEncoding';

interface IFieldRef {
    fieldName: string;
    isAscending?: boolean;
    lookupId?: boolean;
}

/**
 * Convert multiple filters to CAML and combines them with the given operator (default 'And').
 * Returns '' if no filters are defined.
 *
 * The output is not wrapped with a <Where> element; the caller
 * can combine the result with other filters or wrap with a <Where>
 * element as-needed.
 */
export function filtersToCaml(filters: (IFilter | string)[], operator: string = 'And'): string {
    'use strict';

    return CamlUtilities.combineFilters(filtersToCamlStrings(filters), operator);
}

/**
 * Convert a list of IFilters to a list of CAML strings.
 * (Optionally there can also be strings in the list of filters too, which will be returned as-is.)
 */
export function filtersToCamlStrings(filters: (IFilter | string)[]): string[] {
    'use strict';

    return filters.map((filter: IFilter | string) =>
        typeof filter === 'string' ? filter : filterToCaml(filter));
}

/**
 * Convert a single filter to CAML. Returns '' if the filter has no values.
 */
export function filterToCaml(filter: IFilter): string {
    'use strict';

    // IsNotNull is allowed to have values = undefined, but everything else must have values.
    let needsValues = filter && filter.operator !== 'IsNotNull';
    let hasValues = filter && filter.values && filter.values.length;
    if (!filter || (needsValues && !hasValues)) {
        return '';
    }

    // TODO: instead of using blacklisted types with Or/Eq, use only whitelisted types with In
    // and use Or/Eq for rest? (more reliable...)

    // TODO: get field type from field list if unspecified?

    let operator = filter.operator || 'In';
    // In some cases we want to use a series of <Or><Eq> tags rather than <In>:
    // - Single-value filters (<Eq> is better in this case since it's more reliable server-side)
    // - DateTime values, which can't be compared using <In>
    // - If any of the values are empty we have to use <Or> so we can use the <IsNull> tag.
    let type = filter.type && filter.type.toLowerCase();
    if (operator === 'In'
        && (filter.values.length === 1
            || type === 'datetime'
            || ((type === 'lookup' || type === 'computed') && CamlConstants.dateRegex.test(filter.values[0]))
            || filter.values.some((value: string) => value === ''))) {
        operator = 'Eq';
    }

    let result: string;
    if (operator === 'In') {
        // For multi-value non-DateTime filters with no empty strings, use <In><Values>.
        let fieldRef = _fieldRefToCaml(filter);
        let values = filter.values
            .map((value: string) => _valueToCaml(value, filter))
            .join('');
        result = `<In>${fieldRef}<Values>${values}</Values></In>`;
    } else if (operator === 'IsNotNull') {
        // IsNotNull uses values=undefined
        result = _singleValueFilterToCaml(undefined, filter);
    } else {
        let filterStrings = filter.values.map(
            (value: string) => _singleValueFilterToCaml(value, filter, operator));
        result = CamlUtilities.combineFilters(filterStrings, 'Or');
    }

    // Add in the id attribute if given
    if (filter.id) {
        let idAttr = _stringToAttr(Attrs.id, filter.id);
        let tagEnd = result.indexOf('>');
        result = result.slice(0, tagEnd) + idAttr + result.slice(tagEnd);
    }
    return result;
}

/**
 * Converts a single filter value to a CAML tag.
 * @param value - Value being compared against
 * @param filter - Total filter used for information about the type and field name
 *   (value is presumably from filter.values)
 * @param operator - Override of operator from filter object
 */
function _singleValueFilterToCaml(value: string, filter: IFilter, operator?: string): string {
    'use strict';

    operator = operator || filter.operator;
    if (operator === 'Membership') {
        // Membership is a unary operator that uses a special Type attribute on the operator tag.
        // On the client we store the type in the values array.
        // https://msdn.microsoft.com/en-us/library/office/aa544234.aspx
        let fieldRef = _fieldRefToCaml({ fieldName: filter.fieldName });
        return `<Membership Type="${value}">${fieldRef}</Membership>`;
    } else {
        let fieldRef = _fieldRefToCaml(filter);

        if (operator === 'IsNotNull') {
            return `<IsNotNull>${fieldRef}</IsNotNull>`;
        } else if (value === '') {
            return `<IsNull>${fieldRef}</IsNull>`;
        } else {
            let valueStr = _valueToCaml(value, filter);
            return `<${operator}>${fieldRef}${valueStr}</${operator}>`;
        }
    }
}

/**
 * Converts a field name to a CAML FieldRef tag.
 */
function _fieldRefToCaml(fieldRef: IFieldRef): string {
    'use strict';

    if (!fieldRef) {
        return '';
    }
    let name = _stringToAttr(Attrs.name, fieldRef.fieldName);
    let isAscendingStr = _booleanToAttr(Attrs.ascending, fieldRef.isAscending);
    // TODO does lookupid require a value type?
    let lookupIdStr = _booleanToAttr(Attrs.lookupId, fieldRef.lookupId);
    return `<FieldRef${name}${isAscendingStr}${lookupIdStr}/>`;
}

/**
 * Converts a filter value to a CAML Value tag.
 * It will translate specially formatted values into a Today tag inside the Value.
 */
function _valueToCaml(value: string, filter: IFilter): string {
    'use strict';

    let valueStr;
    let type = filter.type || '';
    if (type.toLowerCase() === 'datetime' && CamlUtilities.isTodayString(value)) {
        let offset = CamlUtilities.getTodayOffset(value);
        if (offset) {
            valueStr = `<Today OffsetDays="${offset}"/>`;
        } else {
            valueStr = '<Today/>';
        }
    } else {
        valueStr = HtmlEncoding.encodeText(value);
    }

    // TODO: get field type somehow if not given?
    let typeStr = _stringToAttr(Attrs.type, type);
    return `<Value${typeStr}>${valueStr}</Value>`;
}

/**
 * Gets a string of an attribute+value. Value will be encoded.
 * Returns '' if value is falsey.
 */
function _stringToAttr(attr: string, value: string): string {
    'use strict';

    return value ? ` ${attr}="${HtmlEncoding.encodeText(value)}"` : '';
}

/**
 * Gets a string of a boolean attribute+value. Returns '' if value is not a boolean.
 */
function _booleanToAttr(attr: string, value: boolean): string {
    'use strict';

    return typeof value === 'boolean' ? ` ${attr}="${String(value).toUpperCase()}"` : '';
}
