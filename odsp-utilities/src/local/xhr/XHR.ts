import IXHROptions from './IXHROptions';
import Async from '../async/Async';
import ErrorHelper from '../logging/ErrorHelper';
import ObjectUtil from '../object/ObjectUtil';

declare const XDomainRequest: {
    new (): XMLHttpRequest;
};

/**
 * Special status values based on states of the XHR instance.
 */
export const enum XHRStatus {
    blocked = 0,
    exception = -1,
    timeout = -2,
    abort = -3
}

export default class XHR {
    public static readonly DEFAULT_TIMEOUT_MS = 30000;

    private readonly _requestTimeoutInMS: number;
    private readonly _postData: string | Blob;
    private readonly _url: string;
    private readonly _headers: { [key: string]: string };
    private readonly _progressCallback: (event: ProgressEvent) => void;
    private readonly _uploadProgressCallback: (event: ProgressEvent) => void;
    private readonly _async: Async;
    private readonly _method: string;
    private readonly _withCredentials: boolean;
    private readonly _needsCors: boolean;

    private _successCallback: (xhr: XMLHttpRequest, statusCode: number) => void;
    private _failureCallback: (xhr: XMLHttpRequest, statusCode: number, timeout: boolean) => void;
    private _request: XMLHttpRequest;
    private _completed: boolean;

    constructor(options: IXHROptions) {
        this._async = new Async(this);

        const {
            url,
            requestTimeoutInMS = XHR.DEFAULT_TIMEOUT_MS,
            json: postData,
            headers = {},
            withCredentials = false,
            needsCors = false,
            onProgress: progressCallback,
            onUploadProgress: uploadProgressCallback
        } = options;

        const {
            method = postData ? 'POST' : 'GET'
        } = options;

        this._url = url;
        this._requestTimeoutInMS = requestTimeoutInMS;
        this._postData = postData;
        this._headers = headers;
        this._method = method;
        this._withCredentials = withCredentials;
        this._needsCors = needsCors;
        this._progressCallback = progressCallback;
        this._uploadProgressCallback = uploadProgressCallback;
    }

    public abort(isCancelled?: boolean) {
        var aborted = this._abortRequest();

        if (aborted && !isCancelled) {
            this._callFailureCallback(this._request, XHRStatus.abort, false);
        }
    }

    public start(
        successCallback: (xhr: XMLHttpRequest, statusCode: number) => void,
        failureCallback: (xhr: XMLHttpRequest, statusCode: number, timeout: boolean) => void) {

        this._successCallback = successCallback;
        this._failureCallback = failureCallback;

        const {
            _method: method,
            _headers: headers
        } = this;

        try {
            this._request = this._getRequest();

            const {
                _progressCallback: progressCallback,
                _uploadProgressCallback: uploadProgressCallback,
                _request: request
            } = this;

            if (progressCallback) {
                request.onprogress = (event: ProgressEvent) => {
                    try {
                        progressCallback(event);
                    } catch (error) {
                        ErrorHelper.logError(error);
                    }
                };
            }

            if (uploadProgressCallback) {
                request.upload.onprogress = (event: ProgressEvent) => {
                    try {
                        uploadProgressCallback(event);
                    } catch (error) {
                        ErrorHelper.logError(error);
                    }
                };
            }

            this._async.setTimeout(() => {
                // Check if we havent logged this event already
                if (!this._completed) {
                    this._timeoutCallback();
                }
            }, this._requestTimeoutInMS);

            // Report Qos on the actual qos calls
            request.onreadystatechange = () => {
                // Check if we havent logged this event in a timeout
                if (!this._completed) {
                    let DONE = 4; // Default done readystate

                    try {
                        DONE = request.DONE || 4;
                    } catch (e) {
                        // IE 9 will throw here if the request was aborted just swallow this
                    }

                    if (request.readyState === DONE) {
                        this._requestEndCallback();
                    }
                }
            };

            request.open(method, this._url, true);

            if ("withCredentials" in request) {
                request.withCredentials = this._withCredentials;
            }

            // Headers have to be set after open is called
            for (const x in headers) {
                request.setRequestHeader(x, headers[x]);
            }

            request.send(this._postData);
        } catch (error) {
            ErrorHelper.logError(error, {
                origin: location ? location.origin : 'unknown',
                withCredentials: this._withCredentials,
                requestUrl: this._url,
                headers: ObjectUtil.safeSerialize(headers),
                method: method
            });

            // abort the request and set the exception status code
            this._abortRequest();

            this._callFailureCallback(this._request, XHRStatus.exception, false);
        }
    }

    private _getRequest(): XMLHttpRequest {
        if (!this._needsCors || !window['XDomainRequest']) {
            return new XMLHttpRequest();
        }

        // This is only needed for IE 9 to support CORS requests
        // Note: we can not set headers on XDomainRequest
        const request = new XDomainRequest();
        request.setRequestHeader = () => { /* Intentionally left blank */ };
        request.onprogress = () => { /* Intentionally left blank */ };
        request.ontimeout = () => { /* Intentionally left blank */ };
        request.onload = () => {
            this._requestEndCallback();
        };

        return request;
    }

    private _abortRequest() {
        let actuallyAborted = false;

        if (!this._completed) {
            this._completed = true;

            // Clear the timeout for the request
            this._async.dispose();

            // Cancel the request
            try {
                if (this._request) {
                    this._request.abort();
                }
            } catch (error) {
                // IE 9 will throw here if the request was aborted just swallow this
            }

            actuallyAborted = true;
        }

        return actuallyAborted;
    }

    private _timeoutCallback() {
        if (!this._completed) {
            this._abortRequest();

            this._callFailureCallback(this._request, XHRStatus.timeout, true);
        }
    }

    private _callSuccessCallback(xhr: XMLHttpRequest, statusCode: number) {
        try {
            if (this._successCallback) {
                this._successCallback(xhr, statusCode);
            }
        } catch (error) {
            ErrorHelper.log(error);
        }
    }

    private _callFailureCallback(xhr: XMLHttpRequest, statusCode: number, timeout: boolean) {
        try {
            if (this._failureCallback) {
                this._failureCallback(xhr, statusCode, timeout);
            }
        } catch (error) {
            ErrorHelper.log(error);
        }
    }

    private _requestEndCallback() {
        if (!this._completed) {
            this._completed = true;

            let status = XHRStatus.exception;

            try {
                // Clear the timeout for the request
                this._async.dispose();

                try {
                    status = this._request.status;
                } catch (error) {
                    // IE 9 will throw here if the request was aborted just swallow this
                }
            } catch (error) {
                status = XHRStatus.exception;

                ErrorHelper.log(error);
            }

            if (status < 400 && status > 0) {
                this._callSuccessCallback(this._request, status);
            } else {
                this._callFailureCallback(this._request, status, false);
            }
        }
    }
}
