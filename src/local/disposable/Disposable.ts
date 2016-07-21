
import IDisposable from './IDisposable';

interface IConvertedDisposable extends IDisposable {
    _Disposable_disposalChain?: DisposalChain;
}

class DisposalChain implements IDisposable {
    private _callbacks: (() => void)[];

    constructor() {
        this._callbacks = [];
    }

    public addCallback(callback: () => void) {
        this._callbacks.push(callback);
    }

    public dispose() {
        // Handle dispose callbacks is the reverse order from when they were attached.
        while (this._callbacks.length) {
            let callback = this._callbacks.pop();
            callback();
        }
    }
}

export function isDisposable<T>(object: T | IDisposable): object is IDisposable {
    'use strict';

    return typeof (<IDisposable>object).dispose === 'function';
}

/**
 * Adds a hook for disposal of a given object instance.
 *
 * @export
 * @template T the typ of object to be modified.
 * @param {T} instance the instance to which to attach a disposal callback.
 * @param {() => void} onDispose a callback to execute upon disposal of the object.
 * @returns {(T & IDisposable)} the original object, now marked as disposable.
 */
export function hook<T>(instance: T, onDispose: () => void): T & IDisposable;
export function hook<T>(instance: T | IDisposable, onDispose: () => void): T & IDisposable {
    'use strict';

    let disposable = <T & IConvertedDisposable>instance;

    let disposalChain = disposable._Disposable_disposalChain;

    if (!disposalChain) {
        let dispose = disposable.dispose;

        disposalChain = new DisposalChain();

        disposable._Disposable_disposalChain = disposalChain;

        disposable.dispose = () => {
            disposalChain.dispose();

            if (dispose) {
                dispose.call(disposable);
            }

            // Restore the old dispose method and clean up modifications.
            disposable.dispose = dispose;
            delete disposable._Disposable_disposalChain;
        };
    }

    disposalChain.addCallback(onDispose);

    return disposable;
}
