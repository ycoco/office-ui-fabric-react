
import {
    IUploadQosData,
    ConflictBehavior,
    IContent
} from './UploadService';
import {
    GraphError,
    getErrorResolution,
    getQosExtraDataFromError,
    ErrorCode,
    InnerErrorCode
} from '../../models/error/Error';
import {
    IItem
} from '../../models/item/Item';
import {
    UploadService,
    ICreateSessionResponse,
    IGetUploadStatusResponse,
    IUploadFragmentResponse
} from './UploadService';
import { ActivityBandwidthVerifier, IActivityBandwidthVerifierParams } from './ActivityBandwidthVerifier';
import { ISessionToken } from '../../base/tokenProvider/ITokenProvider';
import { Qos as QosEvent, ResultTypeEnum } from '@ms/odsp-utilities/lib/logging/events/Qos.event';
import Promise from '@ms/odsp-utilities/lib/async/Promise';
import Signal from '@ms/odsp-utilities/lib/async/Signal';

interface IRange {
    start: number;
    end: number;
}

export interface IWaitParams {
    duration: number;
    allowWakeWhenOnline?: boolean;
}

export interface IUploadConfiguration {
    readonly qosData: IUploadQosData;
    readonly itemUrl: string;
    readonly accessToken?: ISessionToken;
    readonly fileName: string;
    readonly content: IContent;
    readonly lastModifiedDate?: Date;
    readonly eTag?: string;
    readonly onPromptForConfictBehavior: (error?: GraphError) => Promise<ConflictBehavior>;
    readonly onWait: (params: IWaitParams) => Promise<void>;
    readonly onProgress: (lastByte: number) => void;
}

export interface IUploadState {
    readonly nextExpectedRanges?: string[];
    readonly sessionUrl?: string;
    readonly conflictBehavior?: ConflictBehavior;
    readonly waitDuration?: number;
    readonly attemptsRemaining?: number;
    readonly item?: IItem;
    readonly error?: Error;
    readonly speed?: number;
}

// A multiple of bytes convenient for the upload service.
const DISCRETE_CHUNK_SIZE = 320 * 1024;
const MAX_FRAGMENT_SIZE_BYTES = 60 * 1024 * 1024;
const MIN_FRAGMENT_SIZE_BYTES = 32 * 1024;
const INITIAL_WAIT_DURATION = 500;
const INITIAL_ATTEMPTS_REMAINING = 10;
const STANDARD_WAIT_DURATION = 1000;
const MAX_WAIT_DURATION = 30 * 1000;
const UPLOAD_FRAGMENT_TIMEOUT = 60 * 1000;
const SLOW_UPLOAD_FRAGMENT_TIMEOUT = 5 * UPLOAD_FRAGMENT_TIMEOUT;
const MAX_SPEED = 1;
const INITIAL_SPEED = 1 / 8;
const MIN_SPEED = 1 / 1920;

const SPEED_UPGRADE_RATIO = Math.pow(2, 1 / 4);
const FAST_SPEED_DOWNGRADE_RATIO = 1 / 8;
const SLOW_SPEED_DOWNGRADE_RATIO = 1 / 2;

export interface IUploadStateMachineDependencies {
    uploadService: UploadService;
    activityBandwidthVerifierType: new (params: IActivityBandwidthVerifierParams) => ActivityBandwidthVerifier;
    useCommitForUpload: boolean;
}

export class UploadStateMachine {
    private _uploadService: UploadService;
    private _activityBandwidthVerifierType: new (params: IActivityBandwidthVerifierParams) => ActivityBandwidthVerifier;
    private _useCommitForUpload: boolean;

    constructor(params: {}, dependencies: IUploadStateMachineDependencies) {
        this._uploadService = dependencies.uploadService;
        this._activityBandwidthVerifierType = dependencies.activityBandwidthVerifierType;
        this._useCommitForUpload = dependencies.useCommitForUpload;
    }

