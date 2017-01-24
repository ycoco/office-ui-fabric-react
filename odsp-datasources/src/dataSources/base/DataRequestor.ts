import ISpPageContext from '../../interfaces/ISpPageContext';
import ServerData from './ServerData';
import ServerConnection from './ServerConnection';
import Promise from '@ms/odsp-utilities/lib/async/Promise';
import QosEvent, { ResultTypeEnum } from '@ms/odsp-utilities/lib/logging/events/Qos.event';
import ApiEvent from '@ms/odsp-utilities/lib/logging/events/Api.event';
import RUMOneLogger from '@ms/odsp-utilities/lib/logging/rumone/RUMOneLogger';

export interface IDataRequestorParams {
    /**
     * The base QoS name to use for all requests.
     * Calls to `getData` will append their own provided `qosName` values to this base value.
     */
    qosName?: string;
}

export interface IDataRequestorLegacyParams extends IDataRequestorParams {
    /**
     * A current page context. Prefer passing this value in dependencies.
     * `DataRequestor` minimally requires `webServerRelativeUrl` to be set.
     * Additionally, settings `updateFormDigestPageLoaded` can help avoid extra server calls.
     *
     * @type {ISpPageContext}
     * @memberOf IDataRequestorParams
     */
    pageContext: ISpPageContext;
}

export interface IDataRequestorDependencies {
    /**
     * A current page context.
     * `DataRequestor` minimally requires `webServerRelativeUrl` to be set.
     * Additionally, settings `updateFormDigestPageLoaded` can help avoid extra server calls.
     *
     * @type {ISpPageContext}
     * @memberOf IDataRequestorParams
     */
    pageContext: ISpPageContext;
}

export interface IDataRequestor {
    getData<T>(options: IDataRequestGetDataOptions<T>): Promise<T>;
}

export interface IDataRequestGetDataOptions<T> {
    url: string;
    /**
     * Optional override for parsing the server response.
     * The default behavior to to parse as JSON and cast to `T`.
     * Only override this to handle the response string directly or convert to a different data type.
     *
     * @memberOf IDataRequestGetDataOptions
     */
    parseResponse?: (responseText: string) => T;
    /**
     * The name for the call for QoS reporting.
     *
     * @type {string}
     * @memberOf IDataRequestGetDataOptions
     */
    qosName: string;
    /**
     * The HTTP method to use for the request.
     *
     * @type {string}
     * @memberOf IDataRequestGetDataOptions
     */
    method?: string;
    /**
     * Data to put in the body of thr request.
     * Objects should be serialized to JSON first.
     *
     * @type {(string | Blob)}
     * @memberOf IDataRequestGetDataOptions
     */
    additionalPostData?: string | Blob;
    /**
     * Additional headers to include in the request.
     * Headers minimally necessary for SharePoint calls will be provided automatically.
     *
     * @type {{ [key: string]: string }}
     * @memberOf IDataRequestGetDataOptions
     */
    additionalHeaders?: { [key: string]: string };
    /**
     * The request content type.
     * Default is 'application/json;odata=verbose'.
     *
     * @type {string}
     * @memberOf IDataRequestGetDataOptions
     */
    contentType?: string;
    /**
     * The maximum number of retries to make in response to retriable errors.
     * Default is 0.
     *
     * @type {number}
     * @memberOf IDataRequestGetDataOptions
     */
    maxRetries?: number;
    /**
     * Whether or not to disable automatic redirects to the login page if the session expired.
     *
     * @type {boolean}
     * @memberOf IDataRequestGetDataOptions
     */
    noRedirect?: boolean;
    /**
     * Whether or not this call is being made across a site collection.
     * Unnecessary if the full URL is provided.
     *
     * @type {boolean}
     * @memberOf IDataRequestGetDataOptions
     */
    crossSiteCollectionCall?: boolean;
    /**
     * The expected response type.
     *
     * @type {string}
     * @memberOf IDataRequestGetDataOptions
     */
    responseType?: string;
    /**
     * Specify whether or not up-to-date digest information must be provided for this request.
     *
     * @type {boolean}
     * @memberOf IDataRequestGetDataOptions
     */
    needsRequestDigest?: boolean;
    /**
     * A handler for upload progress events.
     *
     * @memberOf IDataRequestGetDataOptions
     */
    onUploadProgress?: (event: ProgressEvent) => void;
}

