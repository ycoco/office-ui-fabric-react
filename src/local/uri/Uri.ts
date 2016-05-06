import ObjectUtil from 'odsp-utilities/object/ObjectUtil';
import StringHelper from 'odsp-utilities/string/StringHelper';

/////////////////////////////
// This file is more clean of all unneeded pollutants. It only contains the minimum amount of code required for someone to use the URI class.
// You should think twice before adding anything else into this file because you will be causing unneeded bloat from someone else.
/////////////////////////////

export interface IUriOptions {
    pathCaseInsensitive?: boolean;
    queryCaseInsensitive?: boolean;
}

export interface IUriOutputOptions {
    doNotPercentEncodeHost?: boolean;
}

export enum UriPartial {
    /** The scheme segment of the URI */
    scheme = 0,
    /** The scheme and authority segments of the URI */
    authority = 1,
    /** The scheme, authority, and path segments of the URI */
    path = 2,
    /** The scheme, authority, path, and query segments of the URI */
    query = 3
}

/**
 * Partial port of groove\Misc\URI.cpp, which was based on RFC2396 and RFC3986 (http://www.ietf.org/rfc/rfc2396.txt).
 * There are a few differences between this implementation and the RFC:
 *  - Implementation does not support parameters (we don't use them, and partial implementation was incorrect)
 *  - Implementation supports some relative URIs at a glance but more investigation required
 *
 *   foo://example.com:8042/over/there?name=ferret#nose
 *   \_/   \______________/\_________/ \_________/ \__/
 *    |           |            |            |        |
 * scheme     authority       path        query   fragment
 *
 * Possible improvements:
 *  - Support path parameters
 *  - Fully support and test relative URLs based on RFC
 *  - Allow changing/removing remaining URI components (i.e. user, host, port, parameters)
 *  - URI.equals could allow ?foo=1&bar=2 equals ?bar=2&foo=1
 *  - URI.parseURI should have better error handling rather than just setting it as path
 *  - URI.getQueryAsObject should have better error handling for query of "a=1&a=2"
 */
export default class Uri {
    private static DELIMITERS = ";/?:@&=$,";
    private static AUTHORITY_TERMINATORS = "/?";

    private _queryCaseInsensitive: boolean = false;
    private _pathCaseInsensitive: boolean = false;
    // All of these are decoded (if relevant) unless specified as encoded.
    private _scheme = "";
    private _user = "";
    private _host = "";
    private _port = "";
    private _path = "";
    private _pathSegments = [];
    private _pathEncoded = "";
    private _query = {};
    private _fragment = "";

    constructor(uriString: string, options?: IUriOptions) {
        if (Boolean(options)) {
            this._queryCaseInsensitive = Boolean(options.queryCaseInsensitive);
            this._pathCaseInsensitive = Boolean(options.pathCaseInsensitive);
        }
        this._parseURI(uriString);
    }

    static concatenate(...uriParts: string[]): string {
        let result = '';
        for (let i = 0; i < uriParts.length; i++) {
            let part = uriParts[i];
            if (i > 0) {
                part = Uri.ensureNoPrecedingSlash(part);
            }
            if (i < uriParts.length - 1) {
                part = Uri.ensureTrailingSlash(part);
            }
            result += part;
        }
        return result;
    }

    static ensureNoPrecedingSlash(part: string): string {
        return part[0] === "/" ? part.substr(1) : part;
    }

    static ensureTrailingSlash(part: string): string {
        return part[part.length - 1] !== "/" ? (part + "/") : part;
    }

    public getScheme(): string {
        return this._scheme;
    }

    public setScheme(scheme: string) {
       this._scheme = scheme;
    }

    public getAuthority(): string {
        return this._getAuthority(false);
    }

    public setAuthority(authority: string) {
        this._parseAuthority(authority);
    }

    public getUser(): string {
        return this._user;
    }

    public getHost(): string {
        return this._host;
    }

    public getPort(): string {
        return this._port;
    }

