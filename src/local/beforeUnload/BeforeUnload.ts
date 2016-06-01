// OneDrive:IgnoreCodeCoverage

import {IDisposable} from '../interfaces/IDisposable';
import ErrorHelper from '../logging/ErrorHelper';
import Promise from '../async/Promise';
import Async from '../async/Async';

export interface IBeforeUnload extends IDisposable {
    allowHashNav(allowNavCallback: () => void, disallowNavCallback: () => void): boolean;
    registerHashNavDialogCallback(callback: (response: string) => Promise<void>);
    registerHandler(callback: (unload: boolean) => string): void;
    unRegisterHandler(callback: (unload: boolean) => string): void;
}

export default class BeforeUnload implements IBeforeUnload {
    private static _handlers: Array<(unload: boolean) => string> = [];
    private static _originalBeforeUnload: (ev: BeforeUnloadEvent) => string;
    private static _isDialogOpen: boolean;
    private static _allowNavs: boolean;
    private static _blockNavsAgainId: number;
    private static _async = new Async();
    private static _initialized = false;

    private _hashNavDialogCallback: (response: string) => Promise<void>;
    private _localHandlers: Array<(unload: boolean) => string> = [];

    public static init() {
        if (!this._initialized) {
            this._initialized = true;

            // Wire up before unload
            this._originalBeforeUnload = window.onbeforeunload;

            window.onbeforeunload = window['__onbeforeunload'] = (ev: BeforeUnloadEvent) => {
                return this._handleBeforeUnload(ev);
            };
        }
    }

    public static registerHandler(callback: (unload: boolean) => string) {
        this._handlers.push(callback);
    }

    public static unRegisterHandler(callback: (unload: boolean) => string) {
        for (var x = 0; x < this._handlers.length; x++) {
            if (this._handlers[x] === callback) {
                this._handlers.splice(x, 1);
                break;
            }
        }
    }

    public static dispose() {
        if (this._originalBeforeUnload) {
            window.onbeforeunload = this._originalBeforeUnload;
        } else {
            window.onbeforeunload = null;
        }
    }

    private static _handleBeforeUnload(ev: BeforeUnloadEvent) {
        var response = undefined;

        if (!this._allowNavs) {
            for (var x = 0; x < this._handlers.length; x++) {
                try {
                    response = this._handlers[x](true);
                    if (response) {
                        break;
                    }
                } catch (e) {
                    ErrorHelper.log(e);
                }
            }

            if (!response && this._originalBeforeUnload) {
                try {
                    response = this._originalBeforeUnload(ev);
                } catch (e) {
                    ErrorHelper.log(e);
                }
            }
        }

        // Make sure the response is undefined so ie will not block
        return response ? response : undefined;
    }

    public registerHashNavDialogCallback(callback: (response: string) => Promise<void>) {
        this._hashNavDialogCallback = callback;
    }

    public allowHashNav(allowNavCallback: () => void, disallowNavCallback: () => void): boolean {
        var response = undefined;

        if (!BeforeUnload._isDialogOpen && !BeforeUnload._allowNavs) {
            for (var x = 0; x < BeforeUnload._handlers.length; x++) {
                try {
                    response = BeforeUnload._handlers[x](false);
                    if (response) {
                        break;
                    }
                } catch (e) {
                    ErrorHelper.log(e);
                }
            }

            if (response) {
                BeforeUnload._isDialogOpen = true;

                this._hashNavDialogCallback(response)
                    .then(
                    () => {
                        BeforeUnload._isDialogOpen = false;
                        BeforeUnload._allowNavs = true;

                        // Dont block until we have a new stack
                        if (!BeforeUnload._blockNavsAgainId) {
                            BeforeUnload._blockNavsAgainId = BeforeUnload._async.setImmediate(() => {
                                BeforeUnload._allowNavs = false;
                                BeforeUnload._blockNavsAgainId = null;
                            });
                        }

                        if (allowNavCallback) {
                            allowNavCallback();
                        }
                    },
                    () => {
                        BeforeUnload._isDialogOpen = false;

                        if (disallowNavCallback) {
                            disallowNavCallback();
                        }
                    });
            }
        }

        return !response && !BeforeUnload._isDialogOpen;
    }

    public registerHandler(callback: (unload: boolean) => string) {
        this._localHandlers.push(callback);
        BeforeUnload.registerHandler(callback);
    }

    public unRegisterHandler(callback: (unload: boolean) => string) {
        for (var x = 0; x < this._localHandlers.length; x++) {
            if (this._localHandlers[x] === callback) {
                this._localHandlers.splice(x, 1);
                break;
            }
        }

        BeforeUnload.unRegisterHandler(callback);
    }

    public dispose() {
        // Clean up any hanging handlers
        for (let handler of this._localHandlers) {
            BeforeUnload.unRegisterHandler(handler);
        }
    }
}

BeforeUnload.init();