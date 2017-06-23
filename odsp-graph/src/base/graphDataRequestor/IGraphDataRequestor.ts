// OneDrive:IgnoreCodeCoverage

import Promise from '@ms/odsp-utilities/lib/async/Promise';

export interface IQosData {
    [key: string]: string | number | boolean;
}

export interface IGraphDataRequestorSendOptions<T> {
    /**
     * The 'name' of the API being invoked, for QoS tracking.
     *
     * @type {string}
     */
    apiName: string;
    /**
     * The URL for the call. If relative, this is relative to the current Vroom API root.
     *
     * @type {string}
     */
    path: string;
    /**
     * The request method.
     *
     * @type {string}
     */
    requestType?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    /**
     * Serialized body for the request.
     *
     * @type {(string | Blob)}
     */
    postData?: string | Blob;
    /**
     * Optional additional headers for the request.
     *
     * @type {{ [key: string]: string; }}
     */
    headers?: { [key: string]: string; };
    disableLogging?: boolean;
    timeout?: number;
    /**
     * An override for the response parsing logic.
     * Only use this if JSON or Blob responses are not expected.
     *
     * @memberof IVroomDataRequestorSendOptions
     */
    parseResponse?: (request: XMLHttpRequest) => T;
    onProgress?: (event: ProgressEvent) => void;
    onUploadProgress?: (event: ProgressEvent) => void;
    /**
     * Extra data to include in the QoS event for the request.
     *
     * @type {IQosData}
     */
    qosExtraData?: IQosData;
    /**
     * The version of the API to use when making the call.
     * Default is 'v2.0'.
     *
     * @type {('v2.0' | 'v2.1')}
     */
    apiVersion?: 'v2.0' | 'v2.1';
    /**
     * Whether or not the target URL will need to provide an access token
     * obtained for the user session.
     * Default is true.
     *
     * @type {boolean}
     */
    needsAuthorization?: boolean;
    /**
     * Whether or not to supply the access token in the headers instead of the querystring.
     * Default is false.
     *
     * @type {boolean}
     */
    useAuthorizationHeaders?: boolean;
}

export interface IGraphDataRequestor {
    /**
     * Sends a request using the Vroom API call pattern and parses the result.
     *
     * @template T The interface for the parsed object expected in the response.
     * @param {IVroomDataRequestorSendOptions<T>} options The options for the request.
     * @returns {Promise<T>} A promise for the response, parsed from JSON.
     */
    send<T>(options: IGraphDataRequestorSendOptions<T>): Promise<T>;
}

export default IGraphDataRequestor;