// OneDrive:IgnoreCodeCoverage

import IClonedEvent from "../logging/IClonedEvent";
import Async from "../async/Async";
import { Beacon as BeaconEvent } from "./events/Beacon.event";
import ErrorHelper from "../logging/ErrorHelper";

export default class EventBatchCache {
    private _events: Array<IClonedEvent> = [];
    private _maxSize: number;
    private _maxFlushTimes: number[];
    private _flushCount = 0;
    private _flushTimeoutId: number;
    private _immediateflushTimeoutId: number;
    private _flushHandler: (events: Array<IClonedEvent>) => void;
    private _newEventHandler: (event: IClonedEvent) => void;
    private _async = new Async(this);
    private _useSlidingWindow: boolean;

    constructor(maxSize: number,
        maxFlushTimes: number[],
        newEventHandler: (event: IClonedEvent) => void,
        flushHandler: (events: Array<IClonedEvent>) => void,
        useSlidingWindow: boolean) {
        this._maxSize = maxSize;
        this._newEventHandler = newEventHandler;
        this._flushHandler = flushHandler;
        this._maxFlushTimes = maxFlushTimes;
        this._useSlidingWindow = useSlidingWindow;
    }

    public addEvent(event: IClonedEvent) {
        this._events.push(event);

        if (this._newEventHandler) {
            try {
                this._newEventHandler(event);
            } catch (e) {
                ErrorHelper.log(e);
            }
        }

        // Dont create a timer for events that are of type beacon
        if (BeaconEvent.isTypeOf(event)) {
            return;
        }

        if (this._events.length >= this._maxSize) {
            this.flush();
        } else {
            this._setFlushTimeout(false);
        }
    }

    public flush() {
        this._setFlushTimeout(true);
    }

    private _handleFlush() {
        this._clearFlushTimeout();

        if (this._events.length) {
            this._flushHandler(this._events);

            // Reset the events array
            this._events = [];
        }
    }

    private _clearFlushTimeout() {
        if (this._flushTimeoutId) {
            this._async.clearTimeout(this._flushTimeoutId);
            this._flushTimeoutId = null;
        }

        if (this._immediateflushTimeoutId) {
            this._async.clearTimeout(this._immediateflushTimeoutId);
            this._immediateflushTimeoutId = null;
        }
    }

    private _setFlushTimeout(immediate: boolean) {
        // if another immediate flush is already queued, disregard
        if (!!this._immediateflushTimeoutId) {
            return;
        }

        if (this._useSlidingWindow) {
            this._clearFlushTimeout();
            if (immediate) {
                this._immediateflushTimeoutId = this._async.setTimeout(() => {
                    this._handleFlush();
                }, 0);
            } else {
                this._flushTimeoutId = this._async.setTimeout(() => {
                    this._handleFlush();
                }, this._getFlushTime());
            }
        } else {
            if (immediate) {
                if (!this._immediateflushTimeoutId) {
                    this._immediateflushTimeoutId = this._async.setTimeout(() => {
                        this._handleFlush();
                    }, 0);
                }
            } else if (!this._flushTimeoutId) {
                this._flushTimeoutId = this._async.setTimeout(() => {
                    this._handleFlush();
                }, this._getFlushTime());
            }
        }
    }

    private _getFlushTime() {
        if (this._flushCount < this._maxFlushTimes.length) {
            var flushCount = this._flushCount;
            this._flushCount++;
            return this._maxFlushTimes[flushCount];
        } else {
            return this._maxFlushTimes[this._maxFlushTimes.length - 1];
        }
    }
}
