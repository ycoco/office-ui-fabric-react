
import ISpPageContext from '../../interfaces/ISpPageContext';
import UriEncoding from '@ms/odsp-utilities/lib/encoding/UriEncoding';
import ItemUrlHelper, { SiteRelation } from './ItemUrlHelper';

export interface IGuidValue {
    guid: string;
}

export interface IRawValue {
    raw: string;
}

export type IParameterValue = number | boolean | string | IGuidValue | IRawValue;

/**
 * Represents aliased method arguments passed to a method segment of a SharePoint
 * API URL.
 *
 * @export
 * @interface IMethodArguments
 */
export interface IMethodArguments {
    [name: string]: IParameterValue;
}

/**
 * Represents a builder for SharePoint API URLs.
 *
 * @export
 * @interface IApiUrl
 */
export interface IApiUrl {
    /**
     * Appends a segment to the API URL.
     * Use this to select a sub-object from the current context.
     *
     * @param {string} name
     * @returns {this}
     */
    segment(name: string): this;

    /**
     * Appends a series of segments to the URL.
     *
     * @param {...string[]} segments
     * @returns {this}
     *
     * @memberOf IApiUrl
     */
    segments(...segments: string[]): this;

    /**
     * Appends a segment for a method call, accepting aliased parameter inputs.
     *
     * @param {string} name
     * @param {IMethodArguments} parameters
     * @returns {this}
     */
    methodWithAliases(name: string, parameters: IMethodArguments): this;

    /**
     * Appends a segment for a method call, accepting ordered parameter inputs.
     *
     * @param {string} name
     * @param {...IParameterValue[]} parameters
     * @returns {this}
     */
    method(name: string, ...parameters: IParameterValue[]): this;

    /**
     * Appends segments to the URL to create a 'web' context, for the Web
     * which contains the given item or list by URL.
     * Use this method if the target Web URL is not known. Simply supply
     * a URL which is known to be within the intended target web.
     *
     * @param {string} [itemUrl]
     * @returns {this}
     */
    webByItemUrl(itemUrl?: string): this;

    /**
     * Appends segments to the URL to create a 'web' context, for the Web
     * which contains the given web by URL.
     * Use this method only the target Web URL is known.
     *
     * @param {string} [itemUrl]
     * @returns {this}
     */
    webByWebUrl(webUrl?: string): this;

    /**
     * Adds a parameter to the end of the URL, encoding the value as appropriate.
     *
     * @param {string} name
     * @param {IParameterValue} value
     * @returns {this}
     */
    parameter(name: string, value: IParameterValue): this;

    /**
     * Adds a set of parameters to the end of the URL, encoding the valus as appropriate.
     *
     * @param {IMethodArguments} arguments
     * @returns {this}
     *
     * @memberOf IApiUrl
     */
    parameters(parameters: IMethodArguments): this;

    /**
     * Appends an ODATA query parameter, assuming the value is already encoded.
     *
     * @param {string} name
     * @param {string} value
     * @returns {this}
     */
    oDataParameter(name: string, value: string): this;

    /**
     * Appends a raw parameter to the end of the URL as an already-encoding query string.
     *
     * @param {string} queryString
     * @returns {this}
     */
    rawParameter(queryString: string): this;

    /**
     * Produces the final URL as a string.
     *
     * @returns {string}
     */
    toString(): string;
}

export interface IApiUrlHelperParams {
    // Nothing
}

export interface IApiUrlHelperDependencies {
    pageContext: ISpPageContext;
    itemUrlHelper: ItemUrlHelper;
}

/**
 * Component which assists in constructing SharePoint API URLs.
 *
 * @export
 * @class ApiUrlHelper
 *
 * @example
 *  import ApiUrlHelper, { resourceKey as apiUrlHelperKey } from './ApiUrlHelper';
 *  let apiUrlHelper = this.resources.consume(apiUrlHelperKey);
 *
 *  let apiUrl = apiUrlHelper.build()
 *      .webByItemKey(item.key)
 *      .segment('Folders')
 *      .segment('Add');
 *
 *  this._dataRequestor.getData({
 *      url: apiUrl.toString(),
 *      method: 'post',
 *      qosName: 'AddFolder'
 *  }).then(() => {
 *      // Something.
 *  });
 */
export default class ApiUrlHelper {
    private _pageContext: ISpPageContext;
    private _itemUrlHelper: ItemUrlHelper;

    constructor(params: IApiUrlHelperParams, dependencies: IApiUrlHelperDependencies) {
        this._pageContext = dependencies.pageContext;
        this._itemUrlHelper = dependencies.itemUrlHelper;
    }

    /**
     * Starts building a new SharePoint API URL.
     *
     * @returns {IApiUrl}
     */
    public build(): IApiUrl {
        return new ApiUrl({
            itemUrlHelper: this._itemUrlHelper,
            pageContext: this._pageContext
        });
    }

