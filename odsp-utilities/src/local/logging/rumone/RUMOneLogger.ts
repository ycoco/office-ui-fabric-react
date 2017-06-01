// OneDrive:IgnoreCodeCoverage
import Async from '../../async/Async';
import PageTransitionType from './PageTransitionType';
import RUMOneSLAPI from './RUMOneSLAPI';
import RUMOneErrorsSLAPI from './RUMOneErrorsSLAPI';
import { RUMOneDataUpload as RUMOneDataUploadEvent } from '../events/RUMOneDataUpload.event';
import PlatformDetection from '../../browser/PlatformDetection';
import { PerfMark, MARKER_PREFIX, getMarkerTime, mark, clearMarks, getAllMarks } from '../../performance/PerformanceMarker';

enum PerformanceDataState {
    /**
     * Not enought data collected to upload
     * At this state logger isRunning is true
     */
    Incomplete = 1,

    /**
     * Required data collected and can be uploaded.
     * Practically all expected controls has rendered by this time
     * and EUPL has been set.
     * At this state logger isRunning is true but sooner to change to false.
     */
    ReadyToUpload = 2,

    /**
     * Incomplete -> ReadyToUpload |  ERROR_TIMEOUT time elapsed -> Uploaded
     * Performance data has been uploaded for the current page.
     * Until reset, no more data will be uploaded.
     */
    Uploaded = 3,

    /**
     * Incomplete -> ERROR_TIMEOUT time elapsed -> TimeOut -> Uploaded
     * Timeout occured before expected controls could finish rendering
     * Data will be uploaded as it is but without EUPL.
     * Consumer should consider EUPL="" as > 30 sec for performance analysis
     */
    TimeOut = 4,

    /**
     * Incomplete -> (ERROR_TIMEOUT time elapsed && TimeOut) | ReadyToUpload -> Skipped
     * This is a state where data has been collected or timeout but uploading the data was skipped
     * This happens when consumer has asked to do so based on the page's debug environment
     */
    Skipped = 5
}

export interface IControl {
    controlId: string;
    ignoreForEUPL?: boolean;
    data?: ControlPerformanceData;
}

export type ControlType = IControl | string;

export class APICallPerformanceData {
    public url: string;
    public duration: number;
    public correlationId: string;
    public status: number;
    public startTime: string;
    public endTime: string;
    public name: string;

    constructor(
        url: string,
        duration: number,
        correlationid: string,
        status: number,
        startTime: string,
        endTime: string,
        name?: string) {
        this.url = url;
        this.duration = duration;
        this.correlationId = correlationid;
        this.status = status;
        this.startTime = startTime;
        this.endTime = endTime;
        this.name = name;
    }
}

export class ControlPerformanceData {
    public controlId: string;
    public startTime: number;
    public endTime: number;
    public renderTimeCalculator: (rumone: RUMOneLogger, controlData: ControlPerformanceData) => number;
    public renderTimeRequiredDataChecker: (rumone: RUMOneLogger, controlData: ControlPerformanceData) => boolean;
    public renderTime: number;
    // if control is set to be secondary and ignore for EUPL, EUPL calculation is not based on its render time,
    // but we will report its render time as part of EUPL breakdown
    public ignoreForEUPL: boolean;

    constructor(
        controlId: string,
        startTime: number,
        endTime: number,
        renderTimeCalculator: (rumone: RUMOneLogger, controlData: ControlPerformanceData) => number,
        renderTimeRequiredDataChecker: (rumone: RUMOneLogger, controlData: ControlPerformanceData) => boolean,
        ignoreForEUPL?: boolean) {
        this.controlId = controlId;
        this.startTime = startTime;
        this.endTime = endTime;
        this.renderTimeCalculator = renderTimeCalculator;
        this.renderTimeRequiredDataChecker = renderTimeRequiredDataChecker;
        this.ignoreForEUPL = !!ignoreForEUPL;
    }
}

function isNullOrUndefined(item: any): boolean {
    'use strict';
    return item === null || item === undefined;
}

const performance = window.performance;
/**
 * It is a new client side perf instrumentation, it logs more metrics, like scenario, api data, server request id, duration, etc in 1 single schema.
 * It has server side usage DB and cosmos supports.
 */