    public getPath(trimTrailingSlash?: boolean): string {
        let retPath = this._path;

        if (Boolean(trimTrailingSlash)) {
            // If the last character is a slash
            if (retPath !== null && retPath.lastIndexOf("/") === (retPath.length - 1)) {
                retPath = retPath.slice(0, -1); //trim last character
            }
        }

        return retPath;
    }

    /**
     * Returns a string containing the leftmost portion of the URI string, ending with the portion specified by part
     */
    public getLeftPart(part: UriPartial): string {
        let ret: string = this._scheme + "://";   // default value is UriPartial.scheme

        if (part === UriPartial.authority) {
            ret += this.getAuthority();
        }
        if (part === UriPartial.path) {
            ret += this.getPath();
        }
        if (part === UriPartial.query) {
            ret += this.getQuery();
        }

        return ret;
    }

    public setPath(path: string) {
        if (path && path[0] !== "/") {
            path = "/" + path;
        }
        this._parsePath(path);
    }

    public getPathSegments(): string[] {
        return this._pathSegments;
    }

    public getLastPathSegment(): string {
        if (this._pathSegments.length === 0) {
            return "";
        }
        return this._pathSegments[this._pathSegments.length - 1];
    }

    public getQuery(encoded?: boolean): string {
        return this._serializeQuery(encoded);
    }

    /**
     * Query is not well-defined but is commonly formatted as key=value and delimited with & or ;
     * (http://www.w3.org/TR/REC-html40/appendix/notes.html#h-B.2.2)
     *  - URI with query "a=1&b=2" or "a=1;b=2" will return {a: "1", b: "2"}
     *  - Mixed-mode will also work: "a=1&b=2;c=3" will return {a: "1", b: "2", c: "3"}
     *  - Assumes that parameters will be unique (i.e. "a=1&a=2" is not allowed and will produce unexpected results)
     */
    public setQuery(query: string) {
        let queryObject = this._deserializeQuery(query);
        this.setQueryFromObject(queryObject);
    }

    public getQueryAsObject(): any {
        return this._query;
    }

    public setQueryFromObject(queryObj: any) {
        this._query = {};
        for (let queryKey in queryObj) {
            if (queryObj.hasOwnProperty(queryKey)) {
                this.setQueryParameter(queryKey, queryObj[queryKey]);
            }
        }
    }

    public getQueryParameter(queryKey: string): string {
        let ret: string = null;
        let query = this._query;
        if (this._queryCaseInsensitive) {
            queryKey = queryKey.toLowerCase();
            for (let key in query) {
                if (this._query.hasOwnProperty(key) && key.toLowerCase() === queryKey) {
                    ret = query[key];
                }
            }
        } else {
            ret = query[queryKey];
        }

        return ret || null;
    }

    /**
     * Adds query parameter to the end if queryKey does not exist, or
     * overwrites existing query value if queryKey already exists.
     */
    public setQueryParameter(queryKey: string, queryValue: string, ignoreEmptyValues: boolean = true) {
        let queryKeyDecoded = this._decodeQueryString(queryKey);
        let queryValueDecoded = this._decodeQueryString(queryValue);

        // there is no point adding undefined or modifying existing values to undefined or null.
        if (!!queryValueDecoded || ignoreEmptyValues) {
            this._query[queryKeyDecoded] = queryValueDecoded;
        }
    }

    public removeQueryParameter(queryKey: string) {
        let queryKeyDecoded = this._decodeQueryString(queryKey);
        delete this._query[queryKeyDecoded];
    }

    public getFragment(): string {
        return this._fragment;
    }

    public setFragment(fragment: string) {
        if (fragment[0] === "#") {
            fragment = fragment.substring(1);
        }
        // Treat the fragment as a query string (decode + as space) because we pass in
        // query parameters using the fragment on page load.
        this._fragment = this._decodeQueryString(fragment);
    }

