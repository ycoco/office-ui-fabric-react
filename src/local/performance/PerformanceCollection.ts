// OneDrive:IgnoreCodeCoverage

/// <reference path='../debug/Debug.d.ts' />

import { PLT, IPLTSingleSchema as IPLTSchema } from '../logging/events/PLT.event';
import { PLTHttpRequest }  from '../logging/events/PLTHttpRequest.event';
import { Api } from '../logging/events/Api.event';
import IClonedEvent from '../logging/IClonedEvent';
import { ClonedEventType as ClonedEventTypeEnum } from "../logging/EventBase";
import ErrorHelper from '../logging/ErrorHelper';
import { Manager } from '../logging/Manager';

//For reference see http://www.w3.org/TR/navigation-timing/
//also, got tips at http://www.stevesouders.com/blog/2014/08/21/resource-timing-practical-tips/
export default class PerformanceCollection {

    public static summary: IPLTSchema = <any>{};
    public static httpRequestCollection: Array<any>;
    private static _times: { [key: string]: number } = {};

    public static appStart() {
        try {
            if (window.performance && performance.timing) {
                Manager.addLogHandler(this.eventLogHandler);
                this.summary.w3cResponseEnd = (performance.timing.responseEnd - performance.timing.fetchStart); //Time to get the aspx from the server
                this._times["appStart"] = new Date().getTime(); //Time it takes for our app to *start* running
                this.summary.appStart = this._times["appStart"] - performance.timing.responseEnd; //Time it takes for our app to *start* running
                this.summary.prefetchStart = -1;
            }
        } catch (e) {
            ErrorHelper.log(e);
        }
    }

    //called when the view is fully loaded
    public static plt(name: string) {
        try {
            if (window.performance && performance.timing && PerformanceCollection._times["plt"] === undefined) {
                let now: number = new Date().getTime();

                Manager.removeLogHandler(this.eventLogHandler);

                this._times["plt"] = (now - performance.timing.fetchStart);
                this.summary.preRender = (this._times["appDataFetchStart"] - this._times["appStart"]); //Time it takes for our app to make the relevant data fetch for this view
                this.summary.dataFetch = (this._times["appDataFetchEnd"] - this._times["appDataFetchStart"]); //Time it takes for our app to get data back from the server

                this.summary.postRender = (now - this._times["appDataFetchEnd"]);
                this.summary.render = this.summary["preRender"] + this.summary["postRender"];
                this.summary.plt = now - performance.timing.fetchStart; //unbiased end to end PLT from fetchStart that excludes unload of previous page.
                this.summary.pltWithUnload = now - performance.timing.navigationStart; //unbiased end to end PLT from navigationStart that includes the unload of the previous page
                this.summary.name = name;
                //we consider an appcache hit if the w3cResponseEnd time is less than 40ms
                this.summary.appCacheHit = this.summary.w3cResponseEnd <= 40 &&
                    Boolean(window.applicationCache) &&
                    Boolean(window.applicationCache.status !== window.applicationCache.UNCACHED);

                // ASSERT(this.summary.appStart +
                //     this.summary.dataFetch +
                //     this.summary.postRender +
                //     this.summary.preRender +
                //     this.summary.w3cResponseEnd ===
                //     this.summary.plt,
                //     "PLT summary times do not add up");

                // Get the count of events so we have it in the plt event logs
                // This must be logged before log data otherwise the count is not passed
                this.getHttpRequests();

                let event = PLT.logData(this.summary);

                if (this.httpRequestCollection) {
                    for (let eventData of this.httpRequestCollection) {
                        PLTHttpRequest.logData(eventData, event);
                    }
                }

                PerformanceCollection.mark('glass');
            }
        } catch (e) {
            ErrorHelper.log(e);
        }
    }

    public static mark(name: string): void {
        if (window.performance && window.performance.mark) {
            window.performance.mark(name);
        }
    }

    private static eventLogHandler(event: IClonedEvent) {
        // Look at all api events
        if (Api.isTypeOf(event)) {
            if (PerformanceCollection._times["appDataFetchStart"] === undefined) {
                // Calculate the start time from the first api event
                PerformanceCollection._times["appDataFetchStart"] = event.startTime;
            } else if (event.eventType === ClonedEventTypeEnum.End || event.eventType === ClonedEventTypeEnum.Single) {
                // Calculate the end time from the api events
                PerformanceCollection._times["appDataFetchEnd"] = PerformanceCollection._times["appDataFetchEnd"] ? Math.max(PerformanceCollection._times["appDataFetchEnd"], event.endTime) : event.endTime;
            }
        }
    }

    private static getHttpRequests() {
        if (window.performance && window.performance.getEntriesByType) {
            let httpRequestCollection: Array<any> = [];
            let perfEntries: Array<any> = performance.getEntriesByType("resource");
            let httpRequests: number = perfEntries.length;

            for (let j = 0; j < httpRequests; j++) {
                let data = {
                    startTime: Math.round(perfEntries[j].startTime),
                    url: perfEntries[j].name,
                    duration: Math.round(perfEntries[j].duration)
                };
                httpRequestCollection.push(data);
            }

            //Make sure we get all the http requests from iframes as well
            let iFrames: NodeListOf<HTMLIFrameElement> = document.getElementsByTagName("iframe");

            httpRequests += iFrames.length;

            for (let i = 0; i < iFrames.length; i++) {
                try {
                    perfEntries = iFrames[i].contentWindow.performance.getEntriesByType("resource");
                } catch (e) {
                    // If the iframe in question isn't domain lowered, we can't access it.
                    perfEntries = null;
                }

                if (perfEntries) {
                    let requests: number = perfEntries.length;
                    httpRequests += requests;

                    for (let j = 0; j < requests; j++) {
                        let iframeData = {
                            startTime: Math.round(perfEntries[j].startTime),
                            url: perfEntries[j].name,
                            duration: Math.round(perfEntries[j].duration)
                        };
                        httpRequestCollection.push(iframeData);
                    }
                }
            }

            this.summary.httpRequests = httpRequests;
            this.httpRequestCollection = httpRequestCollection;
        }

    }
}