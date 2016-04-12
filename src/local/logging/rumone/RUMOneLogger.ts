// OneDrive:IgnoreCodeCoverage
import ControlPerformanceData = require("./ControlPerformanceData");
import APICallPerformanceData = require("./APICallPerformanceData");
// import Features from '../../features/Features';
import Async = require('../../async/Async');
import PageTransitionType = require("./PageTransitionType");
import RUMOneSLAPI = require("./RUMOneSLAPI");
import RUMOneErrorsSLAPI = require("./RUMOneErrorsSLAPI");
import { RUMOneDataUpload as RUMOneDataUploadEvent } from "../events/RUMOneDataUpload.event";

enum PerformanceDataState {
    Incomplete = 1,
    ReadyToUpload = 2,
    Uploaded = 3,
    TimeOut = 4
}

/**
 * It is a new client side perf instrumentation, it logs more metrics, like scenario, api data, server request id, duration, etc in 1 single schema.
 * It has server side usage DB and cosmos supports.
 */
class RUMOneLogger {
    static rumOneLogger: RUMOneLogger = null;
    static CHECK_INTERVAL: number = 100;   // in milliseconds
    static ERROR_TIMEOUT: number = 30000;   // in milliseconds
    static KeyMetrics: string[] = ['EUPL', 'ScenarioId'];

    private async = new Async(this);
    private dataStartTime: number = Number((new Date()).getTime());
    private performanceData: RUMOneSLAPI = null;
    private dataState: PerformanceDataState = PerformanceDataState.Incomplete;
    private controls: Array<ControlPerformanceData> = [];
    private apis: Array<APICallPerformanceData> = [];
    private perfDataTimer: any = null;
    private loggingFunc: (streamName: string, dictProperties: any) => void;
    private expectedControls: Array<string> = [];
    private isW3cTimingCollected: boolean = false;
    private isW3cResourceTimingCollected: boolean = false;
    private tempData: any = {};

    constructor(logFunc: (streamName: string, dictProperties: any) => void) {
        this.performanceData = null;
        this.loggingFunc = logFunc;
        this.getPerformanceData();
        this.setPerfDataTimer();
    }

