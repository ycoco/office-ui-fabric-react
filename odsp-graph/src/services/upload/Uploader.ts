
import Promise from '@ms/odsp-utilities/lib/async/Promise';
import {
    IItem
} from '../../models/item/Item';
import {
    GraphError,
    getQosExtraDataFromError
} from '../../models/error/Error';
import { UploadService, IUploadQosData, ConflictBehavior, IContent } from './UploadService';
import { UploadStateMachine, IUploadConfiguration, IUploadState, IWaitParams } from './UploadStateMachine';
import { ISessionToken } from '../../base/tokenProvider/ITokenProvider';
import { Qos as QosEvent, ResultTypeEnum } from '@ms/odsp-utilities/lib/logging/events/Qos.event';

// The following implements the upload behavior defined in the OneDrive SDK:
// https://dev.onedrive.com/items/upload_large_files.htm

export interface IUploaderDependencies {
    readonly uploadService: UploadService;
    readonly uploadStateMachine: UploadStateMachine;
}

export interface IUploadParams {
    readonly qosData: IUploadQosData;
    readonly content: IContent;
    readonly fileName: string;
    readonly itemUrl: string;
    readonly accessToken?: ISessionToken;
    readonly lastModifiedDate?: Date;
    readonly conflictBehavior?: ConflictBehavior;
    readonly eTag?: string;
    readonly onProgress: (lastByte: number) => void;
    readonly onPromptForConfictBehavior: (error?: GraphError) => Promise<ConflictBehavior>;
    readonly onWait: (params: IWaitParams) => Promise<void>;
}

/**
 * Component which performs uploads using the Vroom API.
 */
export class Uploader {
    private _uploadService: UploadService;
    private _uploadStateMachine: UploadStateMachine;

    constructor(params: {}, dependencies: IUploaderDependencies) {
        const {
            uploadService,
            uploadStateMachine
        } = dependencies;

        this._uploadService = uploadService;
        this._uploadStateMachine = uploadStateMachine;
    }

    public upload({
        conflictBehavior,
        ...configuration
    }: IUploadParams): Promise<IItem> {
        const {
            qosData
        } = configuration;

        const qosEvent = new QosEvent({
            name: 'VroomUploader.upload',
            extraData: qosData
        });

        return this._uploadState(configuration, {
            conflictBehavior: conflictBehavior
        }).then((item: IItem) => {
            qosEvent.end({
                resultType: ResultTypeEnum.Success
            });

            return item;
        }, (error: Error) => {
            qosEvent.end({
                resultType: Promise.isCanceled(error) ? ResultTypeEnum.ExpectedFailure : ResultTypeEnum.Failure,
                resultCode: error.message,
                extraData: {
                    ...qosData,
                    ...getQosExtraDataFromError(error)
                }
            });

            return Promise.wrapError(error);
        });
    }

    /**
     * Advances a state machine until an item is uploaded or a non-retryable error occurs.
     */
    private _uploadState(configuration: IUploadConfiguration, state: IUploadState): Promise<IItem> {
        const {
            sessionUrl,
            item,
            error
        } = state;

        if (item) {
            // Success state.
            return Promise.wrap(item);
        } else if (error) {
            // Termination state.
            let cancelSession: Promise<void>;

            if (sessionUrl) {
                cancelSession = this._uploadService.cancelSession({
                    qosData: configuration.qosData,
                    sessionUrl: sessionUrl
                }).then(() => {
                    // Do nothing.
                }, () => {
                    // Ignore error.
                });
            }

            return Promise.as(cancelSession).then(() => {
                return Promise.wrapError(error);
            });
        }

        // Advance the state.
        return this._uploadStateMachine.advanceState(configuration, state).then((nextState: IUploadState) => {
            // Cycle back through the machine.
            return this._uploadState(configuration, nextState);
        });
    }
}

export default Uploader;
