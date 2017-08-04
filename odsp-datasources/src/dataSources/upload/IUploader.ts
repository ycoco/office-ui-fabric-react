import { UploadState } from './Upload';
import { UploadError } from './UploadError';

export interface IUploader {
    state: UploadState;
    error: UploadError;

    start(): void;
    abort(): void;
}

export const UPLOADSTATE_CHANGE = 'upload_state_change';

export default IUploader;