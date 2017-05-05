// OneDrive:CoverageThreshold(96)

import { CamlConstants, CamlTags as Tags, CamlAttributes as Attrs } from './CamlConstants';
import { getViewDomParts, parseViewFields } from './CamlParsingBasic';
import * as CamlUtilities from './CamlUtilities';
import { IViewArrangeInfo, IFilter, IOrderedField, IGroupBy, IRowLimit, IViewDomParts } from '@ms/odsp-datasources/lib/interfaces/view/IViewArrangeInfo';

export * from './CamlParsingBasic';

interface IFilterValue {
    type: string;
    value: string;
}

/**
 * Gets the arrange info from the given IViewDomParts or CAML string.
 *
 * This will throw if viewInfo is a string that's not valid XML (see CamlParsingBasic.getViewDomParts
 * for details). Invalid CAML will be ignored.
 */
export function parseView(viewInfo: IViewDomParts | string): IViewArrangeInfo {
    'use strict';

    let domParts = typeof viewInfo === 'string' ? getViewDomParts(viewInfo) : viewInfo;

    return {
        filters: parseFilters(domParts.where),
        sorts: parseSorts(domParts.orderBy),
        groupBy: parseGroupBy(domParts.groupBy),
        fieldNames: parseViewFields(domParts.viewFields),
        rowLimit: parseRowLimit(domParts.rowLimit)
    };
}

/**
 * Parses an OrderBy tag.
 * Ascending is optional (defaults to true) but should be TRUE or FALSE if present.
 *
 * Returns undefined if no sort fields are defined (or none follow the expected format).
 * Sort fields that don't follow the expected format are ignored.
 *
 * Example:
 * <OrderBy>
 *   <FieldRef Name="Field1" Ascending="TRUE" />
 *   <FieldRef Name="Field2" Ascending="FALSE" />
 *   ...
 * </OrderBy>
 */
export function parseSorts(orderBy: Element): IOrderedField[] {
    'use strict';

    if (!orderBy) {
        return undefined;
    }
    let sorts = Array.prototype.slice.call(orderBy.childNodes)
        .map((elem: Element) => _parseOrderedField(elem))
        .filter((sort: IOrderedField) => !!sort);
    return sorts.length ? sorts : undefined;
}

/**
 * Parses a GroupBy tag.
 * Collapse is optional (defaults to true) but should be TRUE or FALSE if present.
 * Ascending is optional (defaults to true) but should be TRUE or FALSE if present.
 *
 * Ignores any non-FieldRef children, or FieldRefs after the first two.
 * Returns undefined if groupBy doesn't exist or has no valid FieldRef children.
 *
 * Example:
 * <GroupBy Collapse="TRUE">
 *   <FieldRef Name="Field1" Ascending="TRUE" />
 *   <FieldRef Name="Field2" Ascending="FALSE" />
 * </GroupBy>
 */
export function parseGroupBy(groupBy: Element): IGroupBy {
    'use strict';

    if (!groupBy) {
        return undefined;
    }

    // GroupBy is supposed to have at most two <FieldRef> children (and no other children)
    let groupFields: IOrderedField[] = Array.prototype.slice.call(groupBy.childNodes)
        .map((elem: Element) => _parseOrderedField(elem))
        .filter((field: IOrderedField) => !!field);

    if (groupFields.length) {
        let result: IGroupBy = {
            // Collapse attribute is optional and defaults to true
            isCollapsed: _getBooleanAttr(groupBy, Attrs.collapse, true),
            group1: groupFields[0]
        };
        if (groupFields[1]) {
            result.group2 = groupFields[1];
        }
        return result;
    }
    return undefined;
}

/**
 * Parses a RowLimit tag.
 * The Paged attribute is optional (not specified means false to the server).
 *
 * Returns undefined if the tag doesn't exist or has no text content.
 *
 * Example:
 * <RowLimit Paged="TRUE">30</RowLimit>
 */
