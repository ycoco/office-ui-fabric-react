import IMockXHRRequest from './IMockXHRRequest';
import MockXHREventType from './MockXHREventType';
import MockXHRReadyState from './MockXHRReadyState';

export default class MockXMLHttpRequest {
    private static _error;
    private static _originalXHR;
    private static _callbacks: Array<(mockXMLHttpRequest: MockXMLHttpRequest, eventType: MockXHREventType) => void>;

    readyState = MockXHRReadyState.UNINITIALIZED;
    request: IMockXHRRequest;
    responseType: string;
    onreadystatechange;
    status: number;
    response;
    responseText: string;

    static beforeEach() {
        this._originalXHR = window['XMLHttpRequest'];
        window['XMLHttpRequest'] = MockXMLHttpRequest;
    }

    static afterEach() {
        window['XMLHttpRequest'] = this._originalXHR;
        this._error = null;
        this._callbacks = null;
    }

    static hasErrors() {
        return !!this._error;
    }

    static throwErrors() {
        if (this._error) {
            throw this._error;
        }
    }

    static addCallback(callback: (mockXMLHttpRequest: MockXMLHttpRequest, eventType: MockXHREventType) => void) {
        if (!this._callbacks) {
            this._callbacks = [];
        }

        this._callbacks.push(callback);
    }

    static callCallbacks(mockXMLHttpRequest: MockXMLHttpRequest, eventType: MockXHREventType) {
        if (this._callbacks) {
            for (var x = 0; x < this._callbacks.length; x++) {
                try {
                this._callbacks[x](mockXMLHttpRequest, eventType);
                } catch (e) {
                    if (!this._error) {
                        this._error = e;
                    }
                }
            }
        }
    }

    public open(type: string, url: string, async: boolean, user: string, password: string) {
        this.request = {
            type: type,
            url: url,
            async: async,
            user: user,
            password: password,
            headers: {},
            data: null
        };

        this.responseType = this.responseType || "text";

        MockXMLHttpRequest.callCallbacks(this, MockXHREventType.Open);
    }

    public fireReadyStateChange(readyState: number) {
        this.readyState = readyState || 1;

        this.onreadystatechange();
    }

    public endRequest() {
        if (this.readyState === MockXHRReadyState.LOADING) {
            this.fireReadyStateChange(MockXHRReadyState.LOADED);
        }

        this.fireReadyStateChange(MockXHRReadyState.COMPLETE);
    }

    public send(data: string) {
        this.request.data = data;

        MockXMLHttpRequest.callCallbacks(this, MockXHREventType.Send);
    }
}
