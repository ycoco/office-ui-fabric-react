// OneDrive:IgnoreCodeCoverage

import IXHROptions from './IXHROptions';
import XHR from './XHR';
import Promise from '../async/Promise';

export default class XHRPromise {
    public static start(options: IXHROptions) {
        const xhr = new XHR(options);

        return new Promise<XMLHttpRequest>((complete: (request: XMLHttpRequest, statusCode?: number) => void, error: (request: XMLHttpRequest, statusCode?: number, timeout?: boolean) => void) => {
            xhr.start(complete, error);
        }, () => {
            xhr.abort(true);
        });
    }

    public static startAndPostProcess<T>(options: IXHROptions, postProcessor: (request: XMLHttpRequest, status?: number) => T): Promise<T> {
        const xhr = new XHR(options);

        return new Promise<T>((complete: (result: T) => void, error: (request: XMLHttpRequest, statusCode?: number, timeout?: boolean) => void) => {
            xhr.start((xhr: XMLHttpRequest, status: number) => {
                complete(postProcessor(xhr, status));
            }, error);
        }, () => {
            xhr.abort(true);
        });
    }
}
