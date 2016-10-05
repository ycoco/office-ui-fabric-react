// OneDrive:IgnoreCodeCoverage

import { ClonedEventType as ClonedEventTypeEnum } from "../logging/EventBase";
import { AccountType as AccountTypeEnum } from "../logging/EventBase";
import IClonedEvent from "../logging/IClonedEvent";
import { Manager } from "../logging/Manager";
import { Beacon, IBeaconStartSchema } from "../logging/events/Beacon.event";
import ErrorHelper from "../logging/ErrorHelper";
import BeforeUnload from '../beforeUnload/BeforeUnload';
import PlatformDetection from '../browser/PlatformDetection';

const ARIA_QOS_NAME = "AriaBeacon";

export interface IContextData {
    isAuthenticated: boolean;
    accountType: AccountTypeEnum;
    market: string;
    userId: string;
    version: string;
    manifest: string;
    session: string;
    environment?: string;
    workload?: string;
    siteSubscriptionId?: string;
    farmLabel?: string;
    forceEnabled?: boolean;
}

export default class AriaLoggerCore {
    public static logStartEvents: boolean;
    private static _ariaTelemtry: typeof microsoft.applications.telemetry;
    private static _logger: microsoft.applications.telemetry.Logger;

    public static Init(tenantToken: string,
        context: IContextData,
        aria: typeof microsoft.applications.telemetry) {
        try {
            this._ariaTelemtry = aria;
            this.logStartEvents = true;

            let platformDetection = new PlatformDetection();

            this._ariaTelemtry.LogManager.initialize(tenantToken);

            this._logger = new this._ariaTelemtry.Logger();

            let semanticContext = this._logger.getSemanticContext();
            let contextMap = semanticContext['contextMap'];

            contextMap.Add("AppInfo.Session", context.session);
            semanticContext.setAppVersion(context.version);
            contextMap.Add("AppInfo.Manifest", context.manifest);

            semanticContext.setUserLanguage(context.market || '');
            semanticContext.setUserId(context.userId);
            this._logger.setContext("AccountType", AccountTypeEnum[context.accountType]);
            this._logger.setContext("Environment", context.environment);
            this._logger.setContext("Workload", context.workload);
            this._logger.setContext("IsAuthenticated", context.isAuthenticated ? 1 : 0);

            semanticContext.setDeviceOsName(platformDetection.osName);
            semanticContext.setDeviceOsVersion(platformDetection.osVersion);
            this._logger.setContext("BrowserName", platformDetection.browserName);
            this._logger.setContext("BrowserMajVer", platformDetection.browserMajor);
            this._logger.setContext("BrowserMinVer", platformDetection.browserMinor);
            this._logger.setContext("BrowserUserAgent", platformDetection.userAgent);
            this._logger.setContext("BrowserIsMobile", platformDetection.isMobile);

            BeforeUnload.init();
            BeforeUnload.registerHandler((unload: boolean): string => {
                if (unload) {
                    this._ariaTelemtry.LogManager.flush(null);
                }

                return null;
            });

            if (context.farmLabel) {
                this._logger.setContext("FarmLabel", context.farmLabel);
            }

            this._logger.setContext("SiteSubscriptionId", context.siteSubscriptionId || "");

            // Listen to aria beaconing and send qos events to monitor its success rate
            this._ariaTelemtry.LogManager.addCallbackListener((isSuccess: number, statusCode: number, tenantToken: string, events: any[]) => {
                let beaconEvent = new Beacon({
                    name: ARIA_QOS_NAME,
                    retryCount: 0,
                    totalRetries: 0,
                    eventCount: events ? events.length : 0
                });

                beaconEvent.end({
                    success: isSuccess === 0,
                    status: statusCode + ''
                });

                if (DEBUG) {
                    // Display errors if the aria logger is failing to log
                    if (isSuccess !== 0) {
                        ErrorHelper.log(new Error(`Aria logger failed with status code ${statusCode}`));
                    }
                }
            });

            let missedClonedEvents = Manager.addLogHandler((event: IClonedEvent) => {
                this.logEvent(event);
            });

            for (let event of missedClonedEvents) {
                this.logEvent(event);
            }
        } catch (e) {
            if (e instanceof this._ariaTelemtry.Exception) {
                e = new Error(`Aria error: ${e.toString()}`);
            }

            ErrorHelper.log(e);
        }
    }

    private static logEvent(event: IClonedEvent) {
        let shouldLogEvent = (this.logStartEvents && event.eventType === ClonedEventTypeEnum.Start) ||
            (event.eventType !== ClonedEventTypeEnum.Start);

        // Dont log its self qos event
        if (Beacon.isTypeOf(event) && event.data) {
            let data: IBeaconStartSchema = event.data;
            if (data.name === ARIA_QOS_NAME) {
                shouldLogEvent = false;
            }
        }

        if (shouldLogEvent && event.enabled) {
            let eventProperties: microsoft.applications.telemetry.EventProperties = new this._ariaTelemtry.EventProperties();

            eventProperties.setProperty("CorrelationVector", event.vector.toString());
            eventProperties.setProperty("ValidationErrors", event.validationErrors);

            let splitEventName = event.eventName.split(',');
            let baseClassName = splitEventName[splitEventName.length - 2];
            let eventName = `ev_${baseClassName}`;
            let fullEventName = `${event.eventName}`;

            if (event.eventType === ClonedEventTypeEnum.End) {
                eventProperties.setProperty("Duration", event.endTime - event.startTime);
            }

            let data = event.data;

            if (data) {
                for (let x in data) {
                    let propertyMetadata = event.metadata[x];

                    if (propertyMetadata) {

                        let prefix = '';
                        if (!propertyMetadata.isPrefixingDisabled) {
                            prefix = propertyMetadata.definedInName + '_';
                        }

                        let loggingName = `${prefix}${x}`;
                        loggingName = loggingName.substr(0, 1).toUpperCase() + loggingName.substr(1) ;
                        let value = data[x];

                        if (propertyMetadata.isMetric) {
                            if (value !== undefined) {
                                eventProperties.setProperty(loggingName, value);
                            }
                        } else {
                            if (propertyMetadata.baseType === "Enum") {
                                eventProperties.setProperty(loggingName, propertyMetadata.typeRef[value]);
                            } else if (propertyMetadata.type === "Object") {
                                let dataObject = value;
                                for (let y in dataObject) {
                                    eventProperties.setProperty(`${loggingName}_${y.replace('.', '_')}`, dataObject[y]);
                                }
                            } else {
                                eventProperties.setProperty(loggingName, value);
                            }
                        }
                    }
                }
            }

            eventProperties.name = eventName;
            eventProperties.setProperty("WebLog_FullName", fullEventName);
            eventProperties.setProperty("WebLog_EventType", ClonedEventTypeEnum[event.eventType]);

            for (let name of splitEventName) {
                if (name) {
                    eventProperties.setProperty(`WebLog_Type_${name}`, 1);
                }
            }

            this._logger.logEvent(eventProperties);
        }
    }
}