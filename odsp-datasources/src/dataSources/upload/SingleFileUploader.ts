// OneDrive:IgnoreCodeCoverage

/**
 * Adapted from odsp-next/.../odb/SingleFileUploader with the streaming upload.
 * @todo: replace with the VroomUploader once it supports streaming upload.
 */

import Promise from '@ms/odsp-utilities/lib/async/Promise';
import Async from '@ms/odsp-utilities/lib/async/Async';
import Semaphore from '@ms/odsp-utilities/lib/async/Semaphore';
import Signal from '@ms/odsp-utilities/lib/async/Signal';
import Guid from '@ms/odsp-utilities/lib/guid/Guid';
import UriEncoding from '@ms/odsp-utilities/lib/encoding/UriEncoding';
import Html5FileUpload from '@ms/odsp-utilities/lib/file/Html5FileUpload';
import Features from '@ms/odsp-utilities/lib/features/Features';
import ItemType from '@ms/odsp-utilities/lib/icons/ItemType';
import * as Path from '@ms/odsp-utilities/lib/path/Path';
import ISpPageContext from '../../interfaces/ISpPageContext';
import { UploadState, UploadErrorType } from './Upload';
import { NameConflictBehavior } from './NameConflictBehavior';
import { ISPListItem } from '../../ListItem';
import { ItemUrlHelper, ApiUrlHelper, IMethodArguments } from '../../Url';
import DataRequestor from '../../dataSources/base/DataRequestor';
import ListTemplateType from '../../dataSources/listCollection/ListTemplateType';
import { ISPListContext } from '../../SPListItemRetriever';
import { buildItemKey } from '../../utilities/list/DataSourceUtilities';
import { UploadError } from './UploadError';
import { BaseUploader } from './BaseUploader';

const SupportPoundPercent = { ODB: 54 };

const MEGABYTES = 1024 * 1024;
const LARGE_FILESIZE = 24 * MEGABYTES;
const UPLOAD_CHUNK_SIZE = 8 * MEGABYTES;
const UPLOAD_STREAMING_CHUNK_SIZE = 250 * MEGABYTES;
const UPLOAD_STREAMING_CHUNK_SIZE_LIMIT = 1 * MEGABYTES;
const MIN_CHUNK_SIZE = 256 * 1024; // 256 kB
const MAX_CHUNK_SIZE = 60 * MEGABYTES;
const MAX_CURRENT_UPLOADS = 3;
const MAX_RETRY_COUNT = 3;
const RETRY_INTERVAL = 1000; // 1 second
const MAX_UPLOAD_REQUEST_DURATION = 60000; // 1 minute. Any longer and there is a risk of losing auth.
const MAX_UPLOAD_STREAMING_REQUEST_DURATION = 2.5 * 60000; // 2.5 minutes for upload streaming, if we get a slower connection then a single half on the chunk size would be close to the throughput of traditional wifi
const SPEED_CHECK_INTERVAL = 10000; // 10 seconds.

const ERRORCODE_DOCALREADYEXISTS = -2130575257;
const ERRORCODE_TIMEOUT = -1;
const ERRORCODE_TOOSLOW = -2;
const ERRORCODE_FILEUPLOADALREADYINPROGRESS = -2130575142;

const TIMEOUT_MILLISECONDS_PER_BYTE = 0.08;
const MIN_INACTIVITY_TIMEOUT = 10000; // 10 seconds.
const FINAL_CHUNK_INACTIVITY_TIMEOUT = 300000; // 5 minutes.

const ON_PROGRESS_THROTTLE_DELAY = 100;

const UPLOAD_QUEUE = new Semaphore(MAX_CURRENT_UPLOADS);

interface IUploadErrorResponse {
    code: string;
    message: string | {
        lang: string;
        value: string;
    };
}

interface IFileUploadStatus {
    d: {
        ExpectedContentRange: string;
    };
}

export interface ISingleFileUploaderParams {
    fileUpload: Html5FileUpload;
    parentItem: ISPListItem;
}

