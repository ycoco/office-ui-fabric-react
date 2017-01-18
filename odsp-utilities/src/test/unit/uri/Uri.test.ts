import chai = require('chai');
var assert = chai.assert;

import Uri, { IUriOptions } from '../../../odsp-utilities/uri/Uri';

describe('Uri', () => {
    function test(method: string, url: string, expected: any, { message, options, methodParam }: any) {
        var uri = new Uri(url, options);
        assert.equal(uri[method](methodParam), expected, message);
    }

    function testDeep(method: string, url: string, expected: any, { message, options, methodParam }: any) {
        var uri = new Uri(url, options);
        assert.deepEqual(uri[method](methodParam), expected, message);
    }

    it('parses', () => {
        var uri = new Uri('http://test');
        assert.isNotNull(uri);
    });

    it('concatenates properly', () => {
        var uriStr = 'https://contoso.sharepoint.com/_layouts/15/group.aspx';
        var uriPart1 = 'https://contoso.sharepoint.com/';
        var uriPart2 = '/_layouts/15/group.aspx';

        assert.equal(Uri.concatenate(uriPart1, uriPart2), uriStr, 'Uri was not concatenated properly');
    });

    it('ensures no preceding slash properly', () => {
        var uriPart2 = '/_layouts/15/group.aspx';
        assert.equal(Uri.ensureNoPrecedingSlash(uriPart2), '_layouts/15/group.aspx', 'Preceding slash was not removed');
    });

    it('ensures trailing slash properly', () => {
        var uriPart1 = 'https://contoso.sharepoint.com';
        assert.equal(Uri.ensureTrailingSlash(uriPart1), 'https://contoso.sharepoint.com/', 'Trailing slash was not ensured');
    });

    it('returns scheme properly', () => {
        var testScheme = (url: string, scheme: string) => test('getScheme', url, scheme, {});

        testScheme('http://test', 'http');
        testScheme('https://test', 'https');
        testScheme('a://somewhere', 'a');
        testScheme('a+b://somewhere', 'a+b');
        testScheme('a1+-.://somewhere', 'a1+-.'); // is technically valid
    });

    it('returns authority properly', () => {
        var testAuthority = (url: string, authority: string) => test('getAuthority', url, authority, {});

        testAuthority('http://somewhere', 'somewhere');
        testAuthority('http://www.live.com', 'www.live.com');
        testAuthority('http://user@live.com:80/aaa/bbb/?c=d#foo', 'user@live.com:80');
        testAuthority('http://a1%20%2f-._~!$&\'()*+,;:=@msft-my.spoppe.com:9001/aaa', 'a1 /-._~!$&\'()*+,;:=@msft-my.spoppe.com:9001');
    });

    it('returns user properly', () => {
        var testUser = (url: string, user: string) => test('getUser', url, user, {});

        testUser('http://onedrive.live.com', '');
        testUser('http://username@somewhere', 'username');
        testUser('http://a1%20%2f%2520-._~!$&\'()*+,;:=@msft-my.spoppe.com:9001/aaa', 'a1 /%20-._~!$&\'()*+,;:=');
    });

    it('returns host properly', () => {
        var testHost = (url: string, host: string) => test('getHost', url, host, {});

        testHost('http://live.com', 'live.com');
        testHost('http://www.live.com', 'www.live.com');
        testHost('http://onedrive.live.com', 'onedrive.live.com');
        testHost('http://onedrive.live.com/', 'onedrive.live.com');
        testHost('http://onedrive.live.com:80/somewhere', 'onedrive.live.com');
        testHost('http://onedrive.live.com/some/path?foo=bar#somewhere', 'onedrive.live.com');
        testHost('http://someone@somewhere', 'somewhere');
        testHost('http://someone@192.168.0.0:8080/whatever', '192.168.0.0');
        testHost('http://a1%20%2f%2520-._~!$&\'()*+,;:=@msft-my.spoppe.com:9001/aaa', 'msft-my.spoppe.com');
    });

    it('returns port properly', () => {
        var testPort = (url: string, port: string) => test('getPort', url, port, {});

        testPort('http://onedrive.live.com', '');
        testPort('http://onedrive.live.com:8/', '8');
        testPort('http://someone@somewhere:9001?foo=bar', '9001');
        testPort('http://a1%20%2f%2520-._~!$&\'()*+,;:=()@msft-my.spoppe.com:9001/aaa', '9001');
    });

    it('returns path properly', () => {
        var testPath = (url: string, path: string, trimTrailingSlash?: boolean) => {
            test('getPath', url, path, { methodParam: trimTrailingSlash });
        };

        testPath('http://somewhere', '');
        testPath('http://somewhere/', '/');
        testPath('http://somewhere/', '', true);
        testPath('http://somewhere?a=path/to/something', '');
        testPath('http://onedrive.live.com/somewhere', '/somewhere');
        testPath('http://onedrive.live.com/somewhere/', '/somewhere/');
        testPath('http://onedrive.live.com/a/b/', '/a/b/');
        testPath('http://onedrive.live.com/a/b/', '/a/b', true);
        testPath('http://onedrive.live.com/a1%20%2520-._~!$&\'()*+,;=/:@%20%2f%20/place', '/a1 %20-._~!$&\'()*+,;=/:@ / /place');
        testPath('http://onedrive.live.com/some/path?foo=bar#somewhere', '/some/path');
    });

    it('returns path segments properly', () => {
        var testPath = (url: string, paths: string[], message?: string) => testDeep('getPathSegments', url, paths, { message: message });

        testPath('http://somewhere', []);
        testPath('http://somewhere/', []);
        testPath('http://somewhere?a=path/to/something', []);
        testPath('http://onedrive.live.com/somewhere', ['somewhere']);
        testPath('http://onedrive.live.com/somewhere/', ['somewhere']);
        testPath('http://onedrive.live.com/a/b/', ['a', 'b']);
        testPath('http://onedrive.live.com/a1%20%2520-._~!$&\'()*+,=/:@%20%2f%20/place',
            ['a1 %20-._~!$&\'()*+,=', ':@ / ', 'place'],
            'possible over-decoding issue');
        testPath('http://onedrive.live.com/some/path?foo=bar#somewhere', ['some', 'path']);
    });

    it('properly interprets query', () => {
        var testQuery = (url: string, query: { [key: string]: string }, message?: string) => {
            testDeep('getQueryAsObject', url, query, { message: message });
        };

        testQuery('http://somewhere', {});
        testQuery('http://somewhere/?foo', { foo: '' });
        testQuery('http://somewhere?foo=bar', { foo: 'bar' });
        testQuery('http://somewhere/?foo=bar', { foo: 'bar' });
        testQuery('http://somewhere/?foo=%23bar#hashtaghashtag', { foo: '#bar' });
        testQuery('http://somewhere/?foo=%25%2520', { foo: '%%20' }, 'possible over-decoding issue');
        testQuery('http://somewhere/something?foo=bar&a=b&c=d', { foo: 'bar', a: 'b', c: 'd' });
        testQuery('http://somewhere/something?foo=bar;a=b;c=d', { foo: 'bar', a: 'b', c: 'd' });
        testQuery('http://somewhere/something?foo=bar;a=b&c=d', { foo: 'bar', a: 'b', c: 'd' });
        testQuery('http://onedrive.live.com/?id=%2fmy%20folder%20%2f', { id: '/my folder /' }, 'characters not percent-decoded');
        testQuery('http://onedrive.live.com/?id=my+folder+name', { id: 'my folder name' }, '+ not decoded to space');
        testQuery('http://onedrive.live.com/?id=my+folder%20name', { id: 'my folder name' });
        testQuery('http://onedrive.live.com/?my%20param=thevalue', { 'my param': 'thevalue' });
    });

    it('properly interprets fragment', () => {
        var testFragment = (url: string, fragment: string) => test('getFragment', url, fragment, {});

        testFragment('http://somewhere', '');
        testFragment('http://somewhere?foo=bar', '');
        testFragment('http://somewhere#foo', 'foo');
        testFragment('http://somewhere/#foo', 'foo');
        testFragment('http://somewhere/?foo=%23bar#hashtaghashtag', 'hashtaghashtag');
        testFragment('http://somewhere/something#%25%2520', '%%20');
        testFragment('http://onedrive.live.com/aaa/bbb#id=%2fmy%20folder%20%2f', 'id=/my folder /');
        testFragment('http://onedrive.live.com/#id=my+folder+name', 'id=my folder name');
        testFragment('http://onedrive.live.com/#id=my+folder%20name', 'id=my folder name');
        testFragment('http://onedrive.live.com/#my%20param=thevalue', 'my param=thevalue');
    });

    it('checks equality correctly', () => {
        var testEqual = (url1: string, url2: string, equal: boolean, message?: string, options?: IUriOptions) => {
            test('equals', url1, equal, { methodParam: new Uri(url2), message: message, options: options });
        };

        // Commented tests are for encoding, where it's unclear what the "proper" behavior is.
        testEqual('http://onedrive.live.com', 'HTTP://ONEDRIVE.live.COM', true, 'host and scheme comparison should be case-insensitive');
        testEqual('https://somewhere', 'http://somewhere', false, 'check scheme comparison');
        // testEqual('http://user%3b@somewhere', 'http://user;@somewhere', false, 'check user encoding');
        testEqual('http://user@somewhere', 'http://USER@somewhere', false, 'user comparison should be case-sensitive');
        testEqual('http://somewhere:80', 'http://somewhere:81', false, 'check port comparison');
        testEqual('http://somewhere#aaa', 'http://somewhere#AAA', false, 'fragment comparison should be case-sensitive');
        // testEqual('http://somewhere#a%2f', 'http://somewhere#a/', false, 'check fragment encoding');
        testEqual('http://somewhere/aaa/bbb/ccc/', 'http://somewhere/aaa/bbb/ccc', true, 'check trim trailing slash for path');
        // testEqual('http://somewhere/aaa%2fbbb', 'http://somewhere/aaa/bbb', false, 'check path encoding');
        testEqual('http://somewhere/aaa/BBB', 'http://somewhere/aaa/bbb', false, 'path comparison should be case-sensitive');
        testEqual('http://somewhere/aaa/BBB', 'http://somewhere/aaa/bbb', true, 'path comparison should respect pathCaseInsensitive', { pathCaseInsensitive: true });
        testEqual('http://somewhere?a=b&c=d', 'http://somewhere?c=d&b=a', false, 'query parameter order should matter');
        // testEqual('http://somewhere?foo=%2f', 'http://somewhere?foo=/', false, 'check query encoding');
        testEqual('http://somewhere?A=b&c=D', 'http://somewhere?a=b&c=d', false, 'query comparison should be case-sensitive');
        testEqual('http://somewhere?A=b&c=D', 'http://somewhere?a=b&c=d', true, 'query comparison should respect queryCaseInsensitive', { queryCaseInsensitive: true });
    });

    it('checks equivalence correctly', () => {
        var testEquiv = (url1: string, url2: string, equal: boolean, message?: string, options?: IUriOptions) => {
            test('equivalent', url1, equal, { methodParam: new Uri(url2), message: message });
        };

        // Commented tests are for encoding, where it's unclear what the "proper" behavior is.
        testEquiv('http://onedrive.live.com', 'HTTP://ONEDRIVE.live.COM', true, 'host and scheme comparison should be case-insensitive');
        testEquiv('https://somewhere', 'http://somewhere', false, 'check scheme comparison');
        // testEquiv('http://user%3b@somewhere', 'http://user;@somewhere', false, 'check user encoding');
        testEquiv('http://user@somewhere', 'http://USER@somewhere', true, 'user comparison should be case-insensitive');
        testEquiv('http://somewhere:80', 'http://somewhere:81', false, 'check port comparison');
        testEquiv('http://somewhere#aaa', 'http://somewhere#AAA', true, 'fragment comparison should be case-insensitive');
        // testEquiv('http://somewhere#a%2f', 'http://somewhere#a/', false, 'check fragment encoding');
        testEquiv('http://somewhere/aaa/bbb/ccc/', 'http://somewhere/aaa/bbb/ccc', true, 'check trim trailing slash for path');
        // testEquiv('http://somewhere/aaa%2fbbb', 'http://somewhere/aaa/bbb', false, 'check path encoding');
        testEquiv('http://somewhere/aaa/BBB', 'http://somewhere/aaa/bbb', true, 'path comparison should be case-insensitive');
        testEquiv('http://somewhere?a=b&c=d', 'http://somewhere?c=d&a=b', true, 'query parameter order should not matter');
        // testEquiv('http://somewhere?foo=%2f', 'http://somewhere?foo=/', false, 'check query encoding');
        testEquiv('http://somewhere?A=b&c=D', 'http://somewhere?a=b&c=d', true, 'query comparison should be case-insensitive');
    });

    it('converts to string correctly', () => {
        var testString = (url: string, message?: string) => {
            var uri = new Uri(url);
            // We ignore case here because encodeURIComponent seems to capitalize hex codes,
            // and hex codes are interpreted the same regardless of case.
            assert.equal(uri.toString().toLowerCase(), url.toLowerCase());
        };

        testString('http://user@onedrive.live.com:80/aaa/bbb/c?foo=bar#hashtag');
        testString('http://user%3b@somewhere', 'check user encoding');
        testString('http://somewhere#a%2f', 'check fragment encoding');
        testString('http://somewhere/aaa%2fbbb', 'check path encoding');
        testString('http://somewhere?foo=%2f', 'check query encoding');
    });

    it('converts to decoded string correctly', () => {
        var testString = (url: string, result: string, message?: string) => test('getDecodedStringForDisplay', url, result, { message: message });

        testString('http://user@onedrive.live.com:80/aaa/bbb/c?foo=bar#hashtag', 'http://user@onedrive.live.com:80/aaa/bbb/c?foo=bar#hashtag');
        testString('http://user%3b@somewhere', 'http://user;@somewhere', 'check user encoding');
        testString('http://somewhere#a%2f', 'http://somewhere#a/', 'check fragment encoding');
        testString('http://somewhere/aaa%2fbbb', 'http://somewhere/aaa/bbb', 'check path encoding');
        testString('http://somewhere?foo=%2f', 'http://somewhere?foo=/', 'check query encoding');
    });

    it('gets string without query and fragment', () => {
        var testString = (url: string, result: string) => test('getStringWithoutQueryAndFragment', url, result, {});

        testString('http://onedrive.live.com/a/b/c', 'http://onedrive.live.com/a/b/c');
        testString('http://onedrive.live.com/a/b/c?foo=bar#hashtag', 'http://onedrive.live.com/a/b/c');
        testString('http://somewhere?foo=bar', 'http://somewhere');
        testString('http://somewhere#foo=bar', 'http://somewhere');
    });

    it('does not throw URI malformed exception for query values with percent signs', () => {
        let uri = new Uri('http://test');
        let specialQueryValue = "%1";
        uri.setQueryParameter("key", specialQueryValue);
        assert.equal(uri.toString(), "http://test?key=" + encodeURIComponent(specialQueryValue));
    });
});