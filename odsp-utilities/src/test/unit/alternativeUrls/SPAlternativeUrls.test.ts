import chai = require("chai");
import * as SPAlternativeUrls from '../../../odsp-utilities/alternativeUrls/SPAlternativeUrls';

const assert: Chai.AssertStatic = chai.assert;

describe('SPAlternativeUrls tests', () => {

    const urlTable: SPAlternativeUrls.IAlternativeUrlTable = {
        'primaryUrl1': 'alternativeUrl1',
        'primaryUrl2': 'alternativeUrl2'
    };

    const urlTable2: SPAlternativeUrls.IAlternativeUrlTable = {
        'primaryUrl1': 'alternativeUrl1',
        'primaryUrl3': 'alternativeUrl3'
    };

    const urlTableLoc: SPAlternativeUrls.IAlternativeUrlTable = {
        '/путь1/file.jpg': 'альтернативный путь1/file.jpg'
    };

    const urlTableEmpty: SPAlternativeUrls.IAlternativeUrlTable = {};

    const urlTableWithExpiration: SPAlternativeUrls.IAlternativeUrlTable = {
        'validUrl1':
        'https://privatecdn.sharepointonlin.com/contoso.sharepoint.com/site/lib/image.jpg?_eat_=4131127098_yyyyyyyyyyyyyyy',
        'validUrl2':
        'https://privatecdn.sharepointonlin.com/contoso.sharepoint.com/site/lib/image.jpg?_eat_=3131127098',
        'invalidUrl1':
        'https://privatecdn.sharepointonlin.com/contoso.sharepoint.com/site/lib/image.jpg?_eat_=1480375309_yyyyyyyyyyyyyyy',
        'invalidUrl2':
        'https://privatecdn.sharepointonlin.com/contoso.sharepoint.com/site/lib/image.jpg?_eat_=1480375310_yyyyyyyyyy&foo=bar'
    };

    it('Can initialize empty url map', (done: MochaDone) => {
        SPAlternativeUrls.updateMap(urlTableEmpty);
        assert.isTrue(Object.keys(SPAlternativeUrls.getUrlTable()).length === 0);
        done();
    });

    it('Can initialize url map', (done: MochaDone) => {
        SPAlternativeUrls.updateMap(urlTable);
        assert.isTrue(Object.keys(SPAlternativeUrls.getUrlTable()).length === 2);
        done();
    });

    it('Can add empty url map', (done: MochaDone) => {
        SPAlternativeUrls.updateMap(urlTableEmpty);
        assert.isTrue(Object.keys(SPAlternativeUrls.getUrlTable()).length === 2);
        done();
    });

    /* tslint:disable:no-null-keyword */
    it('Can add null url map', (done: MochaDone) => {
        SPAlternativeUrls.updateMap(null);
        assert.isTrue(Object.keys(SPAlternativeUrls.getUrlTable()).length === 2);
        done();
    });
    /* tslint:enable:no-null-keyword */

    it('Can add undefined url map', (done: MochaDone) => {
        SPAlternativeUrls.updateMap(undefined);
        assert.isTrue(Object.keys(SPAlternativeUrls.getUrlTable()).length === 2);
        done();
    });

    it('Can re-add same url map', (done: MochaDone) => {
        SPAlternativeUrls.updateMap(urlTable);
        assert.isTrue(Object.keys(SPAlternativeUrls.getUrlTable()).length === 2);
        done();
    });

    it('Can re-add modified url map', (done: MochaDone) => {
        SPAlternativeUrls.updateMap(urlTable2);
        assert.isTrue(Object.keys(SPAlternativeUrls.getUrlTable()).length === 3);
        for (const key in urlTable) {
            assert.isTrue(SPAlternativeUrls.tryGetAlternativeUrl(key) === urlTable[key]);
        }
        for (const key in urlTable2) {
            assert.isTrue(SPAlternativeUrls.tryGetAlternativeUrl(key) === urlTable2[key]);
        }
        done();
    });

    it('Can add localized url map', (done: MochaDone) => {
        SPAlternativeUrls.updateMap(urlTableLoc);
        assert.isTrue(Object.keys(SPAlternativeUrls.getUrlTable()).length === 4);
        for (const key in urlTableLoc) {
            assert.isTrue(SPAlternativeUrls.tryGetAlternativeUrl(key) === urlTableLoc[key]);
        }
        done();
    });

    it('Can expire URLs in the map', (done: MochaDone) => {
        SPAlternativeUrls.updateMap(urlTableWithExpiration);
        assert.isTrue(Object.keys(SPAlternativeUrls.getUrlTable()).length === 8);
        assert.isString(SPAlternativeUrls.tryGetAlternativeUrl('validUrl1'));
        assert.isString(SPAlternativeUrls.tryGetAlternativeUrl('validUrl2'));
        assert.isUndefined(SPAlternativeUrls.tryGetAlternativeUrl('invalidUrl1'));
        assert.isUndefined(SPAlternativeUrls.tryGetAlternativeUrl('invalidUrl2'));
        assert.isTrue(Object.keys(SPAlternativeUrls.getUrlTable()).length === 6);
        done();
    });

    it('Can query for the userphoto URL', (done: MochaDone) => {
        let userPhotoCdnUrlBase: string = '/_layouts/15/userphoto.aspx?';

        assert.equal(SPAlternativeUrls.getUserPhotoUrl(),
            userPhotoCdnUrlBase + 'size=S&accountname=');
        assert.equal(SPAlternativeUrls.getUserPhotoUrl(undefined, SPAlternativeUrls.UserPhotoSize.Medium),
            userPhotoCdnUrlBase + 'size=M&accountname=');
        assert.equal(SPAlternativeUrls.getUserPhotoUrl('accountname1'),
            userPhotoCdnUrlBase + 'size=S&accountname=accountname1');
        assert.equal(SPAlternativeUrls.getUserPhotoUrl('accountname1', SPAlternativeUrls.UserPhotoSize.Medium),
            userPhotoCdnUrlBase + 'size=M&accountname=accountname1');

        userPhotoCdnUrlBase = 'https://p.sp.com/c.sp.com/_userprofile/userphoto.jpg?_eat_=1&_oat_=2';
        SPAlternativeUrls.updateMap({ 'UserPhotoAspx': userPhotoCdnUrlBase });

        assert.equal(SPAlternativeUrls.getUserPhotoUrl('accountname1', SPAlternativeUrls.UserPhotoSize.Medium),
            userPhotoCdnUrlBase + '&size=M&accountname=accountname1');
        done();
    });
});
