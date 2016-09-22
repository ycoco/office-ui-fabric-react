// OneDrive:IgnoreCodeCoverage

import { Qos as QosEvent, ResultTypeEnum, IQosStartSchema } from "../events/Qos.event";
import { PLT as PLTEvent, IPLTSingleSchema } from "../events/PLT.event";
import { Beacon as BeaconEvent } from "../events/Beacon.event";
import { UnhandledError as UnhandledErrorEvent, IUnhandledErrorSingleSchema } from "../events/UnhandledError.event";
import { RequireJSError as RequireJSErrorEvent } from "../events/RequireJSError.event";
import { CaughtError as CaughtErrorEvent, ICaughtErrorSingleSchema } from "../events/CaughtError.event";
import { QosError as QosErrorEvent, IQosErrorSingleSchema } from "../events/QosError.event";
import { Verbose as VerboseEvent, IVerboseSingleSchema } from "../events/Verbose.event";
import { Engagement as EngagementEvent, IEngagementSingleSchema } from "../events/Engagement.event";
import { ClonedEventType as ClonedEventTypeEnum } from "../EventBase";
import { RUMOneDataUpload as RUMOneDataUploadEvent, IRUMOneDataUploadSingleSchema } from "../events/RUMOneDataUpload.event";

import ILogData from "./ILogData";
import DebugPriorityLevel from "./DebugPriorityLevel";
import IClonedEvent from "../IClonedEvent";
import IBeaconHandlers from "./IBeaconHandlers";

module LogProcessor {
    "use strict";

    export interface IProcessAndLogEventParams {
        event: IClonedEvent;
        logFunc: (streamName: string, dictProperties: any) => void;
        eventNamePrefix: string;
        handlers: IBeaconHandlers;
    }

    export const STORE_KEY = "SPCacheLogger";
    export const STORE_SIZE_KEY = "Size";

    const SOURCE_V2_Engagement = "ClientV2Engagement";
    const DEBUG_LOG_STREAM = "ReliabilityLog";
    const USER_ENGAGEMENT_STREAM = "UserEngagement";
    const SOURCE_V2_Reliability = "ClientV2Reliability";

    // regex for SLAPI event names
    const SLAPI_EVENT_NAME_ALLOW = /[^a-z0-9\.\_\-\+]+/ig;

    var _spModuleLink: any = window['_spModuleLink'];
    var _appVersion = _spModuleLink ? _spModuleLink.buildNumber : "";

    export function processAndLogEvent(params: IProcessAndLogEventParams) {
        // Ignored events
        if (params.handlers.ignoredEventsHandler && params.handlers.ignoredEventsHandler(params.event)) {
            return;
        }

        // Get the data to log
        var logDataArray: ILogData[] =
            EngagementEvent.isTypeOf(params.event) ? _processEngagementEvent(params.event) :
            QosEvent.isTypeOf(params.event) ? _processQosEvent(params.event, params.handlers.qosEventNameHandler || null, params.handlers.qosEventExtraDataHandler || null) :
            PLTEvent.isTypeOf(params.event) ? _processPLTEvent(params.event) :
            UnhandledErrorEvent.isTypeOf(params.event) ? _processUnhandledErrorEvent(params.event) :
            RequireJSErrorEvent.isTypeOf(params.event) ? _processRequireJSErrorEvent(params.event) :
            CaughtErrorEvent.isTypeOf(params.event) ? _processCaughtErrorEvent(params.event) :
            VerboseEvent.isTypeOf(params.event) ? _processVerboseEvent(params.event) :
            BeaconEvent.isTypeOf(params.event) ? _processBeaconEvent(params.event) :
            RUMOneDataUploadEvent.isTypeOf(params.event) ? _processRUMOneDataUploadEvent(params.event) :
            null;

        // If the log data array is not defined the event was unhandled, log
        // the event name so is easy to discover and fix
        if (!logDataArray) {
            logDataArray = [{
                userEngagementData: {
                    EngagementName: "UnknownEvent",
                    Duration: 0,
                    LogType: 0,
                    Properties: JSON.stringify({ name: params.event.eventName }),
                    ClientTime: params.event.eventType === ClonedEventTypeEnum.End ? params.event.endTime : params.event.startTime,
                    Source: SOURCE_V2_Engagement
                }
            }];
        }

        // Log all the data in the array adding the event prefix to the tag/name
        for (var index = 0, length = logDataArray.length; index < length; index++) {
            var logData = logDataArray[index];

            if (logData.debugData) {
                logData.debugData.Tag = _addEventPrefix(
                    logData.debugData.Tag,
                    params.eventNamePrefix).replace(SLAPI_EVENT_NAME_ALLOW, "");

                params.logFunc(DEBUG_LOG_STREAM, logData.debugData);
            }

            if (logData.userEngagementData) {
                // SPList: special case for Engagement events
                // set prefix to the name of the list type
                // to be able to track usage/engagement by list type
                var prefix = params.eventNamePrefix;
                if (EngagementEvent.isTypeOf(params.event) && prefix === 'SPList') {
                   // prefix will be set to a list type based on list base template
                   // if list type not found, [refix will be set back to generic SPList
                   prefix = _getScenarioNameFromListType();
                }
                   logData.userEngagementData.EngagementName = _addEventPrefix(
                    logData.userEngagementData.EngagementName,
                    prefix).replace(SLAPI_EVENT_NAME_ALLOW, "");

                // SPList: special case for Qos events; add listBaseTemplate ID to the property bag
                if (QosEvent.isTypeOf(params.event) && params.eventNamePrefix === 'SPList') {
                    params.event.data.extraData["ListBaseTemplate"] = _getListBaseTemplate();
                }
                params.logFunc(USER_ENGAGEMENT_STREAM, logData.userEngagementData);
            }

            if (logData.rumOneData) {
                params.logFunc(logData.rumOneData.streamName, logData.rumOneData.dictionary);
            }
        }
    }

