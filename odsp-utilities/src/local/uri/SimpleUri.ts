
export const enum UriFormat {
    absolute,
    relative,
    serverRelative
}

/**
 * Simplified implementation of a URI parser which does not attempt decoding of segments,
 * handling of query strings, or separation of the fragment.
 *
 * This class makes several assumptions about the format of input URLs:
 * - Absolute URLs begin with '<scheme>://<host>'
 * - Relative URLs being with '/'
 * - URLs never have a trailing '/'
 *
 * @class SimpleUri
 */
export class SimpleUri {
    private _value: string;

    /**
     * Determines the format of the URL.
     *
     * @readonly
     * @type {UriFormat}
     *
     * @example
     *  expect(new SimpleUri('/').format).to.equal(UriFormat.serverRelative);
     * @example
     *  expect(new SimpleUri('https://test').format).to.equal(UriFormat.absolute);
     * @example
     *  expact(new SimpleUri('test').format).to.equal(UriFormat.relative);
     */
    public get format(): UriFormat {
        return this._getFormat();
    }

    /**
     * Gets the authority component of the URI, if the URI is fully-qualified.
     * The authority is formatted as
     * '<scheme>://<host>'
     * and never has a trailing '/'.
     *
     * @readonly
     * @type {string}
     *
     * @example
     *  expect(new SimpleUri('/').authority).to.equal('');
     * @example
     *  expect(new SimpleUri('https://test').authority).to.equal('https://test');
     * @example
     *  expect(new SimpleUri('https://test/').authority).to.equal('https://test');
     * @example
     *  expect(new SimpleUri('/bad/scheme://').authority).to.equal('');
     */
    public get authority(): string {
        return this._getAuthority();
    }

    /**
     * Gets the domain of the URI, which is everything in the authority after
     * the scheme and protocol.
     *
     * @readonly
     * @type {string}
     * @memberOf SimpleUri
     *
     * @example
     *  expect(new SimpleUri('/').domain).to.equal('');
     * @example
     *  expect(new SimpleUri('https://test').domain).to.equal('test');
     * @example
     *  expect(new SimpleUri('https://test/').domain).to.equal('test');
     */
    public get domain(): string {
        return this._getDomain();
    }

    /**
     * Gets the path of the URI, which is everything after the authority.
     * If the URI has no authority, this returns the entire URI.
     * If there is only an authority, this returns ''.
     *
     * @readonly
     * @type {string}
     *
     * @example
     *  expect(new SimpleUri('https://test').path).to.equal('');
     * @example
     *  expect(new SimpleUri('/').path).to.equal('/');
     * @example
     *  expect(new SimpleUri('https://test/').path).to.equal('/');
     * @example
     *  expect(new SimpleUri('/bad/scheme://').path).to.equal('/bad/scheme://');
     */
    public get path(): string {
        return this._getPath();
    }

    /**
     * Gets the segments of the path.
     * If there is no path, this is an empty array.
     * Otherwise, this returns all segments after the first '/'.
     *
     * @readonly
     * @type {string[]}
     *
     * @example
     *  expect(new SimpleUri('https://test').segments).to.deep.equal([]);
     * @example
     *  expect(new SimpleUri('/').segments).to.deep.equal(['']);
     * @example
     *  expect(new SimpleUri('/foo').segments).to.deep.equal(['foo']);
     * @example
     *  expect(new SimpleUri('/foo/').segments).to.deep.equal(['foo', '']);
     * @example
     *  expect(new SimpleUri('/foo/bar').segments).to.deep.equal(['foo', 'bar']);
     * @example
     *  expect(new SimpleUri('/bad/scheme://').segments).to.deep.equal(['bad', 'scheme:', '', '']);
     */
    public get segments(): string[] {
        return this._getSegments();
    }

    /**
     * Creates an instance of SimpleUri.
     *
     * @param {string} value
     */
    constructor(value: string = '') {
        this._value = value;
    }

    private _getFormat(): UriFormat {
        let format: UriFormat;

        if (this._getAuthority()) {
            format = UriFormat.absolute;
        } else {
            let path = this._getPath();

            if (path.indexOf('/') === 0) {
                format = UriFormat.serverRelative;
            } else {
                format = UriFormat.relative;
            }
        }

        this._getFormat = () => format;

        return format;
    }

    private _getAuthority(): string {
        let authority: string;

        let endIndexOfRootDelimeter = this._getEndIndexOfRootDelimeter();

        if (endIndexOfRootDelimeter > -1) {
            let indexOfNextSegment = this._value.indexOf('/', endIndexOfRootDelimeter);

            if (indexOfNextSegment > -1) {
                authority = this._value.substring(0, indexOfNextSegment);
            } else {
                authority = this._value;
            }
        } else {
            authority = '';
        }

        this._getAuthority = () => authority;

        return authority;
    }

    private _getDomain(): string {
        let domain: string;

        let authority = this._getAuthority();

        if (authority) {
            const endIndexOfRootDelimeter = this._getEndIndexOfRootDelimeter();

            domain = authority.substring(endIndexOfRootDelimeter);
        } else {
            domain = '';
        }

        this._getDomain = () => domain;

        return domain;
    }

    private _getPath(): string {
        let path: string;

        let endIndexOfSchemeDelimeter = this._getEndIndexOfRootDelimeter();

        if (endIndexOfSchemeDelimeter > -1) {
            let indexOfNextSegment = this._value.indexOf('/', endIndexOfSchemeDelimeter);

            if (indexOfNextSegment > -1) {
                path = this._value.substring(indexOfNextSegment);
            } else {
                path = '';
            }
        } else {
            path = this._value;
        }

        this._getPath = () => path;

        return path;
    }

    private _getSegments(): string[] {
        let path = this._getPath();

        let segments = path.split('/');

        this._getSegments = () => segments;

        return segments;
    }

    private _getEndIndexOfRootDelimeter(): number {
        let endIndexOfRootDelimeter: number;

        let rootDelimeter = '//';

        let indexOfRootDelimeter = this._value.indexOf(rootDelimeter);

        let indexOfPathDelimeter = this._value.indexOf('/');

        if (indexOfRootDelimeter > -1 && indexOfRootDelimeter <= indexOfPathDelimeter) {
            endIndexOfRootDelimeter = indexOfRootDelimeter + rootDelimeter.length;
        } else {
            endIndexOfRootDelimeter = -1;
        }

        this._getEndIndexOfRootDelimeter = () => endIndexOfRootDelimeter;

        return endIndexOfRootDelimeter;
    }
}

export default SimpleUri;