    /**
     * Does a strict equality check of URIs (including same query parameters
     * in the same order, and most comparisons case-sensitive).
     * According to RFC3986: scheme and host should be case-insensitive.
     * Note: This does not follow RFC2616's URI Comparison since it is not HTTP-specific.
     *
     * KNOWN ISSUE: Depending on your definition of "incorrect," this could return
     * incorrect results for URI parts that get decoded.
     * For example: http://somewhere/my%2fpath and http://somewhere/my/path
     * will compare as equal because the comparisons are done to decoded versions.
     */
    public equals(uri: Uri): boolean {
        return StringHelper.equalsCaseInsensitive(this._scheme, uri.getScheme()) &&
            this._user === uri.getUser() &&
            StringHelper.equalsCaseInsensitive(this._host, uri.getHost()) &&
            this._port === uri.getPort() &&
            this._fragment === uri.getFragment() &&
            this._equalsCaseAppropriate(this.getPath(/*trimTrailingSlash*/true), uri.getPath(true), this._pathCaseInsensitive) &&
            this._equalsCaseAppropriate(this.getQuery(), uri.getQuery(), this._queryCaseInsensitive);
    }

    /**
     * Does an equivalence check of two URIs. Checks to see if the URIs are
     * equivalent, but they may not be exact! Strings are compared case
     * insensitive and query parameters can be in any order.
     *
     * KNOWN ISSUE: Depending on your definition of "incorrect," this could return
     * incorrect results for URI parts that get decoded.
     * For example: http://somewhere/my%2fpath and http://somewhere/my/path
     * will compare as equal because the comparisons are done to decoded versions.
     */
    public equivalent(uri: Uri): boolean {
        let queryToLower = (queryObj: any) => {
            let newQuery = {};
            for (let key in queryObj) {
                if (queryObj.hasOwnProperty(key)) {
                    newQuery[key.toLowerCase()] = queryObj[key].toLowerCase();
                }
            }
            return newQuery;
        };

        return StringHelper.equalsCaseInsensitive(this._scheme, uri.getScheme()) &&
            StringHelper.equalsCaseInsensitive(this._user, uri.getUser()) &&
            StringHelper.equalsCaseInsensitive(this._host, uri.getHost()) &&
            StringHelper.equalsCaseInsensitive(this._port, uri.getPort()) &&
            StringHelper.equalsCaseInsensitive(this.getPath(/*trimTrailingSlash*/true), uri.getPath(true)) &&
            ObjectUtil.deepCompare(queryToLower(this.getQueryAsObject()), queryToLower(uri.getQueryAsObject())) &&
            StringHelper.equalsCaseInsensitive(this._fragment, uri.getFragment());
    }

    /**
     * Note that this returns the URL encoded/escaped while the getXXX() methods
     * for the individual components return the unescaped strings. Returning a
     * concatenation of the decoded components would change the semantics of the
     * URL. See section 2.4.2 of RFC 2396 (http://www.ietf.org/rfc/rfc2396.txt).
     *
     * Use doNotPercentEncodeHost to indicate that the output should not have a
     * percent-encoded host, such as when passing to the url parameter of
     * XmlHttpRequest.open(). Section 3.2.2 of RFC 2396 only allows alphanumeric
     * characters and hyphen in the host of a URL, so percent-encoded hosts are
     * not allowed. While section 3.2.2 of RFC 3986 does not restrict the host
     * character set anymore, not all browsers can handle a percent-encoded host
     * - DNS lookup fails.  But, they will convert the unencoded Unicode to the
     * IDNA encoding (punycode), so leaving the host as-is in this case is preferred.
     */
    public toString(outputOptions?: IUriOutputOptions): string {
        return this._getStringInternal(/*encoded*/true, outputOptions);
    }

    /**
     * This method should be used to obtain a string for display purposes only,
     * because as mentioned above, a decoded URL may have different semantics than
     * the encoded version.
     */
    public getDecodedStringForDisplay(): string {
        return this._getStringInternal(/*encoded*/false);
    }

    /*
     * Input URI of "foo://user:pass@host.com/alpha/beta/gamma/delta;p;a;r;a;m;s?q=1&u=2&e=3&r=4&y=5#fragment"
     * would return "foo://user:pass@host.com/alpha/beta/gamma/delta;p;a;r;a;m;s";
     */
    public getStringWithoutQueryAndFragment(): string {
        return this._getStringWithoutQueryAndFragmentInternal(/*encoded=*/true);
    }

