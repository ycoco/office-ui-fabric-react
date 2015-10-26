// OneDrive:IgnoreCodeCoverage

import IXHROptions = require('./IXHROptions');
import XHR = require('./XHR');
import Promise from '../async/Promise';

class XHRPromise {
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

    public static startAndPostProcess<T>(options: IXHROptions, postProcessor: any) : Promise<T> {

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

export = XHRPromise;