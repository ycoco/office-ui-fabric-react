import { expect, assert } from 'chai';
import * as TestHelpers from './ViewTestHelpers';
import View from '../View';
import * as ViewHelpers from '../ViewHelpers';
import { VisualizationType } from '../../../interfaces/list/IVisualization';
import IServerView from '../../../interfaces/view/IServerView';
import { ViewType } from '../../../interfaces/view/IView';
import { IFilter } from '../../../interfaces/view/IViewArrangeInfo';
import * as CamlUtilities from '../../../utilities/caml/CamlUtilities';
import Guid from '@ms/odsp-utilities/lib/guid/Guid';

// This file has tests for:
// - general view methods not tested elsewhere
// - other view/filter-related methods not tested elsewhere

describe('View general', () => {
    // gets a basic IServerView
    function getServerView(title: string = '', id: string = ''): IServerView {
        return {
            DefaultView: false,
            Hidden: false,
            Id: id,
            ServerRelativeUrl: '',
            Title: title,
            ViewType: 'HTML'
        };
    }

    function getPowerApp(title: string = ''): IServerView {
        let view = getServerView(title);
        view.Hidden = true;
        view.ViewType = '';
        view.VisualizationInfo = {
            VisualizationType: VisualizationType.VisualizationApp,
            VisualizationAppInfo: {
                Id: 'something'
            }
        };
        return view;
    }

    describe('initialization', () => {
        it('initializes from server view', () => {
            let serverView = getServerView('test', '{6ECD4714-5F89-4A9C-8374-7A46497B0E42}');
            let view = new View(serverView);
            expect(view.id).to.equal(Guid.normalizeLower(serverView.Id));
            expect(view.viewType).to.equal(ViewType.standard);
        });

        it('correctly determines view is powerapp', () => {
            let serverView = getPowerApp();
            let view = new View(serverView);
            expect(view.isHidden).to.be.false;
            expect(view.viewType).to.equal(ViewType.power);
            expect(view.visualizationInfo).to.eql(serverView.VisualizationInfo);
        });
    });

    describe('compareTo', () => {
        const view1 = new View(getServerView('view1'));
        const view2 = new View(getServerView('view2'));
        const view2b = new View(getServerView('View2'));
        const app1 = new View(getPowerApp('app1'));
        const app2 = new View(getPowerApp('app2'));

        it('does basic comparisons', () => {
            expect(view1.compareTo(view1)).to.equal(0, 'comparing identical views');
            expect(view1.compareTo(view2)).to.equal(-1);
            expect(view2.compareTo(view1)).to.equal(1);
        });

        it('does case-insensitive comparison', () => {
            expect(view2.compareTo(view2b)).to.equal(0);
            expect(view1.compareTo(view2b)).to.equal(-1);
        });

        it('compares powerapps to each other', () => {
            expect(app1.compareTo(app1)).to.equal(0);
            expect(app1.compareTo(app2)).to.equal(-1);
            expect(app2.compareTo(app1)).to.equal(1);
        });

        it('sorts powerapps after non-powerapps', () => {
            expect(view1.compareTo(app1)).to.equal(-1);
            expect(app1.compareTo(view1)).to.equal(1);
        });
    });
});

describe('Today parsing', () => {
    describe('isTodayString', () => {
        function testIsToday(str: string, result: boolean) {
            expect(CamlUtilities.isTodayString(str)).to.equal(result,
                `isTodayString('${str}') should be ${result}`);
        }

        it('works without offset', () => {
            testIsToday('today', false);
            testIsToday('[today]', true);
            testIsToday('[Today]', true);
            testIsToday('[TodAY]', true);
        });
        it('works with offset', () => {
            testIsToday('[today+1]', false);
            testIsToday('[today]+1', true);
            testIsToday('[Today]+1', true);
            testIsToday('[Today]+20', true);
            testIsToday('[Today]-3', true);
            testIsToday('[Today]+2.5', false); // no decimals
        });
    });

    describe('getTodayOffset', () => {
        function testGetOffset(str: string, offset: number) {
            expect(CamlUtilities.getTodayOffset(str)).to.equal(offset,
                `getTodayOffset('${str}') should be ${offset}`);
        }

        it('works with 0', () => {
            testGetOffset('[today]', 0);
            testGetOffset('[Today]', 0);
        });
        it('works with positives', () => {
            testGetOffset('[today]+1', 1);
            testGetOffset('[today]+20', 20);
            testGetOffset('[today]+0', 0);
        });
        it('works with negatives', () => {
            testGetOffset('[today]-1', -1);
            testGetOffset('[today]-20', -20);
            testGetOffset('[today]-0', 0);
        });
    });

    describe('getTodayString', () => {
        function testGetToday(offset: number, result: string) {
            expect(CamlUtilities.getTodayString(offset)).to.equal(result,
                `getTodayString(${offset}) should be ${result}`);
        }

        it('works with 0', () => {
            testGetToday(0, '[Today]');
        });
        it('works with positives', () => {
            testGetToday(1, '[Today]+1');
            testGetToday(40, '[Today]+40');
        });
        it('works with negatives', () => {
            testGetToday(-1, '[Today]-1');
            testGetToday(-55, '[Today]-55');
        });
    });
});