export interface ISingleFileUploaderDependencies {
    listContext: ISPListContext;
    itemUrlHelper: ItemUrlHelper;
    apiUrlHelper: ApiUrlHelper;
    pageContext: ISpPageContext;
    async: Async;
}

export class SingleFileUploader extends BaseUploader {
    public totalBytes: number;
    public uploadedBytes: number;
    public fileName: string;
    public iconName: string;
    public state: UploadState;
    public error: UploadError;
    public nameConflictBehavior: NameConflictBehavior;
    public allowRename: boolean;
    public item: ISPListItem;

    private _dataRequestor: DataRequestor;
    private _parentItem: ISPListItem;
    private _fileUpload: Html5FileUpload;
    private _listContext: ISPListContext;
    private _itemUrlHelper: ItemUrlHelper;
    private _apiUrlHelper: ApiUrlHelper;
    private _async: Async;

    private _maxUploadRequestDuration: number;
    private _uploadPromise: Promise<void>;
    private _uploadId: string;
    private _chunkNumber: number;
    private _streamingChunkNumber: number;
    private _currentChunkSize: number;
    private _currentStreamingChunkSize: number;

    constructor(params: ISingleFileUploaderParams, dependencies: ISingleFileUploaderDependencies) {
        const {
            fileUpload,
            parentItem
        } = params;

        super();

        this._parentItem = parentItem;
        this._fileUpload = fileUpload;

        this._uploadId = null;
        this._chunkNumber = 0;
        this._streamingChunkNumber = 0;

        this._currentChunkSize = UPLOAD_CHUNK_SIZE;
        this._currentStreamingChunkSize = UPLOAD_STREAMING_CHUNK_SIZE;

        this._listContext = dependencies.listContext;
        this._itemUrlHelper = dependencies.itemUrlHelper;
        this._apiUrlHelper = dependencies.apiUrlHelper;
        this._dataRequestor = new DataRequestor({
            qosName: 'SingleFileUploader',
            pageContext: dependencies.pageContext
        });
        this._async = dependencies.async;

        this.totalBytes = fileUpload.size;
        this.uploadedBytes = 0;
        this.fileName = fileUpload.name;
        this.iconName = fileUpload.iconName;
        this.state = UploadState.queued;
        this.error = null;
        this.nameConflictBehavior = NameConflictBehavior.none;
        this.allowRename = false;
    }

    public start(): Promise<void> {
        this.updateState(UploadState.queued);

        const uploadPromise = UPLOAD_QUEUE.enqueue(() => {
            this.error = undefined;
            this.updateState(UploadState.started);

            return this._upload().then(() => {
                this.updateState(UploadState.completed);
            }, (error: Error | UploadError) => {
                let uploadError: UploadError;

                if (error instanceof UploadError) {
                    uploadError = error;
                } else {
                    uploadError = new UploadError({
                        message: error && error.message || '',
                        errorType: UploadErrorType.general
                    });
                }

                this.error = uploadError;
                this.updateState(UploadState.failed);

                return Promise.wrapError(error);
            });
        });

        this._uploadPromise = uploadPromise;

        return uploadPromise;
    }

    public abort() {
        if (this.state === UploadState.completed) {
            return;
        }

        this.error = null;
        this.updateState(UploadState.aborted);

        const uploadPromise = this._uploadPromise;
        this._uploadPromise = undefined;

        if (uploadPromise) {
            uploadPromise.cancel();

            uploadPromise.then(() => {
                // Ignore output.
            }, () => {
                // Ignore error.
            }).done(() => {
                return this._cancelChunkUpload();
            });
        }
    }

    public restart() {
        const uploadPromise = this._uploadPromise;
        this._uploadPromise = undefined;

        let restartPromise: Promise<void>;

        if (uploadPromise) {
            uploadPromise.cancel();

            restartPromise = uploadPromise.then(undefined, () => {
                return this._cancelChunkUpload().then(undefined, () => {
                    // Ignore errors.
                });
            });
        } else {
            restartPromise = Promise.wrap<void>();
        }

        restartPromise.done(() => {
            this.start();
        });
    }