    // get the list base template id
    function _getListBaseTemplate(): number {
        var listTemplate: number = -1;
        var spPageContextInfo: any = window['_spPageContextInfo'];
        if (spPageContextInfo !== undefined && spPageContextInfo !== null) {
            listTemplate = spPageContextInfo.listBaseTemplate;
        }
        return listTemplate;
    }

    // get the name of the listType; it's SPList for the unrecognized
    // list templates; TODO: add all templates
    function _getScenarioNameFromListType(): string {
            var scenarioName = "";
            var listTemplate = _getListBaseTemplate();
            switch (listTemplate) {
                case 100:
                    scenarioName = "ListNext";
                    break;
                case 101:
                    scenarioName = "DocsNext";
                    break;
                case 102:
                    scenarioName = "SurveyNext";
                    break;
                case 103:
                    scenarioName = "LinksNext";
                    break;
                case 104:
                    scenarioName = "AnnouncementsNext";
                    break;
                case 107:
                    scenarioName = "TasksNext";
                    break;
                case 109:
                    scenarioName = "PicLibNext";
                    break;
                default:
                    scenarioName = "SPList";
                    break;
            }
        return scenarioName;
    }

    // string examples: "{\"w3cResponseEnd\":2", "\"appStart\":750"
    function _cleanString(dataPLT: string): string {
        var cleanString = dataPLT;
        cleanString = cleanString.replace("{", "");
        cleanString = cleanString.replace(/\"/gi, "");
        cleanString = cleanString.replace("}", "");
        return cleanString;
    }

    function _addEventPrefix(eventName: string, prefix: string): string {
        if (!prefix) {
            return eventName;
        }
        return prefix + '.' + eventName;
    }

    function _getResultTypeSuffix(resultType: ResultTypeEnum): string {
        if (resultType === ResultTypeEnum.Success) {
            return ".Success";
        } else if (resultType === ResultTypeEnum.Failure) {
            return ".Failure";
        } else if (resultType === ResultTypeEnum.ExpectedFailure) {
            return ".ExpectedFailure";
        }

        return "";
    }

    function _processRUMOneDataUploadEvent(event: IClonedEvent): ILogData[] {
        if (!event.data) {
             return [{
                userEngagementData: {
                    EngagementName: "RUMOne.no_EventData",
                    Duration: 0,
                    LogType: 0,
                    ClientTime: event.startTime,
                    Source: SOURCE_V2_Engagement
                }
            }];
        }

        var rumOneDataUpdateEventData = <IRUMOneDataUploadSingleSchema>event.data;
        return [{
            rumOneData: {
                streamName: rumOneDataUpdateEventData.streamName,
                dictionary: rumOneDataUpdateEventData.dictionary
            }
        }];
    }

    function _processEngagementEvent(event: IClonedEvent): ILogData[] {
        var logData: ILogData = {};

        // if the event has not data we will get this in COSMOS
        // if it's a start we have only the name and append ".Start" to it
        // else we look for resultCode and append it to data.name with result type
        // if resultCode is not present than we append only the result type to the name
        // i.e. serverDataGetValue.Start OR serverDataGetValue.ResponseText.GetAuth.ExpectedFailure
        var name = "no_EngagementName";
        var properties = "";

        if (event.data) {
            var engagementData = <IEngagementSingleSchema>event.data;
            if (engagementData.name) {
                name = engagementData.name;
            }
            properties = engagementData.extraData ? JSON.stringify(engagementData.extraData) : "";
        }

        logData.userEngagementData = {
            EngagementName: name,
            Properties: properties,
            Duration: 0,
            LogType: 0,
            ClientTime: event.startTime,
            Source: SOURCE_V2_Engagement
        };

        return [logData];
    }

    function _processQosEvent(event: IClonedEvent, qoSEventNameHandler?: (event: IClonedEvent, currentName: string) => string, qosEventExtraDataHandler?: (event: IClonedEvent, qosData: any) => void): ILogData[] {
        var logData: ILogData = {};

        // if the event has not data we will get this in COSMOS
        // if it's a start we have only the name and append ".Start" to it
        // else we look for resultCode and append it to data.name with result type
        // if resultCode is not present than we append only the result type to the name
        // i.e. serverDataGetValue.ResponseText.Success OR serverDataGetValue.ResponseText.GetAuth.ExpectedFailure
        var name = "no_QosName";

        var qosData = event.data ? <IQosStartSchema>event.data : null;
        if (qosData) {
            if (qosData.name) {
                name = qosData.name;
            }

            if (qoSEventNameHandler != null) {
                name = qoSEventNameHandler(event, name);
            }

            qosData.extraData = qosData.extraData || {};

            if (qosEventExtraDataHandler != null) {
                qosEventExtraDataHandler(event, qosData);
            }

            qosData.extraData["appver"] = _appVersion;
        }

        // Duration is calculated only when we have an END event
        var durationTime: number;
        if (event.eventType === ClonedEventTypeEnum.End && event.startTime && event.endTime) {
            durationTime = event.endTime - event.startTime;
        } else {
            durationTime = 0;
        }

        logData.userEngagementData = {
            EngagementName: name,
            Properties: qosData && qosData.extraData ? JSON.stringify(qosData.extraData) : "",
            Duration: durationTime,
            LogType: 0,
            ClientTime: event.eventType === ClonedEventTypeEnum.End ? event.endTime : event.startTime,
            Source: SOURCE_V2_Reliability
        };

        return [logData];
    }

    function _processBeaconEvent(event: IClonedEvent): ILogData[] {
        var logData: ILogData = {};

        var durationTime: number;
        if (event.eventType === ClonedEventTypeEnum.End && event.startTime && event.endTime) {
            durationTime = event.endTime - event.startTime;
        } else {
            durationTime = 0;
        }

        logData.userEngagementData = {
            EngagementName: "Beacon",
            Properties: event.data ? JSON.stringify(event.data) : "no_EventData",
            Duration: durationTime,
            LogType: 0,
            ClientTime: event.eventType === ClonedEventTypeEnum.End ? event.endTime : event.startTime,
            Source: SOURCE_V2_Reliability
        };

        return [logData];
    }

    function _processPLTEvent(event: IClonedEvent): ILogData[] {
        if (!event.data) {
            return [{
                userEngagementData: {
                    EngagementName: "PLT.no_EventData",
                    Duration: 0,
                    LogType: 0,
                    ClientTime: event.startTime,
                    Source: SOURCE_V2_Engagement
                }
            }];
        }

        var logDataList: ILogData[] = [];

        //get the data for this event
        var pltData = <IPLTSingleSchema>event.data;

        // this will be the prefix for the tags; i.e. PLT.SetView-Files.w3cResponseEnd
        var name = "PLT." + pltData.name.replace(" ", "");

        // break down the PLT data and log each one as a separate record in the stream
        //{"name":"SetView-Files","w3cResponseEnd":424,"appStart":254,"preRender":20,"dataFetch":310,"postRender":327,"render":347,"plt":1335}
        var dataPLT = JSON.stringify(pltData).split(',');
        var duration = 0;

        // iterate through data and extract each type
        // create tags like this: PLT.<pagename>.w3cResponseEnd; PLT.<pagename>.appStart
        for (var i = 0; i < dataPLT.length; i++) {
            var cleanedPLTString = _cleanString(dataPLT[i]);
            // split the string and get the name and duration
            // special case for duration when appCacheHit is a boolean
            var subDataPLTs = cleanedPLTString.split(':');

            // skip the 'name' key-value pair
            if (_cleanString(subDataPLTs[1]) !== pltData.name) {
                if (subDataPLTs[1] === 'true') {
                    duration = 1;
                } else if (subDataPLTs[1] === 'false' || subDataPLTs[1] === 'null') {
                    duration = 0;
                } else {
                    duration = parseInt(subDataPLTs[1], 10);
                }

                logDataList.push({ userEngagementData: {
                    EngagementName:  name + "." + subDataPLTs[0],
                    Properties: (subDataPLTs[0] === 'appCacheHit') ? JSON.stringify(event.data) : "",
                    Duration: duration,
                    LogType: 0,
                    ClientTime: event.startTime,
                    Source: SOURCE_V2_Engagement
                }});
            }
        }

        return logDataList;
    }

    function _processUnhandledErrorEvent(event: IClonedEvent): ILogData[] {
        return [{
            userEngagementData: {
                EngagementName: "UnhandledError",
                Duration: 0,
                LogType: 0,
                ClientTime: event.startTime,
                Source: SOURCE_V2_Engagement
            },
            debugData: {
                Tag: "UnhandledError",
                Level: DebugPriorityLevel.Normal,
                Message: event.data ? JSON.stringify(<IUnhandledErrorSingleSchema>event.data) : "no_EventData",
                Misc: "",
                ClientTime: event.startTime
            }
        }];
    }

    function _processRequireJSErrorEvent(event: IClonedEvent): ILogData[] {
        var logData: ILogData = {};

        var name = "RequireJSError";
        var errorData: any;
        var errorMessage: any;

        if (event.data) {
            // clone all properties so that we can omit 'message' in JSON
            errorData = {};
            for (var key in event.data) {
                if (key !== "message") {
                    errorData[key] = event.data[key];
                } else {
                    errorMessage = event.data[key];
                }
            }
        }

        logData.userEngagementData = {
            EngagementName: name,
            Duration: 0,
            LogType: 0,
            ClientTime: event.startTime,
            Source: SOURCE_V2_Engagement
        };

        logData.debugData = {
            Tag: name,
            Level: DebugPriorityLevel.Normal,
            Message: errorMessage ? errorMessage : "no_ErrorMessage",
            Misc: errorData ? JSON.stringify(errorData) : "no_ErrorData",
            ClientTime: event.startTime
        };

        return [logData];
    }

    function _processCaughtErrorEvent(event: IClonedEvent): ILogData[] {
        var logData: ILogData = {};
        var name = "CaughtError";

        if (QosErrorEvent.isTypeOf(event)) {
            if (event.data) {
                var qosErrorData = <IQosErrorSingleSchema>event.data;
                name = qosErrorData.name;
                if (qosErrorData.resultCode) {
                    name += "." + qosErrorData.resultCode;
                }
                name += _getResultTypeSuffix(qosErrorData.resultType);
            } else {
                name = "QosErrorEvent.no_EventData";
            }
        } else {
            // log it once in the UserEngagement stream to count the hits
            logData.userEngagementData = {
                EngagementName: name,
                Duration: 0,
                LogType: 0,
                ClientTime: event.startTime,
                Source: SOURCE_V2_Engagement
            };
        }

        // log it again in ReliabilityLog stream with data for debugging
        var caughtErrorData = event.data ? <ICaughtErrorSingleSchema>event.data : null;
        logData.debugData = {
            Tag: name,
            Level: DebugPriorityLevel.Normal, // it's interesting, not boring
            Message: caughtErrorData && caughtErrorData.message ? caughtErrorData.message : "",
            Misc: caughtErrorData && caughtErrorData.stack ? JSON.stringify(caughtErrorData.stack) : "",
            ClientTime: event.startTime
        };

        return [logData];
    }

    function _processVerboseEvent(event: IClonedEvent): ILogData[] {
        var logData: ILogData = {};
        var name = "Verbose";

        if (event.data) {
            var verboseData = <IVerboseSingleSchema>event.data;
            if (verboseData.name) {
                name = verboseData.name + ".Verbose";
            }
        } else {
            name += ".no_EventData";
        }

        // log it in ReliabilityLog stream with data for debugging
        logData.debugData = {
            Tag: name,
            Level: DebugPriorityLevel.Low,
            Message: verboseData.message,
            Misc: "",
            ClientTime: event.startTime
        };

        return [logData];
    }
}

export default LogProcessor;
