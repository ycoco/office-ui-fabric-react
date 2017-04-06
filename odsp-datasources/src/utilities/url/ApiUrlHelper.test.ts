
import ApiUrlHelper, { IApiUrl } from './ApiUrlHelper';
import ItemUrlHelper from './ItemUrlHelper';
import ISpPageContext from '../../interfaces/ISpPageContext';
import UriEncoding from '@ms/odsp-utilities/lib/encoding/UriEncoding';
import { expect } from 'chai';

const WEB_ROOT = 'https://test/example';
const API_ROOT = `${WEB_ROOT}/_api`;

describe('ApiUrlHelper', () => {
    let apiUrlHelper: ApiUrlHelper;

    let pageContext: ISpPageContext;

    beforeEach(() => {
        pageContext = <any>{
            webAbsoluteUrl: WEB_ROOT,
            listUrl: WEB_ROOT + '/list'
        };

        apiUrlHelper = new ApiUrlHelper({}, {
            pageContext: pageContext,
            itemUrlHelper: new ItemUrlHelper({}, {
                pageContext: pageContext
            })
        });
    });

    describe('#build', () => {
        describe('with default web', () => {
            let apiUrl: IApiUrl;

            beforeEach(() => {
                apiUrl = apiUrlHelper.build();
            });

            it('produces API root', () => {
                expect(apiUrl.toString()).to.equal(API_ROOT);
            });

            describe('#segment', () => {
                it('appends a segment', () => {
                    expect(apiUrl.segment('foo').toString()).to.equal(`${API_ROOT}/foo`);
                });
            });

            describe('#method', () => {
                it('appends an empty method', () => {
                    expect(apiUrl.method('bar').toString()).to.equal(`${API_ROOT}/bar()`);
                });

                it('appends parameters', () => {
                    expect(apiUrl.method('args', true, 'test').toString()).to.equal(`${API_ROOT}/args(@a1,@a2)?@a1=true&@a2='test'`);
                });
            });

            describe('#methodWithAliases', () => {
                it('appends parameters', () => {
                    expect(apiUrl.methodWithAliases('aliases', {
                        'foo': true,
                        'bar': 'test'
                    }).toString()).to.equal(`${API_ROOT}/aliases(foo=@a1,bar=@a2)?@a1=true&@a2='test'`);
                });
            });

            describe('#webByItemUrl', () => {
                it('appends web', () => {
                    expect(apiUrl.webByItemUrl().toString()).to.equal(`${API_ROOT}/web`);
                });

                it('appends remote web', () => {
                    expect(apiUrl.webByItemUrl('https://other/place').toString()).to.equal(`${API_ROOT}/SP.RemoteWeb(@a1)/GetListByServerRelativeUrl(@a2)/ParentWeb?@a1='${UriEncoding.encodeRestUriStringToken('https://other/place')}'&@a2='${UriEncoding.encodeRestUriStringToken('/place')}'`);
                });
            });
        });
    });

    describe('#contextInfoUrl', () => {
        it('converts a _layouts URL', () => {
            expect(apiUrlHelper.contextInfoUrl('https://test/a/b/c/_layouts/15/test.aspx')).to.equal('https://test/a/b/c/_api/contextinfo');
        });

        it('converts a document URL', () => {
            expect(apiUrlHelper.contextInfoUrl('https://test/a/b/c/test.xlsx')).to.equal('https://test/a/b/c/test_xlsx/_api/contextinfo');
        });
    });
});