    private _upload(): Promise<void> {
        this.uploadedBytes = 0;

        let uploadFilePromise: Promise<ISPListItem>;

        const fileSize = this._fileUpload.size;

        if (fileSize <= LARGE_FILESIZE) {
            uploadFilePromise = this._sendSingleRequestUpload();
        } else {
            this._maxUploadRequestDuration = MAX_UPLOAD_STREAMING_REQUEST_DURATION;

            uploadFilePromise = this._sendStreamingUpload();
        }

        return uploadFilePromise.then((item: ISPListItem) => {
            this.uploadedBytes = fileSize;
            this.item = item;
            return Promise.wrap<void>();
        });
    }

    private _createUploadError(errorResponse: IUploadErrorResponse): UploadError {
        let errorCodeNum: number;

        let errorMessage: string;

        if (typeof errorResponse === 'string') {
            errorMessage = String(errorResponse);
        } else {
            errorCodeNum = this._getErrorCode(errorResponse);
            if (typeof errorResponse.message === 'string') {
                errorMessage = String(errorResponse.message);
            } else {
                errorMessage = errorResponse.message.value;
            }
        }

        let errorType: UploadErrorType;

        if (errorCodeNum === ERRORCODE_DOCALREADYEXISTS) {
            errorType = UploadErrorType.conflict;
        } else if (errorCodeNum === ERRORCODE_TIMEOUT) {
            errorType = UploadErrorType.general;
        } else if (errorMessage) {
            // The error text comes from the server.
            errorType = UploadErrorType.other;
        } else {
            errorType = UploadErrorType.general;
        }

        return new UploadError({
            message: errorMessage,
            errorType: errorType,
            allowRename: this.allowRename
        });
    }

    private _getErrorCode(errorResponse: IUploadErrorResponse): number {
        const {
            code = ''
        } = errorResponse;

        const [errorCode] = code.split(',').map((value: string) => Number(value));

        return errorCode;
    }

    private _getUploadFileUrl(): string {
        const uniqueId = this._parentItem.properties && this._parentItem.properties.uniqueId;

        const parentUrlParts = this._itemUrlHelper.getItemUrlParts(this._parentItem.key);

        let apiUrl = this._apiUrlHelper.build()
            .webByItemUrl(parentUrlParts);

        if (uniqueId) {
            apiUrl = apiUrl.method('GetFolderById', uniqueId);
        } else {
            if (Features.isFeatureEnabled(SupportPoundPercent)) {
                apiUrl = apiUrl.methodWithAliases('GetFolderByServerRelativePath', {
                    'DecodedUrl': parentUrlParts.serverRelativeItemUrl
                });
            } else {
                apiUrl = apiUrl.method('GetFolderByServerRelativeUrl', parentUrlParts.serverRelativeItemUrl);
            }
        }

        const fileName = this._fileUpload.name;
        const overwrite = this.nameConflictBehavior === NameConflictBehavior.overwrite;

        apiUrl = apiUrl.segment('Files');

        if (Features.isFeatureEnabled(SupportPoundPercent)) {
            apiUrl = apiUrl.methodWithAliases('AddUsingPath', {
                'DecodedUrl': fileName,
                'overwrite': overwrite
            });
        } else {
            apiUrl = apiUrl.methodWithAliases('Add', {
                'url': fileName,
                'overwrite': overwrite
            });
        }

        // Required fields may be defined as part of content type, in additional to the list directly
        // ListDataSource fetches content types information, but doesn't include the ContentType/Fields information.
        // After files are uploaded, need to fetch the content types and fields so that item.hasMissingMetadata can be evaluated.
        let expandValue = null;

        // @todo: replace with ItemParentHelper
        if (this._listContext) {
            if (this._listContext.contentTypesEnabled &&
                (this._listContext.listTemplateType !== ListTemplateType.mySiteDocumentLibrary)) {
                expandValue = (expandValue ? expandValue : 'ListItemAllFields') + '/' + 'ContentType/Fields';
            }
        }

        if (expandValue) {
            apiUrl.oDataParameter('$Expand', expandValue);
        }

        return apiUrl.toString();
    }

