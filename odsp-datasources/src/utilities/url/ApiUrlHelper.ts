
import ISpPageContext from '../../interfaces/ISpPageContext';
import UriEncoding from '@ms/odsp-utilities/lib/encoding/UriEncoding';
import { ItemUrlHelper, SiteRelation, IItemUrlParts, IGetUrlPartsOptions } from './ItemUrlHelper';

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
     * which contains the given item, list, or web by URL.
     * Supply as many parts of the URL as are known, so that the correct web route
     * may be selected.
     *
     * @param {IGetUrlPartsOptions} [options] 
     * @returns {this} 
     *
     * @memberOf IApiUrl
     */
    webByUrl(options?: IGetUrlPartsOptions): this;

    /**
     * Appends segments to the URL to create a 'web' context, for the web
     * determined by parts extracted from an `ItemUrlHelper`.
     * Use this method instead of `webByUrl` if there is already an `IItemUrlParts`
     * object available when using an `ItemUrlHelper`.
     *
     * @param {IItemUrlParts} urlParts 
     * @returns {this} 
     *
     * @memberOf IApiUrl
     */
    webByItemUrl(urlParts: IItemUrlParts): this;

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
    apiUrlType?: new () => IApiUrl;
}

/**
 * Implementation of an extendable SharePoint API URL. Method on this class mutate the underlying object and return the same object back to the caller.
 */
export class ApiUrl implements IApiUrl {
    private _itemUrlHelper: ItemUrlHelper;
    private _pageContext: ISpPageContext;

    private _webUrl: string;
    private _segments: string[];
    private _parameters: IQueryParameter[];
    private _rawParameters: string[];

    private _lastParameterId: number;

    constructor(params: {}, dependencies: IApiUrlDependencies) {
        this._itemUrlHelper = dependencies.itemUrlHelper;
        this._pageContext = dependencies.pageContext;

        this._segments = [];
        this._parameters = [];
        this._rawParameters = [];

        this._lastParameterId = 0;
    }

    public toString(): string {
        const querySegments: string[] = [];

        if (this._parameters.length) {
            querySegments.push(this._parameters.map(({
                name,
                serializedValue
            }: IQueryParameter) => `${name}=${serializedValue}`).join('&'));
        }

        querySegments.push(...this._rawParameters);

        let query: string;

        if (querySegments.length) {
            query = `?${querySegments.join('&')}`;
        } else {
            query = '';
        }

        const {
            _webUrl: webUrl = this._pageContext.webAbsoluteUrl
        } = this;

        const parts = [webUrl, '_api', ...this._segments];

        return `${parts.join('/')}${query}`;
    }

    public segment(name: string): this {
        this._segments.push(name);

        return this;
    }

    public segments(...segments: string[]): this {
        for (const name of segments) {
            this.segment(name);
        }

        return this;
    }

    public methodWithAliases(name: string, parameters: IMethodArguments) {
        const methodArguments = Object.keys(parameters).map((name: string) => {
            const value = parameters[name];

            return `${name}=${this._autoParameter(value)}`;
        });

        return this.segment(`${name}(${methodArguments.join(',')})`);
    }

    public method(name: string, ...parameters: IParameterValue[]): this {
        const methodArguments = parameters.map((value: IParameterValue) => {
            return this._autoParameter(value);
        });

        return this.segment(`${name}(${methodArguments.join(',')})`);
    }

    public parameter(name: string, value: IParameterValue): this {
        return this._parameter(name, value);
    }

    public parameters(parameters: IMethodArguments): this {
        for (const name of Object.keys(parameters)) {
            const value = parameters[name];

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

    public webByUrl(options?: IGetUrlPartsOptions): this {
        return this.webByItemUrl(this._itemUrlHelper.getUrlParts(options));
    }

    public webByItemUrl(urlParts: IItemUrlParts): this {
        const {
            siteRelation,
            isCrossDomain,
            fullItemUrl
        } = urlParts;

        if (isCrossDomain || siteRelation === SiteRelation.crossSite) {
            this.method('SP.RemoteWeb', fullItemUrl);
        }

        return this.segment('web');
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
export class ApiUrlHelper {
    private _apiUrlType: new () => IApiUrl;

    constructor(params: IApiUrlHelperParams, dependencies: IApiUrlHelperDependencies) {
        const {
            itemUrlHelper,
            pageContext
        } = dependencies;

        const {
            apiUrlType = class extends ApiUrl {
            constructor() {
                super({}, {
                    itemUrlHelper: itemUrlHelper,
                    pageContext: pageContext
                })
            }
        }
        } = dependencies;

        this._apiUrlType = apiUrlType;
    }

    /**
     * Starts building a new SharePoint API URL.
     *
     * @returns {IApiUrl}
     */
    public build(): IApiUrl {
        return new this._apiUrlType();
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

interface IQueryParameter {
    readonly name: string;
    readonly serializedValue: string;
}

export interface IApiUrlDependencies {
    readonly itemUrlHelper: ItemUrlHelper;
    readonly pageContext: ISpPageContext;
}

function isGuid(value: IParameterValue): value is IGuidValue {
    return !!value && typeof value === 'object' && (<IGuidValue>value).guid !== void 0;
}

function isRaw(value: IParameterValue): value is IRawValue {
    return !!value && typeof value === 'object' && (<IRawValue>value).raw !== void 0;
}