    public static isNullOrUndefined(item: any): boolean {
        return item === null || item === undefined;
    }
    /**
     * RUMOneLogger.getRUMOneLogger: Use this method to get a singleton reference of RUMOneLogger
     * with default parameters.
     */
    public static getRUMOneLogger(): RUMOneLogger {
        /*if (!Features.isFeatureEnabled(Features.RUMOne)) {
            return null;
        }*/

        if (!RUMOneLogger.rumOneLogger) {
            try {
                RUMOneLogger.rumOneLogger = new RUMOneLogger(
                    (streamName: string, dictProperties: any) => {
                        RUMOneDataUploadEvent.logData({streamName: streamName, dictionary: dictProperties });
                    });
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
        this.logMessageInConsole("Reset performance Logger Done");
    }
    public logPerformanceData (key: string, value: any) {
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
    public writeServerSideLatency (duration: number, iisLatency: number) {
        if (!this.isCollected('ServerRequestDuration')) {
            this.logPerformanceData('ServerRequestDuration', duration);
            this.logPerformanceData('IISLatency', iisLatency);
        }
    }
    public writeControlPerformanceData(controlData: ControlPerformanceData) {
        if (controlData) {
            var existing: boolean = false;
            for (var index = 0; index < this.controls.length; index++) {
                if (this.controls[index].controlId === controlData.controlId) {
                    existing = true;
                    break;
                }
            }
            if (!existing) {
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
        if ((!this.isCollected('PageTransitionType') || overwrite) && !RUMOneLogger.isNullOrUndefined(pageTransitionType) && (pageTransitionType === PageTransitionType.fullPageLoad || pageTransitionType === PageTransitionType.none)) {
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
                    // log the file names of all resource requests in a JSON string. The output will looks like:
                    // ["odsp-next-master_20160403.003/require-db6c47e2.js","GetList('%2Fteams%2FSPGroups%2FVNextDocLib')/RenderListDataAsStream","odsp-next-master_20160403.003/listviewdataprefetch-5722132e.js","odsp-next-master_20160403.003/knockout-822234a4.js"]
                    let filenames = JSON.stringify(requests.map(( timing: PerformanceResourceTiming) => {
                        return timing.name.split("/").map((urlToken: string) => {
                            return urlToken.split("?")[0];
                        }).filter((urlToken: string) => {
                            return urlToken &&  urlToken.length > 0;
                        }).slice(-2).join("/");
                    }));
                    this.logPerformanceData(source + "RequestNames", filenames);
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
    private logMessageInConsole(message: string) {
        try {
            if ('sessionStorage' in window && window.sessionStorage) {
                var debugStr = window.sessionStorage["enableRUMOneDebugging"];
                var debug = debugStr && debugStr.toLowerCase() === "true";
            }
        } catch (e) {
            // sessionStorage errors
        }
        if (debug && typeof console !== "undefined" && console) {
            console.log(message);
        }
    }
    private logObjectForDebugging(propertyName: string, dictProperties: any) {
        var logMessageText: string = propertyName + " : " + JSON.stringify(dictProperties);
        this.logMessageInConsole(logMessageText);
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

    private loopForDataCompleteness() {
        this.clearPerfDataTimer();

        this.logObjectForDebugging("RUMONE", this.performanceData);
        this.logObjectForDebugging("RUMOne DataState", String(this.getReadableDataState(this.dataState)));
        this.logObjectForDebugging("Control Performance Data", this.controls);
        this.logObjectForDebugging("API Performance Data", this.apis);

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
            if (Number((new Date()).getTime()) - Number(this.dataStartTime) > RUMOneLogger.ERROR_TIMEOUT) {  // waited too long, data is still incomplete, then upload the data collected so far and log a timeout error in RUMOneErrors stream
                this.dataState = PerformanceDataState.TimeOut;
                this.setAPIDataToRUMOne();   // before upload, set supplementary data
                this.writeServerUrl(null);
                this.uploadPerfData();
                this.reportErrors('TimeOut', 'Did not get key perf metrics in ' + String(RUMOneLogger.ERROR_TIMEOUT) + ' milliseconds. Missed metrics: ' + missedKeyMetrics.join() + '.');
            } else {
                this.processControlPerfData();
                if (this.readyToComputeEUPL()) { // if all expected control data is available, compute EUPL
                    this.setEUPL();
                }
            }
        } else { // key metrics are collected, upload them
            this.setAPIDataToRUMOne();   // before upload, set supplementary data
            this.writeServerUrl(null);
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
            var controlId: string = controlData.controlId;
            var renderTime: number = controlData.renderTime;
            if (!this.isCollected('Control1Id')) {
                this.logPerformanceData('Control1Id', controlId);
                this.logPerformanceData('Control1RenderTime', renderTime);
                return;
            }
            if (!this.isCollected('Control2Id')) {
                this.logPerformanceData('Control2Id', controlId);
                this.logPerformanceData('Control2RenderTime', renderTime);
                return;
            }
            if (!this.isCollected('Control3Id')) {
                this.logPerformanceData('Control3Id', controlId);
                this.logPerformanceData('Control3RenderTime', renderTime);
                return;
            }
            if (!this.isCollected('Control4Id')) {
                this.logPerformanceData('Control4Id', controlId);
                this.logPerformanceData('Control4RenderTime', renderTime);
            }
        }
    }
    private processControlPerfData() {
        for (var index = 0; index < this.controls.length; index++) {
            var control = this.controls[index];
            var that = this;
            if (!Boolean(control.renderTime) && control.renderTimeRequiredDataChecker(that, control)) {  // if this control is not processed yet and ready to be processed
                control.renderTime = control.renderTimeCalculator(that, control);
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
    private setAPIDataToRUMOne() {
        var calls: number = 0;
        var durationSum: number = 0;
        for (var index = 0; index < this.apis.length; index++) {
            var apiData: APICallPerformanceData = this.apis[index];
            if (apiData) {
                calls++;
                durationSum += apiData.duration;
                apiData.url = apiData.url.split("/").map((s: string) => { return s.split("?")[0]; }).slice(-2).join('/'); // only take the function part of the API url to avoid cosmos data scrubber
            }
        }
        this.logPerformanceData('APICallCount', calls);
        this.logPerformanceData('APICallDurationSum', durationSum);
        this.logPerformanceData('APICalls', JSON.stringify(this.apis));
    }
    private getW3cTimingName(timingName: string): string {
        if (timingName !== 'secureConnectionStart') {
            return 'W3c' + timingName.charAt(0).toUpperCase() + timingName.slice(1);
        } else {
            return 'W3csecureConnectStart';  // to workaround a RUMOne schema issue W3csecureConnectStart should be W3csecureConnectionStart
        }
    }
    private getWindowPerfTimingObject   (): any {
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

export = RUMOneLogger;