    private _isConflictFile(): Promise<boolean> {
        // web/GetFolderByServerRelativeUrl('{folder})/Files?$filter=Name eq '{fileName}'
        // get an HTTP Status code of 200 no matter the document exists or not
        // return true only when not allow overwrite and file exists on server
        // if allow overwrite, then no need to check on server
        if (this.nameConflictBehavior === NameConflictBehavior.overwrite) {
            return Promise.wrap(false);
        }

        const parentUrlParts = this._itemUrlHelper.getItemUrlParts(this._parentItem.key);

        let apiUrl = this._apiUrlHelper.build()
            .webByItemUrl(parentUrlParts);

        if (Features.isFeatureEnabled(SupportPoundPercent)) {
            apiUrl = apiUrl.methodWithAliases('GetFolderByServerRelativePath', {
                'DecodedUrl': parentUrlParts.serverRelativeItemUrl
            });
        } else {
            apiUrl = apiUrl.method('GetFolderByServerRelativeUrl', parentUrlParts.serverRelativeItemUrl);
        }

        apiUrl = apiUrl
            .segment('Files')
            .oDataParameter('$filter', `Name eq '${UriEncoding.encodeRestUriStringToken(this._fileUpload.name)}'`);

        return this._dataRequestor.getData<boolean>({
            url: apiUrl.toString(),
            qosName: 'GetFile',
            parseResponse: (responseText: string) => {
                let data = JSON.parse(responseText);
                if (data && data.d && data.d.results && data.d.results.length > 0) {
                    if (data.d.results[0].Exists && this._streamingChunkNumber > 0) {
                        return false;
                    }

                    return true;
                } else {
                    return false;
                }
            }
        }).then((result: boolean) => {
            return result;
        }, (error: any) => {
            if (Promise.isCanceled(error)) {
                return Promise.wrapError(error);
            }

            return false;
        });
    }

    /**
     * Process upload complete response string and return the uploaded item.
     */
    private _processUploadCompleteResponse(responseText: string): ISPListItem {
        return this._getItemFromResponse(responseText);
    }

    /**
     * Get item from the upload response
     */
    private _getItemFromResponse(responseText: string): ISPListItem {
        let item: ISPListItem;

        try {
            let itemData = JSON.parse(responseText);
            itemData = itemData.d;

            let itemKey = this._getItemKey();

            let listItemId: string;

            if (itemData.ListItemAllFields && itemData.ListItemAllFields.Id) {
                listItemId = String(itemData.ListItemAllFields.Id);
            }

            let hasMissingMetadata = false;
            if (itemData.ListItemAllFields && itemData.ListItemAllFields.ContentType &&
                itemData.ListItemAllFields.ContentType.Fields &&
                itemData.ListItemAllFields.ContentType.Fields.results) {
                let requiredColumns = itemData.ListItemAllFields.ContentType.Fields.results.filter((field: any) => (field.Required));
                if (requiredColumns.length > 0) {
                    for (let requiredColumn of requiredColumns) {
                        if (!itemData.ListItemAllFields[requiredColumn.InternalName]) {
                            hasMissingMetadata = true;
                            break;
                        }
                    }
                }
            }

            let uniqueId: string;

            if (itemData.UniqueId) {
                uniqueId = Guid.normalizeLower(itemData.UniqueId);
            }

            const fileName = itemData.Name;
            const extension = Path.getFileExtension(fileName);

            item = {
                key: itemKey,
                parentKey: this._parentItem.key,
                type: ItemType.File,
                id: itemData.ServerRelativeUrl,
                name: fileName,
                displayName: fileName,
                extension: extension,
                properties: {
                    ID: listItemId,
                    uniqueId: uniqueId
                },
                itemFromServer: itemData,
                hasMissingMetadata: hasMissingMetadata
            };

        } catch (error) {
            // Ignore errors.
        }

        return item;
    }

