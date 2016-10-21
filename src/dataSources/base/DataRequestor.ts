import ISpPageContext from '../../interfaces/ISpPageContext';
import ServerData from './ServerData';
import ServerConnection from './ServerConnection';
import Promise from '@ms/odsp-utilities/lib/async/Promise';
import QosEvent, { ResultTypeEnum } from '@ms/odsp-utilities/lib/logging/events/Qos.event';
import ApiEvent from '@ms/odsp-utilities/lib/logging/events/Api.event';
import RUMOneLogger from '@ms/odsp-utilities/lib/logging/rumone/RUMOneLogger';

export interface IDataRequestorParams {
    pageContext: ISpPageContext;
    qosName?: string;
}

export interface IDataRequestor {
    getData<T>(options: IDataRequestGetDataOptions<T>): Promise<T>;
}

export interface IDataRequestGetDataOptions<T> {
    url: string;
    parseResponse?: (responseText: string) => T;
    qosName: string;
    method?: string;
    additionalPostData?: string;
    additionalHeaders?: { [key: string]: string };
    contentType?: string; // defaults to application/json;odata=verbose
    maxRetries?: number;
    noRedirect?: boolean;
    crossSiteCollectionCall?: boolean;
    responseType?: string;
    needsRequestDigest?: boolean;
}

export default class DataRequestor implements IDataRequestor {
    private _pageContext: ISpPageContext;

    private _qosName: string;

    public static parseJSON<T>(responseText: string): T {
        return responseText && JSON.parse(responseText) || undefined;
    }

    constructor(params: IDataRequestorParams) {
        let {
            pageContext,
            qosName
        } = params;

        this._pageContext = pageContext;
        this._qosName = qosName;
    }

    public getData<T>({
        url,
        parseResponse = DataRequestor.parseJSON,
        qosName,
        additionalPostData = '',
        additionalHeaders,
        contentType,
        method = 'POST',
        maxRetries = 0,
        crossSiteCollectionCall = false,
        noRedirect = false,
        needsRequestDigest = true,
        responseType
    }: IDataRequestGetDataOptions<T>): Promise<T> {
        maxRetries = Math.max(maxRetries, 0);
        let numRetries: number = 0;

        let serverConnection: ServerConnection = new ServerConnection({
            webServerRelativeUrl: this._pageContext.webServerRelativeUrl,
            needsRequestDigest: needsRequestDigest,
            webUrl: crossSiteCollectionCall ? this._pageContext.webAbsoluteUrl : undefined
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
        let onExecute = (complete: (argData?: T) => void, error: (err?: any) => void) => {
        /* tslint:enable: no-any */
            // forward declarations to shut up linter
            let onDataSuccess: (serverData: ServerData) => void;
            let onError: (serverData: ServerData) => void;
            let doGetData: () => void;

            onDataSuccess = (serverData: ServerData) => {
                let data: T;
                let qos = new QosEvent({ name: qosName });
                const response = serverData.getValue(ServerData.DataValueKeys.ResponseText);
                const status = serverData.getValue(ServerData.DataValueKeys.Status);
                const correlationId = serverData.getValue(ServerData.DataValueKeys.CorrelationId);
                let parsedResponse = false;
                try {
                    // This line could throw if the response does not have the expected data type.
                    // For example, there is at least one handler (SpoSuiteLinks.ashx) that will return
                    // an HTML error page rather than the expected JSON on error. We should count that case
                    // as a failure even though *something* was successfully returned.
                    data = parseResponse(response);
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
                        error: (typeof ex === 'object' ? JSON.stringify(ex) : ex) +
                            ' ' + response,
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
                const status = serverData.getValue(ServerData.DataValueKeys.Status);
                let correlationId: string = serverData.getValue(ServerData.DataValueKeys.CorrelationId);
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
                    let response = serverData.getValue(ServerData.DataValueKeys.ErrorResponseText);
                    errorData = response;
                    let data = JSON.parse(response);
                    errorData = data.error || {};
                    errorData.status = status;
                    if (correlationId) {
                        errorData.correlationId = correlationId;
                    }
                } catch (ex) {
                    // ignore parse error... will use the raw response from the server.
                }

                let requestUrl: string = serverData.getValue(ServerData.DataValueKeys.SourceURL);
                let index = requestUrl.indexOf('?');
                if (index > 0) {
                    requestUrl = requestUrl.substring(index + 1);
                }

                qos.end({
                    resultType: resultType,
                    requestUrl: requestUrl,
                    error: typeof errorData === 'object' ? JSON.stringify(errorData) : errorData,
                    resultCode: resultCode,
                    extraData: {
                        'CorrelationId': serverData.getValue(ServerData.DataValueKeys.CorrelationId),
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
                serverConnection.getServerDataFromUrl(
                    url,
                    onDataSuccess,
                    onError,
                    additionalPostData,
                    true /*fRest*/,
                    method,
                    additionalHeaders,
                    contentType,
                    noRedirect,
                    responseType);
            };
            doGetData();
        };

        let onCancel = () => {
            if (serverConnection) {
                serverConnection.abort();
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
            return new Promise<T>(onExecute, onCancel);
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