    private _equalsCaseAppropriate(a: string, b: string, isCaseInsensitive: boolean): boolean {
        if (isCaseInsensitive) {
            return StringHelper.equalsCaseInsensitive(a, b);
        }
        return a === b;
    }

    private _getStringInternal(encoded: boolean, outputOptions?: IUriOutputOptions): string {
        let ret = this._getStringWithoutQueryAndFragmentInternal(encoded, outputOptions);
        let query = this.getQuery(encoded);
        if (query) {
            ret += "?" + query;
        }

        if (this._fragment) {
            ret += "#" + (encoded ? encodeURIComponent(this._fragment) : this._fragment);
        }

        return ret;
    }

    private _getStringWithoutQueryAndFragmentInternal(encoded: boolean, outputOptions?: IUriOutputOptions): string {
        let ret = "";

        if (this._scheme) {
            ret += (encoded ? encodeURIComponent(this._scheme) : this._scheme) + ":";
        }

        // Authority includes user, host, and port
        let authority = this._getAuthority(/*encoded=*/encoded, outputOptions);
        if (authority) {
            ret += "//" + authority;
        }

        if (this._pathEncoded) {
            ret += (encoded ? this._pathEncoded : this._path);
        }

        return ret;
    }

    private _deserializeQuery(queryStr: string): any {
        let queryObj = {};

        if (queryStr.indexOf("?") === 0) {
            queryStr = queryStr.substring(1);
        }

        let queryParts = queryStr.split(/[;&]+/);
        for (let queryIdx = 0; queryIdx < queryParts.length; queryIdx++) {
            let queryPart = queryParts[queryIdx];
            let queryPartSegments = queryPart.split("=");

            if (queryPartSegments.length > 0) {
                let queryKey = queryPartSegments[0];

                if (queryKey.length > 0) {
                    let queryValue = queryPartSegments.slice(1).join('=');

                    queryObj[queryKey] = queryValue;
                }
            }
        }

        return queryObj;
    }

    private _serializeQuery(encoded?: boolean): string {
        encoded = Boolean(encoded);
        let queryStr = "";
        for (let queryKey in this._query) {
            if (this._query.hasOwnProperty(queryKey)) {
                let key = queryKey;
                let value = this._query[queryKey];

                if (encoded) {
                    key = encodeURIComponent(key);
                    value = encodeURIComponent(value);
                }

                if (value === null || value === "") {
                    queryStr += key + "=&";
                } else {
                    queryStr += key + "=" + value + "&";
                }
            }
        }
        if (queryStr !== "") {
            queryStr = queryStr.slice(0, -1); //trim extra & at the end
        }
        return queryStr;
    }

    private _parseURI(uriString: string) {
        let remainingString = uriString;

        // Find fragment
        let fragmentBeginPos = remainingString.indexOf("#");
        if (fragmentBeginPos >= 0) {
            let fragment = remainingString.substring(fragmentBeginPos + 1);
            this.setFragment(fragment);
            remainingString = remainingString.substring(0, fragmentBeginPos);   //remove fragment
        }

        // Find scheme
        let schemeEndPos: number = StringHelper.findOneOf(remainingString, Uri.DELIMITERS);
        if (schemeEndPos >= 0) {
            let firstColonPos = remainingString.indexOf(":");
            if (firstColonPos >= 0 && firstColonPos === schemeEndPos) {
                this.setScheme(remainingString.substring(0, schemeEndPos));
                remainingString = remainingString.substring(schemeEndPos + 1);  //remove scheme
            }
        } else {
            this.setPath(remainingString);
            return;
        }


        // Find authority
        let authority = "";
        let doubleSlashPos = remainingString.indexOf("//");
        if (doubleSlashPos >= 0 && doubleSlashPos === 0) {
            remainingString = remainingString.substring(2); //skip the //

            let authorityEndPos = StringHelper.findOneOf(remainingString, Uri.AUTHORITY_TERMINATORS);
            if (authorityEndPos >= 0) {
                authority = remainingString.substring(0, authorityEndPos);
                remainingString = remainingString.substring(authorityEndPos);   //remove authority
            } else {
                authority = remainingString;
                remainingString = null;
            }

            this.setAuthority(authority);

            if (!remainingString) {
                this.setPath("");
                return;
            }
        }

        // Find query
        let queryBeginPos = remainingString.indexOf("?");
        if (queryBeginPos >= 0) {
            this.setQuery(remainingString.substring(queryBeginPos + 1));
            remainingString = remainingString.substring(0, queryBeginPos);
        }

        this.setPath(remainingString);
    }

