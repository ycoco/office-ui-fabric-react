export interface IProgressStrings {
    UploadProgressStart?: string;
    UploadProgressComplete?: string;
    UploadProgressFailed?: string;
    ProgressCountTemplateInterval?: string;
}

export interface IProgressCommandProps {
    eventContainer: any;
    strings: IProgressStrings;
}

export interface IProgress {
    type: ProgressType;
    state: ProgressState;
    totalCount: number;
    successCount?: number;
    failureCount?: number;
}

export enum ProgressType {
    uploadItems,
    deleteItems
}

export enum ProgressState {
    started,
    completed,
    failed
}

export const PROGRESS_UPDATE: string = 'progress_update';