    /**
     * Performs the required action based on upload state and outputs the next state.
     */
    public advanceState(configuration: IUploadConfiguration, state: IUploadState): Promise<IUploadState> {
        const {
            sessionUrl,
            nextExpectedRanges
        } = state;

        let getNextState: Promise<IUploadState>;

        if (!sessionUrl) {
            getNextState = this._createSessionState(configuration, state);
        } else if (!nextExpectedRanges) {
            getNextState = this._getStatusState(configuration, state);
        } else {
            getNextState = this._uploadItemState(configuration, state);
        }

        return getNextState.then((state: IUploadState) => {
            if (state.error) {
                // Determine whether or not recovery is possible and update the state accordingly.
                return this._handleGeneralErrorState(configuration, state);
            } else {
                // The step was successful, so reset the retry behavior.
                return this._getState(state, {
                    waitDuration: undefined,
                    attemptsRemaining: undefined
                });
            }
        });
    }

    /**
     * Creates an upload session and updates state.
     */
    private _createSessionState(configuration: IUploadConfiguration, state: IUploadState): Promise<IUploadState> {
        const {
            qosData
        } = configuration;

        const qosEvent = new QosEvent({
            name: 'VroomUploader.createSession',
            extraData: qosData
        });

        return this._uploadService.createSession({
            qosData: qosData,
            itemUrl: configuration.itemUrl,
            accessToken: configuration.accessToken,
            fileName: configuration.fileName,
            fileSize: configuration.content.size,
            eTag: configuration.eTag,
            lastModifiedDate: configuration.lastModifiedDate,
            conflictBehavior: state.conflictBehavior
        }).then((response: ICreateSessionResponse) => {
            qosEvent.end({
                resultType: ResultTypeEnum.Success
            });

            return this._getState(state, {
                nextExpectedRanges: response.nextExpectedRanges,
                sessionUrl: response.uploadUrl
            });
        }, (error: Error) => {
            return this._handleCreateSessionErrorState(configuration, this._getState(state, {
                error: error
            })).then((state: IUploadState) => {
                if (state.error) {
                    qosEvent.end({
                        resultType: ResultTypeEnum.Failure,
                        resultCode: error.message,
                        extraData: {
                            ...qosData,
                            ...getQosExtraDataFromError(error)
                        }
                    });
                } else {
                    qosEvent.end({
                        resultType: ResultTypeEnum.ExpectedFailure
                    });
                }

                return state;
            });
        });
    }

    private _handleCreateSessionErrorState(configuration: IUploadConfiguration, state: IUploadState): Promise<IUploadState> {
        return this._handleErrorState(state, (code: ErrorCode | InnerErrorCode | number, error: GraphError) => {
            switch (code) {
                case 'entityTagDoesNotMatch':
                case 'resourceModified':
                case 'versionNumberDoesNotMatch':
                case 'nameAlreadyExists':
                case 409:
                case 412:
                    return this._promptForConflictBehaviorState(error, configuration, state);
            }
        });
    }

    private _getStatusState(configuration: IUploadConfiguration, state: IUploadState): Promise<IUploadState> {
        const {
            qosData
        } = configuration;

        const qosEvent = new QosEvent({
            name: 'VroomUploader.getStatus',
            extraData: qosData
        });

        return this._uploadService.getStatus({
            qosData: qosData,
            sessionUrl: state.sessionUrl
        }).then((response: IGetUploadStatusResponse) => {
            qosEvent.end({
                resultType: ResultTypeEnum.Success
            });

            return this._getState(state, {
                nextExpectedRanges: response.nextExpectedRanges
            });
        }, (error: Error) => {
            qosEvent.end({
                resultType: ResultTypeEnum.Failure,
                resultCode: error.message,
                extraData: {
                    ...qosData,
                    ...getQosExtraDataFromError(error)
                }
            });

            return this._getState(state, {
                error: error
            });
        });
    }

