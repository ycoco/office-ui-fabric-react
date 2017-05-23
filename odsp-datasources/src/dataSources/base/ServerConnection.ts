
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
     *
     * @type {Date}
     * @memberOf IServerConnectionParams
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

export interface IServerConnectionParams extends IComponentParams, IFormDigest {
    webServerRelativeUrl?: string;
    needsRequestDigest?: boolean;
    webUrl?: string;
}

export interface IGetServerDataFromUrlOptions {
    url: string;
    successCallback: (serverData: ServerData) => any;
    failureCallback: (serverData: ServerData) => any;
    uploadProgressCallback?: (event: ProgressEvent) => void;
    additionalPostData?: string | Blob;
    isRest: boolean;
    method: string;
    additionalHeaders?: {
        [key: string]: string;
    };
    contentType?: string;
    noRedirect?: boolean;
    responseType?: string;
    needsRequestDigest?: boolean;
}

export default class ServerConnection extends Component {
    // Number of seconds subtracted from the request digest iterval
    // to compensate for the client-server delay
    private static INTERVAL_ADJUST = 10;
    private static _formDigest: IFormDigest;

    private _events: EventGroup;
    private _currentRequest = undefined;
    private _needsRequestDigest = true;
    private _requestCanaryForAuth = false;
    private _webUrl = undefined;
    private _alwaysGetDigest = false;
    private _webServerRelativeUrl = undefined;

    private static _isXhrAborted(xhr: any) {
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
            (new Date().getTime() - formDigest.updateFormDigestPageLoaded.getTime()) < formDigest.formDigestTimeoutSeconds * 1000 /*convert to ms*/;
    }

    constructor(params: IServerConnectionParams = {}) {
        super(params);

        this._events = new (this.scope.attached(EventGroup))(this);

        this._needsRequestDigest = params.needsRequestDigest !== false;
        if (this._needsRequestDigest) {
            this._tryLoadDigest(params);
        }

        if (params.webUrl) {
            this._webUrl = params.webUrl;
            this._alwaysGetDigest = true;
        }
        this._webServerRelativeUrl = params.webServerRelativeUrl;
    }

    public abort() {
        if (this._currentRequest) {
            // Add a custom field to this request object so we can pass the message to the OnReadyStateChange function that THIS specific XHR has been canceled!
            //  It's unclear to me is this is really needed.  Some documentation I have ready states 'Calling abort resets the object; the onreadystatechange
            //  event handler is removed, and readyState is changed to 0 (uninitialized).'  If this is the case, then the onreadystatechange should never be
            //  called and if it is then the state of the request is set to 0, which I handle below.
            // For completeness only I leave this here.  (Belt and suspenders).
            let request = this._currentRequest;
            request.isCancelled = true;

            // Now abort this XHR
            this._currentRequest.abort();
            this._currentRequest = undefined;
        }
    }

    public isRequestActive() {
        return !!this._currentRequest;
    }

    public getServerDataFromUrl(options: IGetServerDataFromUrlOptions) {
        let {
            url: strUrl,
            successCallback,
            failureCallback,
            uploadProgressCallback,
            additionalPostData,
            isRest: fRest,
            method = 'POST',
            additionalHeaders: addtionHeaders,
            contentType,
            noRedirect,
            responseType,
            needsRequestDigest = this._needsRequestDigest
        } = options;

        let startTime: string = new Date().toISOString();
        let req: XMLHttpRequest = new XMLHttpRequest();
        req.open(method, strUrl, true);
        if (responseType) {
            req.responseType = responseType;
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
        if (!this._alwaysGetDigest && ServerConnection._isValidFormDigest(ServerConnection._formDigest)) {
            callback(ServerConnection._formDigest.formDigestValue);
            return;
        } else {
            this._ensureRequestDigestWorker(callback, failureCallback);
        }
    }

    private _ensureRequestDigestWorker(callback?: (requestDigest: string) => void, failureCallback?: (serverData: ServerData) => void): void {
        let onDataSuccess = (serverData: ServerData) => {
            const responseText = serverData.getResponseText();
            const jsonObj = JSON.parse(<string>responseText);
            const requestDigest = jsonObj.d.GetContextWebInformation;

            ServerConnection._formDigest = {
                formDigestValue: requestDigest.FormDigestValue,
                formDigestTimeoutSeconds: requestDigest.FormDigestTimeoutSeconds - ServerConnection.INTERVAL_ADJUST,
                updateFormDigestPageLoaded: new Date()
            };

            if (callback) {
                callback(ServerConnection._formDigest.formDigestValue);
            }
        };

        let onDataError = (serverData: ServerData) => {
            if (callback) {
                callback(undefined);
            } else if (failureCallback) {
                failureCallback(serverData);
            }
        };

        let serverConnectionParms = <IServerConnectionParams>{
            needsRequestDigest: false,
            webServerRelativeUrl: this._webServerRelativeUrl,
            webUrl: undefined
        };
        let serverConnection = new ServerConnection(serverConnectionParms);
        if (!callback) {
            // no callback only means we're doing auth only request.
            serverConnection._requestCanaryForAuth = true;
        }

        if (this._webUrl || this._webServerRelativeUrl) {
            serverConnection.getServerDataFromUrl({
                url: Uri.concatenate(this._webUrl ? this._webUrl : this._webServerRelativeUrl, '/_api/contextinfo'),
                successCallback: onDataSuccess,
                failureCallback: onDataError,
                isRest: true,
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

            if (this._requestCanaryForAuth) {
                this._requestCanaryForAuth = false;
                if (status === 403) {
                    try {
                        failureCallback(serverData);
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
                        let redirectLoginPageURL = this._webServerRelativeUrl + '/_layouts/15/AccessDenied.aspx';
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
                    this._ensureRequestDigestWorker(undefined);
                }
                return;
            }
            failureCallback(serverData);
        } else {
            failureCallback();
        }
    }

    /** Attempts to load or refresh the cached form digest with the params form digest data. */
    private _tryLoadDigest(params: IServerConnectionParams) {
        // should start using the params data when:
        // params has valid form digest data and
        // - the cached form digest data is invalid or expired or
        // - the params digest data is fresher that the cached data.
        if (ServerConnection._isValidFormDigest(params) &&
            (!ServerConnection._isValidFormDigest(ServerConnection._formDigest) ||
                ServerConnection._formDigest.updateFormDigestPageLoaded.getTime() < params.updateFormDigestPageLoaded.getTime())) {
            ServerConnection._formDigest = {
                updateFormDigestPageLoaded: params.updateFormDigestPageLoaded,
                formDigestValue: params.formDigestValue,
                formDigestTimeoutSeconds: params.formDigestTimeoutSeconds
            };
        }
    }
}