import Promise from '@ms/odsp-utilities/lib/async/Promise';
import Semaphore from '@ms/odsp-utilities/lib/async/Semaphore';
import { UploadState, UploadErrorType } from './Upload';
import { ISPListItem } from '../../ListItem';
import { ISPCreateFolderContext } from '../../dataSources/fileSystem/ISPCreateFolderContext';
import { UploadError } from './UploadError';
import { BaseUploader } from './BaseUploader';

export interface ISingleFolderUploaderParams {
    parentItem: ISPListItem;
    name: string;
    onCreateFolder: (item: ISPListItem) => Promise<void>;
}

export interface ISingleFolderUploaderDependencies {
    dataSource: { createFolder: (context: ISPCreateFolderContext) => Promise<ISPListItem>; };
    uploadQueue: Semaphore;
}

export class SingleFolderUploader extends BaseUploader {
    public state: UploadState;
    public fileName: string;
    public error: UploadError;
    public item: ISPListItem;

    private _parentItem: ISPListItem;
    private _dataSource: { createFolder: (context: ISPCreateFolderContext) => Promise<ISPListItem>; };
    private _uploadQueue: Semaphore;
    private _onCreateFolder: (item: ISPListItem) => Promise<void>;

    private _uploadPromise: Promise<void>;

    constructor(params: ISingleFolderUploaderParams, dependencies: ISingleFolderUploaderDependencies) {
        super();

        this._dataSource = dependencies.dataSource;
        this._uploadQueue = dependencies.uploadQueue;

        this._parentItem = params.parentItem;
        this._onCreateFolder = params.onCreateFolder;

        this.state = UploadState.queued;
        this.fileName = params.name;
    }

    public start(): void {
        this._uploadPromise = this._upload();
    }

    public abort(): void {
        this.error = undefined;
        this.updateState(UploadState.aborted);

        const uploadPromise = this._uploadPromise;
        delete this._uploadPromise;

        if (uploadPromise) {
            uploadPromise.cancel();
        }
    }

    public restart(): void {
        const uploadPromise = this._uploadPromise;
        delete this._uploadPromise;

        if (uploadPromise) {
            uploadPromise.cancel();
        }

        uploadPromise.then(() => {
            // Nothing.
        }, () => {
            // Ignore errors.
        }).done(() => {
            this.start();
        });
    }

    private _upload(): Promise<void> {
        this.updateState(UploadState.started);

        return this._uploadQueue.enqueue(() => this._dataSource.createFolder({
            parent: this._parentItem,
            folderName: this.fileName,
            needItemDetails: true
        })).then((item: ISPListItem) => {
            this.item = item;

            return this._onCreateFolder(item);
        }).then(() => {
            this.updateState(UploadState.completed);
        }, (error: Error | string) => {
            let message: string;

            if (error instanceof Error) {
                message = error.message;
            } else {
                message = error;
            }

            this.error = new UploadError({
                errorType: UploadErrorType.other,
                message: message
            });

            this.updateState(UploadState.failed);
        });
    }
}

export default SingleFolderUploader;
