// OneDrive:IgnoreCodeCoverage

import IClonedEvent = require("../IClonedEvent");
import DataStore = require("../../models/store/BaseDataStore");
import DataStoreCachingType = require("../../models/store/DataStoreCachingType");
import { Manager } from "../Manager";
import LogProcessor = require("./LogProcessor");

module BeaconCache {
    "use strict";

    var _eventNamePrefix: string = "";
    var _store: DataStore = new DataStore(LogProcessor.STORE_KEY, DEBUG ? DataStoreCachingType.none : DataStoreCachingType.session);
    var _instance: OdbBeaconCache = null;
    var _ignoredEventsHandler: (event: IClonedEvent) => boolean = null;
    var _qoSEventNameHandler: (event: IClonedEvent, currentName: string) => string = null;
    var _qoSEventExtraDataHandler: (event: IClonedEvent, qosData: any) => void = null;

    if (DEBUG) {
        try {
            console.log("Beacon: To disable logging to the console set \"window.disableBeaconLogToConsole = true\" in the debug window");
        } catch (error) {
            // Ignore errors here. This code path, console.log, is only called during debug and it can throw while
            // debugging or stepping through the code polluting the UI with unhandled errors.
        }
    }

    class OdbBeaconCache {
        constructor(eventNamePrefix: string,
            ignoredEventsHandler: (event: IClonedEvent) => boolean,
            qoSEventNameHandler: (event: IClonedEvent, currentName: string) => string,
            qoSEventExtraDataHandler: (event: IClonedEvent, qosData: any) => void) {
            _eventNamePrefix = eventNamePrefix;
            _ignoredEventsHandler = ignoredEventsHandler;
            _qoSEventNameHandler = qoSEventNameHandler;
            _qoSEventExtraDataHandler = qoSEventExtraDataHandler;

            var bufferedEvents = Manager.addLogHandler((event: IClonedEvent) => {
                this.addEvent(event);
            });
            // Add bufferred events to local store
            for (var x = 0; x < bufferedEvents.length; x++) {
                this.addEvent(bufferedEvents[x]);
            }
        }

        private addEvent(event: IClonedEvent) {
            if (event.enabled) {
                // put every new event to the session storage so that Sharepoint can upload it for us
                // if user navigates away before Beacon event
                LogProcessor.processAndLogEvent({
                    event: event,
                    logFunc: (streamName: string, dictProperties: any) => {
                        var storeSize = _store.getValue<number>(LogProcessor.STORE_SIZE_KEY);
                        if (!storeSize) {
                            storeSize = 0;
                        }
                        _store.setValue(storeSize.toString(), { name: streamName, props: dictProperties });
                        _store.setValue(LogProcessor.STORE_SIZE_KEY, ++storeSize);
                    },
                    eventNamePrefix: _eventNamePrefix,
                    qoSEventNameHandler: _qoSEventNameHandler,
                    ignoredEventsHandler: _ignoredEventsHandler
                });
            }
        }
    }

    export function addToLoggingManager(eventNamePrefix: string,
    ignoredEventsHandler: (event: IClonedEvent) => boolean,
    qoSEventNameHandler: (event: IClonedEvent, currentName: string) => string,
    qoSEventExtraDataHandler: (event: IClonedEvent, qosData: any) => void): void {
        if (!_instance) {
            _instance = new OdbBeaconCache(eventNamePrefix, ignoredEventsHandler, qoSEventNameHandler, qoSEventExtraDataHandler);
        } else {
            throw new Error("The beaconCache has already been added to the logging manager with event name prefix " + _eventNamePrefix + ".");
        }
    }

    export function getBeaconCacheEventNamePrefix(): string {
        if (!_instance) {
            return null;
        } else {
            return _eventNamePrefix;
        }
    }
}

export = BeaconCache;