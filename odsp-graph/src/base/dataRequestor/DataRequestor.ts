// OneDrive:IgnoreCodeCoverage

import Promise from '@ms/odsp-utilities/lib/async/Promise';
import XHRPromise from '@ms/odsp-utilities/lib/xhr/XHRPromise';
import { ITokenProvider, ISessionToken } from '../../base/tokenProvider/ITokenProvider';
import { IDataRequestor, IDataRequestorSendOptions } from './IDataRequestor';
import { Api as ApiEvent, IApiEndSchema } from '@ms/odsp-utilities/lib/logging/events/Api.event';
import { ResultTypeEnum } from "@ms/odsp-utilities/lib/logging/events/Qos.event";
import Uri from '@ms/odsp-utilities/lib/uri/Uri';
import { IErrorResponse, VroomError, getQosExtraDataFromError } from './IDataRequestor';
import { IUrlProvider } from '../dataRequestor/IDataRequestor';

export { IDataRequestor };

export interface IDataRequestorDependencies {
    sessionManagementProvider: {
        getToken(): Promise<ISessionToken>;
    };
    urlDataSource: {
        getVroomApiBaseUrl(): string;
    };
}

export class DataRequestor implements IDataRequestor {
    private _sessionManagementProvider: ITokenProvider;
    private _urlDataSource: IUrlProvider;
    private _apiBaseUrl: string;

    constructor(params: {}, dependencies: IDataRequestorDependencies) {
        const {
            sessionManagementProvider,
            urlDataSource
        } = dependencies;

        this._sessionManagementProvider = sessionManagementProvider;
        this._urlDataSource = urlDataSource;
        this._apiBaseUrl = urlDataSource.getVroomApiBaseUrl();
    }

    public send<T>(options: IDataRequestorSendOptions<T>): Promise<T> {
        const {
            headers = {},
            path,
            apiName,
            requestType = 'GET',
            disableLogging = false,
            timeout,
            onProgress,
            onUploadProgress,
            qosExtraData,
            apiVersion = 'v2.0',
            needsAuthorization = true,
            useAuthorizationHeaders = false,
            accessToken
        } = options;

        const getAccessToken = needsAuthorization && (accessToken || this._sessionManagementProvider.getToken(apiVersion)) || undefined;

        return Promise.as(getAccessToken).then((sessionToken: ISessionToken) => {
            const apiBaseUrl = this._apiBaseUrl;

            let requestHeaders = {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                ...headers
            };

            let apiUri: Uri;

            if (sessionToken && sessionToken.tokenUrl && path.indexOf("/drive/") === 0) {
                // replace the generic "/drive/" with our specific token url
                apiUri = new Uri(`${sessionToken.tokenUrl}/${path.substring(7)}`);
            } else {
                apiUri = new Uri(path);
                if (!apiUri.getScheme()) {
                    apiUri = new Uri(apiBaseUrl + path);
                }
            }

            // save the url to log before we add sensitive tokens
            let apiUrlToLog = apiUri.toString();

            if (sessionToken) {
                const {
                    accessToken: sessionAccessToken,
                    proofToken
                } = sessionToken;

                if (useAuthorizationHeaders) {
                    if (sessionAccessToken) {
                        requestHeaders = {
                            ...requestHeaders,
                            'Authorization': `bearer ${sessionAccessToken}`
                        };
                    }

                    if (proofToken) {
                        requestHeaders = {
                            ...requestHeaders,
                            'X-PROOF_TOKEN': proofToken
                        };
                    }
                } else {
                    if (sessionAccessToken) {
                        // We attach the access token as a query parameter to every request.
                        // We could also pass it in through the 'Authorization: bearer' header,
                        // but that would result in an extra CORS preflight request for every
                        // unique path.
                        apiUri.setQueryParameter('access_token', sessionAccessToken);
                    }

                    if (proofToken) {
                        // ODB scenarios use proof tokens
                        apiUri.setQueryParameter('prooftoken', proofToken);
                    }
                }
            }

            let apiEvent: ApiEvent;

            if (!disableLogging) {
                apiEvent = new ApiEvent({
                    url: apiUrlToLog,
                    name: 'VroomDataRequest.' + apiName,
                    extraData: qosExtraData
                });
            }

            return XHRPromise.start({
                url: apiUri.toString(),
                headers: requestHeaders,
                method: requestType,
                json: options.postData || '',
                requestTimeoutInMS: timeout,
                onProgress: onProgress,
                onUploadProgress: onUploadProgress
            }).then((request: XMLHttpRequest) => {
                if (apiEvent) {
                    apiEvent.end({
                        resultType: ResultTypeEnum.Success
                    });
                }

                if (options.parseResponse) {
                    return options.parseResponse(request);
                }

                if (request.responseText.length === 0) {
                    return null;
                }

                return <T>JSON.parse(request.responseText);
            }, (request: XMLHttpRequest | Error) => {
                let response: IErrorResponse;

                let apiEndSchema: IApiEndSchema;

                let error: Error;

                if (request instanceof Error) {
                    const resultType = Promise.isCanceled(request) ? ResultTypeEnum.ExpectedFailure : ResultTypeEnum.Failure;

                    apiEndSchema = {
                        error: request.message,
                        resultType: resultType
                    };

                    error = request;
                } else {
                    if (request.responseText) {
                        try {
                            response = <IErrorResponse>JSON.parse(request.responseText);
                        } catch (error) {
                            // no-op
                        }
                    }

                    const {
                        status,
                        statusText
                    } = request;

                    const {
                        error: {
                            message = '',
                        innererror: {
                                stackTrace = '',
                            debugMessage = ''
                            } = {}
                        } = {}
                    } = response || {};

                    error = new VroomError(new Error(message), {
                        response: response,
                        status: status,
                        request: request
                    });

                    apiEndSchema = {
                        resultType: ResultTypeEnum.Failure,
                        error: message,
                        extraData: {
                            ...(qosExtraData || {}),
                            ...getQosExtraDataFromError(error),
                            stack: stackTrace,
                            httpStatus: status,
                            httpStatusText: statusText,
                            debugMessage: debugMessage,
                            accessTokenLength: (sessionToken && sessionToken.accessToken) ? sessionToken.accessToken.length : -1
                        }
                    };
                }

                if (apiEvent) {
                    apiEvent.end(apiEndSchema);
                }

                return Promise.wrapError(error);
            });
        });
    }
}

export default DataRequestor;