export interface IDataRequestGetDataAsBlobOptions extends IDataRequestGetDataOptions<Blob> {
    responseType: 'blob';
}

export default class DataRequestor implements IDataRequestor {
    private _pageContext: ISpPageContext;

    private _qosName: string;

    public static parseJSON<T>(responseText: string): T {
        return responseText && JSON.parse(responseText) || undefined;
    }

    constructor(params: IDataRequestorLegacyParams);
    constructor(params: IDataRequestorParams, dependencies: IDataRequestorDependencies);
    constructor(params: IDataRequestorParams, dependencies?: IDataRequestorDependencies) {
        this._pageContext = dependencies ? dependencies.pageContext : (params as IDataRequestorLegacyParams).pageContext;
        this._qosName = params.qosName;
    }

    public getData(options: IDataRequestGetDataAsBlobOptions): Promise<Blob>;
    public getData<T>(options: IDataRequestGetDataOptions<T>): Promise<T>;
    public getData<T>({
        url,
        parseResponse = <(responseText: string) => T>DataRequestor.parseJSON,
        qosName,
        additionalPostData = '',
        additionalHeaders,
        contentType,
        method = 'POST',
        maxRetries = 0,
        crossSiteCollectionCall = false,
        noRedirect = false,
        needsRequestDigest = true,
        responseType,
        onUploadProgress
    }: IDataRequestGetDataOptions<T>): Promise<T | Blob> {
        maxRetries = Math.max(maxRetries, 0);
        let numRetries: number = 0;

        let serverConnection: ServerConnection = new ServerConnection({
            webServerRelativeUrl: this._pageContext.webServerRelativeUrl,
            needsRequestDigest: needsRequestDigest,
            webUrl: crossSiteCollectionCall ? this._pageContext.webAbsoluteUrl : undefined,
            // Pull current digest state from the page.
            // This helps initial requests avoid extra server calls.
            // Unit tests will need to spoof this in order to avoid the need to mock the digest response.
            updateFormDigestPageLoaded: this._pageContext.updateFormDigestPageLoaded,
            formDigestValue: this._pageContext.formDigestValue,
            formDigestTimeoutSeconds: this._pageContext.formDigestTimeoutSeconds
        });

        let qosNames: string[] = [];

        if (this._qosName) {
            qosNames.push(this._qosName);
        }

        if (qosName) {
            qosNames.push(qosName);
        }

        qosName = qosNames.join('.');

        /* tslint:disable: no-any */
        let onExecute = (complete: (argData?: T | Blob) => void, error: (err?: any) => void) => {
        /* tslint:enable: no-any */
            // forward declarations to shut up linter
            let onDataSuccess: (serverData: ServerData) => void;
            let onError: (serverData: ServerData) => void;
            let doGetData: () => void;

            onDataSuccess = (serverData: ServerData) => {
                let data: T | Blob;
                let qos = new QosEvent({ name: qosName });
                const response = serverData.getResponseText();
                const status = serverData.getStatus();
                const correlationId = serverData.getCorrelationId();
                let parsedResponse = false;
                try {
                    if (response instanceof Blob) {
                        data = response;
                    } else {
                        data = parseResponse(response);
                    }
                    // This line could throw if the response does not have the expected data type.
                    // For example, there is at least one handler (SpoSuiteLinks.ashx) that will return
                    // an HTML error page rather than the expected JSON on error. We should count that case
                    // as a failure even though *something* was successfully returned.
                    parsedResponse = true;
                    qos.end({
                        resultType: ResultTypeEnum.Success,
                        extraData: {
                            'CorrelationId': correlationId,
                            'HttpStatus': status
                        }
                    });
                } catch (ex) {
                    // The response did not parse properly.
                    qos.end({
                        resultType: ResultTypeEnum.Failure,
                        resultCode: 'InvalidJSON',
                        error: (typeof ex === 'object' ? JSON.stringify(ex) : ex),
                        extraData: {
                            'CorrelationId': correlationId,
                            'HttpStatus': status
                        }
                    });
                    // let the caller know there was an error in parsing the data
                    error();
                }

                // pass the response to the caller
                if (parsedResponse) {
                    qos = new QosEvent({ name: qosName + 'Complete'});
                    try {
                        complete(data);
                        qos.end({
                            resultType: ResultTypeEnum.Success,
                            extraData: {
                                'CorrelationId': correlationId,
                                'HttpStatus': status
                            }
                        });
                    } catch (ex) {
                        // the caller failed to handle the data
                        qos.end({
                            resultType: ResultTypeEnum.Failure,
                            error: (typeof ex === 'object' ? JSON.stringify(ex) : ex),
                            extraData: {
                                'CorrelationId': correlationId,
                                'HttpStatus': status
                            }
                        });
                    }
                }
                serverConnection = undefined;
            };

            onError = (serverData?: ServerData) => {
                const qos = new QosEvent({
                    name: qosName
                });

                if (!serverData) {
                    // serverData will be undefined if the request was aborted
                    qos.end({
                        resultType: ResultTypeEnum.ExpectedFailure,
                        resultCode: 'RequestAborted'
                    });
                    return;
                }

                let resultType = ResultTypeEnum.Failure;
                const status = serverData.getStatus();
                let correlationId = serverData.getCorrelationId();
                const resultCode = status;
                if (status === 403 || status === 404) {
                    // no need to retry authentication errors...
                    // no need to retry document not found errors...
                    maxRetries = 0;
                    resultType = ResultTypeEnum.ExpectedFailure;
                }

                let errorData = undefined;
                // Try to parse error data from the server
                try {
                    let response = serverData.getErrorResponseText();
                    errorData = response;

                    if (typeof response === 'string') {
                        let data = JSON.parse(response);
                        errorData = data.error || data['odata.error'] || {};
                        errorData.status = status;
                        if (correlationId) {
                            errorData.correlationId = correlationId;
                        }
                    }
                } catch (ex) {
                    // ignore parse error... will use the raw response from the server.
                }

                let errorMessage: string = (typeof errorData === 'object') ? JSON.stringify(errorData) : errorData;
                qos.end({
                    resultType: resultType,
                    error: errorMessage,
                    resultCode: `${resultCode}`,
                    extraData: {
                        'CorrelationId': serverData.getCorrelationId(),
                        'HttpStatus': status
                    }
                });

                if (numRetries < maxRetries) {
                    ++numRetries;
                    doGetData();
                } else {
                    error(errorData);
                }
            };

            doGetData = () => {
                serverConnection.getServerDataFromUrl({
                    url: url,
                    successCallback: onDataSuccess,
                    failureCallback: onError,
                    uploadProgressCallback: onUploadProgress,
                    additionalPostData: additionalPostData,
                    isRest: true,
                    method: method,
                    additionalHeaders: additionalHeaders,
                    contentType: contentType,
                    noRedirect: noRedirect,
                    responseType: responseType
                });
            };
            doGetData();
        };

        let onCancel = () => {
            if (serverConnection) {
                serverConnection.abort();
                serverConnection.dispose();
            }
        };

        let apiStartTime: number = new Date().getTime();

        let rumOne: RUMOneLogger = RUMOneLogger.getRUMOneLogger();

        if (rumOne) {
            if (!Boolean(rumOne.readTempData('appDataFetchStart'))) {
                // Record the App DataFetch start before the first API call
                rumOne.saveTempData('appDataFetchStart', apiStartTime);
            }
        }

        return ApiEvent.instrumentPromise({
            url: url,
            name: qosName + '.Promise'
        }, () => {
            return new Promise<T>(onExecute, onCancel).then((result: T) => {
                if (serverConnection) {
                    serverConnection.dispose();
                }

                return result;
            }, (error: any) => {
                if (serverConnection) {
                    serverConnection.dispose();
                }

                return Promise.wrapError(error);
            });
        /* tslint:disable:no-string-literal no-any */
        }, undefined, (error?: any) => {
        /* tslint:enable:no-string-literal no-any */
            /// TODO: implement proper cancelation check when it's implemented in Promise.ts
            if (error && error.name === 'Canceled') {
                return {
                    error: error,
                    resultCode: 'Canceled',
                    resultType: ResultTypeEnum.ExpectedFailure
                };
            }
            if (error && error.status === 403) {
                return {
                    error: error,
                    resultCode: 'AccessDenied',
                    resultType: ResultTypeEnum.ExpectedFailure
                };
            }
            return {
                error: error,
                resultCode: '',
                resultType: ResultTypeEnum.Failure
            };
        });
    }
}