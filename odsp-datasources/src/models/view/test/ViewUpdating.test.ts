import { expect, assert } from 'chai';
import * as TestHelpers from './ViewTestHelpers';
import View from '../View';
import * as ViewHelpers from '../ViewHelpers';
import IView from '../../../interfaces/view/IView';
import { IOrderedField, IGroupBy, IRowLimit, IFilter, ArrangeInfoType } from '../../../interfaces/view/IViewArrangeInfo';
import * as CamlSerialization from '../../../utilities/caml/CamlSerialization';

type IUpdateValue = string[] | IOrderedField | IGroupBy | IRowLimit | (IFilter | string)[] | IFilter | string;
type IResultValue = string[] | IOrderedField[] | IGroupBy | IRowLimit | IFilter[];

const _serializer = new XMLSerializer();

interface IUpdateOperation {
    /** What the update does */
    description: string;
    /** Call the appropriate update method with this value */
    updateValue: IUpdateValue;
    /** Result, if different from updateValue */
    expectedResult?: IResultValue;
    /** True if undefined is the expected result... */
    expectedResultIsUndefined?: boolean;
    /** If true, expect view.isDirty() to be false not true */
    expectViewNotDirty?: boolean;
    /**
     * Result CAML (will only check CAML if this is given).
     * If it's a string, does an equality check.
     * If it's an array, does a contains check on each member.
     */
    expectedCaml?: string | string[];
    /** Options for updating a sort field */
    sortOptions?: { removeSort?: boolean; overwriteAll?: boolean; };
    /** Index for updating a view field */
    fieldIndex?: number;
}

interface IUpdateOperationSet {
    /** Type of updates being made */
    updateType: ArrangeInfoType;
    /**
     * Function to use to make each update.
     * Returns a string describing the update operation (usually the function call made).
     */
    updateFunc: (view: View, update: IUpdateOperation) => string;
    /** Category from SampleViewInfo.validDefs which contains the view to use as a starting point  */
    category: string;
    /**
     * Exact description of the view from SampleViewInfo.validDefs[category] that will be used
     * as a starting point for modifications
     */
    description: string;
    /** List of updates to make once view is initialized */
    updates: IUpdateOperation[];
}

