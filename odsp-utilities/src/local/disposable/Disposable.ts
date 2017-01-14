
import IDisposable from './IDisposable';

interface IDisposeExtension<T> {
    (): void;
    disposalChain?: DisposalChain<T>;
}

class DisposalChain<T> implements IDisposable {
    private _callbacks: (() => void)[];
    private _owner: T;

    constructor(owner: T) {
        this._callbacks = [];
        this._owner = owner;
    }

    public addCallback(callback: () => void) {
        this._callbacks.push(callback);
    }

    public dispose() {
        // Handle dispose callbacks is the reverse order from when they were attached.
        while (this._callbacks.length) {
            const callback = this._callbacks.pop();
            callback.call(this._owner);
        }
    }
}

/**
 * Determines whether not an object requires is disposable.
 *
 * @export
 * @template T
 * @param {(T | IDisposable)} object
 * @returns {object is IDisposable}
 */
export function isDisposable<T>(object: T | IDisposable): object is (T & IDisposable) {
    return typeof (<IDisposable>object).dispose === 'function';
}

/**
 * Adds a hook for disposal of a given object instance.
 *
 * @export
 * @template T the type of object to be modified.
 * @param {T} instance the instance to which to attach a disposal callback.
 * @param {() => void} onDispose a callback to execute upon disposal of the object.
 * @returns {(T & IDisposable)} the original object, now marked as disposable.
 */
export function hook<T>(instance: T, onDispose: (this: T) => void): T & IDisposable;
export function hook<T>(instance: T | IDisposable, onDispose: (this: T) => void): T & IDisposable {
    const disposable = <T & IDisposable>instance;
    const dispose = disposable.dispose as IDisposeExtension<T>;

    let disposalChain = typeof dispose === 'function' && dispose.disposalChain;

    if (!disposalChain) {
        disposalChain = new DisposalChain<T>(disposable);

        const disposeHook = (() => {
            disposalChain.dispose();

            if (dispose) {
                // Restore the old dispose method and clean up modifications.
                disposable.dispose = dispose;
                disposable.dispose();
            }
        }) as IDisposeExtension<T>;
        disposable.dispose = disposeHook;

        disposeHook.disposalChain = disposalChain;
    }

    disposalChain.addCallback(onDispose);

    return disposable;
}

export { IDisposable } from './IDisposable';