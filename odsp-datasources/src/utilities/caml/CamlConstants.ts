'use strict';

export const CamlTags = {
    view: 'View',
    viewFields: 'ViewFields',
    rowLimit: 'RowLimit',
    query: 'Query',
    orderBy: 'OrderBy',
    groupBy: 'GroupBy',
    where: 'Where',
    // logic operators
    and: 'And',
    or: 'Or',
    // comparison operators
    beginsWith: 'BeginsWith',
    contains: 'Contains',
    dateRangesOverlap: 'DateRangesOverlap',
    eq: 'Eq',
    greater: 'Gt',
    greaterEq: 'Geq',
    includes: 'Includes',
    inTag: 'In',
    isNotNull: 'IsNotNull',
    isNull: 'IsNull',
    less: 'Lt',
    lessEq: 'Leq',
    membership: 'Membership',
    notEq: 'Neq',
    notIncludes: 'NotIncludes',
    // used inside OrderBy, GroupBy, filter operators
    fieldRef: 'FieldRef',
    // used inside filter operators
    value: 'Value',
    values: 'Values',
    today: 'Today'
};

export const CamlAttributes = {
    name: 'Name',
    collapse: 'Collapse',
    ascending: 'Ascending',
    type: 'Type',
    includeTimeValue: 'IncludeTimeValue',
    paged: 'Paged',
    offset: 'Offset',
    offsetDays: 'OffsetDays',
    lookupId: 'LookupId',
    /** This is not from the CAML spec, just added for convenience */
    id: 'id'
};

export const CamlConstants = {
    doctype: 'application/xml',
    /** String format for query selector for a given field name. {0} = field name. */
    fieldNameQuery: 'FieldRef[Name="{0}"]',
    /** Matches dates in ISO format like 2016-04-28T12:34:56Z. match[1] = date. */
    datetimeRegex: /^(\d{4}-\d{2}-\d{2})T\d{2}:\d{2}:\d{2}Z$/,
    /** Matches dates in ISO format with time 0, like 2016-04-28T00:00:00Z. match[1] = date. */
    datetimeNoTimeRegex: /^(\d{4}-\d{2}-\d{2})T00:00:00Z$/,
    /** Matches dates starting with pattern like 2016-04-28 */
    dateRegex: /^\d{4}-\d{2}-\d{2}/,
    /** Matches the client-side Today format. match[1] = offset */
    todayRegex: /^\[today\]([+-]\d+)?$/i
};

export default CamlConstants;