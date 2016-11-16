import chai = require('chai');
var assert = chai.assert;

import NavigationHelper = require('../../../../odsp-shared/utilities/navigation/NavigationHelper');

describe('NavigationHelper', () => {
    it('replaces a query string at the beginning', () => {
        var input = "http://onedrive.com/?foo=bar&1=2&a=b";
        assert.equal("http://onedrive.com/?foo=baz&1=2&a=b", NavigationHelper.replaceQuery(input, "foo", "baz"));
    });

    it('replaces a query string in the middle', () => {
        var input = "http://onedrive.com/?foo=bar&1=2&a=b";
        assert.equal("http://onedrive.com/?foo=bar&1=3&a=b", NavigationHelper.replaceQuery(input, "1", "3"));
    });

    it('replaces a query string at the end', () => {
        var input = "http://onedrive.com/?foo=bar&1=2&a=b";
        assert.equal("http://onedrive.com/?foo=bar&1=2&a=c", NavigationHelper.replaceQuery(input, "a", "c"));
    });

    it('no-ops when no query matches', () => {
        var input = "http://onedrive.com/?foo=bar&1=2&a=b";
        assert.equal("http://onedrive.com/?foo=bar&1=2&a=b", NavigationHelper.replaceQuery(input, "doesnot", "exist"));
    });
});