    /**
     * Performs either a fragment upload or a commit and updates state.
     */
    private _uploadItemState(configuration: IUploadConfiguration, state: IUploadState): Promise<IUploadState> {
        const {
            qosData
        } = configuration;

        const fileSize = configuration.content.size;

        const nextRange = this._getNextRange({
            fileSize: fileSize,
            nextExpectedRanges: state.nextExpectedRanges
        });

        const qosEvent = new QosEvent({
            name: 'VroomUploader.uploadItem',
            extraData: configuration.qosData
        });

        let pendingNextState: Promise<IUploadState>;

        if (nextRange && nextRange.start < fileSize) {
            pendingNextState = this._uploadFragmentState({
                nextRange: nextRange
            }, configuration, state);
        } else if (this._useCommitForUpload) {
            // There are no ranges to update, but no item was output.
            // This implies the upload needs to be committed manually.
            pendingNextState = this._commitState(configuration, state);
        } else {
            // There is nothing left to upload, but it is not possible to commit.
            // In this case, clear the session and restart since this is the only way to finish the upload.
            pendingNextState = this._cancelSessionState(configuration, state);
        }

        return pendingNextState.then((state: IUploadState) => {
            if (state.error) {
                return this._handleUploadItemErrorState(configuration, state).then((state: IUploadState) => {
                    const error = state.error;

                    if (error) {
                        qosEvent.end({
                            resultType: ResultTypeEnum.Failure,
                            resultCode: error.message,
                            extraData: {
                                ...qosData,
                                ...getQosExtraDataFromError(error)
                            }
                        });
                    } else {
                        qosEvent.end({
                            resultType: ResultTypeEnum.ExpectedFailure
                        });
                    }

                    return state;
                });
            }

            qosEvent.end({
                resultType: ResultTypeEnum.Success
            });

            return state;
        });
    }

    /**
     * Uploads a fragment and updates state.
     */
    private _uploadFragmentState({
        nextRange
    }: {
            nextRange: IRange;
        }, configuration: IUploadConfiguration, state: IUploadState): Promise<IUploadState> {
        const {
            onProgress,
            content,
            content: {
                size: fileSize
            },
            qosData
        } = configuration;

        const {
            sessionUrl,
            speed = INITIAL_SPEED
        } = state;

        const {
            start: startByte,
            end: suggestedEndByte
        } = nextRange;

        onProgress(startByte);

        const fragmentSize = this._getFragmentSize(speed);

        const endByte = Math.min(startByte + fragmentSize, suggestedEndByte);

        let uploadFragment: Promise<IUploadState>;

        const signal = new Signal<IUploadState>(() => {
            if (uploadFragment) {
                uploadFragment.cancel();
            }
        });

        const timeout = speed > MIN_SPEED ? UPLOAD_FRAGMENT_TIMEOUT : SLOW_UPLOAD_FRAGMENT_TIMEOUT;

        const bandwidthVerifier = new this._activityBandwidthVerifierType({
            timeout: timeout,
            totalBytes: endByte - startByte
        });

        let qosLastByte: number;

        const qosEvent = new QosEvent({
            name: 'VroomUploader.uploadFragment',
            extraData: {
                ...qosData,
                'startByte': startByte,
                'endByte': endByte,
                'fileSize': fileSize,
                'speed': speed,
                'fragmentSize': fragmentSize
            }
        });

        uploadFragment = this._uploadService.uploadFragment({
            qosData: configuration.qosData,
            sessionUrl: sessionUrl,
            startByte: startByte,
            endByte: endByte,
            fileSize: fileSize,
            content: content.slice(startByte, endByte),
            timeout: timeout,
            onProgress: (lastByte: number) => {
                qosLastByte = lastByte;

                if (speed > MIN_SPEED && !bandwidthVerifier.doesActivityHaveRemainingCapacity(lastByte - startByte)) {
                    qosEvent.end({
                        resultType: ResultTypeEnum.ExpectedFailure,
                        extraData: {
                            ...qosData,
                            'lastByte': lastByte
                        }
                    });

                    // If it is not possible to upload the remaining bytes in time,
                    // give up now and lower the fragment size for the next attempt.
                    signal.complete(this._getState(state, {
                        speed: Math.max(speed * SLOW_SPEED_DOWNGRADE_RATIO, MIN_SPEED),
                        nextExpectedRanges: undefined
                    }));

                    if (uploadFragment) {
                        uploadFragment.cancel();
                    }
                }

                onProgress(lastByte);
            }
        }).then((result: IUploadFragmentResponse | IItem) => {
            onProgress(endByte);

            qosEvent.end({
                resultType: ResultTypeEnum.Success
            });

            if (this._isItem(result)) {
                state = this._getState(state, {
                    item: result
                });
            } else {
                state = this._getState(state, {
                    nextExpectedRanges: result.nextExpectedRanges,
                    // If the upload had extra time, then it should be safe to increase the fragment size.
                    speed: Math.min(
                        bandwidthVerifier.didActivityHaveExtraCapacity() ?
                            speed * SPEED_UPGRADE_RATIO :
                            speed,
                        MAX_SPEED)
                });
            }

            return state;
        }, (error: Error) => {
            qosEvent.end({
                resultType: ResultTypeEnum.Failure,
                resultCode: error.message,
                extraData: {
                    ...qosData,
                    ...getQosExtraDataFromError(error),
                    'lastByte': qosLastByte
                }
            });

            return this._getState(state, {
                error: error
            });
        });

        uploadFragment.done((state: IUploadState) => {
            signal.complete(state);
        });

        return signal.getPromise();
    }