    private _generateChunkPostUrl(startByte: number, endByte: number): string {
        const fileUpload = this._fileUpload;
        let uniqueId = this._parentItem.properties.uniqueId;
        let lastChunk = (fileUpload.size <= endByte);

        const parentUrlParts = this._itemUrlHelper.getItemUrlParts(this._parentItem.key);

        let apiUrl = this._apiUrlHelper.build()
            .webByItemUrl(parentUrlParts);

        let uploadMethod: string;
        let uploadMethodArguments: IMethodArguments = {
            'uploadId': {
                guid: this._uploadId
            }
        };

        if (this._chunkNumber === 0 && this._streamingChunkNumber === 0) {
            uploadMethod = 'StartUpload';

            if (uniqueId) {
                apiUrl = apiUrl.method('GetFolderById', uniqueId);
            } else {
                if (Features.isFeatureEnabled(SupportPoundPercent)) {
                    apiUrl = apiUrl.methodWithAliases('GetFolderByServerRelativePath', {
                        'DecodedUrl': parentUrlParts.serverRelativeItemUrl
                    });
                } else {
                    apiUrl = apiUrl.method('GetFolderByServerRelativeUrl', parentUrlParts.serverRelativeItemUrl);
                }
            }

            apiUrl = apiUrl.segment('Files');

            if (this.nameConflictBehavior === NameConflictBehavior.overwrite) {
                if (Features.isFeatureEnabled(SupportPoundPercent)) {
                    apiUrl = apiUrl.methodWithAliases('GetByPathOrAddStub', {
                        'DecodedUrl': fileUpload.name
                    });
                } else {
                    apiUrl = apiUrl.method('GetByUrlOrAddStub', fileUpload.name);
                }
            } else {
                if (Features.isFeatureEnabled(SupportPoundPercent)) {
                    apiUrl = apiUrl.methodWithAliases('AddStubUsingPath', {
                        'DecodedUrl': fileUpload.name
                    });
                } else {
                    apiUrl = apiUrl.method('AddStub', fileUpload.name);
                }
            }
        } else {
            if (lastChunk) {
                uploadMethod = 'FinishUpload';
            } else {
                uploadMethod = 'ContinueUpload';
            }

            if (Features.isFeatureEnabled(SupportPoundPercent)) {
                apiUrl = apiUrl.methodWithAliases('GetFileByServerRelativePath', {
                    'DecodedUrl': `${parentUrlParts.serverRelativeItemUrl}/${fileUpload.name}`
                });
            } else {
                apiUrl = apiUrl.method('GetFileByServerRelativeUrl', `${parentUrlParts.serverRelativeItemUrl}/${fileUpload.name}`);
            }

            // tslint:disable-next-line:no-string-literal
            uploadMethodArguments['fileOffset'] = startByte;
        }

        apiUrl = apiUrl.methodWithAliases(uploadMethod, uploadMethodArguments);

        return apiUrl.toString();
    }

    private _getUploadStatus(): Promise<Number> {
        const file = this._fileUpload;
        const uploadId = this._uploadId;

        const parentUrlParts = this._itemUrlHelper.getItemUrlParts(this._parentItem.key);

        let uploadStatusUrl = this._apiUrlHelper.build()
            .webByItemUrl(parentUrlParts);

        uploadStatusUrl = uploadStatusUrl
            .methodWithAliases('GetFileByServerRelativePath', {
                'DecodedUrl': `${parentUrlParts.serverRelativeItemUrl}/${file.name}`
            })
            .methodWithAliases('GetUploadStatus', {
                'uploadId': {
                    guid: uploadId
                }
            });

        return this._dataRequestor.getData<IFileUploadStatus>({
            url: uploadStatusUrl.toString(),
            qosName: 'GetUploadStatus',
            method: 'GET'
        }).then((statusResponse: IFileUploadStatus) => {
            // TODO: handle case where call returns explicit error
            if (statusResponse.d && statusResponse.d.ExpectedContentRange) {
                let lastSeenByte = parseInt(statusResponse.d.ExpectedContentRange.split("-")[0], 10);

                return lastSeenByte;
            } else {
                return Promise.wrapError();
            }
        });
    }

