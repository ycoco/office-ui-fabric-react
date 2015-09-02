// OneDrive:IgnoreCodeCoverage
import Promise, { SignalPromise } from './Promise';

/**
 * Signal is used to manage a promise without having to pass a function to the Promise constructor.
 * Example:
 * var s = new Signal<boolean>();
 * setTimeout(() => {
 *    s.complete(true);
 * }, 1000);
 * return s.promise;
 */
class Signal<T> {
    private _promise: any;

    /**
     * Create a new Signal (also known as a Deferred in some circles.)
     * @param: oncancel A function to be called when the promise is cancelled.
     */
    constructor(oncancel?: () => void) {
        this._promise = new SignalPromise(oncancel);
    }

    /**
     * The underlying promise that the Signal manages.
     */
    public getPromise(): Promise<T> {
        return this._promise;
    }

    /**
     * Cancel the underlying promise.
     */
    public cancel() {
        this._promise.cancel();
    }

    /**
     * Complete the underlying promise with the given value.
     */
    public complete(value?: T) {
        this._promise._completed(value);
    }

    /**
     * Put the underlying promise into the error state with the given value.
     */
    public error(value?: any) {
        this._promise._error(value);
    }
}

export = Signal;