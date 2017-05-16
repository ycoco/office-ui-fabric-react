import { expect, assert } from 'chai';
import { IValidViewInfo, validDefs } from './SampleViewInfo';
import * as TestHelpers from './ViewTestHelpers';
import { IFilter } from '@ms/odsp-datasources/lib/interfaces/view/IViewArrangeInfo';
import * as CamlSerialization from '../../caml/CamlSerialization';
import * as CamlUtilities from '../../caml/CamlUtilities';

const f1 = '<Eq><FieldRef Name="aaa"/><Value Type="Text">foo</Value></Eq>';
const f2 = '<Eq><FieldRef Name="bbb"/><Value Type="Text">bar</Value></Eq>';
const f3 = '<Gt><FieldRef Name="ccc"/><Value Type="Number">3</Value></Gt>';

const if1: IFilter = { fieldName: 'aaa', type: 'Text', operator: 'Eq', values: ['foo'] };
const if2: IFilter = { fieldName: 'bbb', type: 'Text', operator: 'Eq', values: ['bar'] };

describe('CamlUtilities.combineFilters', () => {
    it('works with no filters', () => {
        expect(CamlUtilities.combineFilters(null)).to.equal('', 'null filters should give empty string');
        expect(CamlUtilities.combineFilters([])).to.equal('', 'empty list of filters should give empty string');
    });

    it('works with 1 filter', () => {
        expect(CamlUtilities.combineFilters([f1])).to.equal(f1);
    });

    it('works with 2 filters', () => {
        expect(CamlUtilities.combineFilters([f1, f2])).to.equal(`<And>${f1}${f2}</And>`);
    });

    it('works with 3 filters', () => {
        expect(CamlUtilities.combineFilters([f1, f2, f3])).to.equal(`<And><And>${f1}${f2}</And>${f3}</And>`);
    });

    it('works with arbitrary operator', () => {
        expect(CamlUtilities.combineFilters([f1, f2, f3], 'Or')).to.equal(`<Or><Or>${f1}${f2}</Or>${f3}</Or>`);
    });
});

describe('CamlSerialization.filterToCaml', () => {
    function checkSerialization(description: string, category: string) {
        it(description, () => {
            let defs = validDefs[category];
            let path = 'SampleViewInfo.validDefs.' + category;
            expect(defs).to.not.equal(undefined, path + ' does not exist');

            defs.forEach((def: IValidViewInfo, i: number) => {
                if (def.skipSerializationTest || !def.filters) {
                    return;
                }

                path = TestHelpers.getObjectPath(category, i, def.description);
                let result = CamlSerialization.filtersToCaml(def.filters);

                // Check that the serialization result is valid XML
                try {
                    CamlUtilities.xmlToDom(result);
                } catch (ex) {
                    assert(false, `filterToCaml(${path}) generated invalid XML. ` +
                        `Message: ${ex.message}. XML: ${result}`);
                }

                // Then check that it's as expected.
                let op = def.expectSerializedOperator;
                if (op && op !== category) {
                    // In a few cases, the serialized filter uses a different (but logically equivalent)
                    // structure than the "original" XML. In that case just check that the outermost
                    // operator is as expected, because that operator is fully tested separately.
                    // (For example, <Or><Eq> and <In> structures are sometimes interchangeable.)
                    expect(result.substr(0, op.length + 1)).to.equal(`<${op}`,
                        `Expected serialized ${path} to use <${op}>`);
                } else {
                    // Basic version: original view def should contain the result XML
                    expect(def.xml).to.contain(result, `Error serializing ${path}`);
                }
            });
        });
    }

    checkSerialization('serializes Eq filters', 'eq');
    checkSerialization('serializes other binary filters', 'otherBinary');
    checkSerialization('serializes IsNull filters', 'isNull');
    checkSerialization('serializes IsNotNull filters', 'isNotNull');
    checkSerialization('serializes Membership filters', 'membership');
    checkSerialization('serializes In filters', 'in');
    // also tests CamlUtilities.combineFilters
});

// also tests CamlSerialization.filtersToCamlStrings and CamlUtilities.combineFilters
describe('CamlSerialization.filtersToCaml', () => {
    it('combines IFilters', () => {
        expect(CamlSerialization.filtersToCaml([if1, if2])).to.equal(`<And>${f1}${f2}</And>`);
    });

    it('combines strings', () => {
        expect(CamlSerialization.filtersToCaml([f1, f2, f3])).to.equal(`<And><And>${f1}${f2}</And>${f3}</And>`);
    });

    it('combines mixed types', () => {
        expect(CamlSerialization.filtersToCaml([if1, if2, f3])).to.equal(`<And><And>${f1}${f2}</And>${f3}</And>`);
    });

    it('combines using Or', () => {
        expect(CamlSerialization.filtersToCaml([f1, f2], 'Or')).to.equal(`<Or>${f1}${f2}</Or>`);
    });
});
