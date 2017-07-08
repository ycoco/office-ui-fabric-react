
import ServerData from './ServerData';
import UriEncoding from '@ms/odsp-utilities/lib/encoding/UriEncoding';
import Uri from '@ms/odsp-utilities/lib/uri/Uri';
import APICallPerformanceData from '@ms/odsp-utilities/lib/logging/rumone/APICallPerformanceData';
import RUMOneLogger from '@ms/odsp-utilities/lib/logging/rumone/RUMOneLogger';
import EventGroup from '@ms/odsp-utilities/lib/events/EventGroup';
import Component, { IComponentParams } from '@ms/odsp-utilities/lib/component/Component';

export interface IFormDigest {
    /**
     * The time at which digest information was provided on the page.
     * If present, this may allow the connection to avoid requesting digest information
     * before making the request.
     */
    updateFormDigestPageLoaded?: Date;
    /** The form digest value used to validate postback requests. */
    formDigestValue?: string;
    /**
     * The time interval in seconds to the form digest expiration.
     * To be used in conjunction with the updateFormDigestPageLoaded to compute the actual expiration time.
     */
    formDigestTimeoutSeconds?: number;
}

export interface IServerConnectionParams extends IComponentParams {
    /** If provided, this will be used for requests, and _alwaysGetDigest will be set to true. */
    webAbsoluteUrl?: string;
    /** Only used if webAbsoluteUrl is not provided. */
    webServerRelativeUrl?: string;
    needsRequestDigest?: boolean;
    /** Deprecated. Use webAbsoluteUrl. */
    webUrl?: string;
    formDigest?: IFormDigest;
}

export interface IGetServerDataFromUrlOptions {
    url: string;
    successCallback: (serverData: ServerData) => any;
    failureCallback: (serverData: ServerData) => any;
    uploadProgressCallback?: (event: ProgressEvent) => void;
    additionalPostData?: string | Blob;
    /** Whether this is a REST request. Default true. */
    isRest?: boolean;
    method: string;
    additionalHeaders?: {
        [key: string]: string;
    };
    contentType?: string;
    noRedirect?: boolean;
    responseType?: string;
    needsRequestDigest?: boolean;
}

type ExtendedXHR = XMLHttpRequest & {
    isCancelled?: boolean;
};

export default class ServerConnection extends Component {
    // Number of seconds subtracted from the request digest interval
    // to compensate for the client-server delay
    private static INTERVAL_ADJUST = 10;
    private static _formDigests: { [webServerRelativeUrl: string]: IFormDigest } = {};

    private _events: EventGroup;
    private _currentRequest: ExtendedXHR;
    private _needsRequestDigest: boolean;
    private _requestCanaryForAuth: boolean;
    private _alwaysGetDigest: boolean;
    private _webAbsoluteUrl: string;
    private _webServerRelativeUrl: string;

    private static _isXhrAborted(xhr: any): boolean {
        try {
            // status isn't necessarily valid unless the readyState is true.
            if (xhr.readyState === 4 && (typeof (xhr.status) === 'undefined' || xhr.status === 0)) {
                return true;
            }
            if (xhr.isCancelled) {
                return true;
            }
        } catch (e) {
            return true;
        }
        return false;
    }

    private static _isValidFormDigest(formDigest: IFormDigest): boolean {
        return formDigest && formDigest.updateFormDigestPageLoaded &&
            (Date.now() - formDigest.updateFormDigestPageLoaded.getTime()) < formDigest.formDigestTimeoutSeconds * 1000 /*convert to ms*/;
    }