    private _uploadFragment(startByte: number = 0, retries: number = MAX_RETRY_COUNT): Promise<ISPListItem> {
        const fileSize = this._fileUpload.size;

        const endByte = Math.min(this._currentChunkSize + startByte, fileSize);

        if (!this._uploadId) {
            this._uploadId = Guid.generate();
        }

        const startTime = Date.now();

        return this._sendFileData({
            url: this._generateChunkPostUrl(startByte, endByte),
            qosName: 'SendFileRequest',
            data: this._fileUpload.slice(startByte, endByte),
            offset: startByte,
            length: endByte - startByte
        }).then((data: string) => {
            this.uploadedBytes = endByte;

            if (endByte < fileSize) {
                this._chunkNumber++;

                if (Date.now() - startTime < MAX_UPLOAD_REQUEST_DURATION) {
                    this._currentChunkSize = Math.min(Math.floor(this._currentChunkSize * Math.pow(2, 1 / 4)), MAX_CHUNK_SIZE);
                }

                return this._uploadFragment(endByte);
            } else {
                return this._processUploadCompleteResponse(data);
            }
        }, (errorResponse: IUploadErrorResponse) => {
            if (Promise.isCanceled(errorResponse)) {
                return Promise.wrapError(errorResponse);
            }

            let errorCode = this._getErrorCode(errorResponse);

            if (errorCode === ERRORCODE_TOOSLOW) {
                if (this._currentChunkSize > MIN_CHUNK_SIZE) {
                    // If there is still a remedy available, reduce the chunk size and try again.
                    this._currentChunkSize = Math.max(Math.floor(this._currentChunkSize / 2), MIN_CHUNK_SIZE);

                    let cancelPromise: Promise<void>;

                    if (this._chunkNumber === 0) {
                        cancelPromise = this._cancelChunkUpload();
                    }

                    return Promise.as(cancelPromise).then(() => {
                        return this._uploadFragment(startByte);
                    });
                }
            } else if (retries > 0 && this._canRetry(errorResponse)) {
                let retryTimeoutId: number;

                let retrySignal = new Signal<void>(() => {
                    if (retryTimeoutId) {
                        this._async.clearTimeout(retryTimeoutId);
                    }
                });

                retryTimeoutId = this._async.setTimeout(() => retrySignal.complete(), RETRY_INTERVAL);

                return retrySignal.getPromise().then(() => {
                    return this._uploadFragment(startByte, retries - 1);
                });
            }

            return Promise.wrapError(this._createUploadError(errorResponse));
        });
    }

    private _sendSingleRequestUpload(): Promise<ISPListItem> {
        return this._isConflictFile().then((isConflictFile: boolean) => {
            if (!isConflictFile) {
                return this._fileUpload.slice(0, this._fileUpload.size);
            } else {
                const uploadError = new UploadError({
                    message: '',
                    errorType: UploadErrorType.conflict
                });

                return Promise.wrapError(uploadError);
            }
        }).then((data: Blob) => {
            return this._sendFileData({
                url: this._getUploadFileUrl(),
                qosName: 'UploadFile',
                data: data,
                offset: 0,
                length: data.size
            }).then((responseText: string) => {
                return this._processUploadCompleteResponse(responseText);
            }).then((item: ISPListItem) => {
                return item;
            }, (errorResponse: IUploadErrorResponse) => {
                if (Promise.isCanceled(errorResponse)) {
                    return Promise.wrapError(errorResponse);
                }

                const errorCode = this._getErrorCode(errorResponse);

                if (errorCode === ERRORCODE_TOOSLOW) {
                    // Switch to fragment upload since the whole file will take too long.
                    this.nameConflictBehavior = NameConflictBehavior.overwrite;

                    return this._uploadFragment();
                }

                return Promise.wrapError(this._createUploadError(errorResponse));
            });
        });
    }

