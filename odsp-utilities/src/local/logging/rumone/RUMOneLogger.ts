// OneDrive:IgnoreCodeCoverage
import Async from '../../async/Async';
import PageTransitionType from './PageTransitionType';
import RUMOneSLAPI from './RUMOneSLAPI';
import RUMOneErrorsSLAPI from './RUMOneErrorsSLAPI';
import { RUMOneDataUpload as RUMOneDataUploadEvent } from '../events/RUMOneDataUpload.event';
import PlatformDetection from '../../browser/PlatformDetection';

enum PerformanceDataState {
    Incomplete = 1,
    ReadyToUpload = 2,
    Uploaded = 3,
    TimeOut = 4
}

const MARKER_PREFIX = "EUPL.";

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

    constructor(
        controlId: string,
        startTime: number,
        endTime: number,
        renderTimeCalculator: (rumone: RUMOneLogger, controlData: ControlPerformanceData) => number,
        renderTimeRequiredDataChecker: (rumone: RUMOneLogger, controlData: ControlPerformanceData) => boolean) {
        this.controlId = controlId;
        this.startTime = startTime;
        this.endTime = endTime;
        this.renderTimeCalculator = renderTimeCalculator;
        this.renderTimeRequiredDataChecker = renderTimeRequiredDataChecker;
    }
}

/**
 * It is a new client side perf instrumentation, it logs more metrics, like scenario, api data, server request id, duration, etc in 1 single schema.
 * It has server side usage DB and cosmos supports.
 */
export default class RUMOneLogger {
    public static rumOneLogger: RUMOneLogger = null;
    public static CHECK_INTERVAL: number = 100;   // in milliseconds
    public static ERROR_TIMEOUT: number = 30000;   // in milliseconds
    public static MAX_MARKS: number = 50;   // suppport maximum 50 perf markers
    public static KeyMetrics: string[] = ['EUPL', 'ScenarioId'];

    private static _isConsoleOpened: boolean = false;

    private async = new Async(this);
    private dataStartTime: number = Number((new Date()).getTime());
    private performanceData: RUMOneSLAPI = null;
    private dataState: PerformanceDataState = PerformanceDataState.Incomplete;
    private controls: Array<ControlPerformanceData> = [];
    private apis: Array<APICallPerformanceData> = [];
    private perfDataTimer: any = null;
    private loggingFunc: (streamName: string, dictProperties: any) => void;
    private expectedControls: Array<string> = [];
    private euplBreakDown: { [key: string]: number } = {};
    private serverMetrics: { [key: string]: number } = {};
    private isW3cTimingCollected: boolean = false;
    private isW3cResourceTimingCollected: boolean = false;
    private tempData: any = {};
    private markerIndex: number = 0;
    private _platformDetection: PlatformDetection;

    constructor(logFunc: (streamName: string, dictProperties: any) => void) {
        this.performanceData = null;
        this.loggingFunc = logFunc;
        this.getPerformanceData();
        this.setPerfDataTimer();
        this._platformDetection = new PlatformDetection();
    }

