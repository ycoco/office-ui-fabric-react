import ServerData from './ServerData';
import UriEncoding from '@ms/odsp-utilities/lib/encoding/UriEncoding';
import Uri from '@ms/odsp-utilities/lib/uri/Uri';
import APICallPerformanceData from '@ms/odsp-utilities/lib/logging/rumone/APICallPerformanceData';
import RUMOneLogger from '@ms/odsp-utilities/lib/logging/rumone/RUMOneLogger';

export interface IServerConnectionParams {
    webServerRelativeUrl?: string;
    needsRequestDigest?: boolean;
    webUrl?: string;
    updateFormDigestPageLoaded?: Date;
}

export default class ServerConnection {
    // Number of seconds subtracted from the request digest iterval
    // to compensate for the client-server delay
    private static DEFAULT_DIGEST_INTERVAL = 1800;
    private static INTERVAL_ADJUST = 10;
    private static _requestDigestInterval: number; // in seconds
    private static _requestDigest: string;
    private static _lastDigestLoaded: Date;
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

    constructor(params: IServerConnectionParams = {}) {
        this._needsRequestDigest = params.needsRequestDigest !== false;
        if (this._needsRequestDigest && !ServerConnection._requestDigest) {
            this._tryLoadDigestFromPage(params);
        }

        // Currently the ServerConnection takes the site collection relative url from the window['_spPageContextInfo'].
        // This should not happen because we already have a hostSettings object that contains all that information.
        // However, the hostSettings is a resouce that has to be consumed here and there's no foolproof way of making sure the
        // resource is exposed in every use case of the ServerConnection object so we're just setting the webUrl as a parameter
        // in the constructor.
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

    public getServerDataFromUrl(
        strUrl: string,
        successCallback: (serverData: ServerData) => any,
        failureCallback: (serverData: ServerData) => any,
        additionalPostData: string,
        fRest: boolean,
        method: string = 'POST',
        addtionHeaders?: { [key: string]: string },
        contentType?: string,
        noRedirect?: boolean,
        responseType?: string) {

        let startTime: string = new Date().toISOString();
        let req: XMLHttpRequest = new XMLHttpRequest();
        req.open(method, strUrl, true);
        if (responseType) {
            req.responseType = responseType;
        }
        req.setRequestHeader('accept', 'application/json;odata=verbose');
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

        if (addtionHeaders) {
            for (let headerKey in addtionHeaders) {
                if (headerKey) {
                    req.setRequestHeader(headerKey, addtionHeaders[headerKey]);
                }
            }
        }

        // Remember this request so we can tell if we have a request in flight and so we can cancel it if needed.
        this._currentRequest = req;

        let onRequestDigestReady = (requestDigest?: string): void => {
            if (this._needsRequestDigest && requestDigest) {
                req.setRequestHeader('x-requestdigest', requestDigest);
            }

            req.onreadystatechange = (): void => {
                this._onReadyStateChange(req, strUrl, successCallback, failureCallback, noRedirect, startTime);
            };
            req.send(additionalPostData);
        };

        if (this._needsRequestDigest) {
            this._ensureRequestDigest(onRequestDigestReady, failureCallback);
        } else {
            onRequestDigestReady();
        }
    }

    private _ensureRequestDigest(callback: (requestDigest: string) => void, failureCallback?: (serverData: ServerData) => void): void {
        let now = new Date();

        // if requestDigest is available and not expired then use it, otherwise get a new one
        if (!this._alwaysGetDigest && ServerConnection._requestDigest && ServerConnection._lastDigestLoaded &&
            (now.getTime() - ServerConnection._lastDigestLoaded.getTime()) < ServerConnection._requestDigestInterval * 1000 /*convert to ms*/) {
            callback(ServerConnection._requestDigest);
            return;
        } else {
            this._ensureRequestDigestWorker(callback, failureCallback);
        }
    }

    private _ensureRequestDigestWorker(callback?: (requestDigest: string) => void, failureCallback?: (serverData: ServerData) => void): void {
        let onDataSuccess = (serverData: ServerData) => {
            let responseText = serverData.getValue(ServerData.DataValueKeys.ResponseText);
            let jsonObj = JSON.parse(responseText);
            ServerConnection._requestDigest = jsonObj.d.GetContextWebInformation.FormDigestValue;
            ServerConnection._requestDigestInterval = (jsonObj.d.GetContextWebInformation.FormDigestTimeoutSeconds - ServerConnection.INTERVAL_ADJUST);
            ServerConnection._lastDigestLoaded = new Date();
            if (callback) {
                callback(ServerConnection._requestDigest);
            }
        };

        let onDataError = (serverData: ServerData) => {
            if (callback) {
                callback(undefined);
            } else if (failureCallback) {
                failureCallback(serverData);
            }
        };

        let serverConnectionParms = <IServerConnectionParams> {
            needsRequestDigest: false,
            webUrl: undefined
        };
        let serverConnection = new ServerConnection(serverConnectionParms);
        if (!callback) {
            // no callback only means we're doing auth only request.
            serverConnection._requestCanaryForAuth = true;
        }
        serverConnection.getServerDataFromUrl(
            Uri.concatenate(this._webUrl ? this._webUrl : this._webServerRelativeUrl, '/_api/contextinfo'),
            onDataSuccess,
            onDataError,
            undefined,
            true /*frest*/, 'POST', undefined, undefined, !!failureCallback);
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
        req.onreadystatechange = undefined;

        if (!ServerConnection._isXhrAborted(req)) {
            let serverData = new ServerData(req, strUrl);
            let status: number = serverData.getValue(ServerData.DataValueKeys.Status);

            let apiEndTime: number = new Date().getTime();
            let rumOne = RUMOneLogger.getRUMOneLogger();
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
                        let redirectLoginPageURL: string = serverData.getValue(ServerData.DataValueKeys.AuthenticationRedirect);
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
                            redirectLoginPageUri.setQueryParameter('correlation', UriEncoding.encodeURIComponent(serverData.getValue(ServerData.DataValueKeys.CorrelationId)));
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

    /**
     * This scenario is specific to SharePoint where the request digest is in the page
     */
    private _tryLoadDigestFromPage(params: IServerConnectionParams) {
        let requestDigestElement: HTMLInputElement = undefined;
        let elements: NodeList = document.getElementsByName('__REQUESTDIGEST');
        if (elements && elements.length === 1) {
            requestDigestElement = <HTMLInputElement>elements[0];
            if ((requestDigestElement !== undefined) &&
                (requestDigestElement.tagName.toLowerCase() === 'input') &&
                (requestDigestElement.type.toLowerCase() === 'hidden') &&
                (requestDigestElement.value !== undefined) &&
                (requestDigestElement.value.length > 0) &&
                params.updateFormDigestPageLoaded) {
                ServerConnection._requestDigest = requestDigestElement.value;
                ServerConnection._lastDigestLoaded = params.updateFormDigestPageLoaded;
                ServerConnection._requestDigestInterval = (ServerConnection.DEFAULT_DIGEST_INTERVAL - ServerConnection.INTERVAL_ADJUST);
            }
        }
    }
}