export default class RUMOneLogger {
    public static rumOneLogger: RUMOneLogger = null;
    public static CHECK_INTERVAL: number = 100;   // in milliseconds
    public static ERROR_TIMEOUT: number = 30000;   // in milliseconds
    public static MAX_MARKS: number = 100;   // suppport maximum 100 perf markers
    public static KeyMetrics: string[] = ['EUPL', 'ScenarioId'];

    private async = new Async(this);
    private dataStartTime: number = Number((new Date()).getTime());
    private performanceData: RUMOneSLAPI = null;
    private dataState: PerformanceDataState = PerformanceDataState.Incomplete;
    private controls: Array<IControl> = [];
    private apis: Array<APICallPerformanceData> = [];
    private perfDataTimer: any = null;
    private loggingFunc: (streamName: string, dictProperties: any) => void;
    private euplBreakDown: { [key: string]: number } = {};
    private serverMetrics: { [key: string]: number } = {};
    private isW3cTimingCollected: boolean = false;
    private isW3cResourceTimingCollected: boolean = false;
    private tempData: any = {};
    private _platformDetection: PlatformDetection;
    private _waitOnAddingExpectedControl: boolean;
    private _excludePageData: boolean;
    private _emergencyUpdateFunc: () => void = this._emergencyUpload.bind(this);

    constructor(logFunc: (streamName: string, dictProperties: any) => void) {
        this.performanceData = null;
        this.loggingFunc = logFunc;
        this.getPerformanceData();
        this.setPerfDataTimer();
        this._platformDetection = new PlatformDetection();
        this._hookUnloadEvent();
    }

    /**
     * RUMOneLogger.getRUMOneLogger: Use this method to get a singleton reference of RUMOneLogger
     * with default parameters.
     */
    public static getRUMOneLogger(logFunc?: (streamName: string, dictProperties: any) => void): RUMOneLogger {
        let loggingFunc = logFunc || ((streamName: string, dictProperties: any) => {
            RUMOneDataUploadEvent.logData({ streamName: streamName, dictionary: dictProperties });
        });
        if (!RUMOneLogger.rumOneLogger) {
            try {
                RUMOneLogger.rumOneLogger = new RUMOneLogger(loggingFunc);
            } catch (e) {
                // If RUMOneLogger fails, don't block UX
                RUMOneLogger.rumOneLogger = null;
            }
        }
        return RUMOneLogger.rumOneLogger;
    }
    public getPerformanceData(): RUMOneSLAPI {
        if (!this.performanceData) {
            this.performanceData = new RUMOneSLAPI();
            this.logMessageInConsole("RUMOne object initiated!");
        }
        return this.performanceData;
    }
    public resetLogger() {
        this._emergencyUpload(); // upload ready key metrics if we have not. this should rarely happen
        this.dataStartTime = (new Date()).getTime();
        this.dataState = PerformanceDataState.Incomplete;
        this.isW3cTimingCollected = false;
        this.isW3cResourceTimingCollected = false;
        this.controls = [];
        this.apis = [];
        this.tempData = {};
        this.performanceData = null;
        this._excludePageData = false;
        this._waitOnAddingExpectedControl = false;
        this.getPerformanceData();
        this.clearPerfDataTimer();
        this.setPerfDataTimer();
        this.euplBreakDown = {};
        this.serverMetrics = {};
        this.clearResourceTimings();
        clearMarks();
        this._unhookUnloadEvent();
        this._hookUnloadEvent();
        this.logMessageInConsole("Reset performance Logger Done");
    }

    /**
     * Consumer should own logic to determine whether to ignore the  page for perf data collection
     * when Called this API, RUMOneLogger will not upload data but display in the console for debug purpose
     * E.g. Hidden Preload.aspx page for sharepoint or a debug page with #debugManifest or ?moduleLoader= in the url
     *
     */
    public excludePageForPerfData(): void {
        this._excludePageData = true;
    }

