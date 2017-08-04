import { UploadErrorType }  from './Upload';

export class UploadError {
    public message: string;
    public errorType: UploadErrorType;
    public maxSizeInBytes: number;
    public allowRename: boolean;
    public libraryName: string;
    public extraData: {
        [key: string]: string | number | boolean;
    };

    constructor(params: {
        message: string;
        errorType?: UploadErrorType;
        maxSizeInBytes?: number;
        allowRename?: boolean;
        libraryName?: string;
        extraData?: { [key: string]: string | number | boolean; };
    }) {
        this.message = params.message;
        this.errorType = params.errorType || UploadErrorType.other;
        this.maxSizeInBytes = params.maxSizeInBytes;
        this.allowRename = params.allowRename || false;
        this.extraData = params.extraData;
        this.libraryName = params.libraryName;
    }
}

export default UploadError;