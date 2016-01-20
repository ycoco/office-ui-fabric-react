
import IDisposable = require('./IDisposable');

export module Disposable {
    'use strict';

    const DISPOSABLE_CHAIN_KEY = '_Disposable_disposalChain';

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

    /**
     * Adds a hook for disposal of a given object instance.
     */
    export function hook<T>(instance: T, onDispose: () => void): T & IDisposable;
    export function hook<T>(instance: T | IDisposable, onDispose: () => void): T & IDisposable {
        let disposable = <T & IDisposable>instance;

        let disposalChain = <DisposalChain>instance[DISPOSABLE_CHAIN_KEY];

        if (!disposalChain) {
            let dispose = disposable.dispose;

            disposalChain = new DisposalChain();

            instance[DISPOSABLE_CHAIN_KEY] = disposalChain;

            disposable.dispose = () => {
                disposalChain.dispose();

                if (dispose) {
                    dispose.call(disposable);
                }

                // Restore the old dispose method and clean up modifications.
                disposable.dispose = dispose;
                delete instance[DISPOSABLE_CHAIN_KEY];
            };
        }

        disposalChain.addCallback(onDispose);

        return disposable;
    }

    /**
     * Ensures that an instance is disposed when a base object is disposed.
     */
    export function attach<B extends IDisposable, E extends IDisposable>(lifetime: B, instance: E): B {
        return Disposable.hook(lifetime, () => instance.dispose());
    }

    /**
     * Determines whether or not a given instance is disposable.
     */
    export function isDisposable<T>(instance: T | IDisposable): instance is (T & IDisposable) {
        return !!(<T & IDisposable>instance).dispose;
    }
}

export default Disposable;