    public logPerformanceData(key: string, value: any) {
        if (!key || !this.performanceData || !this.verifyPropertyMatchingSchema(key)) {
            return;
        }
        this.getPerformanceData();
        this.performanceData[key] = value;
    }
    public getPerformanceDataPropertyValue(key: string): any {
        if (!this.performanceData || !key || !this.verifyPropertyMatchingSchema(key)) {
            return null;
        }
        return this.performanceData[key];
    }
    public verifyPropertyMatchingSchema(propertyName: string): boolean {
        var properties: any = this.getRUMOnePropertyNames(this.performanceData);
        return properties.join().indexOf(propertyName) !== -1;
    }
    public addExpectedControl(control: ControlType) {
        const normalizedControl = this._normalizeControl(control);
        if (!this.expectingControl(control)) {
            this.controls.push(normalizedControl);
        }
    }
    public expectingControl(control: ControlType): boolean {
        const normalizedControl = this._normalizeControl(control);
        return this.controls.filter((expected: IControl) => expected.controlId === normalizedControl.controlId).length > 0;
    }
    public writeServerCorrelationId(correlationId: string) {
        if (!this.isCollected('ServerCorrelationId')) {
            this.logPerformanceData('ServerCorrelationId', correlationId);
        }
    }
    public writeServerUrl(url: string) {
        if (!this.isCollected('ServerUrl')) {
            var serverUrl: string = url || window.location.href;
            this.logPerformanceData('ServerUrl', serverUrl);
        }
    }
    public writeServerSideLatency(duration: number, iisLatency: number) {
        if (!this.isCollected('ServerRequestDuration')) {
            this.logPerformanceData('ServerRequestDuration', duration);
            this.logPerformanceData('IISLatency', iisLatency);
        }
    }
    public writeControlPerformanceData(controlData: ControlPerformanceData) {
        if (controlData) {
            let foundControl = this.controls.filter((control: IControl) => control.controlId === controlData.controlId)[0];
            if (foundControl) {
                if (!foundControl.data) {
                    foundControl.data = controlData;
                }
            } else {
                const control: IControl = {
                    controlId: controlData.controlId,
                    ignoreForEUPL: controlData.ignoreForEUPL || true,  // for control data that is not registered via addExpectedControl, always treat as secondary control unless otherwise is specified
                    data: controlData
                };
                this.controls.push(control);
            }
        }
    }
    public writeAPICallPerformanceData(apiData: APICallPerformanceData) {
        if (apiData) {
            this.apis.push(apiData);
        }
    }
    public readAPICallPerformanceData(): Array<APICallPerformanceData> {
        return this.apis;
    }
    public writeAppCache(appCache: boolean) {
        if (!this.isCollected('AppCache')) {
            this.logPerformanceData('AppCache', appCache);
        }
    }
    public writePageTransitionType(pageTransitionType: PageTransitionType, overwrite?: boolean) {
        if ((!this.isCollected('PageTransitionType') || overwrite) &&
            (pageTransitionType === PageTransitionType.fullPageLoad || pageTransitionType === PageTransitionType.none || pageTransitionType === PageTransitionType.onePageAppNavigation)) {
            this.logPerformanceData('PageTransitionType', pageTransitionType);
        }
    }
    public writeScenarioId(scenarioId: string, overwrite?: boolean) {
        if (!this.isCollected('ScenarioId') || overwrite) {
            this.logPerformanceData('ScenarioId', scenarioId);
        }
    }
    public collectW3CPerfTimings() {
        if (!this.isW3cTimingCollected) {
            var w3cTimeStampNames = ['navigationStart', 'unloadEventStart', 'unloadEventEnd', 'fetchStart', 'redirectStart', 'redirectEnd', 'domainLookupStart', 'domainLookupEnd', 'connectStart', 'secureConnectionStart', 'connectEnd', 'requestStart', 'responseStart', 'responseEnd', 'domLoading', 'domComplete', 'loadEventStart', 'loadEventEnd'];
            var perfTimingObject: PerformanceTiming = performance && performance.timing;

            if (perfTimingObject) {
                for (var index = 0; index < w3cTimeStampNames.length; index++) {
                    var w3cObject = perfTimingObject[w3cTimeStampNames[index]];
                    if (w3cObject) {
                        this.logPerformanceData(this.getW3cTimingName(w3cTimeStampNames[index]), Number(w3cObject));
                    }
                }
                this.isW3cTimingCollected = true;
            }
        }
    }
    public collectW3cResourceTimings() {
        if (!this.isW3cResourceTimingCollected && performance && performance.getEntriesByType) {
            var allRequests: Array<PerformanceResourceTiming> = performance.getEntriesByType("resource");

            var iFrames = document.getElementsByTagName("iframe");

            for (var index = 0; index < iFrames.length; index++) {
                var iFramePerformance = null;

                try {
                    iFramePerformance = iFrames[index].contentWindow.performance;
                } catch (e) {
                    // sometimes we can't access iFrame.
                }

                if (iFramePerformance && iFramePerformance.getEntriesByType) {
                    allRequests.concat(iFramePerformance.getEntriesByType("resource"));
                }
            }
            var fromSources = {};
            fromSources["SharePoint"] = (element: PerformanceResourceTiming) => { return /\.sharepoint\.com|\.spoppe\.com/i.test(element.name); };  //matching sharepoint.com or spoppe.com
            fromSources["CDN"] = (element: PerformanceResourceTiming) => { return /(cdn(ppe)?|static(ppe)?)\.sharepointonline\.com|\.akamaihd\.net/i.test(element.name); };  //matching cdn(ppe)sharepointonline.com or adamaihd.net
            fromSources["ThirdParty"] = (element: PerformanceResourceTiming) => { return !fromSources["SharePoint"](element) && !fromSources["CDN"](element); };  // all requests other than sharepoint requests or cdn requests

            var types = {};
            types["ASPX"] = (element: PerformanceResourceTiming) => { return /\.aspx/i.test(element.name); };
            types["JS"] = (element: PerformanceResourceTiming) => { return /script/i.test(element.initiatorType); };
            types["CSS"] = (element: PerformanceResourceTiming) => { return /link|css/i.test(element.initiatorType); };
            types["IMG"] = (element: PerformanceResourceTiming) => { return /img/i.test(element.initiatorType); };

            var sources: Array<string> = Object.keys(fromSources);
            for (var index = 0; index < sources.length; index++) {
                var source = sources[index];
                var requests = this.categorizeResourceRequests(allRequests, {
                    from: fromSources[source],
                    requestType: null        //match any type to get total request count for this source
                });
                this.logPerformanceData(source + "RequestCountTotal", requests.length); //SharePoint|CDN|ThirdParty resource request count

                var typeKeys: Array<string> = Object.keys(types);
                for (var typeIndex = 0; typeIndex < typeKeys.length; typeIndex++) {
                    var type = typeKeys[typeIndex];
                    this.logPerformanceData(source + "RequestCount" + type, this.categorizeResourceRequests(requests, {
                        from: null,     // requests already only contains the requests from SharePoint|CDN|ThirdParty source
                        requestType: types[type]
                    }).length);   //SharePoint|CDN|ThirdParty ASPX resource request count
                }

                if (requests.length > 0) {
                    this.logPerformanceData(source + "RequestDownloadTime", Math.round(requests.reduce((sum: number, currentVal: PerformanceResourceTiming) => {
                        return sum + currentVal.duration;
                    }, 0) / requests.length));  //SharePoint|CDN|ThirdParty resource request average duration
                    // log the file names of all resource requests in a JSON string. The output after processing will looks like:
                    // [{name: "require-db6c47e2.js", startTime: 500, duration: 100},{name: "RenderListDataAsStream", startTime: 200, duration: 10}]
                    // The raw resource name before this processing is "https://msft.spoppe.com/teams/SPGroups/_api/web/GetList(@listUrl)/RenderListDataAsStream?Paged=TRUE&p_FileLeafRef=test%2eurl&p_ID=213&PageFirstRow=121&View=6eab4254-2f2f-4086-91c0-549ae900cc93&@listUrl=%27%2Fteams%2FSPGroups%2FVNextDocLib%27"
                    let files = JSON.stringify(requests.map((timing: PerformanceResourceTiming) => {
                        return {
                            name: timing.name.split("/").map((urlToken: string) => {
                                return urlToken.split("?")[0];
                            }).filter((urlToken: string) => {
                                return urlToken && urlToken.length > 0;
                            }).slice(-1)[0].replace(/\(.*?\)/g, '()'),
                            startTime: Math.round(timing.startTime),
                            duration: Math.round(timing.duration),
                            transferSize: timing['transferSize'] || 0
                        };
                    }));
                    this.logPerformanceData(source + "RequestNames", files);
                }
            }

            this.isW3cResourceTimingCollected = true;
        }
    }
    public saveTempData(key: string, value: any) {
        this.tempData[key] = value;
    }
    public readTempData(key: string): any {
        return this.tempData[key];
    }
    public writeRenderTime(renderTime: number, overwrite?: boolean) {
        if (!this.isCollected('RenderTime') || overwrite) {
            this.logPerformanceData('RenderTime', renderTime);
        }
    }
    public writePreRenderTime(preRender: number) {
        if (!this.isCollected('PreRender')) {
            this.logPerformanceData('PreRender', preRender);
        }
    }
    public writePostRenderTime(postRender: number) {
        if (!this.isCollected('PostRender')) {
            this.logPerformanceData('PostRender', postRender);
        }
    }
    public writeDataFetchTime(dataFetch: number, overwrite?: boolean) {
        if (!this.isCollected('DataFetch') || overwrite) {
            this.logPerformanceData('DataFetch', dataFetch);
        }
    }

