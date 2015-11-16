// OneDrive:IgnoreCodeCoverage

import ErrorHelper = require("../ErrorHelper");
import BeaconBase = require("../BeaconBase");
import BeaconCache = require("./BeaconCache");
import IClonedEvent = require("../IClonedEvent");
import Guid from '../../guid/Guid';
import DataStore = require("../../models/store/BaseDataStore");
import DataStoreCachingType = require("../../models/store/DataStoreCachingType");
import LogProcessor = require("./LogProcessor");

module Beacon {
    "use strict";

    const LOGGING_REQUEST_TIMEOUT = 10000; // 10 seconds
    const FLUSH_TIMEOUT = 5000; // 5 seconds
    const BEACON_BATCH_SIZE = 100;
    const BEACON_MAX_CRITICAL_FLUSH_INTERVAL_SIZE = 5000; // 5 seconds
    // SLAPI
    const SLAPI_STREAM_ID = 1234;
    const SLAPI_JSON_VERSION = "V1";
    const SLAPI_IDX_VERSION = 0;
    const SLAPI_IDX_EVENTNAME = 1;
    const SLAPI_IDX_PROPERTY_START = 2;

    // BSQM Constants
    const SLAPI_MAX_DATA_SIZE  = 64 * 1024;
    const SLAPI_MAX_ROWS_IN_STREAM = 1000;
    const SLAPI_SIZE_DWORD = 4;
    const SLAPI_SIZE_DATAPOINT_ENTRY = 3 * 4 /*SIZE_DWORD*/;
    const SLAPI_SIZE_STREAM_ENTRY = 3 * 4 /*SIZE_DATAPOINT_ENTRY*/;
    const SLAPI_MS_BTN_EPOCHS = 11644473600000;    // Milliseconds between 1/1/1070 and 1/1/1601
    const SLAPI_MAX_INT32 = 0xFFFFFFFF;
    const SLAPI_MAX_SQM_DATAID = 0x7FFFFFFF;
    const SLAPI_DATAKEY_SESSION_NORMAL = 0;
    const SLAPI_DATAKEY_SESSION_CONTINUATION = 1;

    const SLAPI_FLAG_BSQM_ENABLED = 0x00000010;
    // const SLAPI_FLAG_QOS_ENABLED = 0x00000020;

    // SQM Datapoints
    const SLAPI_DATAID_BSQM_MAXSTREAMROWSSTREAMID = 8048;
    const SLAPI_DATAID_BSQM_MAXSTREAMROWS = 7993;
    const SLAPI_DATAID_SESSION_TYPE = 60;

    class WSAStreamRow {
        Tic: number = 0;
        Vals: Array<any> = null;

        constructor(values: Array<any>) {
            var _this = this;
            _this.Tic = _getTicks32();
            var numValues = values.length;
            _this.Vals = new Array(numValues);
            for (var i = 0; i < numValues; i++) {
                _this.Vals[i] = values[i];
            }
        }
    }

    class WSADatapoint {
        Id: number;
        Val: number;
        Tic: number;

        constructor(id: number, value: number) {
            var _this = this;
            _this.Id = id;
            _this.Val = value;
            _this.Tic = _getTicks32();
        }
    }

    class WSAStream {
        Id: number;
        Width: number;
        Rows: Array<WSAStreamRow>;
        constructor(id: number, width: number) {
            var _this = this;
            _this.Id = id;
            _this.Width = width;
            _this.Rows = new Array(0);
        }
    }

    class WSAData {
        StartTime: number = null;
        EndTime: number = null;
        CorrelationId: Guid;
        Flags: number = 0;
        wsaDatapoints: Array<WSADatapoint> = null;
        wsaStreams: Array<WSAStream> = null;

        constructor() {
            var _this = this;
            _this.StartTime = _getTicks64();
            _this.EndTime = null;
            _this.CorrelationId = null;
            _this.Flags = SLAPI_FLAG_BSQM_ENABLED;
            _this.wsaDatapoints = new Array(0);
            _this.wsaStreams = new Array(0);
        }
    }