    /**
     * Commits the session and updates state.
     */
    private _commitState(configuration: IUploadConfiguration, state: IUploadState): Promise<IUploadState> {
        configuration.onProgress(configuration.content.size);

        const {
            qosData
        } = configuration;

        const qosEvent = new QosEvent({
            name: 'VroomUploader.commit',
            extraData: qosData
        });

        // There are no ranges to update, but no item was output.
        // This implies the upload needs to be committed manually.
        return this._uploadService.commit({
            qosData: qosData,
            itemUrl: configuration.itemUrl,
            accessToken: configuration.accessToken,
            fileName: configuration.fileName,
            sessionUrl: state.sessionUrl,
            conflictBehavior: state.conflictBehavior
        }).then((item: IItem) => {
            qosEvent.end({
                resultType: ResultTypeEnum.Success
            });

            return this._getState(state, {
                item: item
            });
        }, (error: Error) => {
            return this._handleCommitErrorState(this._getState(state, {
                error: error
            })).then((state: IUploadState) => {
                qosEvent.end({
                    resultType: state.error ? ResultTypeEnum.Failure : ResultTypeEnum.ExpectedFailure,
                    resultCode: error.message,
                    extraData: {
                        ...qosData,
                        ...getQosExtraDataFromError(error)
                    }
                });

                return state;
            });
        });
    }

    private _handleCommitErrorState(state: IUploadState): Promise<IUploadState> {
        return this._handleErrorState(state, (code: ErrorCode | InnerErrorCode | number) => {
            switch (code) {
                case 'uploadSessionFailed':
                case 'uploadSessionNotFound':
                case 410:
                    return Promise.wrap(this._getState(state, {
                        error: undefined,
                        sessionUrl: undefined
                    }));
            }
        });
    }

    private _cancelSessionState(configuration: IUploadConfiguration, state: IUploadState): Promise<IUploadState> {
        const {
            qosData
        } = configuration;

        const qosEvent = new QosEvent({
            name: 'VroomUploader.cancelSession',
            extraData: qosData
        });

        return this._uploadService.cancelSession({
            qosData: configuration.qosData,
            sessionUrl: state.sessionUrl
        }).then(() => {
            qosEvent.end({
                resultType: ResultTypeEnum.Success
            });

            return this._getState(state, {
                sessionUrl: undefined
            });
        }, (error: Error) => {
            qosEvent.end({
                resultType: ResultTypeEnum.Failure,
                resultCode: error.message,
                extraData: {
                    ...qosData,
                    ...getQosExtraDataFromError(error)
                }
            });

            return this._getState(state, {
                sessionUrl: undefined
            });
        });
    }

