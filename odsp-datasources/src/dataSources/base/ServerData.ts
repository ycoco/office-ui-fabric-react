
import Promise from '@ms/odsp-utilities/lib/async/Promise';
import Signal from '@ms/odsp-utilities/lib/async/Signal';

export interface IErrorData {
    status: number;
    statusText?: string;
    data?: Object;
    infected?: boolean;
    code?: string;
    correlationId?: string;
    groupThrottle?: string;
    responseData?: any;
    extraData?: any;
}

export interface IDataValueTypes {
    'SourceUrl': string;
    'CorrelationId': string;
    'Status': number;
    'AuthenticationRedirect': string;
    'ResponseText': string | Blob;
    'ErrorResponseText': string | IErrorData;
}

export interface IDataValueKeys {
    SourceURL: 'SourceUrl';
    CorrelationId: 'CorrelationId';
    Status: 'Status';
    AuthenticationRedirect: 'AuthenticationRedirect';
    ResponseText: 'ResponseText';
    ErrorResponseText: 'ErrorResponseText';
    GroupThrottle: "GroupThrottle";
}

function _parseBlobError(blob: Blob): Promise<{ message?: string }> {
    const signal = new Signal<Object>();
    let reader: FileReader;
    const onLoad = () => {
        if (reader.result) {
            let response;
            try {
                response = JSON.parse(reader.result);
                signal.complete(response);
            } catch (error) {
                signal.complete({ message: 'Unable to parse blob result.' });
            }
        }
    };

    const onError = () => {
        signal.complete({ message: 'Unable to read blob error response.' });
    };

    try {
        reader = new FileReader();
        reader.addEventListener('load', onLoad);
        reader.addEventListener('error', onError);
        reader.readAsText(blob);
    } catch (error) {
        onError();
    }

    return signal.getPromise().then((errorData: { message?: string }) => {
        if (reader) {
            reader.removeEventListener('load', onLoad);
            reader.removeEventListener('error', onError);
        }
        return errorData;
    });
}

export default class ServerData {
    /* tslint:disable:variable-name */
    public static DataValueKeys: IDataValueKeys = {
        // (String) Original source url for this request.
        SourceURL: 'SourceUrl',
        // (String) SharePoint CorrelationId that corresponds with this request.
        CorrelationId: 'CorrelationId',
        // (Number) HTTP status code for this request
        Status: 'Status',
        // (String) URL to redirect to in case of an error
        AuthenticationRedirect: 'AuthenticationRedirect',
        // (String) Response text for this server request.
        ResponseText: 'ResponseText',
        // (String) Error Response for this server request.
        ErrorResponseText: 'ErrorResponseText',
        // (String) GroupThrottle Response for this server request.
        GroupThrottle: 'GroupThrottle'
    };
    /* tslint:enable:variable-name */
    private _request: XMLHttpRequest;
    private _url: string;

    constructor(request: XMLHttpRequest, strUrl: string) {
        this._request = request;
        this._url = strUrl;
    }

    public getSourceUrl(): string {
        return this._url;
    }

    public getCorrelationId(): string {
        return this._request.getResponseHeader('SPRequestGuid');
    }

    public getGroupThrottle(): string {
        return this._request.getResponseHeader('SPGroupThrottle');
    }

    public getStatus(): number {
        try {
            // We read the status in a try catch to avoid issues
            // with IE implementation which throws a bogus exception
            return this._request.status;
        } catch (e) {
            // do nothing
        }
    }

    public getAuthenticationRedirect(): string {
        return this._request.getResponseHeader('X-Forms_Based_Auth_Required');
    }

    public getResponseType(): string {
        return this._request.responseType;
    }

    public getResponseText(): string | Blob {
        if (!this._request.responseType || this._request.responseType === 'text') {
            return this._request.responseText;
        } else {
            return this._request.response;
        }
    }

    public getErrorResponseText(): string | IErrorData {
        if (this._request.responseType === 'blob') {
            let errorData: IErrorData = {
                status: this._request.status,
                statusText: this._request.statusText,
                infected: undefined
            };
            if (this._request.getResponseHeader('x-virus-infected')) {
                errorData.infected = true;
            }
            return errorData;
        } else {
            return <string>this.getResponseText();
        }
    }

    public parseError(): Promise<string | IErrorData> {
        const signal = new Signal<string | IErrorData>();
        if (!this._request.responseType || this._request.responseType === 'text') {
            signal.complete(this._request.responseText);
        }
        else if (this._request.responseType === 'blob') {
            _parseBlobError(this._request.response).then((response: Object) => {
                const errorData: IErrorData = {
                    data: response,
                    status: this.getStatus(),
                    statusText: this._request.statusText,
                    infected: !!this._request.getResponseHeader('x-virus-infected')
                };
                signal.complete(errorData);
            });
        } else {
            signal.complete(this._request.response);
        }

        return signal.getPromise();
    }

    public getValue<T extends keyof IDataValueTypes>(key: T): IDataValueTypes[T] {
        let value: IDataValueTypes[keyof IDataValueTypes];

        switch (key) {
            case ServerData.DataValueKeys.SourceURL:
                value = this.getSourceUrl();
                break;

            case ServerData.DataValueKeys.CorrelationId:
                value = this.getCorrelationId();
                break;

            case ServerData.DataValueKeys.Status:
                value = this.getStatus();
                break;

            case ServerData.DataValueKeys.AuthenticationRedirect:
                value = this.getAuthenticationRedirect();
                break;

            case ServerData.DataValueKeys.ResponseText:
                value = this.getResponseText();
                break;

            case ServerData.DataValueKeys.ErrorResponseText:
                value = this.getErrorResponseText();
                break;
        }

        return <IDataValueTypes[T]><any>value;
    }
}