    private _parseAuthority(authority: string) {
        this._host = authority;

        let userNameEndPos = authority.lastIndexOf("@");
        if (userNameEndPos >= 0) {
            this._host = this._host.substring(userNameEndPos + 1);
        }

        let hostPortSeparatorPos = this._host.indexOf(":");
        if (userNameEndPos < 0 && hostPortSeparatorPos < 0) {
            return;
        }

        let authorityComponents = authority;
        if (userNameEndPos < 0) {
            this._host = authorityComponents;
        } else {
            this._user = authorityComponents.substring(0, userNameEndPos);
            this._host = authorityComponents.substring(userNameEndPos + 1);
        }

        if (hostPortSeparatorPos >= 0) {
            this._port = this._host.substring(hostPortSeparatorPos + 1);
            this._host = this._host.substring(0, hostPortSeparatorPos);
        }

        this._user = decodeURIComponent(this._user);
        this._host = decodeURIComponent(this._host);
    }

    private _parsePath(remainingString: string) {
        this._path = decodeURIComponent(remainingString);
        this._pathSegments = [];
        this._pathEncoded = remainingString;

        // We have to split the path BEFORE decoding so that encoded / characters
        // don't get interpreted as path separators.
        let encodedPathSegments = remainingString.split("/");
        for (let i = 0; i < encodedPathSegments.length; ++i) {
            let decodedSegment = decodeURIComponent(encodedPathSegments[i]);
            this._pathSegments[i] = decodedSegment;
        }

        // Trims first/last element if empty
        if (this._pathSegments[0] === "") {
            this._pathSegments.shift(); // remove first element
        }
        if (this._pathSegments[this._pathSegments.length - 1] === "") {
            this._pathSegments.pop(); // remove last element
        }
    }

    private _getAuthority(encoded: boolean, outputOptions: IUriOutputOptions = {}): string {
        // Note that if encoded is false, doNotPercentEncodeHost doesn't matter - the whole URI (including host) will not be encoded.
        let doNotPercentEncodeHost = outputOptions && outputOptions.doNotPercentEncodeHost;

        let authority = "";

        let user: string;
        let host: string;
        let port: string;

        if (encoded) {
            // While technically a reserved character, ':' is commonly used in the
            // username to denote username:password, so we special case not encoding
            // the first occurence of this character.
            user = encodeURIComponent(this._user).replace("%3A", ":");

            if (doNotPercentEncodeHost) {
                host = this._host;
            } else {
                host = encodeURIComponent(this._host);
            }
            port = encodeURIComponent(this._port);
        } else {
            user = this._user;
            host = this._host;
            port = this._port;
        }

        if (user !== "") {
            authority = user + "@";
        }
        if (this._host !== "") {
            authority += host;
        }
        if (this._port !== "") {
            authority += ":" + port;
        }

        return authority;
    }

    private _decodeQueryString(component: string): string {
        // For query strings only, "+" is a valid substitute for a space, but decodeURIComponent
        // doesn't take this into account. (Note that replace("+", " ") only replaces one +.)
        let result = component;
        try {
            result = decodeURIComponent(component.replace(/\+/g, " "));
        } catch (e) {
            // %1 (or anything with a % that is not a result of calling encodeURIComponent)
            // would make decodeURIComponent throw a URI malformed exception.
            // Return the original value in these cases.
        }
        return result;
    }
}
