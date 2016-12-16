export interface IItemState {
    upload?: IItemUploadState;
    removing?: boolean;
}

export interface IItemUploadState {
    status?: UploadState;
//    progress?: IProgress;
//    error?: UploadError;
}

export enum UploadState {
    queued,
    started,
    completed,
    aborted,
    failed,
    none
}