export function parseRowLimit(rowLimit: Element): IRowLimit {
    'use strict';

    if (!rowLimit || !rowLimit.textContent) {
        return undefined;
    }

    return {
        rowLimit: Number(rowLimit.textContent),
        isPerPage: _getBooleanAttr(rowLimit, Attrs.paged, false)
    };
}

/**
 * Parses a <Where> (filter) tag and returns an array of the filters found.
 *
 * Returns undefined if the element is undefined or has no supported children.
 * Currently-unsupported or invalid filters will be ignored.
 *
 * Unsupported (but valid) children are:
 * - Or tags with children other than a combination of Or/Eq/IsNull on the same field
 * - DateRangesOverlap, because it has unusual syntax and is only relevant for calendar views
 *  (which the new UI doesn't support). https://msdn.microsoft.com/en-us/library/office/ms436080.aspx)
 *
 * Where is only supposed to have a single child node, so child nodes after the first are ignored.
 */
export function parseFilters(where: Element): IFilter[] {
    'use strict';

    if (!where || !where.childElementCount) {
        return undefined;
    }
    let filters = parseFilter(where.firstElementChild);
    return filters && filters.length ? filters : undefined;
}

/**
 * Parses a logic or comparison filter operator tag into an array of IFilters.
 * (See parseFilters info about unsupported tags.)
 *
 * Returns undefined if anything unsupported/unrecognized is found.
 */
export function parseFilter(filter: Element): IFilter[] {
    'use strict';

    if (!filter) {
        return undefined;
    }

    let result: IFilter[] | IFilter;

    switch (filter.tagName) {
        // Logic operators
        case Tags.and:
            result = _parseAnd(filter);
            break;
        case Tags.or:
            result = _parseOuterOr(filter);
            break;
        // Unary comparison operators
        case Tags.isNull:
        case Tags.isNotNull:
        case Tags.membership:
            result = _parseUnaryOpNode(filter);
            break;
        // Binary operators
        case Tags.beginsWith:
        case Tags.contains:
        case Tags.eq:
        case Tags.greaterEq:
        case Tags.greater:
        case Tags.includes:
        case Tags.lessEq:
        case Tags.less:
        case Tags.notEq:
        case Tags.notIncludes:
            result = _parseBinaryOpNode(filter);
            break;
        // Operator taking multiple values
        case Tags.inTag:
            result = _parseIn(filter);
            break;
        // If we get here, the operator is either DateRangesOverlap or not a valid CAML operator.
    }

    if (result) {
        if (Array.isArray(result)) {
            return result.length ? result : undefined;
        } else {
            return [result];
        }
    }
    return undefined;
}

/**
 * Parses a tag like <FieldRef Name="Field1" Ascending="TRUE" />.
 * Ascending is optional (defaults to true) but should be true or false if present.
 *
 * Returns undefined if the tag name is not FieldRef or the Name attribute is missing.
 */
function _parseOrderedField(fieldRef: Element): IOrderedField {
    'use strict';

    if (!fieldRef || fieldRef.tagName !== Tags.fieldRef) {
        return undefined;
    }
    let fieldName = CamlUtilities.getAttr(fieldRef, Attrs.name);
    if (!fieldName) {
        return undefined;
    }

    return {
        fieldName: fieldName,
        isAscending: _getBooleanAttr(fieldRef, Attrs.ascending, true)
    };
}

/**
 * Gets the value of a boolean attribute. Valid values are true, false, and not present.
 */
function _getBooleanAttr(elem: Element, attr: string, defaultValue?: boolean): boolean {
    'use strict';

    let value = CamlUtilities.getAttr(elem, attr) || '';
    switch (value.toLowerCase()) {
        case 'true': return true;
        case 'false': return false;
        default: return defaultValue;
    }
}