    var _startTicks: number = 0;
    var _wsaData: WSAData = null;
    var _numDatapoints: number = 0;
    var _numStreams: number = 0;
    var _numStreamBytes: number = 0;
    var _dictStreams: any = null;
    var _dictDatapoints: any = null;
    var _streamRowCount: number = 0;
    var _isDataAvailableForUpload: Boolean = false;
    var _isContinuation: Boolean = false;
    var _isInitialized: Boolean = false;
    var _emptyCorrelationId = '00000000-0000-0000-0000-000000000000';
    var _eventNamePrefix: string = "";
    var _store: DataStore = new DataStore(LogProcessor.STORE_KEY, DEBUG ? DataStoreCachingType.none : DataStoreCachingType.session);
    var _storeSize: number = _store.getValue<number>(LogProcessor.STORE_SIZE_KEY);
    var _instance: OdbBeacon = null;
    var _ignoredEventsHandler: (event: IClonedEvent) => boolean = null;
    var _qoSEventNameHandler: (event: IClonedEvent, currentName: string) => string = null;
    var _qoSEventExtraDataHandler: (event: IClonedEvent, qosData: any) => void = null;

    if (!_storeSize) {
        _storeSize = 0;
    }

    // read any events Sharepoint put into session storage but haven't uploaded
    for (var i = 0; i < _storeSize; i++) {
        var item = _store.getValue(i.toString());
        if (!item || !item['name'] || !item['props']) {
            continue;
        }

        _WriteLog(item['name'], item['props']);
    }

    if (DEBUG) {
        try {
            console.log("Beacon: To disable logging to the console set \"window.disableBeaconLogToConsole = true\" in the debug window");
        } catch (error) {
            // Ignore errors here. This code path, console.log, is only called during debug and it can throw while
            // debugging or stepping through the code polluting the UI with unhandled errors.
        }
    }

    class OdbBeacon extends BeaconBase {
        protected _createBeaconRequest = (events: Array<IClonedEvent>) => {
            // grab the CorrelationId
            var spPageContextInfo: any = window['_spPageContextInfo'];

            //TODO: decide if we want to generate unique correlationid
            // or keep setting it to server correlationid
            if (spPageContextInfo !== undefined && spPageContextInfo !== null) {
                _SetCorrelationId(spPageContextInfo.CorrelationId);
            } else {
                _SetCorrelationId(_emptyCorrelationId);
            }

            // Converts to SP logging format
            for (var x = 0; x < events.length; x++) {
                var event = events[x];
                LogProcessor.processAndLogEvent({
                    event: event,
                    logFunc: (streamName: string, dictProperties: any) => {
                        _WriteLog(streamName, dictProperties);
                    },
                    eventNamePrefix: _eventNamePrefix,
                    qoSEventNameHandler: _qoSEventNameHandler,
                    ignoredEventsHandler: _ignoredEventsHandler
                });
            }

            this.beacon();
        };

        protected _onNewEvent = (event: IClonedEvent) => {
            // BeaconCache puts every new event to the session storage so that Sharepoint can upload it for us
            // if user navigates away before Beacon event. So we do nothing here.
        };

        constructor(eventNamePrefix: string,
        ignoredEventsHandler: (event: IClonedEvent) => boolean,
        qoSEventNameHandler: (event: IClonedEvent, currentName: string) => string,
        qoSEventExtraDataHandler: (event: IClonedEvent, qosData: any) => void) {
            super('/_layouts/15/WsaUpload.ashx',
                BEACON_BATCH_SIZE,
                [FLUSH_TIMEOUT],
                true, /* useSlidingWindow */
                BEACON_MAX_CRITICAL_FLUSH_INTERVAL_SIZE,
                BeaconBase.DEFAULT_TOTAL_RETRIES,
                BeaconBase.DEFAULT_RESET_TOTAL_RETRIES_AFTER,
                true);

            _ignoredEventsHandler = ignoredEventsHandler;
            _qoSEventNameHandler = qoSEventNameHandler;
            _qoSEventExtraDataHandler = qoSEventExtraDataHandler;
            _eventNamePrefix = eventNamePrefix;
        }

        public beacon() {
            if (!DEBUG) {
                var json = _getUploadData();
                if (json != null && json.length > 0) {
                    var headers: { [key: string]: string } = {};
                    headers["Content-Type"] = "application/json";
                    this.sendBeacon(json, headers, LOGGING_REQUEST_TIMEOUT);
                }
            } else if (!window["disableBeaconLogToConsole"]) {
                try {
                    console.log("Beacon: Uploaded to COSMOS (To disable logging to the console set \"window.disableBeaconLogToConsole = true\" in the debug window)");
                } catch (error) {
                    // Ignore errors here. This code path, console.log, is only called during debug and it can throw while
                    // debugging or stepping through the code polluting the UI with unhandled errors.
                }
            }

            // Set session storage size to zero instead of clearing
            _storeSize = 0;
            _store.setValue(LogProcessor.STORE_SIZE_KEY, _storeSize);
        }
    }