    constructor(params: IServerConnectionParams = {}) {
        super(params);

        this._events = new (this.scope.attached(EventGroup))(this);

        // If the absolute URL is provided, it will be used for most requests.
        let webAbsoluteUrl = params.webAbsoluteUrl || params.webUrl;
        // The server-relative URL is used for caching request digests.
        // If it's not provided, try and calculate it from the absolute URL.
        this._webServerRelativeUrl = params.webServerRelativeUrl || (webAbsoluteUrl && new Uri(webAbsoluteUrl).getPath());
        if (this._webServerRelativeUrl === '/') {
            this._webServerRelativeUrl = '';
        }

        if (webAbsoluteUrl) {
            this._webAbsoluteUrl = webAbsoluteUrl;
            this._alwaysGetDigest = true;
        } else {
            this._alwaysGetDigest = false;
        }

        this._needsRequestDigest = params.needsRequestDigest !== false;
        if (this._needsRequestDigest) {
            this._tryLoadDigest(params.formDigest);
        }
        this._requestCanaryForAuth = false;
    }

    public abort(): void {
        if (this._currentRequest) {
            // Add a custom field to this request object so we can pass the message to the OnReadyStateChange function that THIS specific XHR has been canceled!
            //  It's unclear to me is this is really needed.  Some documentation I have ready states 'Calling abort resets the object; the onreadystatechange
            //  event handler is removed, and readyState is changed to 0 (uninitialized).'  If this is the case, then the onreadystatechange should never be
            //  called and if it is then the state of the request is set to 0, which I handle below.
            // For completeness only I leave this here.  (Belt and suspenders).
            let request = this._currentRequest;
            request.isCancelled = true;

            // Now abort this XHR
            request.abort();
            this._currentRequest = undefined;
        }
    }

    public isRequestActive(): boolean {
        return !!this._currentRequest;
    }

    public getServerDataFromUrl(options: IGetServerDataFromUrlOptions): void {
        let {
            url: strUrl,
            successCallback,
            failureCallback,
            uploadProgressCallback,
            additionalPostData,
            isRest: fRest = true,
            method = 'POST',
            additionalHeaders: addtionHeaders,
            contentType,
            noRedirect,
            responseType,
            needsRequestDigest = this._needsRequestDigest
        } = options;

        let startTime: string = new Date().toISOString();
        let req: ExtendedXHR = new XMLHttpRequest();
        req.open(method, strUrl, true);
        if (responseType) {
            req.responseType = <any>responseType;
        }

        // Set the Content Type
        if (contentType) {
            req.setRequestHeader('Content-Type', contentType);
        } else {
            if (fRest) {
                req.setRequestHeader('Content-Type', 'application/json;odata=verbose');
            } else {
                req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
            }
        }

        let acceptHeaderSpecified: boolean = false;
        if (addtionHeaders) {
            for (let headerKey in addtionHeaders) {
                if (headerKey) {
                    req.setRequestHeader(headerKey, addtionHeaders[headerKey]);
                    if (headerKey.toLowerCase() === 'accept') {
                        acceptHeaderSpecified = true;
                    }
                }
            }
        }
        if (!acceptHeaderSpecified) {
            req.setRequestHeader('accept', 'application/json;odata=verbose');
        }

        // Remember this request so we can tell if we have a request in flight and so we can cancel it if needed.
        this._currentRequest = req;
        let onRequestDigestReady = (requestDigest?: string): void => {
            if (needsRequestDigest && requestDigest) {
                req.setRequestHeader('x-requestdigest', requestDigest);
            }

            this._events.on(req, 'readystatechange', () => {
                this._onReadyStateChange(req, strUrl, successCallback, failureCallback, noRedirect, startTime);
            });

            if (uploadProgressCallback && req.upload) {
                this._events.on(req.upload, 'progress', (event: ProgressEvent) => {
                    uploadProgressCallback(event);
                });
            }

            req.send(additionalPostData);
        };

        if (needsRequestDigest) {
            this._ensureRequestDigest(onRequestDigestReady, failureCallback);
        } else {
            onRequestDigestReady();
        }
    }

    private _ensureRequestDigest(callback: (requestDigest: string) => void, failureCallback?: (serverData: ServerData) => void): void {
        // if requestDigest is available and not expired then use it, otherwise get a new one
        let currentDigest = ServerConnection._formDigests[this._webServerRelativeUrl];
        if (!this._alwaysGetDigest && ServerConnection._isValidFormDigest(currentDigest)) {
            callback(currentDigest.formDigestValue);
        } else {
            this._ensureRequestDigestWorker(callback, failureCallback);
        }
    }