describe('ViewHelpers.getFilter', () => {
    it('returns undefined when no filters exist', () => {
        function testBasicGetFilter(xml: string) {
            let view = new View(xml);
            expect(ViewHelpers.getFilter(view, 'a')).to.be.undefined;
        }

        testBasicGetFilter(<any>{}); // makes a view with no XML
        testBasicGetFilter('<View/>');
        testBasicGetFilter('<View><Query/></View>');
        testBasicGetFilter('<View><Query><Where/></Query></View>');
    });

    function testGetFilter(id: string, xml: string, expectedResult: IFilter, throws?: boolean) {
        xml = `<View><Query><Where>${xml}</Where></Query></View>`;
        let view = new View(xml);
        if (throws) {
            expect(() => ViewHelpers.getFilter(view, id)).to.throw;
        } else {
            let filter = ViewHelpers.getFilter(view, id);
            TestHelpers.expectEqualProps({
                actual: filter,
                expected: expectedResult,
                objectPath: `getFilter(view, '${id}')`,
                xml: xml
            });
        }
    }

    const eq = '<Eq><FieldRef Name="bbb"/><Value Type="Text">asdf</Value></Eq>';
    const eqB = '<Eq id="b"><FieldRef Name="aaa"/><Value Type="Text">foo</Value></Eq>';

    it('returns undefined for nonexistent filter', () => {
        testGetFilter('a', eq, undefined);
        testGetFilter('a', eqB, undefined);
    });

    it('throws if multiple of id found', () => {
        testGetFilter('b', `<And>${eqB}${eqB}</And>`, undefined, true /*throws*/);
    });

    it('returns IFilter', () => {
        // Just testing here with <Eq>. As long as the parsing code is working correctly,
        // all other operators should work as well.
        testGetFilter('b', eqB, { fieldName: 'aaa', id: 'b', type: 'Text', operator: 'Eq', values: ['foo'] });
        testGetFilter('b', `<And>${eq}${eqB}</And>`, { fieldName: 'aaa', id: 'b', type: 'Text', operator: 'Eq', values: ['foo'] });
    });

    it('returns undefined with And', () => {
        // This could theoretically be something we want to support later.
        testGetFilter('a', `<And id="a">${eq}${eqB}</And>`, undefined);
    });
});

describe('View.prepareForSaving', () => {
    it('works with no filters', () => {
        function testPrepareForSaving1(xml: string) {
            let view = new View(xml);
            expect(() => view.prepareForSaving(), 'Should not throw with XML ' + xml).to.not.throw;
        }

        testPrepareForSaving1('');
        testPrepareForSaving1('<View/>');
        testPrepareForSaving1('<View><Query/></View>');
        testPrepareForSaving1('<View><Query><Where/></Query></View>');
    });

    it('works with filters', () => {
        function testPrepareForSaving2(filters: string, ids: string[]) {
            let view = new View(`<View><Query><Where>${filters}</Where></Query></View>`);
            try {
                view.prepareForSaving();
            } catch (ex) {
                assert(false, 'prepareForSaving threw with ' + filters);
            }
            for (let id of ids) {
                expect(ViewHelpers.getFilter(view, id), `id attribute ${id} should be gone`).to.be.undefined;
            }
        }

        testPrepareForSaving2('<a/>', []);
        testPrepareForSaving2('<a id="foo"/>', ['foo']);
        testPrepareForSaving2('<a id="foo"/><b><c id="bar"/><d/></b>', ['foo', 'bar']);
    });
});

describe('ViewHelpers.getAllSmartFilters', () => {
    it('returns undefined when no filter exist', () => {
        function testNoSmartFilters(xml: string) {
            let view = new View(xml);
            expect(ViewHelpers.getAllSmartFilters(view)).to.be.undefined;
        }

        testNoSmartFilters(<any>{}); // makes a view with no XML
        testNoSmartFilters('<View/>');
        testNoSmartFilters('<View><Query/></View>');
    });

    function testGetAllSmartFilters(xml: string, expectedResult: IFilter[]) {
        xml = `<View><Query><Where>${xml}</Where></Query></View>`;
        let view = new View(xml);
        let filters = ViewHelpers.getAllSmartFilters(view);
        expect(filters.length).to.eql(expectedResult.length);
        for (let i = 0; i < filters.length; i++) {
            TestHelpers.expectEqualProps({
                actual: filters[i],
                expected: expectedResult[i],
                objectPath: `getAllSmartFilters(view)`,
                xml: xml
            });
        }

    }

    const eqAFoo = '<Eq ><FieldRef Name="aaa"/><Value Type="Text">foo</Value></Eq>';
    const eqABar = '<Eq ><FieldRef Name="aaa"/><Value Type="Text">bar</Value></Eq>';
    const eqAWithId = '<Eq id="a"><FieldRef Name="aaa"/><Value Type="Text">foo</Value></Eq>';
    const eqBWithId = '<Eq id="b"><FieldRef Name="bbb"/><Value Type="Text">foo</Value></Eq>';
    const filterAWithId = { fieldName: 'aaa', id: 'a', type: 'Text', operator: 'Eq', values: ['foo'] };
    const filterBWithId = { fieldName: 'bbb', id: 'b', type: 'Text', operator: 'Eq', values: ['foo'] };

    it('returns IFilter[]', () => {
        testGetAllSmartFilters(`${eqAFoo}`, []);
        testGetAllSmartFilters(`${eqAWithId}`, [filterAWithId]);
        testGetAllSmartFilters(`<Or>${eqAWithId}${eqBWithId}</Or>`, [filterAWithId, filterBWithId]);
        testGetAllSmartFilters(`<Or id="a">${eqAFoo}${eqABar}</Or>`, [{ fieldName: 'aaa', id: 'a', type: 'Text', operator: 'Eq', values: ['foo', 'bar'] }]);
    });
});