    export function addToLoggingManagerForBeaconCache(ignoredEventsHandler: (event: IClonedEvent) => boolean,
    qoSEventNameHandler: (event: IClonedEvent, currentName: string) => string, qoSEventExtraDataHandler: (event: IClonedEvent, qosData: any) => void): void {
        var beaconCacheEventNamePrefix = BeaconCache.getBeaconCacheEventNamePrefix();
        if (!beaconCacheEventNamePrefix) {
            beaconCacheEventNamePrefix = "NoBeaconCache";
        }
        addToLoggingManager(beaconCacheEventNamePrefix, ignoredEventsHandler, qoSEventNameHandler, qoSEventExtraDataHandler);
    }

    export function addToLoggingManager(eventNamePrefix: string,
    ignoredEventsHandler: (event: IClonedEvent) => boolean,
    qoSEventNameHandler: (event: IClonedEvent, currentName: string) => string,
    qoSEventExtraDataHandler: (event: IClonedEvent, qosData: any) => void): void {
        if (!_instance) {
            _instance = new OdbBeacon(eventNamePrefix, ignoredEventsHandler, qoSEventNameHandler, qoSEventExtraDataHandler);
        } else {
            throw new Error("The beacon has already been added to the logging manager with event name prefix " + _eventNamePrefix + ".");
        }
    }

    function _initialize() {
        if (_isInitialized) {
            return;
        }

        _wsaData = new WSAData();
        _dictStreams = new Array(0);
        _dictDatapoints = new Array(0);

        _createStream(SLAPI_STREAM_ID, 1);
        _isInitialized = true;
    }

    function _createStream(streamId: number, width: number) {
        if (!Boolean(_dictStreams[streamId])) {
            var wsaStream: WSAStream = new WSAStream(streamId, width);
            var idxStream: number = _numStreams;
            _wsaData.wsaStreams[idxStream] = wsaStream;
            _numStreams++;
            _numStreamBytes += SLAPI_SIZE_STREAM_ENTRY;
            _dictStreams[streamId] = idxStream;
        }
    }

    function _addToStream(streamId: number, dictValues: Array<any>) {
        try {
            var wsaStreamRow: WSAStreamRow = new WSAStreamRow(dictValues);
            if (_isMaxSizeReachedCheck()) {
                return;
            }

            _isDataAvailableForUpload = true;
            _setDatapoint(SLAPI_DATAID_BSQM_MAXSTREAMROWSSTREAMID, streamId);

            var wsaStream: WSAStream = _wsaData.wsaStreams[_dictStreams[streamId]];
            if (Boolean(wsaStream)) {
                if (_streamRowCount < SLAPI_MAX_ROWS_IN_STREAM) {
                    wsaStream.Rows[_streamRowCount++] = wsaStreamRow;
                    _numStreamBytes += _getTotalBytesForRow(wsaStreamRow);
                    _setDatapoint(SLAPI_DATAID_BSQM_MAXSTREAMROWS, _streamRowCount); // update row count datapoint
                } else {
                    throw ("Beacon: MAX_ROWS_IN_STREAM exceeded for stream ID " + String(streamId));
                }
            }
        } catch (e) {
            ErrorHelper.log(e);
        }
    }

    function _getTotalBytesForRow(row: WSAStreamRow): number {
        var numTotalBytes = SLAPI_SIZE_DWORD;
        for (var i = 0; i < row.Vals.length; i++) {
            var value: string = String(row.Vals[i]);
            numTotalBytes += value.length * 2; // A JavaScript char is 16 bit 2 byte
        }
        numTotalBytes += (row.Vals.length - 1) * 6; // plus the commas and quotes when serialized
        return numTotalBytes;
    }

    function _setDatapoint(datapointId: number, datapointValue: number) {
        if (datapointId < 1 || datapointId > SLAPI_MAX_SQM_DATAID) {
            return;
        }
        if (datapointValue < 0 || datapointValue > SLAPI_MAX_INT32) {
            return;
        }

        var savedDatapoint = null;
        var idxDP = _dictDatapoints[datapointId];
        if (Boolean(idxDP)) {
            savedDatapoint = _wsaData.wsaDatapoints[idxDP];
        }
        if (savedDatapoint == null) {
            var datapoint: WSADatapoint = new WSADatapoint(datapointId, datapointValue);
            var idxDatapoint: number = _numDatapoints;
            _wsaData.wsaDatapoints[idxDatapoint] = datapoint;
            _dictDatapoints[datapointId] = idxDatapoint;
            _numDatapoints++;
        } else {
            savedDatapoint.Val = datapointValue;
        }
    }