    public isRunning(): boolean {
        return !(
            this.dataState === PerformanceDataState.Uploaded ||
            this.dataState === PerformanceDataState.TimeOut ||
            this.dataState === PerformanceDataState.Skipped);
    }

    public writeEUPLBreakdown(euplBreakdown: string, overwrite?: boolean) {
        if (euplBreakdown) {
            try {
                const breakdown: Object = JSON.parse(euplBreakdown);
                for (let key in breakdown) {
                    if (!breakdown.hasOwnProperty(key)) {
                        continue;
                    }
                    this.addEUPLBreakdown(key, breakdown[key], overwrite);
                }
            } catch (e) {
                // in case the euplBreakdown is invalid JSON
                this.logMessageInConsole("Failed to write EUPL breakdown data:" + e.toString());
            }
        }
    }

    public addEUPLBreakdown(name: string, value: number, overwrite?: boolean) {
        if (name && !isNullOrUndefined(value)) {
            if (isNullOrUndefined(this.euplBreakDown[name]) || overwrite) {
                this.euplBreakDown[name] = value;
            }
        }
    }

    /**
     * Add list of flights enabled for this page.
     */
    public addFlights(flights: string[]) {
        if (flights && flights.length > 0) {
            const _flights: string[] = JSON.parse(this.getPerformanceDataPropertyValue('Flights') || '[]');
            for (let index = 0; index < flights.length; index++) {
                const flight: string = flights[index];
                if (flight && _flights.indexOf(flight) === -1) {
                    _flights.push(flight);
                }
            }

            this.logPerformanceData('Flights', JSON.stringify(_flights));
        }
    }