    private _sendStreamingUpload(startByte: number = 0, retries: number = MAX_RETRY_COUNT): Promise<ISPListItem> {
        if (!this._uploadId) {
            this._uploadId = Guid.generate();
        }

        const fileSize = this._fileUpload.size;
        const endByte = this._streamingChunkNumber > 0 ? Math.min(this._currentStreamingChunkSize + startByte, fileSize) : 0;

        return this._isConflictFile().then((isConflictFile: boolean) => {
            if (!isConflictFile) {
                return this._fileUpload.slice(startByte, endByte);
            } else {
                const uploadError = new UploadError({
                    message: '',
                    errorType: UploadErrorType.conflict
                });

                return Promise.wrapError(uploadError);
            }
        }).then((data: Blob) => {
            return this._sendFileData({
                url: this._generateChunkPostUrl(startByte, endByte),
                qosName: 'SendFileRequest',
                data: data,
                offset: startByte,
                length: data.size
            }).then((responseText: string) => {
                this.uploadedBytes = endByte;

                if (endByte < fileSize) {
                    this._streamingChunkNumber++;

                    return this._sendStreamingUpload(endByte, retries);
                } else {
                    return this._processUploadCompleteResponse(responseText);
                }
            }, (errorResponse: IUploadErrorResponse) => {
                if (Promise.isCanceled(errorResponse)) {
                    return Promise.wrapError(errorResponse);
                }

                let errorCode = this._getErrorCode(errorResponse);

                if (errorCode === ERRORCODE_TOOSLOW) {
                    if (this._currentStreamingChunkSize <= UPLOAD_STREAMING_CHUNK_SIZE_LIMIT) {
                        return Promise.wrapError(this._createUploadError(errorResponse));
                    }

                    this._currentStreamingChunkSize = this._currentStreamingChunkSize / 2;
                }

                return this._getUploadStatus().then((lastByte: number) => {
                    return this._sendStreamingUpload(lastByte, MAX_RETRY_COUNT);
                }, (error: Error) => {
                    if (retries > 0 && this._canRetry(errorResponse)) {
                        let retryTimeoutId: number;

                        let retrySignal = new Signal<void>(() => {
                            if (retryTimeoutId) {
                                this._async.clearTimeout(retryTimeoutId);
                            }
                        });

                        retryTimeoutId = this._async.setTimeout(() => retrySignal.complete(), RETRY_INTERVAL);

                        return retrySignal.getPromise().then(() => {
                            return this._sendStreamingUpload(0, retries - 1);
                        });
                    }

                    return Promise.wrapError(this._createUploadError(errorResponse));
                });
            });
        });
    }

    private _canRetry(errorResponse: IUploadErrorResponse): boolean {
        const errorCode = this._getErrorCode(errorResponse);

        let canRetry: boolean;

        switch (errorCode) {
            case ERRORCODE_DOCALREADYEXISTS:
                canRetry = false;
                break;
            case ERRORCODE_FILEUPLOADALREADYINPROGRESS:
                canRetry = false;
                break;
            default:
                canRetry = true;
                break;
        }

        return canRetry;
    }

    private _cancelChunkUpload(): Promise<void> {
        let uploadId = this._uploadId;
        this._uploadId = undefined;
        this._chunkNumber = 0;

        if (uploadId) {
            const file = this._fileUpload;

            const parentUrlParts = this._itemUrlHelper.getItemUrlParts(this._parentItem.key);

            let apiUrl = this._apiUrlHelper.build()
                .webByItemUrl(parentUrlParts);

            if (Features.isFeatureEnabled(SupportPoundPercent)) {
                apiUrl = apiUrl.methodWithAliases('GetFileByServerRelativePath', {
                    'DecodedUrl': `${parentUrlParts.serverRelativeItemUrl}/${file.name}`
                });
            } else {
                apiUrl = apiUrl.method('GetFileByServerRelativeUrl', `${parentUrlParts.serverRelativeItemUrl}/${file.name}`);
            }

            apiUrl = apiUrl.methodWithAliases('CancelUpload', {
                'uploadId': {
                    guid: uploadId
                }
            });

            return this._dataRequestor.getData<{}>({
                url: apiUrl.toString(),
                qosName: 'CancelUploadSession'
            }).then(() => {
                // Ignore response.
            });
        } else {
            return Promise.wrap<void>();
        }
    }

