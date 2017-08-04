/**
 * @todo: this needs to be converged with the odsp-next base BatchUploader and shared.
 *
 * Currently, the odsp-next BatchUploader depends on the OperationProgress framework
 * and the knockout-dependent uploader interface. Need to work on factoring them out so
 * we can share the core logic.
 */

import Async from '@ms/odsp-utilities/lib/async/Async';
import Promise from '@ms/odsp-utilities/lib/async/Promise';
import Semaphore from '@ms/odsp-utilities/lib/async/Semaphore';
import Signal from '@ms/odsp-utilities/lib/async/Signal';
import EventGroup from '@ms/odsp-utilities/lib/events/EventGroup';
import PlatformDetection from '@ms/odsp-utilities/lib/browser/PlatformDetection';
import * as FileEntries from '@ms/odsp-utilities/lib/file/FileEntries';
import { IFileSystemEntry } from '@ms/odsp-utilities/lib/file/FileSystem';
import { INativeHtml5File } from '@ms/odsp-utilities/lib/file/INativeHtml5File';
import Html5FileUpload from '@ms/odsp-utilities/lib/file/Html5FileUpload';
import { ISPListItem } from '../../ListItem';
import { ISPListContext } from '../../SPListItemRetriever';
import ISpPageContext from '../../interfaces/ISpPageContext';
import { ISPCreateFolderContext } from '../fileSystem/ISPCreateFolderContext';
import { ItemUrlHelper, ApiUrlHelper } from '../../Url';
import { UploadError } from './UploadError';
import { UploadState, UploadErrorType } from './Upload';
import { IUploader, UPLOADSTATE_CHANGE } from './IUploader';
import { SingleFileUploader } from './SingleFileUploader';
import { SingleFolderUploader } from './SingleFolderUploader';
import { SingleErrorUploader } from './SingleErrorUploader';

const MAX_FILE_SIZE = 10 * 1024 * 1024 * 1024;

interface IPendingUpload {
    wait: Promise<void>;
}

export interface IUploadProgressInfo {
    state: UploadState;
    totalCount: number;
    successCount?: number;
    failureCount?: number;
}

export interface IUploadParams {
    files: File[];
    parentItem: ISPListItem;
    onBatchComplete?: () => void;
    onUpdateProgress?: (progressInfo: IUploadProgressInfo) => void;
}

export interface IUploadDependencies {
    listContext: ISPListContext;
    itemUrlHelper: ItemUrlHelper;
    apiUrlHelper: ApiUrlHelper;
    pageContext: ISpPageContext;
    async: Async;
    platformDetection: PlatformDetection;
    dataSource: { createFolder: (context: ISPCreateFolderContext) => Promise<ISPListItem>; };
}

export class BatchUploader {
    private _fileList: INativeHtml5File[];
    private _uploaders: IUploader[];
    private _parentItem: ISPListItem;
    private _startUploadQueue: Semaphore;
    private _async: Async;
    private _fileReaderQueue: Semaphore;
    private _fileReader: FileReader;
    private _events: EventGroup;
    private _deps: IUploadDependencies;
    private _maxFileSize: number;
    private _onBatchComplete: () => void;
    private _onUpdateProgress: (progressInfo: IUploadProgressInfo) => void;

    private _totalCount: number;
    private _successCount: number;
    private _failureCount: number;

    constructor(params: IUploadParams, dependencies: IUploadDependencies) {
        this._fileList = params.files;
        this._parentItem = params.parentItem;
        this._onBatchComplete = params.onBatchComplete;
        this._onUpdateProgress = params.onUpdateProgress;

        this._deps = dependencies;
        this._async = this._deps.async;
        this._maxFileSize = MAX_FILE_SIZE;

        this._uploaders = [];
        this._events = new EventGroup(this);

        this._fileReader = new FileReader();
        this._fileReaderQueue = new Semaphore();
        this._startUploadQueue = new Semaphore();
    }

    public start(): Promise<void> {
        return this.beforeStart().then(() => {
            const files = this._fileList;

            let entries: FileEntries.IEntry[];

            if (isFileList(files)) {
                entries = FileEntries.buildEntriesFromFileList(files);
            } else {
                entries = FileEntries.buildEntriesFromEntryList(files);
            }

            return Promise.all(entries.map((entry: FileEntries.IEntry, index: number) => {
                return this._getUpload(entry, this._parentItem, index);
            })).then((uploads: IPendingUpload[]) => {
                // All uploads have been initialized.
                this._updateProgress({
                    state: UploadState.started,
                    totalCount: this._totalCount,
                    successCount: this._successCount,
                    failureCount: this._failureCount
                });
                return Promise.all(uploads.map((upload: IPendingUpload) => upload.wait));
            }).then(() => {
                // All uploads are complete.
            });
        }).then(() => {
            this.onBatchComplete();
        }, () => {
            this.onBatchComplete();
        });
    }

