// OneDrive:IgnoreCodeCoverage

interface IXHROptions {
    url: string;
    json?: string | Blob;
    headers?: { [key: string]: string };
    requestTimeoutInMS?: number;
    method?: string;
    withCredentials?: boolean;
    needsCors?: boolean;
    onProgress?: (event: ProgressEvent) => void;
    onUploadProgress?: (event: ProgressEvent) => void;
}

export default IXHROptions;