    /**
     * Handles a fragment upload or commit error, either by resetting some state or failing out.
     */
    private _handleUploadItemErrorState(configuration: IUploadConfiguration, state: IUploadState): Promise<IUploadState> {
        const {
            speed = MAX_SPEED
        } = state;

        // All fragment upload errors should reset the known progress.
        state = this._getState(state, {
            nextExpectedRanges: undefined
        });

        return this._handleErrorState(state, (code: ErrorCode | InnerErrorCode | number, error: GraphError) => {
            switch (code) {
                case 0:
                    // The message was likely too large to get through. Dramatically reduce the size.
                    return window.navigator.onLine ? Promise.wrap(this._getState(state, {
                        speed: Math.max(speed * FAST_SPEED_DOWNGRADE_RATIO, MIN_SPEED)
                    })) : undefined;
                case 'uploadSessionFailed':
                case 'uploadSessionNotFound':
                case 404:
                    // Upload session is somehow gone. Need to start over.
                    return Promise.wrap(this._getState(state, {
                        error: undefined,
                        sessionUrl: undefined
                    }));
                case 'entityTagDoesNotMatch':
                case 'resourceModified':
                case 'versionNumberDoesNotMatch':
                case 'nameAlreadyExists':
                case 409:
                case 412:
                    return this._promptForConflictBehaviorState(error, configuration, state);
                case 'invalidRange':
                case 416:
                    // Fragment overlap. Need to wait for a previous fragment upload to resolve.
                    return this._wait({
                        duration: STANDARD_WAIT_DURATION
                    }, configuration).then(() => {
                        return this._getState(state, {
                            error: undefined
                        });
                    });
            }
        });
    }

    /**
     * Handles a general API error, either by waiting and resetting some state or failing out.
     */
    private _handleGeneralErrorState(configuration: IUploadConfiguration, state: IUploadState): Promise<IUploadState> {
        const {
            waitDuration = INITIAL_WAIT_DURATION,
            attemptsRemaining = INITIAL_ATTEMPTS_REMAINING
        } = state;

        return this._handleErrorState(state, (code: ErrorCode | InnerErrorCode | number) => {
            switch (code) {
                case 'unauthenticated':
                case 401 /* Unauthorized */:
                case 'lockMismatch':
                case 423 /* Lock error */:
                case 501: /* Upload not allowed */
                case 'quotaLimitReached':
                case 507: /* Quota exceeded */
                    return;
            }

            if (typeof code === 'number') {
                if (code >= 400 && code < 500 /* Client error */) {
                    // Retry is not allowed.
                    return;
                }

                if (code === 0 ||
                    code >= 500 && code < 600 /* Transient server error */) {
                    // Server error. Wait and retry indefinitely via exponential back-off.
                    return this._wait({
                        duration: waitDuration,
                        allowWakeWhenOnline: true
                    }, configuration).then(() => {
                        return this._getState(state, {
                            error: undefined,
                            waitDuration: Math.min(waitDuration * 2, MAX_WAIT_DURATION),
                            attemptsRemaining: undefined
                        });
                    });
                }

                if (!attemptsRemaining) {
                    // Out of retry attempts.
                    return;
                }

                // Retryable client error. Retry a finite amount of times.
                return this._wait({
                    duration: STANDARD_WAIT_DURATION
                }, configuration).then(() => {
                    return this._getState(state, {
                        error: undefined,
                        waitDuration: undefined,
                        attemptsRemaining: Math.max(attemptsRemaining - 1, 0)
                    });
                });
            }
        });
    }

    private _handleErrorState(state: IUploadState, resolveError: (code: ErrorCode | InnerErrorCode | number, error?: GraphError) => Promise<IUploadState>): Promise<IUploadState> {
        const {
            error
        } = state;

        let resolution = getErrorResolution(error, resolveError);

        if (resolution === undefined) {
            resolution = Promise.wrap(state);
        }

        return resolution;
    }