    protected beforeStart(): Promise<void> {
        this._totalCount = 0;
        this._successCount = 0;
        this._failureCount = 0;

        return Promise.wrap<void>();
    }

    protected onBatchComplete(): void {
        this._updateProgress({
            state: (this._failureCount === 0) ? UploadState.completed : UploadState.failed,
            totalCount: this._totalCount,
            successCount: this._successCount,
            failureCount: this._failureCount
        });
        if (this._onBatchComplete) {
            this._onBatchComplete();
        }
    }

    private _getUpload(entry: FileEntries.IEntry, parentItem: ISPListItem, index: number): Promise<IPendingUpload> {
        return this._startUploadQueue.enqueue(() => {
            let timeoutId: number;

            const signal = new Signal<void>(() => {
                if (timeoutId) {
                    this._async.clearTimeout(timeoutId);
                }
            });

            timeoutId = this._async.setTimeout(() => signal.complete(), 0);

            return signal.getPromise();
        }).then(() => {
            let upload: Promise<IPendingUpload>;

            if (entry.type === FileEntries.EntryType.directory) {
                upload = this._getDirectoryUpload(entry, parentItem);
            } else {
                upload = this._getUnknownUpload(entry, parentItem, index);
            }

            return upload;
        }).then((upload: IPendingUpload) => {
            return upload;
        }, (error: Error) => {
            return Promise.wrapError(error);
        });
    }

    private _getDirectoryUpload(directoryEntry: FileEntries.IDirectoryEntry, parentItem: ISPListItem): Promise<IPendingUpload> {
        const initialUploads = new Signal<IPendingUpload[]>();

        const uploader = new SingleFolderUploader({
            name: directoryEntry.name,
            parentItem: parentItem,
            onCreateFolder: (item: ISPListItem) => {
                return directoryEntry.getEntries().then((page: FileEntries.IDirectoryPage) => {
                    return this._getUploadsForDirectoryPage(page, item, 0);
                }).then((uploads: IPendingUpload[]) => {
                    // All uploads in the folder are initialized.
                    initialUploads.complete(uploads);
                }, (error: Error) => {
                    initialUploads.error(error);
                });
            }
        }, {
            dataSource: this._deps.dataSource,
            uploadQueue: new Semaphore(3)
        });

        const folderUpload: IPendingUpload = {
            wait: this._waitForUploader(uploader).then(() => {
                return initialUploads.getPromise();
            }).then((uploads: IPendingUpload[]) => {
                this._updateProgress({
                    state: UploadState.started,
                    totalCount: this._totalCount,
                    successCount: this._successCount,
                    failureCount: this._failureCount
                });
                // One the folder is uploads, wait for the children to upload.
                return Promise.all(uploads.map((upload: IPendingUpload) => upload.wait));
            }).then(() => {
                // The folder is created, and all uploads in the folder are done.
            })
        };

        return Promise.wrap(folderUpload);
    }

    private _waitForUploader(uploader: IUploader): Promise<void> {
        const signal = new Signal<void>(() => {
            uploader.abort();
        });

        this._updateSignalFromUploadState(uploader, signal);

        this._addUploader(uploader);

        uploader.start();

        return signal.getPromise();
    }

    private _updateSignalFromUploadState(uploader: IUploader, signal: Signal<void>) {
        const state = uploader.state;

        this._events.off(uploader, UPLOADSTATE_CHANGE);
        if (state === UploadState.completed) {
            this._successCount++;
            signal.complete();
        } else if (state === UploadState.failed) {
            this._failureCount++;
            signal.error(uploader.error || new Error('Unknown error from uploader.'));
        } else if (state === UploadState.aborted) {
            this._failureCount++;
            signal.cancel();
        } else {
            this._events.on(uploader, UPLOADSTATE_CHANGE, () => {
                this._updateSignalFromUploadState(uploader, signal);
            });
        }
    }

    private _addUploader(uploader: IUploader): IUploader {
        this._totalCount++;
        this._uploaders.push(uploader);
        return uploader;
    }

    private _getUploadsForDirectoryPage(directoryPage: FileEntries.IDirectoryPage, parentItem: ISPListItem, offset: number): Promise<IPendingUpload[]> {
        const {
            entries
        } = directoryPage;

        const pendingUploads = [Promise.all(entries.map((entry: FileEntries.IEntry, index: number) => {
            return this._getUpload(entry, parentItem, offset + index);
        }))];

        if (directoryPage.getEntries) {
            pendingUploads.push(directoryPage.getEntries().then((nextPage: FileEntries.IDirectoryPage) => this._getUploadsForDirectoryPage(nextPage, parentItem, offset + entries.length)));
        }

        return Promise.all(pendingUploads).then((uploads: IPendingUpload[][]): IPendingUpload[] => {
            return [].concat(...uploads);
        });
    }