    /**
     * Generates a GetContextWebInformation API call URL based on any input URL against
     * a SharePoint server.
     *
     * @param {string} url
     * @returns {string}
     */
    public contextInfoUrl(fullItemUrl: string): string {
        const layoutsIndex = fullItemUrl.indexOf('/_layouts/');

        let contextInfoRootUrl: string;

        if (layoutsIndex > -1) {
            contextInfoRootUrl = fullItemUrl.substring(0, layoutsIndex);
        } else {
            const lastSegmentIndex = fullItemUrl.lastIndexOf('/');
            const lastExtensionIndex = fullItemUrl.lastIndexOf('.');

            if (lastExtensionIndex > lastSegmentIndex) {
                contextInfoRootUrl = `${fullItemUrl.substring(0, lastExtensionIndex)}_${fullItemUrl.substring(lastExtensionIndex + 1)}`;
            } else {
                contextInfoRootUrl = fullItemUrl;
            }
        }

        return `${contextInfoRootUrl}/_api/contextinfo`;
    }
}

interface IApiUrlParams {
    itemUrlHelper: ItemUrlHelper;
    pageContext: ISpPageContext;
}

interface IQueryParameter {
    name: string;
    serializedValue: string;
}

class ApiUrl implements IApiUrl {
    private _itemUrlHelper: ItemUrlHelper;
    private _pageContext: ISpPageContext;

    private _webUrl: string;
    private _segments: string[];
    private _parameters: IQueryParameter[];
    private _rawParameters: string[];

    private _lastParameterId: number;

    constructor(params: IApiUrlParams) {
        let {
            itemUrlHelper,
            pageContext
        } = params;

        this._itemUrlHelper = itemUrlHelper;
        this._pageContext = pageContext;

        this._segments = [];
        this._parameters = [];
        this._rawParameters = [];

        this._lastParameterId = 0;
    }

    public toString(): string {
        let query: string;

        let querySegments: string[] = [];

        if (this._parameters.length) {
            querySegments.push(this._parameters.map(({
                name,
                serializedValue
            }: IQueryParameter) => `${name}=${serializedValue}`).join('&'));
        }

        querySegments.push(...this._rawParameters);

        if (querySegments.length) {
            query = `?${querySegments.join('&')}`;
        } else {
            query = '';
        }

        let {
            _webUrl: webUrl = this._pageContext.webAbsoluteUrl
        } = this;

        let parts = [webUrl, '_api', ...this._segments];

        return `${parts.join('/')}${query}`;
    }

    public segment(name: string): this {
        this._segments.push(name);

        return this;
    }

    public segments(...segments: string[]): this {
        for (let name of segments) {
            this.segment(name);
        }

        return this;
    }

    public methodWithAliases(name: string, parameters: IMethodArguments) {
        let methodArguments = Object.keys(parameters).map((name: string) => {
            let value = parameters[name];

            return `${name}=${this._autoParameter(value)}`;
        });

        return this.segment(`${name}(${methodArguments.join(',')})`);
    }

    public method(name: string, ...parameters: IParameterValue[]): this {
        let methodArguments = parameters.map((value: IParameterValue) => {
            return this._autoParameter(value);
        });

        return this.segment(`${name}(${methodArguments.join(',')})`);
    }

    public parameter(name: string, value: IParameterValue): this {
        return this._parameter(name, value);
    }

    public parameters(parameters: IMethodArguments): this {
        for (let name of Object.keys(parameters)) {
            let value = parameters[name];

            this.parameter(name, value);
        }

        return this;
    }

    public oDataParameter(name: string, value: string): this {
        return this.parameter(name, {
            raw: value
        });
    }

    public rawParameter(queryString: string): this {
        this._rawParameters.push(queryString);

        return this;
    }

    public webByItemUrl(itemUrl?: string): this {
        let urlParts = this._itemUrlHelper.getUrlParts({
            path: itemUrl
        });

        let {
            siteRelation,
            fullListUrl
        } = urlParts;

        if (siteRelation === SiteRelation.crossSite) {
            this.method('SP.RemoteWeb', fullListUrl);

            this.segment('web');

            return this;
        } else {
            return this.segment('web');
        }
    }

    public webByWebUrl(webUrl?: string): this {
        let urlParts = this._itemUrlHelper.getUrlParts({
            path: webUrl,
            webUrl: webUrl
        });

        let {
            isCrossDomain,
            siteRelation
        } = urlParts;

        if (isCrossDomain || siteRelation === SiteRelation.crossSite) {
            this.method('SP.RemoteWeb', urlParts.fullItemUrl);

            this.segment('web');

            return this;
        } else {
            return this.segment('web');
        }
    }

    private _autoParameter(value: IParameterValue): string {
        let name = `@a${++this._lastParameterId}`;

        this._parameter(name, value);

        return name;
    }

    private _parameter(name: string, value: IParameterValue): this {
        let serializedValue: string;

        if (isGuid(value)) {
            serializedValue = `guid'${value.guid}'`;
        } else if (isRaw(value)) {
            serializedValue = value.raw;
        } else if (typeof value === 'number') {
            serializedValue = `${value}`;
        } else if (typeof value === 'boolean') {
            serializedValue = `${value}`;
        } else {
            serializedValue = `'${UriEncoding.encodeRestUriStringToken(value)}'`;
        }

        this._parameters.push({
            name: name,
            serializedValue: serializedValue
        });

        return this;
    }
}

function isGuid(value: IParameterValue): value is IGuidValue {
    return !!value && typeof value === 'object' && (<IGuidValue>value).guid !== void 0;
}

function isRaw(value: IParameterValue): value is IRawValue {
    return !!value && typeof value === 'object' && (<IRawValue>value).raw !== void 0;
}