    private _promptForConflictBehaviorState(error: GraphError, configuration: IUploadConfiguration, state: IUploadState): Promise<IUploadState> {
        const {
            onPromptForConfictBehavior,
            qosData
        } = configuration;

        const qosEvent = new QosEvent({
            name: 'VroomUploader.promptForConflictBehavior',
            extraData: qosData
        });

        return Promise.wrap().then(() => {
            return onPromptForConfictBehavior(error);
        }).then((conflictBehavior: ConflictBehavior) => {
            qosEvent.end({
                resultType: ResultTypeEnum.Success,
                extraData: qosData
            });

            return this._getState(state, {
                error: undefined,
                conflictBehavior: conflictBehavior
            });
        }, (error: Error) => {
            qosEvent.end({
                resultType: ResultTypeEnum.Failure,
                resultCode: error.message,
                extraData: {
                    ...qosData,
                    ...getQosExtraDataFromError(error)
                }
            });

            return this._getState(state, {
                error: error
            });
        });
    }

    private _wait({
        duration,
        allowWakeWhenOnline
    }: {
            duration: number;
            allowWakeWhenOnline?: boolean;
        }, configuration: IUploadConfiguration): Promise<void> {
        const {
            onWait,
            qosData
        } = configuration;

        const qosEvent = new QosEvent({
            name: 'VroomUploader.wait',
            extraData: qosData
        });

        return Promise.wrap<void>().then(() => {
            return onWait({
                duration: duration,
                allowWakeWhenOnline: allowWakeWhenOnline
            });
        }).then(() => {
            qosEvent.end({
                resultType: ResultTypeEnum.Success
            });
        }, (error: Error) => {
            qosEvent.end({
                resultType: Promise.isCanceled(error) ? ResultTypeEnum.Success : ResultTypeEnum.Failure
            });

            return Promise.wrapError(error);
        });
    }

    /**
     * Gets an incremented state based on a current state and a delta.
     */
    private _getState(current: IUploadState, increment: Partial<IUploadState>): IUploadState {
        return {
            ...current,
            ...increment
        };
    }

    /**
     * Gets the next valid byte range for the upload given the expected ranges from the server.
     */
    private _getNextRange({
        fileSize,
        nextExpectedRanges = []
    }: {
            fileSize: number;
            nextExpectedRanges: string[];
        }): IRange {
        return nextExpectedRanges.reduce((nextRange: IRange, rangeInput: string): IRange => {
            // rangeInput e.g. '0-', '1024-4095'

            const [startInput, endInput] = rangeInput.split('-', 2);
            // startInput e.g. '0', '1024'
            // endInput e.g. '', '4095'

            const startByte = parseInt(startInput, 10);
            // startByte e.g. 0, 1024

            let range: IRange;

            if (!nextRange || startByte < nextRange.start && startByte < fileSize) {
                const endByte = endInput === '' ?
                    fileSize :
                    Math.min(
                        parseInt(endInput, 10) + 1, // endInput is the *index* of the last byte
                        fileSize);
                // endByte e.g. 3556, 4096

                range = {
                    start: startByte,
                    end: endByte
                };
            } else {
                range = nextRange;
            }

            return range;
        }, undefined);
    }

    private _isItem<T>(itemOrOther: IItem | T): itemOrOther is IItem {
        return !!(<IItem>itemOrOther).id;
    }

    /**
     * Determines the fragment size to use given a current speed value.
     */
    private _getFragmentSize(speed: number): number {
        const rawFragmentSize = speed * MAX_FRAGMENT_SIZE_BYTES;

        let normalizedFragmentSize: number;

        if (rawFragmentSize > DISCRETE_CHUNK_SIZE) {
            // If the fragment size is greater than the discrete chunk size, always use a multiple of
            // the discrete chunk size.
            normalizedFragmentSize = rawFragmentSize - rawFragmentSize % DISCRETE_CHUNK_SIZE;
        } else {
            // Otherwise, use a multiple of the minimum chunk size.
            normalizedFragmentSize = rawFragmentSize - rawFragmentSize % MIN_FRAGMENT_SIZE_BYTES;
        }

        return Math.min(Math.max(normalizedFragmentSize, MIN_FRAGMENT_SIZE_BYTES), MAX_FRAGMENT_SIZE_BYTES);
    }
}