    public addServerMetrics(metric: { [key: string]: number }, overwrite?: boolean) {
        if (metric) {
            for (let key in metric) {
                if (key && !isNullOrUndefined(metric[key]) &&
                    (isNullOrUndefined(this.serverMetrics[key]) || overwrite)) {
                    this.serverMetrics[key] = metric[key];
                }
            }
        }
    }

    public readControlPerformanceData(): Array<ControlPerformanceData> {
        return this.controls.filter((control: IControl) => !!control.data).map((control: IControl) => control.data);
    }

    public mark(name: string): void {
        mark(name);
    }

    public now(): number {
        return performance && performance.now ? Math.round(performance.now()) : NaN;
    }

    public getMarkerTime(name: string): number {
        return getMarkerTime(name);
    }

    /**
     * If set to true, RUMOnelogger will wait until this is not set false again before concluding all expected controls are added
     * Set it to true if not all expected controls are added
     * Set it to false once all expected controls has been added
     */
    public set waitOnAddingExpectedControl(wait: boolean) {
        this._waitOnAddingExpectedControl = wait;
    }

    private clearResourceTimings(): void {
        if (performance && performance.clearResourceTimings) {
            performance.clearResourceTimings();
        }
    }
    private collectMarks(): void {
        let marks = {};
        let markerIndex = 0;
        getAllMarks().forEach((mark: PerfMark) => {
            if (markerIndex < RUMOneLogger.MAX_MARKS) {
                let markName = mark.name.substr(MARKER_PREFIX.length) + `.mark${markerIndex++}`;
                marks[markName] = Math.round(mark.startTime);  // covert to rumone collected marks to object and merge to EUPL Breakdown
            }
        });
        this.writeEUPLBreakdown(JSON.stringify(marks));
    }

    private logMessageInConsole(message: string) {
        if (this.isRUMOneDebuggingEnabled) {
            console.log(message);
        }
    }

    private get isRUMOneDebuggingEnabled(): boolean {
        try {
            if ('sessionStorage' in window && window.sessionStorage) {
                const debugStr = window.sessionStorage["enableRUMOneDebugging"];
                const debug = debugStr && debugStr.toLowerCase() === "true";
                return debug && typeof console !== "undefined" && !!console;
            }
        } catch (e) {
            // sessionStorage errors
        }

        return false;
    }