/**
 * Parses an In filter tag. Type is expected to be the same between values (if that's not the case,
 * a default type will be used in the returned filter).
 *
 * Returns undefined if the tag does not have a FieldRef child (with name) and a Values child.
 * Unrecognized or empty values will be ignored.
 *
 * Example:
 * <In>
 *   <FieldRef Name="Editor"/>
 *   <Values>
 *     <Value Type="User">Person 1</Value>
 *     <Value Type="User">Person 2</Value>
 *     <Value Type="User">Person 3</Value>
 *   </Values>
 * </In>
 */
function _parseIn(inNode: Element): IFilter {
    'use strict';

    // In should have exactly one FieldRef child with Name and one Values child
    // (neither of which should have text)
    let result = _getBasicFilter(inNode);
    let valuesNode: Element = Array.prototype.filter.call(inNode.childNodes,
        (elem: Element) => elem.tagName === Tags.values)[0];
    if (!result || !valuesNode) {
        return undefined;
    }

    let hasMultipleTypes = false;
    let values: string[] = Array.prototype.map.call(valuesNode.childNodes, (elem: Element) => {
        // Get the value and type from each value node.
        // (For value nodes with unrecognized children, _parseValueNode returns undefined.)
        let value: IFilterValue = _parseValueNode(elem);
        if (value && value.type && !hasMultipleTypes) {
            // If the values have only a single type, we'll store that type in the filter object.
            // (A mix of nodes with the single type and no type is fine too.)
            let curr = value.type;
            let prev = result.type;
            hasMultipleTypes = !!(prev && curr && prev !== curr);
            result.type = prev || curr;
        }
        return value && value.value;
    });
    // Remove empty strings (from <Value></Value> which is ignored by server) and undefineds
    values = values.filter((value: string) => !!value);

    if (values.length) {
        result.values = values;
        if (hasMultipleTypes) {
            result.type = undefined;
        }
    }
    return values.length ? result : undefined;
}

/**
 * Parses an And filter tag and returns an array of all filters found inside.
 *
 * Any unrecognized/unsupported elements within the And will be ignored.
 * Returns undefined if the tag has no children or neither child is a supported filter type.
 *
 * And should have exactly two immediate children (the server is likely to throw if this isn't
 * the case). If more children are present, we ignore them. If one child is present, it will be
 * processed as usual.
 */
function _parseAnd(andNode: Element): IFilter[] {
    'use strict';

    // And should have exactly two children
    if (!andNode || !andNode.childElementCount) {
        return undefined;
    }

    let firstChild = andNode.firstElementChild;
    let filters1 = parseFilter(firstChild);
    if (!firstChild.nextElementSibling) {
        // And with only one child is actually invalid, but we ignore that here...
        return filters1;
    }
    let filters2 = parseFilter(firstChild.nextElementSibling);
    // Ignore child nodes after the second (that's technically invalid)

    if (!filters1 && !filters2) {
        // If both filters1 and filters2 are unrecognized, count the whole And node as one
        // unrecognized filter.
        return undefined;
    }
    return (filters1 || []).concat(filters2 || []);
}

/**
 * Calls _parseOrEqIsNull and validates the result.
 *
 * Returns a filter with no type if any child nodes have values of different types.
 * Returns undefined if the Or contains filters for multiple fields (this is valid but unsupported).
 *
 * Example supported structure:
 *     <Or>
 *       <Or>
 *         <Eq>
 *           <FieldRef Name="Editor" />
 *           <Value Type="User">Person 1</Value>
 *         </Eq>
 *         <IsNull>
 *           <FieldRef Name="Editor" />
 *         </IsNull>
 *       </Or>
 *       <Eq>
 *         <FieldRef Name="Editor" />
 *         <Value Type="User">Person 3</Value>
 *       </Eq>
 *     </Or>
 *
 * Result:
 * {
 *   fieldName: 'Editor',
 *   type: 'User',
 *   values: ['Person 1', '', 'Person 3']
 * }
 */