    private _ensureRequestDigestWorker(callback?: (requestDigest: string) => void, failureCallback?: (serverData: ServerData) => void): void {
        let onDataSuccess = (serverData: ServerData) => {
            const responseText = serverData.getResponseText();
            const jsonObj = JSON.parse(<string>responseText);
            const requestDigest = jsonObj.d.GetContextWebInformation;

            ServerConnection._formDigests[this._webServerRelativeUrl] = {
                formDigestValue: requestDigest.FormDigestValue,
                formDigestTimeoutSeconds: requestDigest.FormDigestTimeoutSeconds - ServerConnection.INTERVAL_ADJUST,
                updateFormDigestPageLoaded: new Date()
            };

            if (callback) {
                callback(ServerConnection._formDigests[this._webServerRelativeUrl].formDigestValue);
            }
        };

        let onDataError = (serverData: ServerData) => {
            if (callback) {
                callback(undefined);
            } else if (failureCallback) {
                failureCallback(serverData);
            }
        };

        let serverConnection = new ServerConnection({
            needsRequestDigest: false,
            webServerRelativeUrl: this._webServerRelativeUrl,
            webUrl: undefined
        });
        if (!callback) {
            // no callback only means we're doing auth only request.
            serverConnection._requestCanaryForAuth = true;
        }

        let webUrl = this._webAbsoluteUrl || this._webServerRelativeUrl;
        if (typeof webUrl === 'string') {
            serverConnection.getServerDataFromUrl({
                url: Uri.concatenate(webUrl, '/_api/contextinfo'),
                successCallback: onDataSuccess,
                failureCallback: onDataError,
                method: 'POST',
                noRedirect: !!failureCallback
            });
        } else if (failureCallback) {
            failureCallback(undefined);
        }
    }

