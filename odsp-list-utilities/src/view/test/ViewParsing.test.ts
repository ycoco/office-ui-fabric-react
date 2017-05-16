import { expect, assert } from 'chai';
import { IValidViewInfo, validDefs } from './SampleViewInfo';
import * as TestHelpers from './ViewTestHelpers';
import View from '../View';
import * as CamlParsing from '../../caml/CamlParsing';

describe('View parsing', () => {
    /**
     * Given the name of a category of view XML and corresponding arrange info from
     * SampleViewInfo.validDefs, verify that initializing a new view gives the expected result.
     */
    function expectValidCategory(description: string, category: string) {
        it(description, () => {
            let defs = validDefs[category];
            let objectPath = TestHelpers.getObjectPath(category);
            expect(defs).to.not.equal(undefined, objectPath + ' does not exist');

            defs.forEach((def: IValidViewInfo, i: number) => {
                expectValid(def, TestHelpers.getObjectPath(category, i, def.description));
            });
        });
    }

    function expectValid(def: IValidViewInfo, objectPath: string) {
        TestHelpers.tryTests(objectPath, () => {
            let view = new View(def.xml);
            view.getDomParts();
            expect(view.hasParseError()).to.equal(false,
                `Unexpected parsing error for ${objectPath}. \nOriginal XML: ${def.xml}`);

            // Compare properties of the view info one by one
            TestHelpers.expectEqualProps({
                actual: TestHelpers.getEffectiveArrangeInfo(view),
                expected: def,
                objectPath: objectPath,
                xml: def.xml
            });
        });
    }

    describe('basics', () => {
        it('throws on basic invalid xml', () => {
            let invalidXmls = [
                // not XML
                'hi',
                // invalid XML
                '<View',
                '<View><Foo Bar="Baz/></View>',
                // outer tag must be <View>
                '<Foo></Foo>',
                // case-sensitive
                '<view></view>',
                // tag cases don't match
                '<View><ViewFields></viewfields></View>'
            ];

            invalidXmls.forEach((xml: string, i: number) => {
                let view = new View(xml);
                try {
                    expect(() => view.getDomParts()).to.throw;
                } catch (ex) {
                    assert(false, `Issue with invalidXmls[${i}]: expected error creating view with ${xml}`);
                }
            });
        });

        expectValidCategory('creates basic views', 'basic');
    });

    describe('view fields', () => {
        expectValidCategory('handles ViewFields', 'viewFields');
    });

    describe('order by', () => {
        expectValidCategory('handles OrderBy', 'orderBy');
    });

    describe('group by', () => {
        expectValidCategory('handles GroupBy', 'groupBy');
    });

    describe('row limit', () => {
        expectValidCategory('handles RowLimit', 'rowLimit');
    });

    describe('filters', () => {
        expectValidCategory('handles basic Where clauses', 'where');
        expectValidCategory('handles Eq filters', 'eq');
        expectValidCategory('handles other binary operators', 'otherBinary');
        expectValidCategory('handles IsNull filters', 'isNull');
        expectValidCategory('handles IsNotNull filters', 'isNotNull');
        expectValidCategory('handles Membership filters', 'membership');
        expectValidCategory('handles In filters', 'in');
        expectValidCategory('handles Or filters', 'or');
        expectValidCategory('handles And filters', 'and');
    });

    describe('all-up', () => {
        it('handles views all-up', () => {
            expectValidCategory('handles parsing all-up', 'allUp');
        });
    });

    describe('containsSmartFilter', () => {
        const testContainsSmartFilter = (xml: string, expectedResult: boolean) => {
            xml = `<View><Query><Where>${xml}</Where></Query></View>`;
            let view = new View(xml);
            expect(CamlParsing.containSmartFilters(view.getDomParts())).to.equal(expectedResult);
        };
        const eq = '<Eq><FieldRef Name="bbb"/><Value Type="Text">asdf</Value></Eq>';
        const eqB = '<Eq id="b"><FieldRef Name="aaa"/><Value Type="Text">foo</Value></Eq>';

        it('returns true for containing smart filters', () => {
            testContainsSmartFilter(eqB, true);
        });

        it('returns false for not containing smart filters', () => {
            testContainsSmartFilter(eq, false);
        });
    });
});