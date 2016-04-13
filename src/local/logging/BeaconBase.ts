// OneDrive:IgnoreCodeCoverage

import IClonedEvent from "../logging/IClonedEvent";
import { Manager } from "../logging/Manager";
import EventBatchCache from "./EventBatchCache";
import XHR from "../xhr/XHR";
import { Beacon as BeaconEvent } from "./events/Beacon.event";

abstract class BeaconBase {
    protected static DEFAULT_TOTAL_RETRIES = 3;
    protected static DEFAULT_RESET_TOTAL_RETRIES_AFTER = 3;

    private _endPointUrl: string;
    private _eventBatchCache: EventBatchCache;
    private _lastSendBeacon: number = 0;
    private _maxCriticalFlushInterval: number;
    private _successfulLogRequests: number;
    private _totalRetries: number;
    private _totalRetriesStartValue: number;
    private _resetTotalRetriesAfter: number;
    private _ignorePreviousEvents: boolean;

    constructor(endPointUrl: string,
        batchSize: number,
        flushTimeouts: number[],
        useSlidingWindow: boolean,
        maxCriticalFlushInterval: number,
        totalRetries?: number,
        resetTotalRetriesAfter?: number,
        ignorePreviousEvents?: boolean) {
        this._endPointUrl = endPointUrl;
        this._maxCriticalFlushInterval = maxCriticalFlushInterval;
        this._totalRetries = totalRetries === undefined ? BeaconBase.DEFAULT_TOTAL_RETRIES : totalRetries;
        this._totalRetriesStartValue = this._totalRetries;
        this._resetTotalRetriesAfter = resetTotalRetriesAfter === undefined ? BeaconBase.DEFAULT_RESET_TOTAL_RETRIES_AFTER : resetTotalRetriesAfter;
        this._ignorePreviousEvents = ignorePreviousEvents === undefined ? false : ignorePreviousEvents;

        this._eventBatchCache = new EventBatchCache(
            batchSize,
            flushTimeouts,
            (event: IClonedEvent) => {
                if (this._onNewEvent) {
                    this._onNewEvent(event);
                }
            },
            (events: Array<IClonedEvent>) => {
                // Create the beacon request
                this._createBeaconRequest(events);
            },
            useSlidingWindow);

        this.init();
    }

    protected abstract _createBeaconRequest(events: Array<IClonedEvent>): void;
    protected abstract _onNewEvent(event: IClonedEvent): void;

    protected sendBeacon(json: string, headers: { [key: string]: string }, requestTimeoutInMS: number) {
        this._sendBeacon(json, headers, requestTimeoutInMS, 0);
    }

    private _sendBeacon(json: string, headers: { [key: string]: string }, requestTimeoutInMS: number, retryCount: number) {
        if (retryCount === 0) {
            this._lastSendBeacon = Manager.getTime();
        }

        var xhr = new XHR({
            url: this._endPointUrl,
            json: json,
            headers: headers,
            requestTimeoutInMS: requestTimeoutInMS
        });

        var beaconEvent = new BeaconEvent({
            retryCount: retryCount,
            totalRetries: this._totalRetries
        });

        xhr.start(
            (xhr: XMLHttpRequest, status: number) => {
                beaconEvent.end({ status: status + '', success: true });

                if (++this._successfulLogRequests >= this._resetTotalRetriesAfter) {
                    this._successfulLogRequests = this._resetTotalRetriesAfter;
                    this._totalRetries = this._totalRetriesStartValue;
                }
            },
            (xhr: XMLHttpRequest, status: number, timeout: boolean) => {
                this._successfulLogRequests = 0;

                beaconEvent.end({ status: status + '', success: false });

                // Retry if we timed out since we failed
                if (status === XHR.TIMEOUT_STATUS && this._totalRetries > 0) {
                    this._totalRetries--;
                    this._sendBeacon(json, headers, requestTimeoutInMS, retryCount + 1);
                }
            });
    }

    private init() {
        var bufferedEvents = Manager.addLogHandler((event: IClonedEvent) => {
            this.addEvent(event);
        });

        if (!this._ignorePreviousEvents) {
            for (var x = 0; x < bufferedEvents.length; x++) {
                this.addEvent(bufferedEvents[x]);
            }
        }
    }

    private addEvent(event: IClonedEvent) {
        if (event.enabled) {
            this._eventBatchCache.addEvent(event);

            if (event.critical &&
                (!this._lastSendBeacon ||
                    Manager.getTime() - this._lastSendBeacon > this._maxCriticalFlushInterval
                    )) {
                this._eventBatchCache.flush();
            }
        }
    }
}

export default BeaconBase;