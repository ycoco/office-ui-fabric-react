
import { ItemUrlHelper, IItemUrlParts, SiteRelation } from './ItemUrlHelper';
import ISpPageContext from '../../interfaces/ISpPageContext';
import { expect } from 'chai';

describe('ItemUrlHelper', () => {
    let itemUrlHelper: ItemUrlHelper;

    beforeEach(() => {
        let pageContext: ISpPageContext = <any>{
            webAbsoluteUrl: 'https://contoso-my.sharepoint.com/personal/user',
            listUrl: 'https://contoso-my.sharepoint.com/personal/user/Documents'
        };

        itemUrlHelper = new ItemUrlHelper({}, {
            pageContext: pageContext
        });
    });

    describe('#getUrlParts', () => {
        let itemUrlParts: IItemUrlParts;

        describe('with no inputs', () => {
            beforeEach(() => {
                itemUrlParts = itemUrlHelper.getUrlParts();
            });

            it('computes itemUrl', () => {
                expect(itemUrlParts.fullItemUrl).to.equal('https://contoso-my.sharepoint.com/personal/user/Documents');
            });

            it('computes listUrl', () => {
                expect(itemUrlParts.fullListUrl).to.equal('https://contoso-my.sharepoint.com/personal/user/Documents');
            });
        });

        describe('with path and relative webUrl', () => {
            beforeEach(() => {
                itemUrlParts = itemUrlHelper.getUrlParts({
                    path: 'https://contoso.sharepoint.com/teams/finance/Shared Documents/reports/test.xlsx',
                    webUrl: '/teams/finance'
                });
            });

            it('computes listUrl', () => {
                // This should be undefined since it may not be inferred.
                expect(itemUrlParts.normalizedListUrl).to.equal(undefined);
            });

            it('computes server-relative listUrl as undefined', () => {
                // This should be undefined since it may not be inferred.
                expect(itemUrlParts.serverRelativeListUrl).to.equal(undefined);
            });

            it('computes serverRelativeUrl', () => {
                expect(itemUrlParts.serverRelativeItemUrl).to.equal('/teams/finance/Shared Documents/reports/test.xlsx');
            });

            it('is cross site', () => {
                expect(itemUrlParts.siteRelation).to.equal(SiteRelation.crossSite);
            });
        });

        describe('with relative listUrl and relative path', () => {
            beforeEach(() => {
                itemUrlParts = itemUrlHelper.getUrlParts({
                    listUrl: '/personal/user/Documents',
                    path: '/personal/user/Documents/projects/test.docx'
                });
            });

            it('computes listUrl', () => {
                // This should be undefined
                expect(itemUrlParts.normalizedListUrl).to.be.undefined;
            });

            it('computes serverRelativeUrl', () => {
                expect(itemUrlParts.serverRelativeItemUrl).to.equal('/personal/user/Documents/projects/test.docx');
            });

            it('computes path', () => {
                expect(itemUrlParts.fullItemUrl).to.equal('https://contoso-my.sharepoint.com/personal/user/Documents/projects/test.docx');
            });

            it('computes webRelativeItemUrl', () => {
                expect(itemUrlParts.webRelativeItemUrl).to.equal('Documents/projects/test.docx');
            });

            it('is not cross list', () => {
                expect(itemUrlParts.isCrossList).to.be.false;
            });
        });

        describe('with absolute listUrl and relative path', () => {
            beforeEach(() => {
                itemUrlParts = itemUrlHelper.getUrlParts({
                    listUrl: 'https://contoso.sharepoint.com/teams/finance/Shared Documents',
                    path: '/teams/finance/Shared Documents/reports/test.xlsx'
                });
            });

            it('computes path', () => {
                expect(itemUrlParts.fullItemUrl).to.equal('https://contoso.sharepoint.com/teams/finance/Shared Documents/reports/test.xlsx');
            });

            it('computes webRelativeItemUrl', () => {
                expect(itemUrlParts.webRelativeItemUrl).to.equal('Shared Documents/reports/test.xlsx');
            });
        });

        describe('with relative path', () => {
            beforeEach(() => {
                itemUrlParts = itemUrlHelper.getUrlParts({
                    path: '/personal/user/Documents/projects/test.docx'
                });
            });

            it('computes path', () => {
                expect(itemUrlParts.fullItemUrl).to.equal('https://contoso-my.sharepoint.com/personal/user/Documents/projects/test.docx');
            });

            it('computes listUrl', () => {
                // This should be undefined since it is the same domain.
                expect(itemUrlParts.normalizedListUrl).to.be.undefined;
            });

            it('computes webRelativeItemUrl', () => {
                expect(itemUrlParts.webRelativeItemUrl).to.equal('Documents/projects/test.docx');
            });

            it('is not cross list', () => {
                expect(itemUrlParts.isCrossList).to.be.false;
            });
        });

        describe('with full path on alternate domain', () => {
            beforeEach(() => {
                itemUrlParts = itemUrlHelper.getUrlParts({
                    path: 'https://contoso.sharepoint.com/teams/finance',
                    webUrl: 'https://contoso.sharepoint.com/teams/finance'
                });
            });

            it('computes normalized path', () => {
                expect(itemUrlParts.normalizedItemUrl).to.equal('https://contoso.sharepoint.com/teams/finance');
            });

            it('computes webRelativeItemUrl', () => {
                expect(itemUrlParts.webRelativeItemUrl).to.equal('');
            });
        });

        describe('with full path on same domain but different site', () => {
            beforeEach(() => {
                itemUrlParts = itemUrlHelper.getUrlParts({
                    path: 'https://contoso-my.sharepoint.com/personal/user2',
                    webUrl: 'https://contoso-my.sharepoint.com/personal/user2'
                });
            });

            it('computes normalized path', () => {
                expect(itemUrlParts.normalizedItemUrl).to.equal('/personal/user2');
            });

            it('is cross site', () => {
                expect(itemUrlParts.siteRelation).to.equal(SiteRelation.crossSite);
            });

            it('computes webRelativeItemUrl', () => {
                expect(itemUrlParts.webRelativeItemUrl).to.equal('');
            });
        });

        describe('with full path on same site but different unknown list', () => {
            beforeEach(() => {
                itemUrlParts = itemUrlHelper.getUrlParts({
                    path: 'https://contoso-my.sharepoint.com/personal/user/Test/Stuff'
                });
            });

            it('computes normalized path', () => {
                expect(itemUrlParts.normalizedItemUrl).to.equal('/personal/user/Test/Stuff');
            });

            it('computes listUrl', () => {
                expect(itemUrlParts.serverRelativeListUrl).to.be.undefined;
            });

            it('is unknown site relation', () => {
                expect(itemUrlParts.siteRelation).to.equal(SiteRelation.unknown);
            });
        });

        describe('with full path on same site but different known immediate sub-list', () => {
            beforeEach(() => {
                itemUrlParts = itemUrlHelper.getUrlParts({
                    path: 'https://contoso-my.sharepoint.com/personal/user/Test/Stuff',
                    listUrl: 'https://contoso-my.sharepoint.com/personal/user/Test'
                });
            });

            it('is same site', () => {
                expect(itemUrlParts.siteRelation).to.equal(SiteRelation.sameSite);
            });
        });

        describe('with full path on same site but different known list', () => {
            beforeEach(() => {
                itemUrlParts = itemUrlHelper.getUrlParts({
                    path: 'https://contoso-my.sharepoint.com/personal/user/Lists/Test/Stuff',
                    listUrl: 'https://contoso-my.sharepoint.com/personal/user/Lists/Test'
                });
            });

            it('is same site', () => {
                expect(itemUrlParts.siteRelation).to.equal(SiteRelation.sameSite);
            });
        });

        describe('with full path on same site but different unknown list', () => {
            beforeEach(() => {
                itemUrlParts = itemUrlHelper.getUrlParts({
                    path: 'https://contoso-my.sharepoint.com/personal/user/foobar/Test/Stuff',
                    listUrl: 'https://contoso-my.sharepoint.com/personal/user/foobar/Test'
                });
            });

            it('is unknown site relation', () => {
                expect(itemUrlParts.siteRelation).to.equal(SiteRelation.unknown);
            });
        });

        describe('with undefined information', () => {
            beforeEach(() => {
                itemUrlParts = itemUrlHelper.getUrlParts();
            });

            it('computes path as default list url', () => {
                expect(itemUrlParts.fullItemUrl).to.equal('https://contoso-my.sharepoint.com/personal/user/Documents');
            });
        });

        describe('with only listUrl', () => {
            beforeEach(() => {
                itemUrlParts = itemUrlHelper.getUrlParts({
                    listUrl: 'https://contoso.sharepoint.com/teams/finance/Shared Documents'
                });
            });

            it('computes server-relative path', () => {
                expect(itemUrlParts.serverRelativeItemUrl).to.equal('/teams/finance/Shared Documents');
            });

            it('computes path as root of list url', () => {
                expect(itemUrlParts.fullItemUrl).to.equal('https://contoso.sharepoint.com/teams/finance/Shared Documents');
            });

            it('is cross list', () => {
                expect(itemUrlParts.isCrossList).to.be.true;
            });
        });

        describe('with only webUrl', () => {
            beforeEach(() => {
                itemUrlParts = itemUrlHelper.getUrlParts({
                    webUrl: 'https://contoso.sharepoint.com/teams/finance'
                });
            });

            it('has no list URL', () => {
                expect(itemUrlParts.serverRelativeListUrl).to.be.undefined;
            });

            it('computes server-relative path', () => {
                expect(itemUrlParts.serverRelativeItemUrl).to.equal('/teams/finance');
            });

            it('computes path as root of web url', () => {
                expect(itemUrlParts.fullItemUrl).to.equal('https://contoso.sharepoint.com/teams/finance');
            });

            it('is cross list', () => {
                expect(itemUrlParts.isCrossList).to.be.true;
            });
        });

        describe('with unencoded values in the path', () => {
            beforeEach(() => {
                itemUrlParts = itemUrlHelper.getUrlParts({
                    path: '/test/list/this % is a # test'
                });
            });

            it('reproduces the input', () => {
                expect(itemUrlParts.serverRelativeItemUrl).to.equal('/test/list/this % is a # test');
            });
        });

        describe('for relative root paths', () => {
            beforeEach(() => {
                itemUrlParts = itemUrlHelper.getUrlParts({
                    path: '/'
                });
            });

            it('reproduces the input', () => {
                expect(itemUrlParts.serverRelativeItemUrl).to.equal('/');
            });

            it('is cross site', () => {
                expect(itemUrlParts.siteRelation).to.equal(SiteRelation.crossSite);
            });

            it('is not cross domain', () => {
                expect(itemUrlParts.isCrossDomain).to.be.false;
            });
        });

        describe('without inferrable listUrl', () => {
            beforeEach(() => {
                itemUrlParts = itemUrlHelper.getUrlParts({
                    path: 'https://contoso.sharepoint.com/teams/finance/Lists/Shared Documents/projects/test.xlsx',
                    webUrl: 'https://contoso.sharepoint.com/teams/finance'
                });
            });

            it('computes listUrl', () => {
                expect(itemUrlParts.fullListUrl).to.be.undefined;
            });
        });

        describe('with inferrable listUrl and absolute webUrl', () => {
            beforeEach(() => {
                itemUrlParts = itemUrlHelper.getUrlParts({
                    path: 'https://contoso.sharepoint.com/teams/finance/Shared Documents/projects/test.xlsx',
                    webUrl: 'https://contoso.sharepoint.com/teams/finance',
                    mayInferListUrl: true
                });
            });

            it('computes listUrl', () => {
                expect(itemUrlParts.fullListUrl).to.equal('https://contoso.sharepoint.com/teams/finance/Shared Documents');
            });
        });

        describe('with inferrable listUrl and relative webUrl', () => {
            beforeEach(() => {
                itemUrlParts = itemUrlHelper.getUrlParts({
                    path: 'https://contoso.sharepoint.com/teams/finance/Shared Documents/projects/test.xlsx',
                    webUrl: '/teams/finance',
                    mayInferListUrl: true
                });
            });

            it('computes listUrl', () => {
                expect(itemUrlParts.fullListUrl).to.equal('https://contoso.sharepoint.com/teams/finance/Shared Documents');
            });
        });

        describe('with inferrable listUrl and only path', () => {
            beforeEach(() => {
                itemUrlParts = itemUrlHelper.getUrlParts({
                    path: 'https://contoso.sharepoint.com/teams/finance/Shared Documents/projects/test.xlsx',
                    mayInferListUrl: true
                });
            });

            it('computes listUrl', () => {
                expect(itemUrlParts.serverRelativeListUrl).to.be.undefined;
            });
        });

        describe('with absolute listUrl and relative webUrl on same domain', () => {
            beforeEach(() => {
                itemUrlParts = itemUrlHelper.getUrlParts({
                    listUrl: 'https://contoso-my.sharepoint.com/personal/user/Documents',
                    webUrl: '/personal/user'
                });
            });

            it('computes path', () => {
                expect(itemUrlParts.fullItemUrl).to.equal('https://contoso-my.sharepoint.com/personal/user/Documents');
            });

            it('is same site', () => {
                expect(itemUrlParts.siteRelation).to.equal(SiteRelation.sameSite);
            });
        });

        describe('with subweb of current web', () => {
            beforeEach(() => {
                itemUrlParts = itemUrlHelper.getUrlParts({
                    path: '/personal/user/Test',
                    webUrl: '/personal/user/Test'
                });
            });

            it('is cross site', () => {
                expect(itemUrlParts.siteRelation).to.equal(SiteRelation.crossSite);
            });
        });
    });
});
