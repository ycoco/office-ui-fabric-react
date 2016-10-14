import { Manager } from '../../../odsp-utilities/logging/Manager';
import IClonedEvent from '../../../odsp-utilities/logging/IClonedEvent';

export default class EventTestWatcher {
    private static _eventCounts = 0;
    private static _callbacks: Array<(e: IClonedEvent) => void> = [];
    private static _error: Error = null;

    public static addLogCallback(callback: (e: IClonedEvent) => void) {
        this._callbacks.push(callback);
    }

    public static getEventCounts() {
        return this._eventCounts;
    }

    public static throwIfHandlerErrors() {
        if (this._error) {
            throw this._error;
        }
    }

    public static beforeEach() {
        Manager.addLogHandler(this.logCallback);
        this._eventCounts = 0;
        this._callbacks = [];
        this._error = null;
    }

    public static afterEach() {
        Manager.removeLogHandler(this.logCallback);
    }

    private static logCallback(e: IClonedEvent) {
        // Dont uses this pointer since the binding is different in manager
        EventTestWatcher._eventCounts++;

        for (var x = 0; x < EventTestWatcher._callbacks.length; x++) {
            try {
                EventTestWatcher._callbacks[x](e);
            } catch (e) {
                // Only keep the first error
                if (!EventTestWatcher._error) {
                    EventTestWatcher._error = e;
                }
            }
        }
    }
}
