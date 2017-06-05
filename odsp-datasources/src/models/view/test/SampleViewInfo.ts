import IViewArrangeInfo from '../../../interfaces/view/IViewArrangeInfo';

/**
 * IValidViewInfos have two parts: the XML to be parsed, a description of the XML,
 * and the expected IViewArrangeInfo result (all the inherited properties).
 */
export interface IValidViewInfo extends IViewArrangeInfo {
    xml: string;
    description: string;
    /**
     * Only relevant for tests of <Or> and <In> filters:
     * Our serialization test code would serialize most of the <Or> test cases using <In>.
     * So use this property to tell which of <Or> or <In> is expected.
     */
    expectSerializedOperator?: string;
    /**
     * If true, don't test serialization of this definition, because the generated XML will be
     * textually different than the XML included in the definition.
     *
     * If we ever need to round-trip filters that could be user-generated (therefore could contain
     * extra attributes and random stuff), we should reconsider some of these cases, especially
     * the ones where skipSerializationTest is true due to presence of extra attributes.
     */
    skipSerializationTest?: boolean;
}

// The following functions are used to wrap snippets of XML so I don't have to write every bit
// of common wrapper XML over and over again.
let identity =      (str: string) => str;
let view =          (str: string) => `<View>${str}</View>`;
let viewFields =    (str: string) => `<ViewFields>${str}</ViewFields>`;
let query =         (str: string) => `<Query>${str}</Query>`;
let orderBy =       (str: string) => `<OrderBy>${str}</OrderBy>`;
let where =         (str: string) => `<Where>${str}</Where>`;
let eq =            (str: string) => `<Eq>${str}</Eq>`;
let isNull =        (str: string) => `<IsNull>${str}</IsNull>`;
let isNotNull =     (str: string) => `<IsNotNull>${str}</IsNotNull>`;
let membership =    (type: string, str: string) => `<Membership Type="${type}">${str}</Membership>`;
let inTag =         (field: string, values: string) => `<In>${field}<Values>${values}</Values></In>`;
let or =            (f1: string, f2: string) => `<Or>${f1}${f2}</Or>`;
let and =           (f1: string, f2: string) => `<And>${f1}${f2}</And>`;
// let or =            (...filters: string[]) => `<Or>${filters.join('')}</Or>`;
// let and =           (...filters: string[]) => `<And>${filters.join('')}</And>`;
let groupByCollapse = (collapse: boolean, str: string) =>
    `<GroupBy Collapse="${collapse ? 'TRUE' : 'FALSE'}">${str}</GroupBy>`;
let viewViewFields = (str: string) => view(viewFields(str));
let viewQuery =     (str: string) => view(query(str));
let viewWhere =     (str: string) => viewQuery(where(str));

const timeStr = '2016-01-14T07:11:00.000Z';

/**
 * Wraps the XML in each view definition using the given wrapper function.
 * This is a way to avoid writing so much boilerplate around each test case: for example,
 * <View><Query><Where>(stuff we care about)</Where></Query></View> for every filtering test.
 */
function wrap(wrapper: (str: string) => string, defs: IValidViewInfo[]): IValidViewInfo[] {
    'use strict';

    defs.forEach((info: IValidViewInfo) => info.xml = wrapper(info.xml));
    return defs;
}

/**
 * Contains sample IValidViewInfo objects that can be used to initialize and verify the contents
 * of views and/or IViewArrangeInfo instances.
 */