// Tests for the updating half of the class
describe('View updating', () => {
    /** Initializes a view from SampleViewInfo.validDefs[category] with the given description. */
    function initView(updateSet: { category: string; description: string; }): View {
        let { category, description } = updateSet;
        // this will assert if a def with the given description isn't found
        let def = TestHelpers.getDef(category, description);
        return new View(def.xml);
    }

    /** Initializes a view, makes updates, and checks the results */
    function testChangedView(updateSet: IUpdateOperationSet) {
        let { updateType, updateFunc, updates } = updateSet;
        // Initialize the view with the given category/description (will assert if there's a problem)
        let view = initView(updateSet);

        for (let update of updates) {
            let { updateValue, description, expectedCaml, expectedResult, expectedResultIsUndefined, expectViewNotDirty } = update;
            // Make the requested changes
            let modification;
            try {
                modification = updateFunc(view, update);
            } catch (ex) {
                assert(false, `Error with ${description}, making update '${JSON.stringify(update)}': ${ex}`);
            }

            let objectPath = `${modification} (${description})`;
            let arrangeInfo;
            try {
                arrangeInfo = TestHelpers.getEffectiveArrangeInfo(view);
            } catch (ex) {
                assert(false, 'Unexpected error after ' + objectPath + ': ' + (ex && ex.message));
            }

            expect(view.hasParseError(), 'Should not be parse errors after ' + objectPath);
            if (expectViewNotDirty) {
                expect(view.isDirty(), 'View should not be dirty after ' + objectPath).equals(false);
            } else {
                expect(view.isDirty(), 'View should be dirty after ' + objectPath).equals(true);
            }

            // Validate that the changes have the expected result
            let updateTypeStr = ArrangeInfoType[updateType];
            expectedResult = <IResultValue>(expectedResultIsUndefined ? undefined : expectedResult || updateValue);
            TestHelpers.expectEqualProps({
                actual: arrangeInfo,
                expected: { [updateTypeStr]: expectedResult },
                objectPath: objectPath,
                props: [updateTypeStr],
                xml: 'n/a'
            });

            // Check CAML if requested (brittle, but important in some cases to ensure stuff
            // we don't understand is preserved)
            let resultCaml = getEffectivePropertyXml(view, updateType);
            if (typeof expectedCaml === 'string') {
                expect(resultCaml).to.eql(expectedCaml, 'issue with CAML after ' + objectPath);
            } else if (Array.isArray(expectedCaml)) {
                for (let caml of expectedCaml) {
                    expect(resultCaml).to.contain(caml, `issue with CAML after ${objectPath}`);
                }
            }
        }
    }

    /**
     * Gets the effective XML for the given property, tracking modifications made.
     * Returns null if the view's baseViewXml is unknown.
     */
    function getEffectivePropertyXml(view: IView, property: ArrangeInfoType) {
        let viewDom = view.getDomParts();
        if (!viewDom) {
            return null;
        }
        let elem;
        switch (property) {
            case ArrangeInfoType.filters: elem = viewDom.where; break;
            case ArrangeInfoType.sorts: elem = viewDom.orderBy; break;
            case ArrangeInfoType.groupBy: elem = viewDom.groupBy; break;
            case ArrangeInfoType.fieldNames: elem = viewDom.viewFields; break;
            case ArrangeInfoType.rowLimit: elem = viewDom.rowLimit; break;
            default: return null;
        }
        return elem ? _serializer.serializeToString(elem) : '';
    }

    describe('fields', () => {
        function updateFields(view: View, update: IUpdateOperation): string {
            let { updateValue, fieldIndex } = update;
            let fieldNames = <string[]>updateValue;
            if (fieldNames && fieldNames.length === 1) {
                view.updateField(fieldNames[0], fieldIndex);
                return `updateField(${fieldNames[0]}, ${fieldIndex})`;
            } else {
                view.replaceFields(fieldNames);
                return `replaceFields(${JSON.stringify(fieldNames)})`;
            }
        }

        it('modifies with updateField', () => {
            // start from empty and test adding/removing fields
            testChangedView({
                updateType: ArrangeInfoType.fieldNames,
                updateFunc: updateFields,
                category: 'basic',
                description: 'query',
                updates: [{
                    description: '[1a] add abc to empty fields list at index 1',
                    updateValue: ['abc'],
                    fieldIndex: 1
                }, {
                    description: '[1b] add def at index 0',
                    updateValue: ['def'],
                    fieldIndex: 0,
                    expectedResult: ['def', 'abc']
                }, {
                    description: '[1c] add aaa at index 9001',
                    updateValue: ['aaa'],
                    fieldIndex: 9001,
                    expectedResult: ['def', 'abc', 'aaa']
                }, {
                    description: '[1d] add bbb at index 2',
                    updateValue: ['bbb'],
                    fieldIndex: 2,
                    expectedResult: ['def', 'abc', 'bbb', 'aaa']
                }, {
                    description: '[1e] add ccc at index 4 (last)',
                    updateValue: ['ccc'],
                    fieldIndex: 4,
                    expectedResult: ['def', 'abc', 'bbb', 'aaa', 'ccc']
                }, {
                    description: '[1f] remove aaa',
                    updateValue: ['aaa'],
                    expectedResult: ['def', 'abc', 'bbb', 'ccc']
                }, {
                    description: '[1g] do not add null field',
                    updateValue: [null],
                    fieldIndex: 2,
                    expectedResult: ['def', 'abc', 'bbb', 'ccc']
                }, {
                    description: '[1h] move abc to a later index (3)',
                    updateValue: ['abc'],
                    fieldIndex: 3,
                    expectedResult: ['def', 'bbb', 'ccc', 'abc']
                }, {
                    description: '[1i] remove abc with index -1',
                    updateValue: ['abc'],
                    fieldIndex: -1,
                    expectedResult: ['def', 'bbb', 'ccc']
                }, {
                    description: '[1j] remove bbb with no index',
                    updateValue: ['bbb'],
                    expectedResult: ['def', 'ccc']
                }
                ]
            });
        });

        it('modifies with updateField, keeps extra attrs', () => {
            // start from a field list with extra attributes, move fields around,
            // ensure extra info is preserved
            testChangedView({
                updateType: ArrangeInfoType.fieldNames,
                updateFunc: updateFields,
                category: 'viewFields',
                description: 'three fields, one with explicit attribute',
                updates: [{
                    description: '[2a] add an additional field',
                    updateValue: ['ddd'],
                    fieldIndex: 10000,
                    expectedResult: ['bbb', 'aaa', 'ccc', 'ddd']
                }, {
                    description: '[2b] move aaa to 1000',
                    updateValue: ['aaa'],
                    fieldIndex: 1000,
                    expectedResult: ['bbb', 'ccc', 'ddd', 'aaa'],
                    expectedCaml: '<ViewFields><FieldRef Name="bbb"/><FieldRef Name="ccc"/>' +
                    '<FieldRef Name="ddd"/><FieldRef Name="aaa" Explicit="TRUE"/></ViewFields>'
                }, {
                    description: '[2c] move ddd to index 3',
                    updateValue: ['ddd'],
                    fieldIndex: 3,
                    expectedResult: ['bbb', 'ccc', 'aaa', 'ddd']
                }, {
                    description: '[2d] move aaa to index 0',
                    updateValue: ['aaa'],
                    fieldIndex: 0,
                    expectedResult: ['aaa', 'bbb', 'ccc', 'ddd'],
                    expectedCaml: '<ViewFields><FieldRef Name="aaa" Explicit="TRUE"/>' +
                    '<FieldRef Name="bbb"/><FieldRef Name="ccc"/><FieldRef Name="ddd"/></ViewFields>'
                }
                ]
            });
        });

        it('modifies with updateField on all-up view', () => {
            testChangedView({
                updateType: ArrangeInfoType.fieldNames,
                updateFunc: updateFields,
                category: 'allUp',
                description: 'test view',
                updates: [{
                    description: '[2.5] move bbb to index 0, preserving extra attr',
                    updateValue: ['bbb'],
                    fieldIndex: 0,
                    expectedResult: ['bbb', 'aaa', 'ccc'],
                    expectedCaml: '<ViewFields><FieldRef Name="bbb" Explicit="TRUE"/>' +
                    '<FieldRef Name="aaa"/><FieldRef Name="ccc"/></ViewFields>'
                }]
            });
        });

        it('modifies with replaceFields', () => {
            testChangedView({
                updateType: ArrangeInfoType.fieldNames,
                updateFunc: updateFields,
                category: 'basic',
                description: 'query',
                updates: [{
                    description: '[3a] add fields where there were none',
                    updateValue: ['aaa', 'bbb', 'ccc']
                }, {
                    description: '[3b] blow away all old fields',
                    updateValue: ['ddd', 'eee', 'fff']
                }, {
                    description: '[3c] replace with undefined is no-op',
                    updateValue: undefined,
                    expectedResult: ['ddd', 'eee', 'fff']
                }, {
                    description: '[3d] replace with empty array is no-op',
                    updateValue: [],
                    expectedResult: ['ddd', 'eee', 'fff']
                }]
            });
        });

        it('modifies with replaceFields, keeps extra attrs', () => {
            testChangedView({
                updateType: ArrangeInfoType.fieldNames,
                updateFunc: updateFields,
                category: 'viewFields',
                description: 'three fields, one with explicit attribute',
                updates: [{
                    description: '[4a] replace some fields, preserving extra attr',
                    updateValue: ['aaa', 'abc', 'def', 'geh'],
                    expectedCaml: '<ViewFields><FieldRef Name="aaa" Explicit="TRUE"/>' +
                    '<FieldRef Name="abc"/><FieldRef Name="def"/><FieldRef Name="geh"/></ViewFields>'
                }]
            });
        });
    });

    // some fieldrefs used for updating sorts and group by
    const bbbDescending = { fieldName: 'bbb', isAscending: false };
    const aaaAscending = { fieldName: 'aaa', isAscending: true };
    const aaaDescending = { fieldName: 'aaa', isAscending: false };
    const cccAscending = { fieldName: 'ccc', isAscending: true };

    describe('sorts', () => {
        function updateSort(view: View, update: IUpdateOperation): string {
            let { updateValue, sortOptions } = update;

            // replace all sort fields with first field given
            view.updateSort(<IOrderedField>updateValue, sortOptions);
            return `updateSort(${JSON.stringify(updateValue)}, ${JSON.stringify(sortOptions)})`;
        }

        it('modifies with updateSort', () => {
            testChangedView({
                updateType: ArrangeInfoType.sorts,
                updateFunc: updateSort,
                category: 'basic',
                description: 'empty',
                updates: [{
                    description: '[5a] let there be orderby...aaa ascending',
                    updateValue: aaaAscending,
                    expectedResult: [aaaAscending]
                }, {
                    description: '[5b] add bbb descending',
                    updateValue: bbbDescending,
                    expectedResult: [aaaAscending, bbbDescending]
                }, {
                    description: '[5c] change aaa to descending',
                    updateValue: aaaDescending,
                    expectedResult: [aaaDescending, bbbDescending]
                }, {
                    description: '[5d] remove aaa',
                    updateValue: aaaDescending,
                    sortOptions: { removeSort: true },
                    expectedResult: [bbbDescending]
                }, {
                    description: '[5e] overwrite all with aaa descending',
                    updateValue: aaaDescending,
                    sortOptions: { overwriteAll: true },
                    expectedResult: [aaaDescending]
                }, {
                    description: '[5f] remove nonexistent ccc',
                    updateValue: { fieldName: 'ccc' },
                    sortOptions: { removeSort: true },
                    expectedResult: [aaaDescending]
                }, {
                    description: '[5g] remove all info',
                    updateValue: undefined,
                    sortOptions: { overwriteAll: true }
                }]
            });
        });

        it('modifies with updateSort, keeps extra attrs', () => {
            testChangedView({
                updateType: ArrangeInfoType.sorts,
                updateFunc: updateSort,
                category: 'orderBy',
                description: 'OrderBy and FieldRef with attributes',
                updates: [{
                    description: '[6a] change aaa to ascending and keep attributes',
                    updateValue: aaaAscending,
                    expectedCaml: '<OrderBy UseIndexForOrderBy="TRUE"><FieldRef Name="aaa" Ascending="TRUE" LookupId="TRUE"/></OrderBy>',
                    expectedResult: [aaaAscending]
                }, {
                    description: '[6b] overwrite with bbb descending',
                    updateValue: bbbDescending,
                    sortOptions: { overwriteAll: true },
                    expectedCaml: '<OrderBy UseIndexForOrderBy="TRUE"><FieldRef Name="bbb" Ascending="FALSE"/></OrderBy>',
                    expectedResult: [bbbDescending]
                }]
            });
        });
    });

    describe('group by', () => {
        function updateGroupBy(view: View, update: IUpdateOperation): string {
            let { updateValue } = update;
            view.updateGroupBy(<IGroupBy>updateValue);
            return `updateGroupBy(${JSON.stringify(updateValue)})`;
        }

        it('modifies with updateGroupBy', () => {
            testChangedView({
                updateType: ArrangeInfoType.groupBy,
                updateFunc: updateGroupBy,
                category: 'basic',
                description: 'empty',
                updates: [{
                    description: '[7a] add groupby aaa ascending, non-collapsed',
                    updateValue: { group1: aaaAscending, isCollapsed: false }
                }, {
                    description: '[7b] change to aaa descending, collapsed',
                    updateValue: { group1: aaaDescending, isCollapsed: true }
                }, {
                    description: '[7c] add bbb descending',
                    updateValue: { group1: aaaDescending, group2: bbbDescending, isCollapsed: true }
                }, {
                    description: '[7d] switch group2 to ccc ascending',
                    updateValue: { group1: aaaDescending, group2: cccAscending, isCollapsed: true }
                }, {
                    description: '[7e] switch group1 to bbb descending',
                    updateValue: { group1: bbbDescending, group2: cccAscending, isCollapsed: true }
                }, {
                    description: '[7f] switching group2 also to bbb descending removes it',
                    updateValue: { group1: bbbDescending, group2: bbbDescending, isCollapsed: true },
                    expectedResult: { group1: bbbDescending, isCollapsed: true }
                }, {
                    description: '[7g] group1 with no name removes grouping info',
                    updateValue: { group1: <IOrderedField><any>{ isAscending: true }, isCollapsed: true },
                    expectedResultIsUndefined: true
                }, {
                    description: '[7h] add groupby aaa ascending, bbb descending, not collapsed',
                    updateValue: { group1: aaaAscending, group2: bbbDescending, isCollapsed: false }
                }, {
                    description: '[7i] not specifying group2 removes it',
                    updateValue: { group1: aaaAscending, isCollapsed: false }
                }, {
                    description: '[7j] undefined removes all groups',
                    updateValue: undefined
                }]
            });
        });

        it('modifies with updateGroupBy, keeps extra attrs', () => {
            testChangedView({
                updateType: ArrangeInfoType.groupBy,
                updateFunc: updateGroupBy,
                category: 'groupBy',
                description: 'extra GroupLimit attribute and LookupId',
                updates: [{
                    description: '[8a] switch group1 aaa to descending and expand groups',
                    updateValue: { group1: aaaDescending, isCollapsed: false },
                    expectedCaml: '<GroupBy GroupLimit="30" Collapse="FALSE">' +
                    '<FieldRef Name="aaa" LookupId="TRUE" Ascending="FALSE"/></GroupBy>'
                }, {
                    description: '[8b] add group2 bbb descending',
                    updateValue: { group1: aaaDescending, group2: bbbDescending, isCollapsed: false },
                    expectedCaml: '<GroupBy GroupLimit="30" Collapse="FALSE">' +
                    '<FieldRef Name="aaa" LookupId="TRUE" Ascending="FALSE"/>' +
                    '<FieldRef Name="bbb" Ascending="FALSE"/></GroupBy>'
                }]
            });
        });
    });

    describe('row limit', () => {
        function updateRowLimit(view: View, update: IUpdateOperation): string {
            let { updateValue } = update;
            view.updateRowLimit(<IRowLimit>updateValue);
            return `updateRowLimit(${JSON.stringify(updateValue)})`;
        }

        it('modifies with updateRowLimit', () => {
            testChangedView({
                updateType: ArrangeInfoType.rowLimit,
                updateFunc: updateRowLimit,
                category: 'rowLimit',
                description: 'normal without paged',
                updates: [{
                    description: '[9a] switch row limit to 300',
                    updateValue: { rowLimit: 300 },
                    expectedResult: { rowLimit: 300, isPerPage: false }
                }, {
                    description: '[9b] set paged to true',
                    updateValue: { rowLimit: 300, isPerPage: true }
                }, {
                    description: '[9c] set paged to false',
                    updateValue: { rowLimit: 300, isPerPage: false }
                }, {
                    description: '[9d] update both limit and paged',
                    updateValue: { rowLimit: 250, isPerPage: true }
                }]
            });
        });
    });

    describe('filters', () => {
        it('remove smart filters', () => {
            function testRemoveSmartFilters(xml: string, expectedResult: string) {
                xml = `<View><Query><Where>${xml}</Where></Query></View>`;
                let view = new View(xml);
                ViewHelpers.removeSmartFilters(view);
                let resultCaml = getEffectivePropertyXml(view, ArrangeInfoType.filters);
                expect(resultCaml).to.eql(expectedResult);
            }

            const eqBWithId = '<Eq id="b"><FieldRef Name="bbb"/><Value Type="Text">foo</Value></Eq>';
            const eqAFoo = '<Eq><FieldRef Name="aaa"/><Value Type="Text">foo</Value></Eq>';
            testRemoveSmartFilters(`${eqBWithId}`, '<Where/>');
            testRemoveSmartFilters(`${eqAFoo}`, `<Where>${eqAFoo}</Where>`);
            testRemoveSmartFilters(`<Or>${eqBWithId}${eqAFoo}</Or>`, `<Where>${eqAFoo}</Where>`);
        });

        it('clears filters', () => {
            testChangedView({
                updateType: ArrangeInfoType.filters,
                updateFunc: (view: View) => {
                    view.clearFilters();
                    return 'clearFilters()';
                },
                category: 'or',
                description: 'basic without type',
                updates: [{
                    description: '[10a] clear filters',
                    updateValue: undefined,
                    expectedCaml: ''
                }]
            });
        });

        // test filters (null is something not currently representable as IFilter)
        const f: IFilter[] = [
            // If adding anything, add it add the end so the existing indices stay the same
            { fieldName: 'aaa', id: '0', type: 'Text', operator: 'Eq', values: ['foo'] },
            { fieldName: 'bbb', id: '1', type: 'Text', operator: 'Eq', values: ['bar'] },
            { fieldName: 'ccc', id: '2', type: 'Text', operator: 'In', values: ['baz', 'z'] },
            { fieldName: 'ddd', id: '3', type: 'Text', operator: 'Eq', values: ['qux'] },
            { fieldName: 'aaa', id: '4', type: 'Text', operator: 'Eq', values: ['something else'] },
            null,
            { fieldName: 'bbb', id: '6', type: 'Text', operator: 'Eq', values: ['aaaaaaaaaaaaaaaa'] },
            { fieldName: 'aaa', id: '7', operator: 'IsNull', values: [''] }
        ];
        // CAML for test filters
        const cf: string[] = [
            CamlSerialization.filterToCaml(f[0]),
            CamlSerialization.filterToCaml(f[1]),
            CamlSerialization.filterToCaml(f[2]),
            CamlSerialization.filterToCaml(f[3]),
            CamlSerialization.filterToCaml(f[4]),
            '<Foo id="5"><FieldRef Name="aaa"/><Value>3</Value></Foo>', // not valid but can be added in theory...
            CamlSerialization.filterToCaml(f[6]),
            CamlSerialization.filterToCaml(f[7])
        ];

        function addFilters(view: View, update: IUpdateOperation): string {
            let { updateValue } = update;
            let filters = CamlSerialization.filtersToCamlStrings(<(IFilter | string)[]>updateValue);
            view.addFilters(filters);
            return 'addFilters(...)';
        }

        it('adds filters one at a time', () => {
            testChangedView({
                updateType: ArrangeInfoType.filters,
                updateFunc: addFilters,
                category: 'basic',
                description: 'empty',
                updates: [{
                    description: '[11a] add single with no existing filters',
                    updateValue: [f[0]]
                }, {
                    description: '[11b] add single with existing filter',
                    updateValue: [f[1]],
                    expectedResult: [f[0], f[1]]
                }, {
                    description: '[11c] add single multi-value filter',
                    updateValue: [f[2]],
                    expectedResult: [f[0], f[1], f[2]]
                }, {
                    description: '[11d] adds empty filter',
                    updateValue: [f[7]],
                    expectedResult: [f[0], f[1], f[2], f[7]]
                }, {
                    description: '[11e] adds unrecognized filter',
                    updateValue: [cf[5]],
                    expectedResult: [f[0], f[1], f[2], f[7]],
                    expectedCaml: [cf[0], cf[1], cf[2], cf[7], cf[5]]
                }]
            });
        });

        it('adds multiple filters at a time', () => {
            testChangedView({
                updateType: ArrangeInfoType.filters,
                updateFunc: addFilters,
                category: 'basic',
                description: 'empty',
                updates: [{
                    description: '[12a] add multi with no existing filters',
                    updateValue: [f[0], f[1], f[2]]
                }, {
                    description: '[12b] add multi including empty with existing filters',
                    updateValue: [f[3], f[7], f[4]],
                    expectedResult: [f[0], f[1], f[2], f[3], f[7], f[4]]
                }, {
                    description: '[12c] add multi including unrecognized',
                    updateValue: [cf[5], f[6]],
                    expectedResult: [f[0], f[1], f[2], f[3], f[7], f[4], f[6]],
                    expectedCaml: [cf[0], cf[1], cf[2], cf[3], cf[7], cf[4], cf[5], cf[6]]
                }]
            });
        });

        it('removes filters', () => {
            testChangedView({
                updateType: ArrangeInfoType.filters,
                updateFunc: (view: View, update: IUpdateOperation) => {
                    let { updateValue, description } = update;
                    if (typeof updateValue === 'string') {
                        let update = `removeFilter(view, '${updateValue}')`;
                        try {
                            ViewHelpers.removeFilter(view, <string>updateValue);
                        } catch (ex) {
                            assert(false, `Error with removeFilter(view, ${update}) (${description}): ${ex}`);
                        }
                        return update;
                    } else {
                        view.addFilters(<string[]>updateValue);
                        return 'addFilters(...)';
                    }
                },
                category: 'basic',
                description: 'empty',
                updates: [{
                    description: '[13a] remove a filter when no filters exist',
                    updateValue: 'aaa',
                    expectedResultIsUndefined: true,
                    expectViewNotDirty: true
                }, {
                    description: '[13b] add a filter (prep)',
                    // in the updateFunc here, specifying an array of filters rather than an id
                    // causes the filters to be added
                    updateValue: [cf[0]],
                    expectedResult: [f[0]]
                }, {
                    description: '[13c] remove nonexistent filter when 1 filter exists',
                    updateValue: 'asdf',
                    expectedResult: [f[0]]
                }, {
                    description: '[13d] remove filter when 1 filter exists',
                    updateValue: '0',
                    expectedResultIsUndefined: true
                }, {
                    description: '[13e] add some filters (prep)',
                    updateValue: [cf[0], cf[1], cf[2], cf[3]],
                    expectedResult: [f[0], f[1], f[2], f[3]]
                }, {
                    description: '[13f] remove a nonexistent filter',
                    updateValue: 'asdfsd',
                    expectedResult: [f[0], f[1], f[2], f[3]]
                }, {
                    description: '[13g] remove a filter',
                    updateValue: '1',
                    expectedResult: [f[0], f[2], f[3]]
                }]
            });
        });

        it('throws on invalid update ops', () => {
            function updateFilter(filter: IFilter, msg: string) {
                let view = initView({ category: 'basic', description: 'empty' });
                expect(() => ViewHelpers.updateFilter(view, filter), msg).to.throw();
            }

            updateFilter({ fieldName: 'a', type: 'Text', operator: 'Eq', values: ['foo'] }, 'updating filter without id should throw');
            updateFilter(<any>{}, 'updating filter that cannot be serialized should throw');

            // Having two filters with the same id is not allowed, and trying to update that id throws
            const eq = '<Eq id="a"><FieldRef Name="aaa"/><Value>asdf</Value></Eq>';
            let view = new View(`<View><Query><Where>${eq}${eq}</Where></Query></View>`);
            expect(() => ViewHelpers.updateFilter(view, { id: 'a', fieldName: 'a', type: 'Text', operator: 'Eq', values: ['bar'] })).to.throw(
                /./, 'updating filter with duplicate id should throw');
        });

        function updateFilter(view: View, update: IUpdateOperation): string {
            let { updateValue } = update;
            ViewHelpers.updateFilter(view, <IFilter>updateValue);
            return `updateFilter(view, ${JSON.stringify(updateValue)})`;
        }

        const update1a: IFilter = { id: '1', fieldName: 'asdf', type: 'Text', operator: 'In', values: ['a', 'b', 'c'] };
        const update1b: IFilter = { id: '1', fieldName: 'aaa', type: 'DateTime', operator: 'Eq', values: ['2016-09-01', '2016-09-02'] };

        it('updates a filter', () => {
            testChangedView({
                updateType: ArrangeInfoType.filters,
                updateFunc: updateFilter,
                category: 'basic',
                description: 'empty',
                updates: [{
                    description: '[14a] add a filter with updateFilter',
                    updateValue: f[0],
                    expectedResult: [f[0]]
                }, {
                    description: '[14b] add another filter with updateFilter',
                    updateValue: f[1],
                    expectedResult: [f[0], f[1]]
                }, {
                    description: '[14c] update a filter',
                    updateValue: update1a,
                    expectedResult: [f[0], update1a]
                }, {
                    description: '[14d] update a filter again',
                    updateValue: update1b,
                    expectedResult: [f[0], update1b]
                }]
            });
        });
    });
});
