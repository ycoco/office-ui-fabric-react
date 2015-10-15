
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
    export function hook<T extends IDisposable>(instance: T, onDispose: () => void): T;
    export function hook(instance: any, onDispose: () => void): IDisposable;
    export function hook<T extends IDisposable>(instance: T | IDisposable, onDispose: () => void): T | IDisposable {
        let disposable = <IDisposable>instance;

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
}

export default Disposable;