    private _getUnknownUpload(fileEntry: FileEntries.IUnknownEntry | FileEntries.IFileEntry, parentItem: ISPListItem, index: number): Promise<IPendingUpload> {
        return fileEntry.getFile().then((file: INativeHtml5File) => {
            let validateFolder: Promise<void>;

            let isFolder: boolean;

            if (fileEntry.type === FileEntries.EntryType.unknown) {
                validateFolder = this._isFolder(file).then((isFolderResult: boolean) => {
                    isFolder = true;

                    if (isFolderResult) {
                        return Promise.wrapError(new UploadError({
                            message: '',
                            errorType: UploadErrorType.folderUploadNotSupported
                        }));
                    }
                });
            } else {
                validateFolder = Promise.wrap<void>();
            }

            const fileUpload = new Html5FileUpload({
                file: file
            }, {
                platformDetection: this._deps.platformDetection
            });

            return validateFolder.then(() => {
                return this._validateFile({
                    fileUpload: fileUpload
                });
            }).then(() => {
                return new SingleFileUploader({
                    fileUpload: fileUpload,
                    parentItem: parentItem
                }, {
                    listContext: this._deps.listContext,
                    itemUrlHelper: this._deps.itemUrlHelper,
                    apiUrlHelper: this._deps.apiUrlHelper,
                    pageContext: this._deps.pageContext,
                    async: this._async
                });
            }, (error: UploadError) => {
                // The file has been found to be invalid.
                return new SingleErrorUploader({ error: error });
            });
        }, (error: Error) => {
            // Unable to resolve the file from the file system.
            return new SingleErrorUploader({
                error: new UploadError({
                    errorType: UploadErrorType.general,
                    message: ''
                })
            });
        }).then((uploader: IUploader) => {
            const upload: IPendingUpload = {
                wait: this._waitForUploader(uploader)
            };

            return upload;
        });
    }

    private _validateFile({
        fileUpload
    }: {
            fileUpload: Html5FileUpload;
        }): Promise<void> {
        if (!fileUpload.name) {
            return Promise.wrapError(new UploadError({
                message: '',
                errorType: UploadErrorType.invalidName
            }));
        } else if (!fileUpload.size) {
            return Promise.wrapError(new UploadError({
                message: '',
                errorType: this._isSPList() ? UploadErrorType.emptyFileOrFolderForDocLib : UploadErrorType.emptyFileOrFolder,
                libraryName: this._deps.listContext.listTitle
            }));
        } else if (this._maxFileSize !== undefined && fileUpload.size > this._maxFileSize) {
            return Promise.wrapError(new UploadError({
                message: '',
                errorType: UploadErrorType.fileSize,
                maxSizeInBytes: this._maxFileSize
            }));
        } else {
            return Promise.wrap<void>();
        }
    }

    private _isSPList(): boolean {
        return this._deps.listContext.listTemplateType !== 700;
    }

    private _isFolder(file: INativeHtml5File): Promise<boolean> {
        const fileReader = this._fileReader;

        return this._fileReaderQueue.enqueue(() => {
            const signal = new Signal<boolean>();

            this._events.on(fileReader, 'load', () => {
                signal.complete(false);
            });

            this._events.on(fileReader, 'error', () => {
                // This is most likely a folder since it does not have content.
                signal.complete(true);
            });

            const slice: (startByte: number, endByte: number) => Blob = file.slice || file.mozSlice || file.webkitSlice;

            try {
                fileReader.readAsArrayBuffer(slice.call(file, 0, Math.min(1, file.size)));
            } catch (error) {
                // This is most likely a folder.
                signal.complete(true);
            }

            return signal.getPromise().then((isFolder: boolean) => {
                this._events.off(fileReader);

                return isFolder;
            });
        });
    }

    private _updateProgress(progressInfo: IUploadProgressInfo) {
        if (this._onUpdateProgress) {
            this._onUpdateProgress(progressInfo);
        }
    }
}

function isFileList(files: ReadonlyArray<INativeHtml5File> | ReadonlyArray<IFileSystemEntry>): files is ReadonlyArray<INativeHtml5File> {
    const file = <INativeHtml5File>files[0];

    return !!file && typeof (file.slice || file.mozSlice || file.webkitSlice) === 'function' && ('size' in file);
}