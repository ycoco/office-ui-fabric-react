
import Promise from '@ms/odsp-utilities/lib/async/Promise';
import Signal from '@ms/odsp-utilities/lib/async/Signal';
import {
    IItem
} from '../../models/item/Item';
import { IDataRequestor } from '../../base/dataRequestor/IDataRequestor';
import { ISessionToken } from '../../base/tokenProvider/ITokenProvider';

export type ConflictBehavior = 'fail' | 'replace' | 'rename';

export interface IContent {
    size: number;
    slice(startByte: number, endByte: number): Blob;
}

export interface IUploadQosData {
    [key: string]: string | number | boolean;
    uploadId: string;
}

export interface IUploadServiceDependencies {
    dataRequestor: IDataRequestor;
}

export interface ICreateSessionRequest {
    readonly item: {
        readonly '@name.conflictBehavior'?: ConflictBehavior;
        readonly fileSystemInfo?: {
            createdDateTime?: string;
            lastModifiedDateTime?: string;
        }
    };
}

export interface ICreateSessionHeaders {
    readonly [name: string]: string;
    readonly 'If-Match'?: string;
    readonly 'Prefer': 'synchronousmetadata';
}

export interface ICreateSessionResponse {
    readonly uploadUrl: string;
    readonly expirationDateTime: string;
    readonly nextExpectedRanges: string[];
}

export interface IUploadFragmentHeaders {
    readonly [name: string]: string;
    readonly 'Content-Range': string;
}

export interface IUploadFragmentResponse {
    readonly expirationDateTime: string;
    readonly nextExpectedRanges?: string[];
}

export interface ICommitRequest {
    readonly '@name.conflictBehavior'?: ConflictBehavior;
    readonly '@content.sourceUrl': string;
}

export interface ICommitHeaders {
    readonly [name: string]: string;
    readonly 'If-Match'?: string;
}

export interface IGetUploadStatusResponse {
    readonly expirationDateTime: string;
    readonly nextExpectedRanges?: string[];
}

export interface ICreateSessionParams {
    qosData: IUploadQosData;
    itemUrl: string;
    accessToken?: ISessionToken;
    fileName: string;
    fileSize: number;
    lastModifiedDate?: Date;
    eTag?: string;
    conflictBehavior: ConflictBehavior;
}

export interface ICancelSessionParams {
    qosData: IUploadQosData;
    sessionUrl: string;
}

export interface IUploadFragmentParams {
    qosData: IUploadQosData;
    sessionUrl: string;
    fileSize: number;
    startByte: number;
    endByte: number;
    content: Blob;
    timeout: number;
    onProgress: (lastByte: number) => void;
}

export interface ICommitParams {
    qosData: IUploadQosData;
    itemUrl: string;
    accessToken?: ISessionToken;
    fileName?: string;
    description?: string;
    eTag?: string;
    lastModifiedDate?: Date;
    conflictBehavior: ConflictBehavior;
    sessionUrl: string;
}

export interface IGetStatusParams {
    qosData: IUploadQosData;
    sessionUrl: string;
}

export class UploadService {
    private _dataRequestor: IDataRequestor;

    constructor(params: {}, dependencies: IUploadServiceDependencies) {
        this._dataRequestor = dependencies.dataRequestor;
    }

    /**
     * Creates an upload session for a file name and folder id.
     */
    public createSession({
        qosData,
        itemUrl,
        accessToken,
        fileName,
        fileSize,
        lastModifiedDate,
        eTag,
        conflictBehavior
    }: ICreateSessionParams): Promise<ICreateSessionResponse> {
        const request: ICreateSessionRequest = {
            item: {
                // Note: the order matters, thanks to how OData handlers parse the input on the server.
                '@name.conflictBehavior': conflictBehavior,
                fileSystemInfo: {
                    lastModifiedDateTime: lastModifiedDate ? lastModifiedDate.toISOString() : undefined
                }
            }
        };

        const headers: ICreateSessionHeaders = {
            ...(eTag ? {
                'If-Match': eTag
            } : {}),
            'Prefer': 'synchronousmetadata'
        };

        return this._dataRequestor.send<ICreateSessionResponse>({
            path: `${itemUrl}/${encodeURIComponent(fileName)}:/oneDrive.createUploadSession`,
            requestType: 'POST',
            apiName: 'CreateSession',
            headers: headers,
            accessToken: accessToken,
            useAuthorizationHeaders: true,
            postData: JSON.stringify(request),
            qosExtraData: {
                'conflictBehavior': conflictBehavior,
                'fileSize': fileSize,
                ...qosData
            }
        });
    }

    public cancelSession({
        qosData,
        sessionUrl
    }: ICancelSessionParams) {
        return this._dataRequestor.send<void>({
            requestType: 'DELETE',
            apiName: 'CancelSession',
            path: sessionUrl,
            needsAuthorization: false,
            qosExtraData: qosData
        });
    }

    /**
     * Uploads a single fragment of the input contents.
     */
    public uploadFragment({
        qosData,
        sessionUrl,
        startByte,
        endByte,
        fileSize,
        content,
        timeout,
        onProgress
    }: IUploadFragmentParams): Promise<IUploadFragmentResponse | IItem> {
        const headers: IUploadFragmentHeaders = {
            'Content-Range': `bytes ${startByte}-${Math.max(endByte - 1, startByte)}/${fileSize}`
        };

        let isActive = true;

        const send = this._dataRequestor.send<IUploadFragmentResponse | IItem>({
            path: sessionUrl,
            needsAuthorization: false,
            requestType: 'PUT',
            apiName: 'UploadFragment',
            headers: headers,
            postData: content,
            timeout: timeout,
            onUploadProgress: (event: ProgressEvent) => {
                if (event.lengthComputable && isActive) {
                    onProgress(startByte + event.loaded);
                }
            },
            qosExtraData: {
                ...qosData,
                'startByte': startByte,
                'endByte': endByte,
                'fileSize': fileSize
            }
        });

        const signal = new Signal<IUploadFragmentResponse | IItem>(() => {
            isActive = false;

            send.cancel();
        });

        send.done((result: IUploadFragmentResponse | IItem) => {
            isActive = false;

            signal.complete(result);
        }, (error: Error) => {
            isActive = false;

            signal.error(error);
        });

        return signal.getPromise();
    }

    /**
     * Commits an upload session.
     */
    public commit({
        qosData,
        itemUrl,
        accessToken,
        fileName,
        description,
        eTag,
        conflictBehavior,
        sessionUrl
    }: ICommitParams): Promise<IItem> {
        const headers: ICommitHeaders = {
            'If-Match': eTag
        };

        const request: ICommitRequest = {
            '@name.conflictBehavior': conflictBehavior,
            '@content.sourceUrl': sessionUrl
        };

        return this._dataRequestor.send<IItem>({
            path: `${itemUrl}/${encodeURIComponent(fileName)}`,
            requestType: 'PUT',
            apiName: 'CommitSession',
            headers: headers,
            accessToken: accessToken,
            useAuthorizationHeaders: true,
            postData: JSON.stringify(request),
            qosExtraData: {
                'conflictBehavior': conflictBehavior,
                ...qosData
            }
        });
    }

    /**
     * Gets the status of an upload session.
     */
    public getStatus({
        qosData,
        sessionUrl
    }: IGetStatusParams): Promise<IGetUploadStatusResponse> {
        return this._dataRequestor.send<IGetUploadStatusResponse>({
            requestType: 'GET',
            apiName: 'GetStatus',
            path: sessionUrl,
            needsAuthorization: false,
            qosExtraData: qosData
        });
    }
}
