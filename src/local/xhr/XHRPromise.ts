// OneDrive:IgnoreCodeCoverage

import IXHROptions from './IXHROptions';
import XHR from './XHR';
import Promise from '../async/Promise';

export default class XHRPromise {
    public static start(options: IXHROptions) {

        var xhr = new XHR(options);

        return new Promise<XMLHttpRequest>(
            (complete: any, error: any) => {
                xhr.start(complete, error);
            },
            () => {
                xhr.abort(true);
            });
    }

    public static startAndPostProcess<T>(options: IXHROptions, postProcessor: any): Promise<T> {

        var xhr = new XHR(options);

        return new Promise<T>(
            (complete: any, error: any) => {
                xhr.start((xhr: XMLHttpRequest, status: number) => {
                    complete(postProcessor(xhr, status));
                }, error);
            },
            () => {
                xhr.abort(true);
            });
    }
}
