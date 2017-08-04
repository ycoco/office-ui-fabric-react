import { UploadState } from './Upload';
import { UploadError } from './UploadError';
import { BaseUploader } from './BaseUploader';

export interface ISingleErrorUploaderParams {
    error: UploadError;
}

export class SingleErrorUploader extends BaseUploader {
    public state: UploadState;
    public error: UploadError;

    constructor(params: ISingleErrorUploaderParams) {
        super();
        this.error = params.error;
    }

    public start() {
        this.updateState(UploadState.failed);
    }

    public abort() {
        this.updateState(UploadState.aborted);
    }
}

export default SingleErrorUploader;