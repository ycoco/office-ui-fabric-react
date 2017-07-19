// OneDrive:IgnoreCodeCoverage

import Promise from '@ms/odsp-utilities/lib/async/Promise';
import * as ObjectUtil from '@ms/odsp-utilities/lib/object/ObjectUtil';
import { ISessionToken } from '../../base/tokenProvider/ITokenProvider';

export interface IItemAnalyticsResponse {
    activities: IActivity[];
    incompleteData: IIncompleteData;
    interval: string;
    lastActivityDateTime: string;
    startDateTime: string;
    viewCount: number;
    viewerCount: number;
}

export interface IIncompleteData {
    missingDataBeforeDateTime: string;
    wasThrottled: boolean;
}

export interface IActivity {
    activityDateTime: string;
    activityType: string;
    actor: IActor;
    location?: string;
}

export interface IActor {
    application?: string;
    user: IUser;
}

export interface IUser {
    displayName: string;
    id: string;
    email: string;
}

export class VroomError implements Error {
    public readonly name: string;
    public readonly message: string;
    public readonly response: IErrorResponse;
    public readonly status: number;
    public readonly serverStack: string;
    public readonly error: Error;
    public readonly type: this;
    public readonly request: XMLHttpRequest;

    constructor(error: Error, params: IErrorParams) {
        const {
            response: {
                error: {
                    innererror: {
                        stackTrace = ''
                    } = {}
                } = {}
            } = {},
            response,
            request,
            status
        } = params;

        const {
            message
        } = error;

        this.name = 'VroomError';
        this.message = message;
        this.type = this;
        this.response = response;
        this.status = status;
        this.serverStack = stackTrace;
        this.request = request;
        this.error = error;

        return ObjectUtil.extend(error, this);
    }
}

export interface IErrorParams {
    response?: IErrorResponse;
    status: number;
    request?: XMLHttpRequest;
}

export interface IErrorResponse {
    error?: IError;
}

export interface IError {
    code: ErrorCode | InnerErrorCode;
    message?: string;
    innererror?: IError;
    stackTrace?: string;
    debugMessage?: string;
}

export type ErrorCode = keyof ({
    accessDenied,
    activityLimitReached,
    generalException,
    invalidRange,
    invalidRequest,
    itemNotFound,
    malwareDetected,
    nameAlreadyExists,
    notAllowed,
    notSupported,
    resourceModified,
    resyncRequired,
    serviceNotAvailable,
    quotaLimitReached,
    unauthenticated
});

export type InnerErrorCode = keyof ({
    accessRestricted,
    cannotSnapshotTree,
    childItemCountExceeded,
    entityTagDoesNotMatch,
    fragmentLengthMismatch,
    fragmentOutOfOrder,
    fragmentOverlap,
    invalidAcceptType,
    invalidParameterFormat,
    invalidPath,
    invalidStartIndex,
    lockMismatch,
    lockNotFoundOrAlreadyExpired,
    lockOwnerMismatch,
    malformedEntityTag,
    maxDocumentCountExceeded,
    maxFileSizeExceeded,
    maxFolderCountExceeded,
    maxFragmentLengthExceeded,
    maxItemCountExceeded,
    maxQueryLengthExceeded,
    maxStreamSizeExceeded,
    nameContainsInvalidCharacters,
    parameterIsTooLong,
    parameterIsTooSmall,
    pathIsTooLong,
    pathIsTooDeep,
    propertyNotUpdateable,
    resyncApplyDifferences,
    resyncUploadDifferences,
    serviceReadOnly,
    throttledRequest,
    tooManyResultsRequested,
    tooManyItemsInQuery,
    totalAffectedItemCountExceeded,
    truncationNotAllowed,
    uploadSessionFailed,
    uploadSessionIncomplete,
    uploadSessionNotFound,
    versionNumberDoesNotMatch,
    virusSuspicious,
    zeroOrFewerResultsRequested
});

export function getQosExtraDataFromError(error: Error): { [key: string]: string | number | boolean; } {
    const extraData: {
        [key: string]: string | number | boolean;
    } = {};

    const errorMessage = 'errorMessage';
    const vroomStatus = 'vroomStatus';
    const vroomErrorCode = 'vroomErrorCode';
    const vroomErrorMessage = 'vroomErrorMessage';
    const vroomErrorInnerCode = 'vroomErrorInnerCode';
    const vroomErrorInnerMessage = 'vroomErrorInnerMessage';
    const vroomErrorInnerDebugMessage = 'vroomErrorInnerDebugMessage';
    const vroomErrorInnerStack = 'vroomErrorInnerStack';

    extraData[errorMessage] = error.message;

    if (isVroomError(error)) {
        extraData[vroomStatus] = error.status;

        const {
            response
        } = error;

        if (response && response.error) {
            const responseError = response.error;

            extraData[vroomErrorCode] = responseError.code;
            extraData[vroomErrorMessage] = responseError.message;

            const innerError = responseError.innererror;

            if (innerError) {
                extraData[vroomErrorInnerCode] = innerError.code;
                extraData[vroomErrorInnerMessage] = innerError.message;
                extraData[vroomErrorInnerDebugMessage] = innerError.debugMessage;
                extraData[vroomErrorInnerStack] = innerError.stackTrace;
            }
        }
    }

    return extraData;
}

export function isVroomError(error: Error): error is VroomError {
    return (<VroomError>error).type instanceof VroomError;
}

export interface IQosData {
    [key: string]: string | number | boolean;
}

export interface IDataRequestorSendOptions<T> {
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
     * @memberof IDataRequestorSendOptions
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
    /**
     * An access token to use for the specific request. If not specified, a general token will be used.
     */
    accessToken?: ISessionToken;
}

export interface IDataRequestor {
    /**
     * Sends a request using the Vroom API call pattern and parses the result.
     *
     * @template T The interface for the parsed object expected in the response.
     * @param {IDataRequestorSendOptions<T>} options The options for the request.
     * @returns {Promise<T>} A promise for the response, parsed from JSON.
     */
    send<T>(options: IDataRequestorSendOptions<T>): Promise<T>;
}

export default IDataRequestor;

export interface IUrlProvider {
    /**
     * Gets the base URL of the Vroom API
     */
    getVroomApiBaseUrl(): string;
}