    public static isNullOrUndefined(item: any): boolean {
        return item === null || item === undefined;
    }
    /**
     * RUMOneLogger.getRUMOneLogger: Use this method to get a singleton reference of RUMOneLogger
     * with default parameters.
     */
    public static getRUMOneLogger(logFunc?: (streamName: string, dictProperties: any) => void): RUMOneLogger {
        let loggingFunc = logFunc || ((streamName: string, dictProperties: any) => {
            // Don't collect performance data from developers desk
            if (!RUMOneLogger.isConsoleOpened) {
                RUMOneDataUploadEvent.logData({ streamName: streamName, dictionary: dictProperties });
            }
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
        this.dataStartTime = (new Date()).getTime();
        this.dataState = PerformanceDataState.Incomplete;
        this.isW3cTimingCollected = false;
        this.isW3cResourceTimingCollected = false;
        this.expectedControls = [];
        this.controls = [];
        this.apis = [];
        this.tempData = {};
        this.performanceData = null;
        this.getPerformanceData();
        this.clearPerfDataTimer();
        this.setPerfDataTimer();
        this.euplBreakDown = {};
        this.serverMetrics = {};
        this.clearResourceTimings();
        this.clearMarks();
        this.logMessageInConsole("Reset performance Logger Done");
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
    public addExpectedControl(control: string) {
        if (this.expectedControls.indexOf(control) === -1) {
            this.expectedControls.push(control);
        }
    }
    public expectingControl(control: string): boolean {
        return this.expectedControls.indexOf(control) >= 0;
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
            let foundControl = this.controls.filter((control: ControlPerformanceData) => {
                return control.controlId === controlData.controlId;
            });
            if (foundControl.length === 0) {
                this.controls.push(controlData);
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
            !RUMOneLogger.isNullOrUndefined(pageTransitionType) &&
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
            var perfTimingObject: any = this.getWindowPerfTimingObject();

            if (perfTimingObject) {
                for (var index = 0; index < w3cTimeStampNames.length; index++) {
                    var w3cObject: any = perfTimingObject[w3cTimeStampNames[index]];
                    if (w3cObject) {
                        this.logPerformanceData(this.getW3cTimingName(w3cTimeStampNames[index]), Number(w3cObject));
                    }
                }
                this.isW3cTimingCollected = true;
            }
        }
    }
    public collectW3cResourceTimings() {
        if (!this.isW3cResourceTimingCollected && window.performance && window.performance.getEntriesByType) {
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
                            duration: Math.round(timing.duration)
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
        return !(this.dataState === PerformanceDataState.Uploaded || this.dataState === PerformanceDataState.TimeOut);
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
        if (name && !RUMOneLogger.isNullOrUndefined(value)) {
            if (RUMOneLogger.isNullOrUndefined(this.euplBreakDown[name]) || overwrite) {
                this.euplBreakDown[name] = value;
            }
        }
    }

    public addServerMetrics(metric: { [key: string]: number }, overwrite?: boolean) {
        if (metric) {
            for (let key in metric) {
                if (key && !RUMOneLogger.isNullOrUndefined(metric[key]) &&
                    (RUMOneLogger.isNullOrUndefined(this.serverMetrics[key]) || overwrite)) {
                    this.serverMetrics[key] = metric[key];
                }
            }
        }
    }

    public readControlPerformanceData(): Array<ControlPerformanceData> {
        return this.controls;
    }

    public mark(name: string): void {
        if (window.performance && window.performance.mark) {
            let markName = name.lastIndexOf(MARKER_PREFIX, 0) === 0 ? name : (MARKER_PREFIX + name);
            window.performance.mark(markName);
        }
    }

    public now(): number {
        return window.performance && window.performance.now ? Math.round(performance.now()) : NaN;
    }

    public getMarkerTime(name: string): number {
        let ret: number = NaN;
        if (window.performance && window.performance.mark) {
            const markName = name.lastIndexOf(MARKER_PREFIX, 0) === 0 ? name : (MARKER_PREFIX + name);
            const mark: Array<PerformanceEntry> = window.performance.getEntriesByName(markName);
            ret = mark && mark.length > 0 ? Math.round(mark[0].startTime) : NaN;
        }
        return ret;
    }

    /**
     * Returns true if the debug console was opened anytime during the lifetime of RUMOneLogger instance
     */
    private static get isConsoleOpened(): boolean {
        if (!RUMOneLogger._isConsoleOpened) {
            // If console is open, it will try to call toString to print object in the console
            // Intercept toString() method to detect if console is really open
            // Yes this is best know hack, when there is no public API supported by browsers
            // It works for both docked and undocked console window
            const divElement: HTMLDivElement = new HTMLDivElement();
            divElement.toString = (): string => {
                RUMOneLogger._isConsoleOpened = true;
                return '';
            };

            console.log(divElement);
        }

        return RUMOneLogger._isConsoleOpened;
    }

    private clearResourceTimings(): void {
        let perfObject = window.self["performance"];
        if (perfObject && perfObject.clearResourceTimings) {
            perfObject.clearResourceTimings();
        }
    }
    private collectMarks(): void {
        if (window.performance && window.performance.getEntriesByType) {
            let marks = {};
            window.performance.getEntriesByType("mark").filter(
                (mark: PerformanceMark) => {
                    return mark.name.lastIndexOf(MARKER_PREFIX, 0) === 0;
                }).forEach((mark: PerformanceMark) => {
                    if (this.markerIndex < RUMOneLogger.MAX_MARKS) {
                        let markName = mark.name.substr(MARKER_PREFIX.length) + `.mark${this.markerIndex++}`;
                        marks[markName] = Math.round(mark.startTime);  // covert to rumone collected marks to object and merge to EUPL Breakdown
                    }
                });
            this.writeEUPLBreakdown(JSON.stringify(marks));
        }
    }
    private clearMarks(): void {
        if (window.performance && window.performance.getEntriesByType && window.performance.clearMarks) {
            window.performance.getEntriesByType("mark").filter(
                (mark: PerformanceMark) => {
                    return mark.name.lastIndexOf(MARKER_PREFIX, 0) === 0;
                }).forEach((mark: PerformanceMark) => {
                    window.performance.clearMarks(mark.name);
                });
        }
        this.markerIndex = 0;
    }

    private logMessageInConsole(message: string) {
      if (RUMOneLogger._isConsoleOpened && this.isRUMOneDebuggingEnabled) {
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
      if (RUMOneLogger._isConsoleOpened && this.isRUMOneDebuggingEnabled) {
        const logMessageText: string = propertyName + " : " + JSON.stringify(dictProperties);
        console.log(logMessageText);
      }
    }

    private isCollected(name: string): boolean {
        return !RUMOneLogger.isNullOrUndefined(this.getPerformanceDataPropertyValue(name));
    }
    private getRUMOnePropertyNames(obj: any): Array<string> {
        var names: Array<string> = [];
        var index: number = 0;
        if (!RUMOneLogger.isNullOrUndefined(obj)) {
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
        if (!RUMOneLogger.isNullOrUndefined(this.perfDataTimer)) {
            this.async.clearTimeout(this.perfDataTimer);
            this.perfDataTimer = null;
        }
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
        // Exit early and save CPU cycles in production
        if (RUMOneLogger._isConsoleOpened && this.isRUMOneDebuggingEnabled) {
            this.logObjectForDebugging("RUMONE: ", this.performanceData);
            this.logObjectForDebugging("RUMOne DataState: ", String(this.getReadableDataState(this.dataState)));
            this.logObjectForDebugging("Control Performance Data: ", this.controls);
            this.logObjectForDebugging("API Performance Data: ", this.apis);
            this.logObjectForDebugging("Temp Data: ", this.tempData);
            this.logObjectForDebugging("EUPLBreakdown: ", this.euplBreakDown);
            this.logObjectForDebugging("ServerMetrics: ", this.serverMetrics);
            this.logMessageInConsole("====================================================================");
        }

        if (!this.isRunning()) {
            return;
        }

        var collected: boolean = true;
        var missedKeyMetrics = [];
        for (var i = 0; i < RUMOneLogger.KeyMetrics.length; i++) {  // check if key metrics are collected
            var keyMetricValue: any = this.getPerformanceDataPropertyValue(RUMOneLogger.KeyMetrics[i]);
            if (RUMOneLogger.isNullOrUndefined(keyMetricValue)) {
                collected = false;
                missedKeyMetrics.push(RUMOneLogger.KeyMetrics[i]);
            }
        }
        this.dataState = collected ? PerformanceDataState.ReadyToUpload : PerformanceDataState.Incomplete;

        if (this.dataState === PerformanceDataState.Incomplete) {
            // waited too long, data is still incomplete, then upload the data collected so far and log a timeout error in RUMOneErrors stream
            if (Number((new Date()).getTime()) - Number(this.dataStartTime) > RUMOneLogger.ERROR_TIMEOUT) {
                this.dataState = PerformanceDataState.TimeOut;
                this.collectSupplementaryData();
                this.uploadPerfData();
                this.reportErrors('TimeOut', 'Did not get key perf metrics in ' + String(RUMOneLogger.ERROR_TIMEOUT) + ' milliseconds. Missed metrics: ' + missedKeyMetrics.join() + '.');
            } else {
                this.processControlPerfData();
                if (this.readyToComputeEUPL()) { // if all expected control data is available, compute EUPL
                    this.setEUPL();
                }
            }
        } else { // key metrics are collected, upload them
            this.collectSupplementaryData();
            try {
                this.uploadPerfData();
            } catch (e) {
                ((errorText: string) => {
                    if (typeof console !== "undefined" && Boolean(console)) {
                        console.error(errorText);
                    }
                })("PerformanceLogger error writing RUMOne data: " + String(e));
            }
            this.dataState = PerformanceDataState.Uploaded;
        }
        this.setPerfDataTimer();
    }
    private getReadableDataState(_dataState: number): string {
        for (var key in PerformanceDataState) {
            if (_dataState === Number(PerformanceDataState[key])) {
                return key;
            }
        }
        return 'NaN';
    }
    private writeControlDataToRUMOne(controlData: ControlPerformanceData) {
        if (controlData) {
            let indexes = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].filter((index: number) => {
                return !this.isCollected(`Control${index}Id`);
            });
            let index = indexes.length > 0 ? indexes[0] : -1;
            if (index > 0) {  //this control data has not yet been logged
                this.logPerformanceData(`Control${index}Id`, controlData.controlId);
                this.logPerformanceData(`Control${index}RenderTime`, controlData.renderTime);
            }
        }
    }
    private processControlPerfData() {
        for (var index = 0; index < this.controls.length; index++) {
            var control = this.controls[index];
            // if this control is not processed yet and ready to be processed
            if (!Boolean(control.renderTime) && control.renderTimeRequiredDataChecker(<any>this, control)) {
                control.renderTime = control.renderTimeCalculator(<any>this, control);
                this.writeControlDataToRUMOne(control);
            }
        }
    }
    private readyToComputeEUPL(): boolean {
        var readyControls: number = 0;
        for (var index = 0; index < this.expectedControls.length; index++) {
            var keyControl: ControlPerformanceData = this.lookUpControls(this.expectedControls[index], this.controls);
            if (keyControl && Boolean(keyControl.renderTime)) {
                readyControls++;
            }
        }
        return this.expectedControls.length > 0 && this.expectedControls.length === readyControls;
    }
    private lookUpControls(_controlId: string, _controls: Array<ControlPerformanceData>): ControlPerformanceData {
        if (_controls) {
            for (var index = 0; index < _controls.length; index++) {
                if (_controlId === _controls[index].controlId) {
                    return _controls[index];
                }
            }
        }
        return null;
    }
    private setEUPL() {
        if (!this.isCollected('EUPL')) {
            var eupl: number = 0;
            for (var index = 0; index < this.controls.length; index++) {
                var controlData: ControlPerformanceData = this.controls[index];
                if (Boolean(controlData.renderTime) && eupl < controlData.renderTime) {
                    eupl = controlData.renderTime;
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
    private getWindowPerfTimingObject(): any {
        var perfObject = window.self["performance"];
        if (!RUMOneLogger.isNullOrUndefined(perfObject) && !RUMOneLogger.isNullOrUndefined(perfObject.timing)) {
            return perfObject.timing;
        }
        return null;
    }
    private uploadPerfData() {
        if (this.performanceData && this.loggingFunc &&
            (this.dataState === PerformanceDataState.ReadyToUpload ||
                this.dataState === PerformanceDataState.TimeOut)) {
            this.loggingFunc("RUMOne", this.getPerformanceData());
        }
    }
    private reportErrors(reason: string, message: string) {
        var errorObj: RUMOneErrorsSLAPI = new RUMOneErrorsSLAPI();
        errorObj.Reason = reason;
        errorObj.Message = message;
        if (this.loggingFunc) {
            this.loggingFunc("RUMOneErrors", errorObj);
        }
    }
}
