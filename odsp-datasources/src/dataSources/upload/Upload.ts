// OneDrive:IgnoreCodeCoverage
export const enum UploadState {
    queued,
    started,
    completed,
    aborted,
    failed,
    none
}

export enum UploadErrorType {
    none,
    other,
    general,
    conflict,
    invalidName,
    fileSize,
    emptyFileOrFolder,
    emptyFileOrFolderForDocLib,
    overQuota,
    accessDenied,
    lockMismatch,
    overQuotaSharedFolder,
    folderUploadNotSupported,
    versionMismatch
}