    private logObjectForDebugging(propertyName: string, dictProperties: any) {
        if (this.isRUMOneDebuggingEnabled) {
            const logMessageText: string = propertyName + " : " + JSON.stringify(dictProperties);
            console.log(logMessageText);
        }
    }

    private isCollected(name: string): boolean {
        return !isNullOrUndefined(this.getPerformanceDataPropertyValue(name));
    }

    private _normalizeControl(control: ControlType): IControl {
        return typeof control === 'string' ? {
            controlId: control,
            ignoreForEUPL: false
        } : control;
    }

    private getRUMOnePropertyNames(obj: any): Array<string> {
        var names: Array<string> = [];
        var index: number = 0;
        if (!isNullOrUndefined(obj)) {
            for (var property in obj) {
                if (obj.hasOwnProperty(property)) {
                    names[index++] = property;
                }
            }
        }
        return names;
    }
    private setPerfDataTimer() {
        this.perfDataTimer = this.async.setTimeout(this.loopForDataCompleteness, RUMOneLogger.CHECK_INTERVAL);
    }

    private clearPerfDataTimer() {
        if (!isNullOrUndefined(this.perfDataTimer)) {
            this.async.clearTimeout(this.perfDataTimer);
            this.perfDataTimer = null;
        }
    }

    private _hookUnloadEvent() {
        /* tslint:disable:ban-native-functions */
        if (window.addEventListener) {
            window.addEventListener('beforeunload', this._emergencyUpdateFunc);
        }
        /* tslint:enable:ban-native-functions */
    }

    private _unhookUnloadEvent() {
        /* tslint:disable:ban-native-functions */
        if (window.removeEventListener) {
            window.removeEventListener('beforeunload', this._emergencyUpdateFunc);
        }
        /* tslint:enable:ban-native-functions */
    }

    private categorizeResourceRequests(requests: Array<PerformanceResourceTiming>, categorizer: any): Array<PerformanceResourceTiming> {
        var ret = [];
        for (var index = 0; index < requests.length; index++) {
            var request = requests[index];
            if ((!categorizer.from || categorizer.from(request)) && (!categorizer.requestType || categorizer.requestType(request))) {
                ret.push(request);
            }
        }
        return ret;
    }

    private collectSupplementaryData(): void {
        this.setAPIDataToRUMOne();
        this.collectMarks();
        this.writeServerUrl(null);
        this.setBrowseInfo();
        this.setReferrer();
        this.logPerformanceData('ServerMetrics', JSON.stringify(this.serverMetrics));
        this.logPerformanceData('EUPLBreakdown', JSON.stringify(this.euplBreakDown));
    }

    private loopForDataCompleteness() {
        this.clearPerfDataTimer();

        if (!this._waitOnAddingExpectedControl) {
            if (this.isRUMOneDebuggingEnabled) {
                this.logObjectForDebugging("RUMONE: ", this.performanceData);
                this.logObjectForDebugging("RUMOne DataState: ", String(this.getReadableDataState(this.dataState)));
                this.logObjectForDebugging("Controls: ", this.controls);
                this.logObjectForDebugging("API Performance Data: ", this.apis);
                this.logObjectForDebugging("Temp Data: ", this.tempData);
                this.logObjectForDebugging("EUPLBreakdown: ", this.euplBreakDown);
                this.logObjectForDebugging("ServerMetrics: ", this.serverMetrics);
                this.logMessageInConsole("====================================================================");
            }

            if (!this.isRunning()) {
                return;
            }

            this._updateState();

            if (this.dataState === PerformanceDataState.ReadyToUpload) {
                this.finishPerfDataUpload();
                return;
            }

            this.processControlRenderTime();
            if (this.readyToComputeEUPL()) { // if all expected control data is available, compute EUPL
                this.setEUPL();
                this._updateState();
            }
        }

        // Check timeout
        this._checkTimeout();
        if (this.isRunning()) {
            this.setPerfDataTimer();
        }
    }