    private _sendFileData({
        url,
        qosName,
        data,
        offset,
        length
    }: {
            url: string;
            qosName: string;
            data: Blob;
            offset: number;
            length: number;
        }): Promise<string> {
        let getDataPromise: Promise<string>;
        let timeoutId: number;

        const signal = new Signal<string>(() => {
            getDataPromise.cancel();
        });

        const refreshTimeout = (bytesRemaining: number) => {
            const minInactivityTimeout = this._chunkNumber > 0 && offset + length >= this._fileUpload.size ?
                FINAL_CHUNK_INACTIVITY_TIMEOUT :
                MIN_INACTIVITY_TIMEOUT;

            const timeout = Math.max(bytesRemaining * TIMEOUT_MILLISECONDS_PER_BYTE, minInactivityTimeout);

            if (timeoutId) {
                this._async.clearTimeout(timeoutId);
            }

            if (bytesRemaining) {
                timeoutId = this._async.setTimeout(() => {
                    signal.error({
                        code: `${ERRORCODE_TIMEOUT}`,
                        message: ''
                    } as IUploadErrorResponse);
                }, timeout);
            }
        };

        let startTime = Date.now();
        let lastProgressTime = Date.now();
        let lastUploadBytes = 0;

        let bandwidthCumulative = 0;
        let bandwidthCount = 0;

        let currentAverageBandwidth: number;

        const onProgress = this._async.debounce((lastByte: number) => {
            if (lastByte > this.uploadedBytes) {
                this.uploadedBytes = lastByte;
            }
        }, ON_PROGRESS_THROTTLE_DELAY, {
                leading: false
            });

        getDataPromise = this._dataRequestor.getData<string>({
            url: url,
            qosName: qosName,
            parseResponse: (responseText: string) => responseText,
            contentType: 'application/octet-stream',
            additionalPostData: data,
            onUploadProgress: (event: ProgressEvent) => {
                if (event.lengthComputable) {
                    let time = Date.now();

                    bandwidthCumulative += (event.loaded - lastUploadBytes) / (time - lastProgressTime);
                    bandwidthCount++;

                    currentAverageBandwidth = event.loaded / (time - startTime);

                    lastProgressTime = time;
                    lastUploadBytes = event.loaded;

                    onProgress(offset + event.loaded);

                    refreshTimeout(length - event.loaded);
                }
            }
        });

        refreshTimeout(length);

        let intervalId = this._async.setInterval(() => {
            if (bandwidthCount) {
                let time = Date.now();
                let bandwidth = (bandwidthCumulative + currentAverageBandwidth) / (bandwidthCount + 1);

                let estimatedTotalTime = time - startTime + (length - lastUploadBytes) / bandwidth;

                if (estimatedTotalTime > this._maxUploadRequestDuration && lastUploadBytes < length) {
                    // The request is never going to complete in time.
                    // Abort now.
                    signal.error({
                        code: `${ERRORCODE_TOOSLOW}`,
                        message: ''
                    });
                }
            }
        }, SPEED_CHECK_INTERVAL);

        getDataPromise.done((promisedata: string) => {
            signal.complete(promisedata);
        }, (error: any) => {
            signal.error(error);
        });

        signal.getPromise().done(() => {
            if (timeoutId) {
                this._async.clearTimeout(timeoutId);
            }

            if (intervalId) {
                this._async.clearInterval(intervalId);
            }
        }, () => {
            getDataPromise.cancel();

            if (timeoutId) {
                this._async.clearTimeout(timeoutId);
            }

            if (intervalId) {
                this._async.clearInterval(intervalId);
            }
        });

        return signal.getPromise();
    }

    private _getItemKey() {
        const {
            serverRelativeItemUrl,
            normalizedListUrl
        } = this._itemUrlHelper.getItemUrlParts(this._parentItem.key);

        const path = `${serverRelativeItemUrl}/${this._fileUpload.name}`;
        return buildItemKey(path, normalizedListUrl);
    }
}
