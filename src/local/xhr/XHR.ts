import IXHROptions from './IXHROptions';
import Async from '../async/Async';
import ErrorHelper from '../logging/ErrorHelper';

declare var XDomainRequest: {
    new (): XMLHttpRequest;
};

export default class XHR {
    static EXCEPTION_STATUS = -1;
    static TIMEOUT_STATUS = -2;
    static ABORT_STATUS = -3;
    static DEFAULT_TIMEOUT_MS = 30000;

    private _request: XMLHttpRequest;
    private _completed: boolean;
    private _requestTimeoutInMS: number;
    private _json: string;
    private _url: string;
    private _headers: { [key: string]: string };
    private _successCallback: (xhr: XMLHttpRequest, statusCode: number) => void;
    private _failureCallback: (xhr: XMLHttpRequest, statusCode: number, timeout: boolean) => void;
    private _async: Async;
    private _method: string;
    private _withCredentials: boolean;
    private _needsCors: boolean;

    constructor(options: IXHROptions) {

        this._async = new Async(this);
        this._url = options.url;
        this._requestTimeoutInMS = options.requestTimeoutInMS || XHR.DEFAULT_TIMEOUT_MS;
        this._json = options.json;
        this._headers = options.headers || {};
        this._method = options.method;
        this._withCredentials = options.withCredentials || false;
        this._needsCors = options.needsCors;
    }

    public abort(isCancelled?: boolean) {
        var aborted = this._abortRequest();

        if (aborted && !isCancelled) {
            this._callFailureCallback(this._request, XHR.ABORT_STATUS, false);
        }
    }

    public start(
        successCallback: (xhr: XMLHttpRequest, statusCode: number) => void,
        failureCallback: (xhr: XMLHttpRequest, statusCode: number, timeout: boolean) => void) {

        try {
            this._successCallback = successCallback;
            this._failureCallback = failureCallback;

            this._request = this._getRequest();

            this._async.setTimeout(() => {
                // Check if we havent logged this event already
                if (!this._completed) {
                    this._timeoutCallback();
                }
            }, this._requestTimeoutInMS);

            // Report Qos on the actual qos calls
            this._request.onreadystatechange = () => {
                // Check if we havent logged this event in a timeout
                if (!this._completed) {
                    var DONE = 4; // Default done readystate

                    try {
                        DONE = this._request.DONE || 4;
                    } catch (e) {
                        // IE 9 will throw here if the request was aborted just swallow this
                    }

                    if (this._request.readyState === DONE) {
                        this._requestEndCallback();
                    }
                }
            };

            if (!this._method) {
                this._method = this._json ? 'POST' : 'GET';
            }

            this._request.open(this._method, this._url, true);

            if ("withCredentials" in this._request) {
                this._request.withCredentials = this._withCredentials;
            }

            // Headers have to be set after open is called
            for (var x in this._headers) {
                this._request.setRequestHeader(x, this._headers[x]);
            }

            this._request.send(this._json);
        } catch (e) {
            if (e && e.message && document) {
                // Attach domain to any error for additional debugging
                e.message += ' - ' + document.domain;
            }
            ErrorHelper.log(e);

            // abort the request and set the exception status code
            this._abortRequest();

            this._callFailureCallback(this._request, XHR.EXCEPTION_STATUS, false);
        }
    }

    private _getRequest(): XMLHttpRequest {
        if (!this._needsCors || !window['XDomainRequest']) {
            return new XMLHttpRequest();
        }

        // This is only needed for IE 9 to support CORS requests
        // Note: we can not set headers on XDomainRequest
        let request = new XDomainRequest();
        request.status = 200;
        request.setRequestHeader = () => { /* Intentionally left blank */ };
        request.onprogress = () => { /* Intentionally left blank */ };
        request.ontimeout = () => { /* Intentionally left blank */ };
        request.onload = () => {
            this._requestEndCallback();
        };

        return request;
    }

    private _abortRequest() {
        var actuallyAborted = false;

        if (!this._completed) {
            this._completed = true;

            // Clear the timeout for the request
            this._async.dispose();

            // Cancel the request
            try {
                if (this._request) {
                    this._request.abort();
                }
            } catch (e) {
                // IE 9 will throw here if the request was aborted just swallow this
            }

            actuallyAborted = true;
        }

        return actuallyAborted;
    }

    private _timeoutCallback() {
        if (!this._completed) {
            this._abortRequest();

            this._callFailureCallback(this._request, XHR.TIMEOUT_STATUS, true);
        }
    }

    private _callSuccessCallback(xhr: XMLHttpRequest, statusCode: number) {
        try {
            if (this._successCallback) {
                this._successCallback(xhr, statusCode);
            }
        } catch (e) {
            ErrorHelper.log(e);
        }
    }

    private _callFailureCallback(xhr: XMLHttpRequest, statusCode: number, timeout: boolean) {
        try {
            if (this._failureCallback) {
                this._failureCallback(xhr, statusCode, timeout);
            }
        } catch (e) {
            ErrorHelper.log(e);
        }
    }

    private _requestEndCallback() {
        if (!this._completed) {
            this._completed = true;

            var status = XHR.EXCEPTION_STATUS;

            try {
                // Clear the timeout for the request
                this._async.dispose();

                try {
                    status = this._request.status;
                } catch (e) {
                    // IE 9 will throw here if the request was aborted just swallow this
                }
            } catch (e) {
                status = XHR.EXCEPTION_STATUS;
                ErrorHelper.log(e);
            }

            if (status < 400 && status > 0) {
                this._callSuccessCallback(this._request, status);
            } else {
                this._callFailureCallback(this._request, status, false);
            }
        }
    }
}
