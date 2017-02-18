interface IValidateLinkParams {
    /**
     * Url to validate
     */
    url: string;
    /**
     * QosEventName for telemetry
     */
    qosEventName: string;
    /**
     * Optional number of milliseconds a request can take before being terminated.
     * A value of 0 (which is the default) means there is no timeout
     */
    timeout?: number;
    /**
     * Optional callback function to execute if link is valid
     * @params httpStatus: number - 200/300 range status code returned from the server
     */
    onComplete?: (httpStatus: number) => void;
    /**
     * Optional callback function to execute if link is invalid
     * @params httpStatus: number - error status code returned from the server
     */
    onError?: (httpStatus: number) => void;
    /**
     * Optional callback function to execute if request timedout
     */
    onTimeout?: Function;
    /**
     * Optional callback function to execute if link is valid
     */
    onFailValidation?: Function;
}

export = IValidateLinkParams;
