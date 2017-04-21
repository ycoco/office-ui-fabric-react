
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

        describe('with path and relative webUrl', () => {
            beforeEach(() => {
                itemUrlParts = itemUrlHelper.getUrlParts({
                    path: 'https://contoso.sharepoint.com/teams/finance/Shared Documents/reports/test.xlsx',
                    webUrl: '/teams/finance'
                });
            });

            it('computes listUrl', () => {
                expect(itemUrlParts.normalizedListUrl).to.equal(undefined);
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
                expect(itemUrlParts.normalizedListUrl).to.be.undefined;
            });

            it('computes webRelativeItemUrl', () => {
                expect(itemUrlParts.webRelativeItemUrl).to.equal('Documents/projects/test.docx');
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

        describe('with full path on same domain', () => {
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

            it('computes path as root of item url', () => {
                expect(itemUrlParts.fullItemUrl).to.equal('https://contoso.sharepoint.com/teams/finance/Shared Documents');
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
