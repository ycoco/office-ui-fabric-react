
import { extend } from '@ms/odsp-utilities/lib/object/ObjectUtil';

export class GraphError implements Error {
    public readonly name: string;
    public readonly message: string;
    public readonly response: IErrorResponse;
    public readonly status: number;
    public readonly serverStack: string;
    public readonly error: Error;
    public readonly type: this;
    public readonly request: XMLHttpRequest;

    constructor(error: Error, params: IErrorParams) {
        /* tslint:disable:no-use-before-declare */
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
        /* tslint:enable:no-use-before-declare */

        const {
            message
        } = error;

        this.name = 'GraphError';
        this.message = message;
        this.type = this;
        this.response = response;
        this.status = status;
        this.serverStack = stackTrace;
        this.request = request;
        this.error = error;

        return extend(error, this);
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

const errorMessage = 'errorMessage';
const vroomStatus = 'vroomStatus';
const vroomErrorCode = 'vroomErrorCode';
const vroomErrorMessage = 'vroomErrorMessage';
const vroomErrorInnerCode = 'vroomErrorInnerCode';
const vroomErrorInnerMessage = 'vroomErrorInnerMessage';
const vroomErrorInnerDebugMessage = 'vroomErrorInnerDebugMessage';
const vroomErrorInnerStack = 'vroomErrorInnerStack';

export function getQosExtraDataFromError(error: Error): { [key: string]: string | number | boolean; } {
    const extraData: {
        [key: string]: string | number | boolean;
    } = {};

    extraData[errorMessage] = error.message;

    if (isGraphError(error)) {
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

export function isGraphError(error: Error): error is GraphError {
    return (<GraphError>error).type instanceof GraphError;
}

export function getErrorResolution<T>(error: Error, resolveError: (code: ErrorCode | InnerErrorCode | number, error?: GraphError) => T): T | undefined {
    if (isGraphError(error)) {
        const {
            response,
            status
        } = error;

        if (response) {
            const innerErrors: IError[] = [];

            let innerError = response.error;

            while (innerError) {
                innerErrors.push(innerError);

                innerError = innerError.innererror;
            }

            while (innerError = innerErrors.pop()) {
                const resolution = resolveError(innerError.code, error);

                if (resolution !== undefined) {
                    return resolution;
                }
            }
        }

        return resolveError(status, error);
    }
}