function _parseOuterOr(orNode: Element): IFilter {
    'use strict';

    // _parseOrEqIsNull will return an array of single-value filters.
    let filters = _parseOrEqIsNull(orNode);
    // First ensure that none of the returned filters are null/undefined
    // (if so, this means something unrecognized inside the Or and we should return undefined)
    if (filters && filters.length && !filters.some((filter: IFilter) => !filter)) {
        // Make one multi-value filter and do some verification.

        // Verify that the Or only contains filters for the same field name and with the same
        // lookupid setting (that's the only case we support for now)
        let nameAndLookupIdMatch = filters.every((filter: IFilter) =>
            filter.fieldName === filters[0].fieldName && filter.lookupId === filters[0].lookupId);
        if (nameAndLookupIdMatch) {
            // Combine the filter values and determine the type.
            let hasMultipleTypes = false;
            let result = filters.reduce((result: IFilter, curr: IFilter) => {
                if (!hasMultipleTypes) {
                    if (result.type && curr.type && result.type !== curr.type) {
                        // multiple types detected, so unset the type
                        hasMultipleTypes = true;
                        result.type = undefined;
                    } else {
                        // ensure the result has a type even if not all filter values
                        // specified types
                        result.type = result.type || curr.type;
                    }
                }
                // accumulate the filter values
                result.values.push(curr.values[0]);
                return result;
            });
            // If Eq is used as the operator when there are multiple values,
            // the result will be a combination of Or/Eq tags like we just parsed.
            result.operator = Tags.eq;
            result.id = orNode && CamlUtilities.getAttr(orNode, Attrs.id);
            return result;
        }
    }
    return null;
}

/**
 * Parses a tree of Or and Eq/IsNull filter tags, presumably for the same field.
 *
 * Returns undefined if the tree contains any operators besides Or, Eq, and IsNull.
 *
 * Or should have exactly two immediate children (the server is likely to throw if this isn't
 * the case). If more children are present, we ignore them. If one child is present, it will be
 * processed as usual.
 */
function _parseOrEqIsNull(orEqNode: Element): IFilter[] {
    'use strict';

    if (!orEqNode.childElementCount) {
        return undefined;
    }

    let tagName = orEqNode && orEqNode.tagName;
    let result: IFilter | IFilter[];
    switch (tagName) {
        case Tags.or:
            let firstChild = orEqNode.firstElementChild;
            let filters1 = _parseOrEqIsNull(firstChild);
            if (filters1 && firstChild.nextElementSibling) {
                let filters2 = _parseOrEqIsNull(firstChild.nextElementSibling);
                // If the second child is present, it must be something supported.
                result = filters2 ? filters1.concat(filters2) : undefined;
            } else {
                result = filters1;
            }
            break;
        case Tags.eq:
            result = _parseBinaryOpNode(orEqNode);
            break;
        case Tags.isNull:
            result = _parseUnaryOpNode(orEqNode);
            break;
    }

    if (result) {
        return Array.isArray(result) ? result : [result];
    }
    return undefined;
}

/**
 * Parses a binary CAML comparison operator (one containing both a FieldRef and a Value).
 *
 * Returns undefined if no FieldRef is found, the FieldRef has no name, no Value is found,
 * or the value is not understood (for example, has an unsupported child node).
 */
function _parseBinaryOpNode(opNode: Element): IFilter {
    'use strict';

    let result = _getBasicFilter(opNode);
    let valueNode = Array.prototype.filter.call(opNode.childNodes, (elem: Element) => elem.tagName === Tags.value)[0];
    if (!result || !valueNode) {
        return undefined;
    }

    let value = _parseValueNode(valueNode);
    if (value) {
        result.type = value.type;
        result.values = [value.value];
        return result;
    }
    return undefined;
}