    /**
     * Check if we reached ERROR_TIMEOUT without being ready to upload and timeout if so
     */
    private _checkTimeout(): void {
        if (!this.isRunning() || this.dataState === PerformanceDataState.ReadyToUpload) {
            return;
        }

        if (Number((new Date()).getTime()) - Number(this.dataStartTime) <= RUMOneLogger.ERROR_TIMEOUT) {
            return; // Nope, we still have time
        }

        // Upload whatever data we have without all key metrics
        this.dataState = PerformanceDataState.TimeOut;
        this.finishPerfDataUpload();
        // Report timeout error
        this.reportErrors(
            'TimeOut', `Did not get key perf metrics in ${RUMOneLogger.ERROR_TIMEOUT} milliseconds. Missed metrics: ${this._getMissedKeyMetrics().join()}. Missed controls: ${this._getMissedControls().map((control: IControl) => control, name).join()}`);
    }

    private _updateState(): void {
        this.dataState =
            (this._getMissedKeyMetrics().length === 0 && this._getMissedControls().length === 0)
                ? PerformanceDataState.ReadyToUpload
                : PerformanceDataState.Incomplete;
    }

    /**
     * Get array of missing key metrices
     */
    private _getMissedKeyMetrics(): string[] {
        const missedKeyMetrics: string[] = [];
        for (var i = 0; i < RUMOneLogger.KeyMetrics.length; i++) {  // check if key metrics are collected
            var keyMetricValue: any = this.getPerformanceDataPropertyValue(RUMOneLogger.KeyMetrics[i]);
            if (isNullOrUndefined(keyMetricValue)) {
                missedKeyMetrics.push(RUMOneLogger.KeyMetrics[i]);
            }
        }

        return missedKeyMetrics;
    }

    /**
     * Get array of controls missing data
     */
    private _getMissedControls(): IControl[] {
        return this.controls.filter((control: IControl) => !control.data || !control.data.renderTime);
    }

    // since we allow secondary controls reported but not be used to calculate EUPL,
    // these controls might be very slow and we are in higher risky that end user navigates
    // away from this page before we upload our data although EUPL might be available already.
    // This should be hooked with onunload event and resetlogger method
    private _emergencyUpload(): void {
        if (this.isRunning() && this._getMissedKeyMetrics().length === 0) {
            this.finishPerfDataUpload(true);
        }
    }

    // if emergency set to true, we will not validate data state in uploadPerfData call
    // since current page is navigating away, mostly likely we already collected key metrics
    // only waiting for secondary controls, we should upload data collected so far
    private finishPerfDataUpload(emergency?: boolean): void {
        this.writeControlDataToRUMOne();
        this.collectSupplementaryData();
        try {
            this.uploadPerfData(emergency);
            if (this.isRUMOneDebuggingEnabled) {
                this.logMessageInConsole('Final Data uploaded');
                this.logObjectForDebugging("RUMONE: ", this.performanceData);
                this.logObjectForDebugging("RUMOne DataState: ", this.getReadableDataState(this.dataState));
            }
        } catch (e) {
            ((errorText: string) => {
                if (typeof console !== "undefined" && Boolean(console)) {
                    console.error(errorText);
                }
            })(`PerformanceLogger error writing RUMOne data: ${e}`);
        } finally {
            this._unhookUnloadEvent();
        }
    }

    private getReadableDataState(_dataState: number): string {
        for (var key in PerformanceDataState) {
            if (_dataState === Number(PerformanceDataState[key])) {
                return key;
            }
        }
        return 'NaN';
    }

    /**
     * Write Control and corresponding render time for top 10 renderTime controls.
     */
    private writeControlDataToRUMOne() {
        if (this.controls && this.controls.length) {
            const byRenderTime: IControl[] = this.controls.slice(0).filter((control: IControl) => !!control.data && !!control.data.renderTime && !control.ignoreForEUPL);
            byRenderTime.sort(
                (control1: IControl, control2: IControl): number => {
                    return control2.data.renderTime - control1.data.renderTime;
                });
            // We have maximum 10 slots for the Control render data collection
            for (let index = 0; index < 10 && index < byRenderTime.length; index++) {
                this.logPerformanceData(`Control${index + 1}Id`, byRenderTime[index].controlId);
                this.logPerformanceData(`Control${index + 1}RenderTime`, byRenderTime[index].data.renderTime);
            }
            // for secondary controls, we wrote data into EUPL breakdown
            let secondaryControls = {};
            this.controls.slice(0).filter((control: IControl) => !!control.data && !!control.data.renderTime && !!control.ignoreForEUPL).forEach((control: IControl) => {
                secondaryControls[control.controlId] = control.data.renderTime;
            });
            if (Object.keys(secondaryControls).length > 0) {
                this.writeEUPLBreakdown(JSON.stringify(secondaryControls), true);
            }
        }
    }