export const validDefs: { [category: string]: IValidViewInfo[] } = {
    // Basic valid views, wrapped with <View>
    basic: wrap(view, [
        { description: 'empty', xml: '' },
        { description: 'query', xml: '<Query/>' },
        // more questionable
        { description: 'fields inside foo', xml: '<Foo><ViewFields><FieldRef Name="aaa"/></ViewFields></Foo>' },
        { description: 'query inside foo', xml: '<Foo><Query><OrderBy><FieldRef Name="aaa"/></OrderBy></Query></Foo>' },
        { description: 'order by inside foo', xml: '<Query /><Foo><OrderBy><FieldRef Name="aaa"/></OrderBy></Foo>' }
    ]),
    // Valid view fields lists, wrapped with <View><ViewFields>
    viewFields: wrap(viewViewFields, [
        {
            description: 'one field',
            xml: '<FieldRef Name="aaa"/>',
            fieldNames: ['aaa']
        }, {
            description: 'one field with separate closing tag',
            xml: '<FieldRef Name="aaa"></FieldRef>',
            fieldNames: ['aaa']
        }, {
            description: 'two fields',
            xml: '<FieldRef Name="aaa"/><FieldRef Name="bbb"/>',
            fieldNames: ['aaa', 'bbb']
        }, {
            description: 'three fields',
            xml: '<FieldRef Name="aaa"/><FieldRef Name="bbb"/><FieldRef Name="ccc"/>',
            fieldNames: ['aaa', 'bbb', 'ccc']
        }, {
            description: 'three fields, one with explicit attribute',
            xml: '<FieldRef Name="bbb"/><FieldRef Name="aaa" Explicit="TRUE"/><FieldRef Name="ccc"/>',
            fieldNames: ['bbb', 'aaa', 'ccc']
        },
        // More questionable
        {
            description: 'has field with no name (ignored)',
            xml: '<FieldRef/><FieldRef Name="aaa"/>',
            fieldNames: ['aaa']
        }, {
            description: 'has field with no name and extra attribute (ignored)',
            xml: '<FieldRef Name="aaa"/><FieldRef Foo="Bar"/>',
            fieldNames: ['aaa']
        }, {
            description: 'has field with mis-capitalized tag name (ignored)',
            xml: '<fieldref Name="aaa"/>',
            fieldNames: []
        }, { // this is potentially valid for views used by DataViewWebparts
            description: 'non-FieldRef in ViewFields (ignored)',
            xml: '<oops/><FieldRef Name="aaa"/>',
            fieldNames: ['aaa']
        },
        // Would formerly have caused exceptions
        {
            description: 'repeated ViewFields (use first one)',
            xml: '<FieldRef Name="aaa"/></ViewFields><ViewFields><FieldRef Name="bbb"/>',
            fieldNames: ['aaa']
        }, {
            description: 'text inside ViewFields',
            xml: 'foo <FieldRef Name="aaa"/> bar',
            fieldNames: ['aaa']
        }
    ]),
    // Valid sorts, wrapped with <View><Query>
    orderBy: wrap(viewQuery, [
        {
            description: 'empty OrderBy',
            xml: '<OrderBy></OrderBy>',
            sorts: undefined
        }, {
            description: 'one field, default ascending',
            xml: '<OrderBy><FieldRef Name="aaa"/></OrderBy>',
            sorts: [ { fieldName: 'aaa', isAscending: true }]
        }, {
            description: 'one field with separate close tag',
            xml: '<OrderBy><FieldRef Name="aaa"></FieldRef></OrderBy>',
            sorts: [ { fieldName: 'aaa', isAscending: true }]
        }, {
            description: 'three fields with default ascending',
            xml: '<OrderBy><FieldRef Name="aaa"/><FieldRef Name="bbb"/><FieldRef Name="ccc"/></OrderBy>',
            sorts: [
                { fieldName: 'aaa', isAscending: true },
                { fieldName: 'bbb', isAscending: true },
                { fieldName: 'ccc', isAscending: true }
            ]
        }, {
            description: 'two fields with non-default ascending',
            xml: '<OrderBy><FieldRef Name="aaa" Ascending="TrUe"/><FieldRef Name="bbb" Ascending="fAlSe"/></OrderBy>',
            sorts: [
                { fieldName: 'aaa', isAscending: true },
                { fieldName: 'bbb', isAscending: false }
            ]
        }, {
            description: 'OrderBy and FieldRef with attributes',
            xml: '<OrderBy UseIndexForOrderBy="TRUE"><FieldRef Name="aaa" Ascending="FALSE" LookupId="TRUE"/></OrderBy>',
            sorts: [ { fieldName: 'aaa', isAscending: false } ]
        },
        // more questionable
        {
            description: 'FieldRef has extra attribute',
            xml: '<OrderBy><FieldRef Name="aaa" Foo="Bar"/></OrderBy>',
            sorts: [ { fieldName: 'aaa', isAscending: true } ]
        }, {
            description: 'FieldRef has no Name',
            xml: '<OrderBy><FieldRef Foo="Bar"/></OrderBy>',
            sorts: undefined
        },
        // would formerly have caused exceptions
        {
            description: 'non-FieldRef inside OrderBy (ignored)',
            xml: '<OrderBy><FieldRef Name="aaa"/><oops/></OrderBy>',
            sorts: [ { fieldName: 'aaa', isAscending: true } ]
        }, {
            description: 'text inside OrderBy (ignored)',
            xml: '<OrderBy>foo <FieldRef Name="aaa"/> bar</OrderBy>',
            sorts: [ { fieldName: 'aaa', isAscending: true } ]
        }, {
            description: 'mis-capitalized FieldRef (ignored)',
            xml: '<OrderBy><fieldref Name="aaa"/><FieldRef Name="bbb"/></OrderBy>',
            sorts: [ { fieldName: 'bbb', isAscending: true } ]
        }, {
            description: 'mis-capitalized Name and Ascending (ignored)',
            xml: '<OrderBy><FieldRef name="aaa"/><FieldRef Name="bbb" ascending="FALSE"/></OrderBy>',
            sorts: [ { fieldName: 'bbb', isAscending: true } ]
        }
    ]),
    // Valid groupings, wrapped with <View><Query>
    groupBy: wrap(viewQuery, [
        {
            description: 'empty',
            xml: '<GroupBy/>',
            groupBy: undefined
        }, {
            description: 'empty with Collapse',
            xml: '<GroupBy Collapse="TrUE"/>',
            groupBy: undefined
        }, {
            description: 'one field, no Collapse or Ascending',
            xml: '<GroupBy><FieldRef Name="aaa"></FieldRef></GroupBy>',
            groupBy: {
                group1: { fieldName: 'aaa', isAscending: true },
                isCollapsed: true
            }
        }, {
            description: 'one field with Collapse, no Ascending',
            xml: '<GroupBy Collapse="FaLsE"><FieldRef Name="bbb"/></GroupBy>',
            groupBy: {
                group1: { fieldName: 'bbb', isAscending: true },
                isCollapsed: false
            }
        }, {
            description: 'one field with Collapse and Ascending',
            xml: '<GroupBy Collapse="truE"><FieldRef Name="bbb" Ascending="fAlSe"/></GroupBy>',
            groupBy: {
                group1: { fieldName: 'bbb', isAscending: false },
                isCollapsed: true
            }
        }, {
            description: 'two fields',
            xml: '<GroupBy><FieldRef Name="aaa"/><FieldRef Name="bbb" Ascending="fAlSe"/></GroupBy>',
            groupBy: {
                group1: { fieldName: 'aaa', isAscending: true },
                group2: { fieldName: 'bbb', isAscending: false },
                isCollapsed: true
            }
        }, {
            description: 'extra GroupLimit attribute and LookupId',
            xml: '<GroupBy GroupLimit="30"><FieldRef Name="aaa" LookupId="TRUE"/></GroupBy>',
            groupBy: {
                group1: { fieldName: 'aaa', isAscending: true },
                isCollapsed: true
            }
        },
        // more questionable
        {
            description: 'first FieldRef has no Name; GroupBy has extra attribute',
            xml: '<GroupBy Foo="Bar"><FieldRef/><FieldRef Name="bbb"/></GroupBy>',
            groupBy: {
                group1: { fieldName: 'bbb', isAscending: true },
                isCollapsed: true
            }
        }, {
            description: 'collapse is lowercase (ignored)',
            xml: '<GroupBy collapse="FALSE"><FieldRef Name="aaa"/></GroupBy>',
            groupBy: {
                group1: { fieldName: 'aaa', isAscending: true },
                isCollapsed: true
            }
        }, {
            description: 'FieldRef has extra attribute',
            xml: '<GroupBy><FieldRef Name="aaa" Foo="Bar"/></GroupBy>',
            groupBy: {
                group1: { fieldName: 'aaa', isAscending: true },
                isCollapsed: true
            }
        },
        // would formerly have caused exceptions
        {
            description: 'case-sensitive tag names',
            xml: '<groupby><FieldRef Name="aaa"/></groupby>',
            groupBy: undefined
        }, {
            description: 'case-sensitive attribute names (ignored)',
            xml: '<GroupBy collapse="FALSE"><FieldRef Name="aaa"/></GroupBy>',
            groupBy: {
                group1: { fieldName: 'aaa', isAscending: true },
                isCollapsed: true
            }
        }, {
            description: 'non-FieldRef inside GroupBy (ignored)',
            xml: '<GroupBy><FieldRef Name="aaa"/><oops/></GroupBy>',
            groupBy: {
                group1: { fieldName: 'aaa', isAscending: true },
                isCollapsed: true
            }
        }, {
            description: 'text inside GroupBy (ignored)',
            xml: '<GroupBy><FieldRef Name="aaa"/>hi</GroupBy>',
            groupBy: {
                group1: { fieldName: 'aaa', isAscending: true },
                isCollapsed: true
            }
        }, {
            description: 'max 2 groups allowed (later groups ignored)',
            xml: '<GroupBy><FieldRef Name="aaa"/><FieldRef Name="bbb"/><FieldRef Name="ccc"/></GroupBy>',
            groupBy: {
                group1: { fieldName: 'aaa', isAscending: true },
                group2: { fieldName: 'bbb', isAscending: true },
                isCollapsed: true
            }
        }
    ]),
    // Valid row limits, wrapped with <View>
    rowLimit: wrap(view, [
        {
            description: 'normal without paged',
            xml: '<RowLimit>30</RowLimit>',
            rowLimit: { rowLimit: 30, isPerPage: false }
        }, {
            description: 'normal with paged true',
            xml: '<RowLimit Paged="TRUE">40</RowLimit>',
            rowLimit: { rowLimit: 40, isPerPage: true }
        }, {
            description: 'normal with paged false',
            xml: '<RowLimit Paged="FALSE">45</RowLimit>',
            rowLimit: { rowLimit: 45, isPerPage: false }
        }, { // more questionable
            description: 'incorrect paged casing',
            xml: '<RowLimit paged="TRUE">50</RowLimit>',
            rowLimit: { rowLimit: 50, isPerPage: false }
        }, { // would formerly have thrown
            description: 'lowercase rowlimit (ignored)',
            xml: '<rowlimit Paged="TRUE">30</rowlimit>',
            rowLimit: undefined
        }, {
            description: 'RowLimit without number inside (ignored)',
            xml: '<RowLimit Paged="TRUE"></RowLimit>',
            rowLimit: undefined
        }
    ]),
    // Unsupported or invalid filters, wrapped with <View><Where>
    // (none of these should be tested with serialization for obvious reasons)
    where: wrap(viewWhere, [
        {
            description: 'empty',
            xml: '',
            filters: undefined
        }, {
            description: 'DateRangesOverlap (unsupported)',
            xml: '<DateRangesOverlap><FieldRef Name="EventDate"/><FieldRef Name="EndDate"/><FieldRef Name="RecurrenceID"/>' +
                '<Value Type="DateTime"><Now/></Value></DateRangesOverlap>',
            filters: undefined
        }, {
            description: 'nonexistent tag',
            xml: '<Foo><FieldRef Name="aaa"/><Value>foo</Value></Foo>',
            filters: undefined
        }
    ]),
    // Valid equals filter contents, wrapped with <View><Query><Where>
    eq: wrap(viewWhere, [
        {
            description: 'normal with value type',
            xml: eq('<FieldRef Name="aaa"/><Value>foo</Value>'),
            filters: [ { fieldName: 'aaa', operator: 'Eq', values: ['foo'] } ]
        }, {
            description: 'normal with value type',
            xml: eq('<FieldRef Name="aaa"/><Value Type="Text">foo</Value>'),
            filters: [ { fieldName: 'aaa', type: 'Text', operator: 'Eq', values: ['foo'] } ]
        }, {
            description: 'fieldref/value order does not matter',
            xml: eq('<Value>foo</Value><FieldRef Name="aaa"/>'),
            filters: [ { fieldName: 'aaa', operator: 'Eq', values: ['foo'] } ],
            skipSerializationTest: true // serialization always puts the fieldref first
        }, {
            description: 'datetime',
            xml: eq('<FieldRef Name="aaa"/><Value Type="DateTime">2016-01-08</Value>'),
            filters: [ { fieldName: 'aaa', type: 'DateTime', operator: 'Eq', values: ['2016-01-08'] } ]
        }, {
            description: 'lookupid',
            xml: eq('<FieldRef Name="aaa" LookupId="TRUE"/><Value Type="User">10</Value>'),
            filters: [ { fieldName: 'aaa', type: 'User', lookupId: true, operator: 'Eq', values: ['10'] } ]
        },
        // these tests cover escape codes and such since Eq is the first filter type tested
        {
            description: 'escape codes',
            xml: eq('<FieldRef Name="aaa"/><Value>&lt;/Value&gt;</Value>'),
            filters: [ { fieldName: 'aaa', operator: 'Eq', values: ['</Value>'] } ]
        }, {
            description: 'weird quoted value',
            xml: eq('<FieldRef Name="aaa"/><Value>\'foo"</Value>'),
            filters: [ { fieldName: 'aaa', operator: 'Eq', values: ['\'foo"'] } ],
            skipSerializationTest: true
        }, {
            description: 'Today value for DateTime',
            xml: eq('<FieldRef Name="aaa"/><Value Type="DateTime"><Today/></Value>'),
            filters: [ { fieldName: 'aaa', type: 'DateTime', operator: 'Eq', values: ['[Today]'] } ]
        }, {
            description: 'Today with OffsetDays',
            xml: eq('<FieldRef Name="aaa"/><Value Type="DateTime"><Today OffsetDays="4"/></Value>'),
            filters: [ { fieldName: 'aaa', type: 'DateTime', operator: 'Eq', values: ['[Today]+4'] } ]
        }, {
            description: 'Today with Offset',
            xml: eq('<FieldRef Name="aaa"/><Value Type="DateTime"><Today Offset="-3"/></Value>'),
            filters: [ { fieldName: 'aaa', type: 'DateTime', operator: 'Eq', values: ['[Today]-3'] } ],
            skipSerializationTest: true // serialization uses OffsetDays
        },
        // more questionable
        {
            description: 'extra attributes on value',
            xml: eq('<FieldRef Name="aaa"/>' + `<Value Type="DateTime" IncludeTimeValue="TRUE">${timeStr}</Value>`),
            filters: [ { fieldName: 'aaa', type: 'DateTime', operator: 'Eq', values: [timeStr] } ],
            skipSerializationTest: true
        }, {
            description: '<UserID/> value for User',
            xml: eq('<FieldRef Name="aaa"/><Value Type="User"><UserID/></Value>'),
            filters: undefined
        },
        // would formerly have thrown
        {
            description: 'empty Eq',
            xml: eq(''),
            filters: undefined
        }, {
            description: 'Eq with two FieldRefs inside',
            xml: eq('<FieldRef Name="aaa"/><FieldRef Name="bbb"/><Value>foo</Value>'),
            filters: [ { fieldName: 'aaa', operator: 'Eq', values: ['foo'] } ],
            skipSerializationTest: true
        }, {
            description: 'Eq with FieldRef without Name',
            xml: eq('<FieldRef/><Value>foo</Value>'),
            filters: undefined
        }, {
            description: 'Eq without Value',
            xml: eq('<FieldRef Name="aaa"/>'),
            filters: undefined
        }, {
            description: 'Eq with random tag inside',
            xml: eq('<FieldRef Name="aaa"/><Value>foo</Value><oops/>'),
            filters: [ { fieldName: 'aaa', operator: 'Eq', values: ['foo'] } ],
            skipSerializationTest: true
        }, {
            description: 'Eq with text',
            xml: eq('<FieldRef Name="aaa"/>hi<Value>foo</Value>'),
            filters: [ { fieldName: 'aaa', operator: 'Eq', values: ['foo'] } ],
            skipSerializationTest: true
        }
    ]),
    // Tests for other binary operators
    otherBinary: [
        // Will be filled in programmatically at bottom of file.
        // (If any special cases are needed for particular operators later, they can be added here.)
    ],
    // Valid is null filter contents, wrapped with <View><Query><Where>
    isNull: wrap(viewWhere, [
        {
            description: 'normal',
            xml: isNull('<FieldRef Name="aaa"/>'),
            filters: [ { fieldName: 'aaa', operator: 'IsNull', values: [''] } ]
        }, {
            description: 'extra attr',
            xml: isNull('<FieldRef Name="aaa" foo="bar"/>'),
            filters: [ { fieldName: 'aaa', operator: 'IsNull', values: [''] } ],
            skipSerializationTest: true
        },
        // would previously have thrown
        {
            description: 'has a Value inside',
            xml: isNull('<FieldRef Name="aaa"/><Value>foo</Value>'),
            filters: [ { fieldName: 'aaa', operator: 'IsNull', values: [''] } ],
            skipSerializationTest: true
        }, {
            description: 'more than one FieldRef',
            xml: isNull('<FieldRef Name="aaa"/><FieldRef Name="bbb"/>'),
            filters: [ { fieldName: 'aaa', operator: 'IsNull', values: [''] } ],
            skipSerializationTest: true
        }, {
            description: 'has text inside',
            xml: isNull('foo <FieldRef Name="aaa"/> bar'),
            filters: [ { fieldName: 'aaa', operator: 'IsNull', values: [''] } ],
            skipSerializationTest: true
        }
    ]),
    isNotNull: wrap(viewWhere, [
        {
            description: 'normal',
            xml: isNotNull('<FieldRef Name="aaa"/>'),
            filters: [ { fieldName: 'aaa', operator: 'IsNotNull', values: undefined } ]
        }, {
            description: 'extra attr',
            xml: isNotNull('<FieldRef Name="aaa" foo="bar"/>'),
            filters: [ { fieldName: 'aaa', operator: 'IsNotNull', values: undefined } ],
            skipSerializationTest: true
        },
        // would previously have thrown
        {
            description: 'has a Value inside',
            xml: isNotNull('<FieldRef Name="aaa"/><Value>foo</Value>'),
            filters: [ { fieldName: 'aaa', operator: 'IsNotNull', values: undefined } ],
            skipSerializationTest: true
        }, {
            description: 'more than one FieldRef',
            xml: isNotNull('<FieldRef Name="aaa"/><FieldRef Name="bbb"/>'),
            filters: [ { fieldName: 'aaa', operator: 'IsNotNull', values: undefined } ],
            skipSerializationTest: true
        }, {
            description: 'has text inside',
            xml: isNotNull('foo <FieldRef Name="aaa"/> bar'),
            filters: [ { fieldName: 'aaa', operator: 'IsNotNull', values: undefined } ],
            skipSerializationTest: true
        }
    ]),
    membership: wrap(viewWhere, [
        {
            description: 'normal',
            xml: membership('SPWeb.AllUsers', '<FieldRef Name="aaa"/>'),
            filters: [ { fieldName: 'aaa', operator: 'Membership', values: ['SPWeb.AllUsers'] } ]
        }, {
            description: 'extra attr',
            // "foo" is not a valid membership type, but we're not checking that right now
            xml: membership('foo', '<FieldRef Name="aaa"/>'),
            filters: [ { fieldName: 'aaa', operator: 'Membership', values: ['foo'] } ],
            skipSerializationTest: true
        },
        // would previously have thrown
        {
            description: 'missing Type attribute',
            xml: '<Membership><FieldRef Name="aaa"/></Membership>',
            filters: undefined
        }, {
            description: 'has a Value inside',
            xml: membership('SPWeb.AllUsers', '<Value>foo</Value><FieldRef Name="aaa"/>'),
            filters: [ { fieldName: 'aaa', operator: 'Membership', values: ['SPWeb.AllUsers'] } ],
            skipSerializationTest: true
        }, {
            description: 'more than one FieldRef',
            xml: membership('SPWeb.AllUsers', '<FieldRef Name="aaa"/><FieldRef Name="bbb"/>'),
            filters: [ { fieldName: 'aaa', operator: 'Membership', values: ['SPWeb.AllUsers'] } ],
            skipSerializationTest: true
        }, {
            description: 'has text inside',
            xml: membership('SPWeb.AllUsers', 'foo <FieldRef Name="aaa"/> bar'),
            filters: [ { fieldName: 'aaa', operator: 'Membership', values: ['SPWeb.AllUsers'] } ],
            skipSerializationTest: true
        }
    ]),
    // Valid In filter contents, wrapped with <View><Query><Where>
    'in': wrap(viewWhere, [
        {
            description: 'one value',
            xml: inTag('<FieldRef Name="aaa"/>', '<Value>foo</Value>'),
            filters: [ { fieldName: 'aaa', operator: 'In', values: ['foo']} ],
            expectSerializedOperator: 'Eq'
        }, {
            description: 'fieldref/values order does not matter',
            xml: '<In><Values><Value>foo</Value></Values><FieldRef Name="aaa"/></In>',
            filters: [ { fieldName: 'aaa', operator: 'In', values: ['foo']} ],
            // serialization test is order-sensitive
            skipSerializationTest: true
        }, {
            description: 'multiple values',
            xml: inTag('<FieldRef Name="aaa"/>',
                '<Value>foo</Value><Value>bar</Value><Value>baz</Value>'),
            filters: [ { fieldName: 'aaa', operator: 'In', values: ['foo', 'bar', 'baz'] } ]
        }, {
            description: 'one value with type',
            xml: inTag('<FieldRef Name="aaa"/>', '<Value Type="Text">foo</Value><Value>bar</Value><Value Type="Text">baz</Value>'),
            filters: [ { fieldName: 'aaa', type: 'Text', operator: 'In', values: ['foo', 'bar', 'baz'] } ],
            // serialization will put a type on all values
            // (could eventually be an issue if we need to round trip user-generated filters)
            skipSerializationTest: true
        }, {
            description: 'encoding issue value',
            xml: inTag('<FieldRef Name="aaa"/>',
                '<Value>&lt;/Value&gt;</Value><Value>foo</Value>'),
            filters: [ { fieldName: 'aaa', operator: 'In', values: ['</Value>', 'foo'] } ]
        }, {
            description: 'lookupid',
            xml: inTag('<FieldRef Name="aaa" LookupId="TRUE"/>',
                '<Value Type="User">10</Value><Value Type="User">11</Value>'),
            filters: [ { fieldName: 'aaa', type: 'User', lookupId: true, operator: 'In', values: ['10', '11'] } ]
        },
        // more questionable
        {
            description: 'three values, one without type',
            xml: inTag('<FieldRef Name="aaa"/>',
                '<Value>foo</Value><Value>bar</Value><Value>baz</Value>'),
            filters: [ { fieldName: 'aaa', operator: 'In', values: ['foo', 'bar', 'baz'] } ],
            // serialization will put a type on all values
            skipSerializationTest: true
        }, {
            description: 'one empty value', // Empty <Value></Value> is ignored by server
            xml: inTag('<FieldRef Name="aaa"/>',
                '<Value>foo</Value><Value></Value>'),
            filters: [ { fieldName: 'aaa', operator: 'In', values: ['foo'] } ],
            expectSerializedOperator: 'Eq'
        }, {
            description: 'extra attributes on fieldref',
            xml: inTag('<FieldRef Name="aaa" Foo="Bar"/>',
                '<Value>foo</Value>'),
            filters: [ { fieldName: 'aaa', operator: 'In', values: ['foo'] } ],
            skipSerializationTest: true
        }, {
            description: 'extra attributes on value',
            xml: inTag('<FieldRef Name="aaa"/>',
                `<Value Type="DateTime" IncludeTimeValue="TRUE">${timeStr}</Value>`),
            filters: [ { fieldName: 'aaa', type: 'DateTime', operator: 'In', values: [timeStr] } ],
            // the attribute will be missing, and since this uses datetimes it will be serialized as Or/Eq
            skipSerializationTest: true
        }, {
            description: 'one value with child node but no text',
            xml: inTag('<FieldRef Name="aaa"/>',
                '<Value Type="User"><UserID/></Value><Value Type="User">foo</Value>'),
            filters: [ { fieldName: 'aaa', type: 'User', operator: 'In', values: ['foo'] } ],
            skipSerializationTest: true
        }, {
            description: 'datetime (serialized as Or/Eq)',
            xml: inTag('<FieldRef Name="aaa"/>',
                '<Value Type="DateTime">2016-09-23</Value><Value Type="DateTime">2016-09-24</Value>'),
            filters: [ { fieldName: 'aaa', type: 'DateTime', operator: 'In', values: ['2016-09-23', '2016-09-24'] } ],
            expectSerializedOperator: 'Or'
        }, {
            description: 'lookup that appears to be datetime (serialized as Or/Eq)',
            xml: inTag('<FieldRef Name="aaa"/>',
                '<Value Type="Lookup">2016-09-23</Value><Value Type="Lookup">2016-09-24</Value>'),
            filters: [ { fieldName: 'aaa', type: 'Lookup', operator: 'In', values: ['2016-09-23', '2016-09-24'] } ],
            expectSerializedOperator: 'Or'
        },
        // would formerly have caused exceptions
        {
            description: 'empty In tag',
            xml: '<In></In>',
            filters: undefined
        }, {
            description: 'lowercase Values tag',
            xml: '<In><FieldRef Name="aaa"/><values><Value>foo</Value></values></In>',
            filters: undefined
        }, {
            description: 'non-Value inside Values',
            xml: inTag('<FieldRef Name="aaa"/>', '<Value>foo</Value><oops/>'),
            filters: [ { fieldName: 'aaa', operator: 'In', values: ['foo'] } ],
            skipSerializationTest: true
        }, {
            description: 'extra FieldRef',
            xml: inTag('<FieldRef Name="aaa"/><FieldRef Name="bbb"/>', '<Value>foo</Value>'),
            filters: [ { fieldName: 'aaa', operator: 'In', values: ['foo'] } ],
            skipSerializationTest: true
        }, {
            description: 'random extra tag inside In',
            xml: inTag('<FieldRef Name="aaa"/>', '<Value>foo</Value>') + '<oops/>',
            filters: [ { fieldName: 'aaa', operator: 'In', values: ['foo'] } ],
            skipSerializationTest: true
        }, {
            description: 'text inside In',
            xml: inTag('<FieldRef Name="aaa"/>hi', '<Value>foo</Value>'),
            filters: [ { fieldName: 'aaa', operator: 'In', values: ['foo'] } ],
            skipSerializationTest: true
        }, {
            description: 'text inside Values',
            xml: inTag('<FieldRef Name="aaa"/>', 'hi<Value>foo</Value>'),
            filters: [ { fieldName: 'aaa', operator: 'In', values: ['foo'] } ],
            skipSerializationTest: true
        }
    ]),
    // Valid Or filter contents, wrapped with <View><Query><Where>
    or: wrap(viewWhere, [
        {
            description: 'basic without type',
            xml: or(
                    eq('<FieldRef Name="aaa"/><Value>foo</Value>'),
                    eq('<FieldRef Name="aaa"/><Value>bar</Value>')),
            filters: [ { fieldName: 'aaa', operator: 'Eq', values: ['foo', 'bar'] } ]
        }, {
            description: 'basic with type',
            xml: or(
                    eq('<FieldRef Name="aaa"/><Value Type="Text">foo</Value>'),
                    eq('<FieldRef Name="aaa"/><Value Type="Text">bar</Value>')),
            filters: [ { fieldName: 'aaa', type: 'Text', operator: 'Eq', values: ['foo', 'bar']}]
        }, {
            description: 'nested with or then eq',
            xml: or(
                    or(
                        eq('<FieldRef Name="aaa"/><Value>foo</Value>'),
                        eq('<FieldRef Name="aaa"/><Value>bar</Value>')),
                    eq('<FieldRef Name="aaa"/><Value>baz</Value>')),
            filters: [ { fieldName: 'aaa', operator: 'Eq', values: ['foo', 'bar', 'baz'] } ]
        }, {
            description: 'nested with eq then or',
            xml: or(
                    eq('<FieldRef Name="aaa"/><Value>foo</Value>'),
                    or(
                        eq('<FieldRef Name="aaa"/><Value>bar</Value>'),
                        eq('<FieldRef Name="aaa"/><Value>baz</Value>'))),
            filters: [ { fieldName: 'aaa', operator: 'Eq', values: ['foo', 'bar', 'baz'] } ],
            skipSerializationTest: true
        }, {
            description: 'deeper nesting (and empty string)',
            xml: or(
                    or(
                        or(
                            or(
                                eq('<FieldRef Name="aaa"/><Value>foo</Value>'),
                                eq('<FieldRef Name="aaa"/><Value>bar</Value>')),
                            eq('<FieldRef Name="aaa"/><Value>baz</Value>')),
                        eq('<FieldRef Name="aaa"/><Value>qux</Value>')),
                    isNull('<FieldRef Name="aaa"/>')),
            filters: [ { fieldName: 'aaa', operator: 'Eq', values: ['foo', 'bar', 'baz', 'qux', ''] } ]
        }, {
            description: 'different nesting',
            xml: or(
                    or(
                        eq('<FieldRef Name="aaa"/><Value>foo</Value>'),
                        eq('<FieldRef Name="aaa"/><Value>bar</Value>')),
                    or(
                        eq('<FieldRef Name="aaa"/><Value>baz</Value>'),
                        eq('<FieldRef Name="aaa"/><Value>qux</Value>'))),
            filters: [ { fieldName: 'aaa', operator: 'Eq', values: ['foo', 'bar', 'baz', 'qux'] } ],
            skipSerializationTest: true
        }, {
            description: 'multi with type on all',
            xml: or(
                    or(
                        or(
                            eq('<FieldRef Name="aaa"/><Value Type="Text">foo</Value>'),
                            eq('<FieldRef Name="aaa"/><Value Type="Text">bar</Value>')),
                        eq('<FieldRef Name="aaa"/><Value Type="Text">baz</Value>')),
                    eq('<FieldRef Name="aaa"/><Value Type="Text">qux</Value>')),
            filters: [ { fieldName: 'aaa', type: 'Text', operator: 'Eq', values: ['foo', 'bar', 'baz', 'qux'] } ]
        }, {
            description: 'multi with type on all except empty string',
            xml: or(
                    or(
                        or(
                            eq('<FieldRef Name="aaa"/><Value Type="Text">foo</Value>'),
                            isNull('<FieldRef Name="aaa"/>')),
                        eq('<FieldRef Name="aaa"/><Value Type="Text">baz</Value>')),
                    eq('<FieldRef Name="aaa"/><Value Type="Text">qux</Value>')),
            filters: [ { fieldName: 'aaa', type: 'Text', operator: 'Eq', values: ['foo', '', 'baz', 'qux'] } ]
        }, {
            description: 'multi with type on one',
            xml: or(
                    or(
                        or(
                            eq('<FieldRef Name="aaa"/><Value>foo</Value>'),
                            isNull('<FieldRef Name="aaa"/>')),
                        eq('<FieldRef Name="aaa"/><Value Type="Text">baz</Value>')),
                    eq('<FieldRef Name="aaa"/><Value>qux</Value>')),
            filters: [ { fieldName: 'aaa', type: 'Text',  operator: 'Eq', values: ['foo', '', 'baz', 'qux'] } ],
            skipSerializationTest: true // type will be used on all
        }, {
            description: 'datetime',
            xml: or(
                    or(
                        eq('<FieldRef Name="aaa"/><Value Type="DateTime">2016-01-08</Value>'),
                        eq('<FieldRef Name="aaa"/><Value Type="DateTime">2016-01-15</Value>')),
                    eq('<FieldRef Name="aaa"/><Value Type="DateTime">2016-01-16</Value>')),
            filters: [ { fieldName: 'aaa', type: 'DateTime', operator: 'Eq', values: ['2016-01-08', '2016-01-15', '2016-01-16'] } ]
        }, {
            description: 'Today value',
            xml: or(
                    eq('<FieldRef Name="aaa"/><Value Type="DateTime"><Today/></Value>'),
                    eq('<FieldRef Name="aaa"/><Value Type="DateTime"><Today OffsetDays="-3"/></Value>')),
            filters: [ { fieldName: 'aaa', type: 'DateTime', operator: 'Eq', values: ['[Today]', '[Today]-3'] } ]
        }, {
            description: 'lookupid',
            xml: or(
                    eq('<FieldRef Name="aaa" LookupId="TRUE"/><Value Type="Lookup">10</Value>'),
                    eq('<FieldRef Name="aaa" LookupId="TRUE"/><Value Type="Lookup">11</Value>')),
            filters: [ { fieldName: 'aaa', type: 'Lookup', lookupId: true, operator: 'Eq', values: ['10', '11'] } ]
        },
        // more questionable
        {
            description: 'extra attributes on fieldref or value',
            xml: or (
                    eq('<FieldRef Name="aaa" Foo="Bar"/><Value>bar</Value>'),
                    eq('<FieldRef Name="aaa"/><Value Foo="Bar">foo</Value>')),
            filters: [ { fieldName: 'aaa', operator: 'Eq', values: ['bar', 'foo'] } ],
            skipSerializationTest: true
        }, {
            description: 'values with multiple types',
            xml: or(
                    eq('<FieldRef Name="aaa"/><Value Type="User">foo</Value>'),
                    eq('<FieldRef Name="aaa"/><Value Type="Text">bar</Value>')),
            filters: [ { fieldName: 'aaa', operator: 'Eq', values: ['foo', 'bar'] } ],
            skipSerializationTest: true
        }, {
            description: 'multiple fields',
            xml: or(
                    eq('<FieldRef Name="aaa"/><Value>foo</Value>'),
                    eq('<FieldRef Name="bbb"/><Value>bar</Value>')),
            filters: undefined
        }, {
            description: 'lookupid on some but not all',
            xml: or(
                    eq('<FieldRef Name="aaa" LookupId="TRUE"/><Value Type="Lookup">10</Value>'),
                    eq('<FieldRef Name="aaa"/><Value Type="Lookup">11</Value>')),
            filters: undefined,
            skipSerializationTest: true
        }, {
            description: 'unsupported stuff inside the or',
            xml: or(
                    eq('<FieldRef Name="aaa"/><Value>foo</Value>'),
                    // this is valid but unsupported
                    '<Neq><FieldRef Name="aaa"/><Value>bar</Value></Neq>'),
            filters: undefined
        }, {
            description: 'or contains And',
            xml: or(
                    and(eq('<FieldRef Name="aaa"/><Value>foo</Value>'),
                        eq('<FieldRef Name="aaa"/><Value>bar</Value>')),
                    eq('<FieldRef Name="aaa"/><Value>baz</Value>')),
            filters: undefined
        },
        // would formerly have thrown
        {
            description: 'empty Or',
            xml: '<Or></Or>',
            filters: undefined
        }, {
            description: 'Or with text content',
            xml: '<Or>hi</Or>',
            filters: undefined
        }, {
            description: 'Or with one child',
            // likely to throw on the server, but we accept it here
            xml: or(eq('<FieldRef Name="aaa"/><Value>foo</Value>'), ''),
            filters: [ { fieldName: 'aaa', operator: 'Eq', values: ['foo'] } ],
            skipSerializationTest: true
        }, {
            description: 'Or with one child and text',
            xml: or(eq('<FieldRef Name="aaa"/><Value>foo</Value>'), 'hi'),
            filters: [ { fieldName: 'aaa', operator: 'Eq', values: ['foo'] } ],
            skipSerializationTest: true
        }, {
            description: 'Or with three children (third child ignored)',
            xml: or(
                    eq('<FieldRef Name="aaa"/><Value>foo</Value>'),
                    eq('<FieldRef Name="aaa"/><Value>bar</Value>') +
                    eq('<FieldRef Name="aaa"/><Value>baz</Value>')),
            filters: [ { fieldName: 'aaa', operator: 'Eq', values: ['foo', 'bar'] } ],
            skipSerializationTest: true
        }
    ]),
    // Valid And filter contents, wrapped with <View><Query><Where>.
    // Everything that can go inside an And has already been tested, so just test a few
    // different combinations and nesting.
    and: wrap(viewWhere, [
        {
            description: 'basic',
            xml: and(
                    eq('<FieldRef Name="aaa"/><Value>foo</Value>'),
                    inTag('<FieldRef Name="bbb"/>',
                        '<Value>foo</Value><Value>bar</Value><Value>baz</Value>')),
            filters: [
                { fieldName: 'aaa', operator: 'Eq', values: ['foo'] },
                { fieldName: 'bbb', operator: 'In', values: ['foo', 'bar', 'baz'] }
            ]
        }, {
            description: 'nested, including Or and In',
            xml: and(
                    and(
                        eq('<FieldRef Name="aaa"/><Value>foo</Value>'),
                        or(
                            eq('<FieldRef Name="bbb"/><Value Type="DateTime">2016-01-08</Value>'),
                            eq('<FieldRef Name="bbb"/><Value Type="DateTime">2016-01-15</Value>'))),
                    inTag('<FieldRef Name="ccc"/>',
                        '<Value>bar</Value><Value>baz</Value>')),
            filters: [
                { fieldName: 'aaa', operator: 'Eq', values: ['foo'] },
                { fieldName: 'bbb', type: 'DateTime', operator: 'Eq', values: ['2016-01-08', '2016-01-15'] },
                { fieldName: 'ccc', operator: 'In', values: ['bar', 'baz'] }
            ]
        }, {
            description: 'nested other way, including IsNull',
            xml: and(
                    eq('<FieldRef Name="aaa"/><Value>foo</Value>'),
                    and(
                        isNull('<FieldRef Name="bbb"/>'),
                        eq('<FieldRef Name="ccc"/><Value>baz</Value>'))),
            filters: [
                { fieldName: 'aaa', operator: 'Eq', values: ['foo'] },
                { fieldName: 'bbb', operator: 'IsNull', values: [''] },
                { fieldName: 'ccc', operator: 'Eq', values: ['baz'] }
            ],
            expectSerializedOperator: 'And'
        }, {
            description: 'four filters, nested additional way',
            xml: and(
                    and(
                        eq('<FieldRef Name="aaa"/><Value>foo</Value>'),
                        eq('<FieldRef Name="bbb"/><Value>foo</Value>')),
                    and(
                        eq('<FieldRef Name="ccc"/><Value>baz</Value>'),
                        eq('<FieldRef Name="ddd"/><Value>qux</Value>'))),
            filters: [
                { fieldName: 'aaa', operator: 'Eq', values: ['foo'] },
                { fieldName: 'bbb', operator: 'Eq', values: ['foo'] },
                { fieldName: 'ccc', operator: 'Eq', values: ['baz'] },
                { fieldName: 'ddd', operator: 'Eq', values: ['qux'] }
            ],
            expectSerializedOperator: 'And'
        }, {
            description: 'two filters for same field', // illogical but legal
            xml: and(
                    eq('<FieldRef Name="aaa"/><Value>foo</Value>'),
                    eq('<FieldRef Name="aaa"/><Value>bar</Value>')),
            filters: [
                { fieldName: 'aaa', operator: 'Eq', values: ['foo'] },
                { fieldName: 'aaa', operator: 'Eq', values: ['bar'] }
            ]
        }, {
            description: 'three filters, some with different value types',
            xml: and(
                    and(
                        eq('<FieldRef Name="aaa"/><Value Type="Text">foo</Value>'),
                        eq('<FieldRef Name="aaa"/><Value Type="User">foo</Value>')),
                    eq('<FieldRef Name="ccc"/><Value Type="Text">baz</Value>')),
            filters: [
                { fieldName: 'aaa', type: 'Text', operator: 'Eq', values: ['foo'] },
                { fieldName: 'aaa', type: 'User', operator: 'Eq', values: ['foo'] },
                { fieldName: 'ccc', type: 'Text', operator: 'Eq', values: ['baz'] }
            ]
        }, {
            description: 'two filters, one empty',
            xml: and(
                    eq('<FieldRef Name="aaa"/><Value>foo</Value>'),
                    isNull('<FieldRef Name="bbb"/>')),
            filters: [
                { fieldName: 'aaa', operator: 'Eq', values: ['foo'] },
                { fieldName: 'bbb', operator: 'IsNull', values: [''] }
            ]
        },
        // more questionable
        {
            description: 'one of children is unsupported',
            xml: and(
                    eq('<FieldRef Name="aaa"/><Value Type="User"><UserID/></Value>'), // this is valid but unsupported
                    eq('<FieldRef Name="bbb"/><Value>foo</Value>')),
            filters: [
                { fieldName: 'bbb', operator: 'Eq', values: ['foo'] }
            ],
            skipSerializationTest: true
        }, {
            description: 'unsupported stuff inside the and',
            xml: and(
                    and(
                        eq('<FieldRef Name="aaa"/><Value>foo</Value>'),
                        '<Foo><FieldRef Name="aaa"/><Value>bar</Value></Foo>'),
                    eq('<FieldRef Name="bbb"/><Value>bar</Value>')),
            filters: [
                { fieldName: 'aaa', operator: 'Eq', values: ['foo'] },
                { fieldName: 'bbb', operator: 'Eq', values: ['bar'] }
            ],
            skipSerializationTest: true
        },
        // would formerly have thrown
        {
            description: 'empty And',
            xml: '<And></And>',
            filters: undefined
        }, {
            description: 'And with text content',
            xml: '<And>hi</And>',
            filters: undefined
        }, {
            description: 'And with one child',
            // likely to throw on the server, but we accept it here
            xml: and(eq('<FieldRef Name="aaa"/><Value>foo</Value>'), ''),
            filters: [ { fieldName: 'aaa', operator: 'Eq', values: ['foo'] } ],
            skipSerializationTest: true
        }, {
            description: 'And with one child and text',
            xml: and(eq('<FieldRef Name="aaa"/><Value>foo</Value>'), 'hi'),
            filters: [ { fieldName: 'aaa', operator: 'Eq', values: ['foo'] } ],
            skipSerializationTest: true
        }, {
            description: 'And with three children (third child ignored)',
            xml: and(
                    eq('<FieldRef Name="aaa"/><Value>foo</Value>'),
                    eq('<FieldRef Name="bbb"/><Value>bar</Value>') +
                    eq('<FieldRef Name="ccc"/><Value>baz</Value>')),
            filters: [
                { fieldName: 'aaa', operator: 'Eq', values: ['foo'] },
                { fieldName: 'bbb', operator: 'Eq', values: ['bar'] }
            ],
            skipSerializationTest: true
        }
    ]),
    // Valid whole views. By this point we've tested all the components, so only bother with
    // complicated combinations here.
    allUp: wrap(identity, [
        {
            description: 'test view',
            xml: '<View Name="{5D885323-C267-414C-AC15-F445400DBBE3}" Type="HTML" DisplayName="stuff" Url="/Shared Documents/Forms/stuff.aspx" >' +
                    query(
                        orderBy('<FieldRef Name="aaa"/><FieldRef Name="ccc"/><FieldRef Name="bbb" Ascending="fAlSe"/>') +
                        groupByCollapse(false, '<FieldRef Name="aaa" Ascending="TrUe"/><FieldRef Name="ccc"/>') +
                        where(
                            and(
                                and(
                                    and(
                                        and(
                                            and(
                                                eq('<FieldRef Name="bbb"/><Value Type="Text">foo</Value>'),
                                                or(
                                                    or(
                                                        eq('<FieldRef Name="aaa"/><Value Type="DateTime">2016-01-08</Value>'),
                                                        isNull('<FieldRef Name="aaa"/>')),
                                                    eq('<FieldRef Name="aaa"/><Value Type="DateTime">2016-01-16</Value>'))),
                                            inTag('<FieldRef Name="ccc"/>', '<Value Foo="Bar">foo</Value><Value>qux</Value>')),
                                        membership('SPWeb.AllUsers', '<FieldRef Name="ddd"/>')),
                                    '<Includes><FieldRef Name="eee"/><Value Type="User">Person1</Value></Includes>'),
                                '<Gt><FieldRef Name="fff"/><Value Type="Number">1</Value></Gt>')
                    )) +
                    viewFields('<FieldRef Name="aaa"/><FieldRef Name="ccc"/><FieldRef Name="bbb" Explicit="TRUE"/>') +
                    '<RowLimit Paged="TRUE">30</RowLimit>' +
                    '<JSLink>clienttemplates.js</JSLink>' +
                    '<XslLink Default="TRUE">main.xsl</XslLink>' +
                    '<Toolbar Type="Standard"/>' +
                '</View>',
            sorts: [
                { fieldName: 'aaa', isAscending: true },
                { fieldName: 'ccc', isAscending: true },
                { fieldName: 'bbb', isAscending: false }
            ],
            groupBy: {
                isCollapsed: false,
                group1: { fieldName: 'aaa', isAscending: true },
                group2: { fieldName: 'ccc', isAscending: true }
            },
            rowLimit: {
                rowLimit: 30,
                isPerPage: true
            },
            filters: [
                { fieldName: 'bbb', type: 'Text', operator: 'Eq', values: ['foo'] },
                { fieldName: 'aaa', type: 'DateTime', operator: 'Eq', values: ['2016-01-08', '2016-01-15', ''] },
                { fieldName: 'ccc', operator: 'In', values: ['foo', 'qux'] },
                { fieldName: 'ddd', operator: 'Membership', values: ['SPWeb.AllUsers'] },
                { fieldName: 'eee', type: 'User', operator: 'Includes', values: ['Person1'] },
                { fieldName: 'fff', type: 'Number', operator: 'Gt', values: ['1'] }
            ],
            fieldNames: ['aaa', 'ccc', 'bbb']
        }
    ])
};

// For the time being (unless/until special cases are added for different operators), add one
// test case for each binary operator besides Eq.
for (let op of ['BeginsWith', 'Contains', 'Geq', 'Gt', 'Includes', 'Leq', 'Lt', 'Neq', 'NotIncludes']) {
    validDefs['otherBinary'].push({
        description: op,
        xml: viewWhere(`<${op}><FieldRef Name="aaa"/><Value Type="test">foo</Value></${op}>`),
        filters: [ { fieldName: 'aaa', type: 'test', operator: op, values: ['foo'] } ]
    });
}
