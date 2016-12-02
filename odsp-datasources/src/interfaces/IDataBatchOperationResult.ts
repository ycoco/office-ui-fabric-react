/** Represents the object for error returned by the server. */
export interface IServerError {
    /** Error code  */
    code: number;
    /** Error message */
    message: string;
}

/** Represents the response from server. */
export interface IServerResponse {
    /** Object for error, if the server request fails. */
    error?: IServerError;
}

/** Represents the object for batch operation result. */
export interface IDataBatchOperationResult {
    /** Array of response for the requests included in the batch operation. */
    items: IServerResponse[];
    /** Whether there is at least one request that has error. */
    hasError: boolean;
}