/**
 * Parses a unary CAML comparison operator (one containing a FieldRef and no Value).
 * The values property of the result is as follows for each operator:
 * - IsNull: values = ['']
 * - IsNotNull: values = undefined
 * - Membership: values = [ type attribute from Membership tag ]
 *   https://msdn.microsoft.com/en-us/library/office/aa544234.aspx
 *
 * Returns undefined if no FieldRef is found, the FieldRef has no name, or the operator is
 * Membership and the Type attribute is missing.
 *
 * Examples:
 * <IsNull>
 *   <FieldRef Name="foo" />
 * </IsNull>
 *
 * <Membership Type="CurrentUserGroups">
 *   <FieldRef Name="AssignedTo"/>
 * </Membership>
 */
function _parseUnaryOpNode(opNode: Element): IFilter {
    'use strict';

    let result = _getBasicFilter(opNode);
    if (result) {
        if (opNode.tagName === Tags.isNull) {
            // nulls in the database are represented by empty strings when filtering
            result.values = [''];
        } else if (opNode.tagName === Tags.membership) {
            // see page linked in method comment
            let type = CamlUtilities.getAttr(opNode, Attrs.type);
            if (type) {
                result.values = [type];
            } else {
                result = undefined;
            }
        }
    }

    return result;
}

/**
 * Gets an IFilter with no values or type based on the first FieldRef node from opNode's children.
 * If such a node doesn't exist or doesn't have a Name attribute, returns undefined.
 */
function _getBasicFilter(opNode: Element): IFilter {
    'use strict';

    let fieldRef: Element = Array.prototype.filter.call(opNode.childNodes, (elem: Element) => elem.tagName === Tags.fieldRef)[0];
    let fieldName = fieldRef && CamlUtilities.getAttr(fieldRef, Attrs.name);
    let id = opNode && CamlUtilities.getAttr(opNode, Attrs.id);
    if (!fieldName) {
        return undefined;
    }
    return {
        fieldName: fieldName,
        id: id,
        // TODO: pass in field types?
        type: undefined,
        lookupId: _getBooleanAttr(fieldRef, Attrs.lookupId),
        operator: opNode.tagName,
        values: undefined
    };
}

/**
 * Parses a Value tag, like <Value Type="User">Person 1</Value>.
 * Supports <Today/> but not other child nodes.
 *
 * Returns undefined if the tag name is not Value or it has children besides Today.
 */
function _parseValueNode(value: Element): IFilterValue {
    'use strict';

    // This logic will have to be changed if we ever want to handle these:
    //   [Me]:           <Value Type="Integer"><UserId /></Value>
    //   Date with time: <Value Type="DateTime" IncludeTimeValue="TRUE">...</Value>
    //   <Now/> (only for DateRangesOverlap which isn't supported)
    let hasUnrecognizedChild = value && value.childElementCount && value.firstElementChild.tagName !== Tags.today;
    if (!value || value.tagName !== Tags.value || hasUnrecognizedChild) {
        return undefined;
    }

    let result: IFilterValue = {
        value: value.textContent,
        // TODO [elcraig]: pass in schema info so we know the actual field type
        type: CamlUtilities.getAttr(value, Attrs.type)
    };
    if (value.childElementCount) {
        // Handles <Value Type="DateTime"><Today Offset="-3"/></Value> by setting the
        // filter value to a special format like "[Today]-3"
        let today = value.firstElementChild;
        let offsetStr = CamlUtilities.getAttr(today, Attrs.offset) || CamlUtilities.getAttr(today, Attrs.offsetDays);
        let offset = parseInt(offsetStr, 10) || 0;
        result.value = CamlUtilities.getTodayString(offset);
        result.type = result.type || 'DateTime';
    }
    // If this is a datetime without IncludeTimeValue, get the date only for filtering.
    let match;
    if (result.value && result.type === 'DateTime'
        && _getBooleanAttr(value, Attrs.includeTimeValue) !== true
        && (match = result.value.match(CamlConstants.datetimeNoTimeRegex))) {
        result.value = match[1];
    }
    return result;
}
