import Promise from './Promise';
import Signal from './Signal';

interface IQueueItem {
    callback: () => Promise<any>;
    canceled: boolean;
    result: Promise<any>;
    signal: Signal<any>;
}

/**
 * Provides a mechanism for limiting the maximum number of promises going on at one time.
 */
export default class Semaphore {

    public concurrency: number;

    private _running: number;
    private _queue: IQueueItem[];

    /**
     * @param concurrency How many promises to kick off before waiting for some to finish. Defaults to 1.
     */
    constructor(concurrency?: number) {
        this.concurrency = concurrency || 1;
        this._running = 0;
        this._queue = [];
        this._promiseComplete = this._promiseComplete.bind(this);
    }

    /**
     * Enqueue a callback that kicks off some asynchronous work.
     * @param callback - Does some async work and returns a promise to indicate completion.
     * @returns A promise of the same shape as the one returned by callback, so you can chain seamlessly.
     */
    public enqueue<T>(callback: () => Promise<T>): Promise<T> {
        var result: Promise<T>;
        if (this._running < this.concurrency) {
            this._running++;
            result = callback();
            result.done(this._promiseComplete, this._promiseComplete);
        } else {
            var item: IQueueItem = {
                callback: callback,
                signal: null,
                canceled: false,
                result: null
            };
            item.signal = new Signal<T>(() => {
                item.canceled = true;
                if (item.result) {
                    item.result.cancel();
                }
            });
            this._queue.push(item);
            result = item.signal.getPromise();
        }
        return result;
    }

    private _promiseComplete() {
        this._running--;
        if (this._running < this.concurrency && this._queue.length) {
            var item = this._queue.shift();
            while (item && item.canceled) {
                if (this._queue.length) {
                    item = this._queue.shift();
                } else {
                    item = null;
                }
            }
            if (item) {
                this._running++;
                item.result = item.callback();
                item.result.done((value: any) => {
                    item.signal.complete(value);
                    this._promiseComplete();
                }, (error: any) => {
                    item.signal.error(error);
                    this._promiseComplete();
                });
            }
        }
    }

}