    function _uploadData(): string {
        if (_wsaData == null) {
            return "";
        }

        try {
            if (_isDataAvailableForUpload) {
                // Add final datapoints
                if (Boolean(_isContinuation)) {
                    _setDatapoint(SLAPI_DATAID_SESSION_TYPE, SLAPI_DATAKEY_SESSION_CONTINUATION);
                } else {
                    _setDatapoint(SLAPI_DATAID_SESSION_TYPE, SLAPI_DATAKEY_SESSION_NORMAL);
                    _isContinuation = true;
                }

                _wsaData.EndTime = _getTicks64();

                var jsonString: string = null;
                try {
                    jsonString = JSON.stringify(_wsaData);
                } catch (e) {
                    ErrorHelper.log(e);
                }

                // Initialize the session data for continuation session
                _initContinuationSession();

                return jsonString;
            }
        } catch (e) {
            ErrorHelper.log(e);
            return "";
        }
    }

    function _initContinuationSession() {
        _dictStreams = new Array(0);
        _dictDatapoints = new Array(0);
        _numDatapoints = 0;
        _numStreams = 0;
        _streamRowCount = 0;
        _numStreamBytes = 0;
        _numDatapoints = 0;

        var sessID = _wsaData.CorrelationId;
        _wsaData = new WSAData();
        _wsaData.CorrelationId = sessID;
        _createStream(SLAPI_STREAM_ID, 1);

        _isDataAvailableForUpload = false;
    }

    function _isMaxSizeReachedCheck(): Boolean {
        var size: number = _numDatapoints * SLAPI_SIZE_DATAPOINT_ENTRY + _numStreamBytes;
        if (size >= SLAPI_MAX_DATA_SIZE) {
            _instance.beacon();
            size = _numDatapoints * SLAPI_SIZE_DATAPOINT_ENTRY + _numStreamBytes;
            return size >= SLAPI_MAX_DATA_SIZE;
        }
        return false;
    }

    function _SetCorrelationId(correlationId: string) {
        _initialize();
        if (Boolean(_wsaData)) {
            if (correlationId !== null && correlationId !== undefined) {
                _wsaData.CorrelationId = correlationId;
            } else {
                _wsaData.CorrelationId = _emptyCorrelationId;
            }
        }
    }

    function _WriteLog(eventName: string, dictProperties: any) {
        _initialize();
        if ((!Boolean(eventName)) || (!Boolean(dictProperties))) {
            return;
        }
        if (!DEBUG) {
            var values = new Array(SLAPI_IDX_PROPERTY_START + 1);
            values[SLAPI_IDX_VERSION] = SLAPI_JSON_VERSION;
            values[SLAPI_IDX_EVENTNAME] = eventName;
            var index = SLAPI_IDX_PROPERTY_START;
            for (var key in dictProperties) {
                var propVal: any = dictProperties[key];
                if (propVal !== undefined && propVal !== null) { // do not need to upload null values wasting bandwidth
                    if (propVal instanceof Date) {
                        propVal = propVal.getTime();
                    }
                    values[index++] = key;
                    values[index++] = propVal;
                }
            }
            _addToStream(SLAPI_STREAM_ID, values);
        } else if (!window["disableBeaconLogToConsole"]) {
            try {
                console.log("Beacon: Logged to " + eventName + " with properties: " + JSON.stringify(dictProperties));
            } catch (error) {
                // Ignore errors here. This code path, console.log, is only called during debug and it can throw while
                // debugging or stepping through the code polluting the UI with unhandled errors.
            }
        }
    }

    function _getUploadData(): string {
        _initialize();
        return _uploadData();
    }

    function _getTicks32(): number {
        var timeNow = new Date();
        var ticks64 = timeNow.getTime();
        if (_startTicks === 0) {
            _startTicks = ticks64;
        }
        return ((1 + ticks64 - _startTicks) & 0x7FFFFFFF);
    }

    function _getTicks64(): number {
        var timeNow = new Date();
        var ticks64 = timeNow.getTime();
        ticks64 = ticks64 + SLAPI_MS_BTN_EPOCHS; // Epoch change from 1/1/1070 to 1/1/1601
        ticks64 = ticks64 * 10000;         // 1ms to 100ns resolution
        return ticks64;
    }
}

export = Beacon;