    /**
     * Calculate renderTime for the controls ready for it.
     */
    private processControlRenderTime() {
        for (let control of this.controls) {
            // if this control is not processed yet and ready to be processed
            if (control.data && !control.data.renderTime && control.data.renderTimeRequiredDataChecker(this, control.data)) {
                control.data.renderTime = control.data.renderTimeCalculator(this, control.data);
            }
        }
    }
    private readyToComputeEUPL(): boolean {
        let keyControls = this.controls.filter((control: IControl) => !control.ignoreForEUPL);
        let ready = keyControls.length > 0;
        for (let control of keyControls) {
            if (!control.data || !control.data.renderTime) {
                ready = false;
                break;
            }
        }
        return ready;
    }
    private setEUPL() {
        if (!this.isCollected('EUPL')) {
            let eupl: number = 0;
            for (let control of this.controls) {
                if (!control.ignoreForEUPL && control.data && control.data.renderTime && eupl < control.data.renderTime) {
                    eupl = control.data.renderTime;
                }
            }
            this.logPerformanceData('EUPL', eupl);
        }
    }
    private setBrowseInfo() {
        this.logPerformanceData('Browser', this._platformDetection.browserName + this._platformDetection.browserMajor);
        this.logPerformanceData('BrowserIsMobile', this._platformDetection.isMobile);
    }
    private setAPIDataToRUMOne() {
        var calls: number = 0;
        var durationSum: number = 0;
        for (var index = 0; index < this.apis.length; index++) {
            var apiData: APICallPerformanceData = this.apis[index];
            if (apiData) {
                calls++;
                durationSum += apiData.duration;
                // only take the function part of the API url to avoid cosmos data scrubber
                // url before processing: /teams/SPGroups/_api/web/GetList(@listUrl)/RenderListDataAsStream?Paged=TRUE&p_FileLeafRef=test%2eurl&p_ID=213&PageFirstRow=121&View=6eab4254-2f2f-4086-91c0-549ae900cc93&@listUrl=%27%2Fteams%2FSPGroups%2FVNextDocLib%27"
                // url after processing: RenderListDataAsStream
                apiData.url = apiData.url.split("/").map((s: string) => { return s.split("?")[0]; }).slice(-1)[0].replace(/\(.*?\)/g, '()');
            }
        }
        this.logPerformanceData('APICallCount', calls);
        this.logPerformanceData('APICallDurationSum', durationSum);
        this.logPerformanceData('APICalls', JSON.stringify(this.apis));
    }
    private setReferrer() {
        if (!this.isCollected('Referrer')) {
            this.logPerformanceData('Referrer', document.referrer);
        }
    }
    private getW3cTimingName(timingName: string): string {
        if (timingName !== 'secureConnectionStart') {
            return 'W3c' + timingName.charAt(0).toUpperCase() + timingName.slice(1);
        } else {
            return 'W3cSecureConnectStart';  // to workaround a RUMOne schema issue W3cSecureConnectStart should be W3cSecureConnectionStart
        }
    }

    private uploadPerfData(emergency?: boolean) {
        if (this._excludePageData) {
            this.dataState = PerformanceDataState.Skipped;
            this.logMessageInConsole('Uploading perf data skipped as requested by the consumer');
        } else if (!emergency && this.dataState !== PerformanceDataState.ReadyToUpload &&
            this.dataState !== PerformanceDataState.TimeOut) {
            console.error(`Error: Uploading perf data called with wrong data state ${this.dataState}`);
        } else if (!this.loggingFunc) {
            console.error('Uploading perf data skipped as loggingFunc is not defined');
        } else if (!this.performanceData) {
            console.error('Error: Uploading perf data called but perf data is not available');
        } else {
            this.loggingFunc("RUMOne", this.getPerformanceData());
            this.dataState = PerformanceDataState.Uploaded;
        }
    }

    private reportErrors(reason: string, message: string) {
        this.logMessageInConsole(message);
        var errorObj: RUMOneErrorsSLAPI = new RUMOneErrorsSLAPI();
        errorObj.Reason = reason;
        errorObj.Message = message;
        if (this.loggingFunc) {
            this.loggingFunc("RUMOneErrors", errorObj);
        }
    }
}
