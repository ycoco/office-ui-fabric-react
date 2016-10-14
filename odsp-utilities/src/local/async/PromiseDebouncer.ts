// OneDrive:IgnoreCodeCoverage 

import Promise from './Promise';
import Signal from './Signal';

/** 
 * Creates a 'debounced' promise that will only allow one promise to execute at a time. If another call to debounce() is made before the
 * previous debounce() call has completed, then it will cancel the original promise, before executing the next promise.
 */
export default class PromiseDebouncer {
    private _originalPromise: Promise<any>;

    /**
     * Wraps the current promise and returns once it has completed. 
     * If debounce is called before the current promise has completed, it will cancel the previous promise.
     * @param: promise Promise to wrap
     */
    public debounce<T>(promise: Promise<T>): Promise<T> {
        this.clear();
        this._originalPromise = promise;

        let signal = new Signal<T>(() => this._originalPromise.cancel());

        this._originalPromise.done((response: any) => {
            this._clear(false);
            signal.complete(response);
        }, (error?: any) => {
            this._clear(false);
            signal.error(error);
        });

        return signal.getPromise();
    }

    /**
     * Clears the state of the debouncer. If the promise is not currently executing, then it's a no-op.
     * If this promise is still executing, then it cancels the promise.
     */
    public clear() {
        this._clear(true);
    }

    /**
     * Returns true if the promise is still executing, false otherwise.
     */
    public isExecuting(): boolean {
        return Boolean(this._originalPromise);
    }

    private _clear(isCancel: boolean) {
        if (this.isExecuting()) {
            if (isCancel) {
                this._originalPromise.cancel();
            }
            this._originalPromise = null;
        }
    }
}