    private _onReadyStateChange(
        req: XMLHttpRequest,
        strUrl: string,
        successCallback: (ev: any) => any,
        failureCallback: (ev?: ServerData) => any,
        noRedirect: boolean,
        startTime: string) {
        // Don't do anything unless the State is 'Ready' and this request has not yet been aborted.
        if (req.readyState !== 4) {
            return;
        }

        // undefined out the request that this object is holding onto.  This is the flag to let us know that we no longer have an active request.
        this._currentRequest = undefined;

        this._events.off(req);

        if (req.upload) {
            this._events.off(req.upload);
        }

        if (!ServerConnection._isXhrAborted(req)) {
            let serverData = new ServerData(req, strUrl);
            let status = serverData.getStatus();

            let rumOne = RUMOneLogger.getRUMOneLogger();
            let apiEndTime = Date.now();
            if (rumOne) {
                let apiData: APICallPerformanceData = new APICallPerformanceData(strUrl, Number(req.getResponseHeader('SPClientServiceRequestDuration')), req.getResponseHeader('SPRequestGuid'), status, startTime, new Date().toISOString());
                rumOne.writeAPICallPerformanceData(apiData);   // log a API call perf data object for each API call before EUPL complete
                rumOne.saveTempData('appDataFetchEnd', apiEndTime);  // Record the last API call end time as app data fetch end
            }

            const shouldRedirectToErrorCustomPromptLocation = !noRedirect && this._shouldRedirectToErrorCustomPromptLocation(req);

            if (this._requestCanaryForAuth) {
                this._requestCanaryForAuth = false;
                if (status === 403) {
                    try {
                        if (shouldRedirectToErrorCustomPromptLocation) {
                            this._redirectToErrorCustomPromptLocation(req);
                        } else {
                            failureCallback(serverData);
                        }
                    } catch (e) {
                        // ignore
                    }

                    if (!noRedirect) {
                        // if users hit 403 again, they're unauthenticated, try redirect to auth.
                        let redirectLoginPageURL = serverData.getAuthenticationRedirect();
                        if (redirectLoginPageURL) {
                            let redirectLoginPageUri = new Uri(redirectLoginPageURL);
                            redirectLoginPageUri.setQueryParameter('ReturnUrl', UriEncoding.encodeURIComponent(window.location.href));
                            window.location.href = redirectLoginPageUri.toString();
                        }
                    }
                } else {
                    // we got form digest, so user is authenticated, they just don't have access to call the API requested
                    // let data source know about the error so it get properly accounted
                    try {
                        failureCallback(serverData);
                    } catch (e) {
                        // ignore
                    }

                    if (!noRedirect) {
                        // handle the redirect to the login page if requested to do so.
                        // this means users have logged in, yet they don't have permision to the OneDrive list.
                        // Go to accessdenied page with request access options.
                        let redirectLoginPageURL = (this._webAbsoluteUrl || this._webServerRelativeUrl) + '/_layouts/15/AccessDenied.aspx';
                        if (redirectLoginPageURL) {
                            let redirectLoginPageUri = new Uri(redirectLoginPageURL);
                            redirectLoginPageUri.setQueryParameter('Source', UriEncoding.encodeURIComponent(window.location.href));
                            redirectLoginPageUri.setQueryParameter('Type', 'list');
                            redirectLoginPageUri.setQueryParameter('correlation', UriEncoding.encodeURIComponent(serverData.getCorrelationId()));
                            // todo: set list guid! (we don't have that info from server context yet).
                            // the access denied page will still kind of work, except that we'll request access to the site, not the list.
                            // redirectLoginPageUri.setQueryParameter('name', context.listName);
                            // Ideally this should be using the navigation resource, but it is not guaranteed to be present here some
                            // DataSources do not extend the base DataSource.
                            window.location.href = redirectLoginPageUri.toString();
                        }
                    }
                }
                return;
            }

            if (status === 200 || status === 201 || status === 204) { // success case
                successCallback(serverData);
                return;
            } else if (status === 403) { // authentication required
                if (noRedirect) {
                    this._ensureRequestDigestWorker(undefined, () => failureCallback(serverData)); // call Canary to check if the user has already signed in or ot.
                } else {
                    if (shouldRedirectToErrorCustomPromptLocation) {
                        this._redirectToErrorCustomPromptLocation(req);
                    } else {
                        this._ensureRequestDigestWorker(undefined);
                    }
                }
                return;
            } else if (status === 401) {
                if (shouldRedirectToErrorCustomPromptLocation) {
                    this._redirectToErrorCustomPromptLocation(req);
                }
            }
            failureCallback(serverData);
        } else {
            failureCallback();
        }
    }

    /** Attempts to load or refresh the cached form digest with the params form digest data. */
    private _tryLoadDigest(formDigest: IFormDigest) {
        // should start using the params data when:
        // params has valid form digest data and
        // - the cached form digest data is invalid or expired or
        // - the params digest data is fresher that the cached data.
        let cachedFormDigest = ServerConnection._formDigests[this._webServerRelativeUrl];
        if (ServerConnection._isValidFormDigest(formDigest) &&
            (!ServerConnection._isValidFormDigest(cachedFormDigest) ||
                cachedFormDigest.updateFormDigestPageLoaded.getTime() < formDigest.updateFormDigestPageLoaded.getTime())) {
            ServerConnection._formDigests[this._webServerRelativeUrl] = formDigest;
        }
    }

    /**
     * If a 401/403 is returned, check for the SharePoint custom error code that indicates the
     * user needs to reattest and redirect to the custom prompt location.
     */
    private _shouldRedirectToErrorCustomPromptLocation(req: XMLHttpRequest) {
        const spErrorCode = req.getResponseHeader('X-SPO-ErrorCode');
        return spErrorCode && spErrorCode === '9.3';
    }

    private _redirectToErrorCustomPromptLocation(req: XMLHttpRequest) {
        const reattestionPageUri = new Uri(req.getResponseHeader('X-SPO-ErrorCustomPromptLocation'));
        reattestionPageUri.setQueryParameter('ReturnUrl', window.location.href);
        window.location.href = reattestionPageUri.toString();
    }
}