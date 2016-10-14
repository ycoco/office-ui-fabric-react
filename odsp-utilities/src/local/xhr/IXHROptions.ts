// OneDrive:IgnoreCodeCoverage

interface IXHROptions {
    url: string;
    json?: string;
    headers?: { [key: string]: string };
    requestTimeoutInMS?: number;
    method?: string;
    withCredentials?: boolean;
    needsCors?: boolean;
}

export default IXHROptions;