export default class ServerData {
    /* tslint:disable:variable-name */
    public static DataValueKeys = {
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
        // (String) Error Response text for this server request.
        ErrorResponseText: 'ErrorResponseText'
    };
    /* tslint:enable:variable-name */
    private _request: XMLHttpRequest;
    private _url: string;

    constructor(request: XMLHttpRequest, strUrl: string) {
        this._request = request;
        this._url = strUrl;
    }

    public getValue(key: string): any {
        let value: any = void 0;

        switch (key) {
            case ServerData.DataValueKeys.SourceURL:
                value = this._url;
                break;

            case ServerData.DataValueKeys.CorrelationId:
                value = this._request.getResponseHeader('SPRequestGuid');
                break;

            case ServerData.DataValueKeys.Status:
                try {
                    // We read the status in a try catch to avoid issues
                    // with IE implementation which throws a bogus exception
                    value = this._request.status;
                } catch (e) {
                    // do nothing
                }
                break;

            case ServerData.DataValueKeys.AuthenticationRedirect:
                value = this._request.getResponseHeader('X-Forms_Based_Auth_Required');
                break;

            case ServerData.DataValueKeys.ResponseText:
                if (!this._request.responseType || this._request.responseType === 'text') {
                    value = this._request.responseText;
                } else {
                    value = this._request.response;
                }
                break;

            case ServerData.DataValueKeys.ErrorResponseText:
                if (this._request.responseType === 'blob') {
                    let errorData = {
                        status: this._request.status,
                        statusText: this._request.statusText,
                        infected: undefined
                    };
                    if (this._request.getResponseHeader('x-virus-infected')) {
                        errorData.infected = true;
                    }
                    return errorData;
                }

                return this.getValue(ServerData.DataValueKeys.ResponseText);
        }
        return value;
    }
}
