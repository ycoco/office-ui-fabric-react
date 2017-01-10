// OneDrive:IgnoreCodeCoverage

/// <reference types="aria" />

import { AccountType, ClonedEventType } from "../logging/EventBase";
import IClonedEvent from "../logging/IClonedEvent";
import { EventFieldType } from "../logging/IEvent";
import { Manager } from "../logging/Manager";
import { Beacon, IBeaconStartSchema } from "../logging/events/Beacon.event";
import ErrorHelper from "../logging/ErrorHelper";
import BeforeUnload from '../beforeUnload/BeforeUnload';
import PlatformDetection from '../browser/PlatformDetection';
import { capitalize } from '../string/StringHelper';

const ARIA_QOS_NAME = "AriaBeacon";

export interface IContextData {
    isAuthenticated: boolean;
    accountType: AccountType;
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

interface ILoggerContext {
    AccountType: string;
    Environment: string;
    Workload: string;
    IsAuthenticated: 1 | 0;
    BrowserName: string;
    BrowserMajVer: number;
    BrowserMinVer: string;
    BrowserUserAgent: string;
    BrowserIsMobile: boolean;
    FarmLabel?: string;
    SiteSubscriptionId: string;
}

let ariaTelemetry: typeof microsoft.applications.telemetry;
let logger: microsoft.applications.telemetry.Logger;

const config = {
    logStartEvents: false,
    Init: init
};

export default config;

function init(
    this: void,
    tenantToken: string,
    context: IContextData,
    aria: typeof microsoft.applications.telemetry): void {
    try {
        ariaTelemetry = aria;
        config.logStartEvents = true;

        const platformDetection = new PlatformDetection();

        ariaTelemetry.LogManager.initialize(tenantToken);

        logger = new ariaTelemetry.Logger();

        const semanticContext = logger.getSemanticContext();
        const contextMap = semanticContext['contextMap'];

        contextMap.Add("AppInfo.Session", context.session);
        semanticContext.setAppVersion(context.version);
        contextMap.Add("AppInfo.Manifest", context.manifest);

        semanticContext.setUserLanguage(context.market || '');
        semanticContext.setUserId(context.userId);

        semanticContext.setDeviceOsName(platformDetection.osName);
        semanticContext.setDeviceOsVersion(platformDetection.osVersion);

        BeforeUnload.init();
        BeforeUnload.registerHandler((unload: boolean): string => {
            if (unload) {
                ariaTelemetry.LogManager.flush(null);
            }

            return null;
        });

        const loggerContext: ILoggerContext = {
            AccountType: AccountType[context.accountType],
            Environment: context.environment,
            Workload: context.workload,
            IsAuthenticated: context.isAuthenticated ? 1 : 0,
            BrowserName: platformDetection.browserName,
            BrowserMajVer: platformDetection.browserMajor,
            BrowserMinVer: platformDetection.browserMinor,
            BrowserUserAgent: platformDetection.userAgent,
            BrowserIsMobile: platformDetection.isMobile,
            SiteSubscriptionId: context.siteSubscriptionId || ""
        };

        if (context.farmLabel) {
            loggerContext.FarmLabel = context.farmLabel;
        }

        for (const key in context) {
            logger.setContext(key, context[key]);
        }

        // Listen to aria beaconing and send qos events to monitor its success rate
        ariaTelemetry.LogManager.addCallbackListener((isSuccess: number, statusCode: number, tenantToken: string, events: any[]) => {
            new Beacon({
                name: ARIA_QOS_NAME,
                retryCount: 0,
                totalRetries: 0,
                eventCount: events ? events.length : 0
            }).end({
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

        Manager.addLogHandler(safeLogEvent).forEach(safeLogEvent);
    } catch (e) {
        if (e instanceof ariaTelemetry.Exception) {
            e = new Error(`Aria error: ${e.toString()}`);
        }

        ErrorHelper.log(e);
    }
}

function safeLogEvent(this: void, event: IClonedEvent) {
    // Try/catch individual events so that one bad event doesn't cause the rest to fail to get logged
    try {
        logEvent(event);
    } catch (exception) {
        let error;
        if (exception instanceof ariaTelemetry.Exception) {
            error = new Error(`Aria error: ${exception.toString()}`);
        }
        if (!exception || !exception.handled) {
            // Only log the exception if it was not already logged before
            ErrorHelper.log(error || exception);
        }
    }
}

function logEvent(this: void, event: IClonedEvent) {
    if (event.enabled && (event.eventType !== ClonedEventType.Start || config.logStartEvents) &&
        !(Beacon.isTypeOf(event) && event.data && (event.data as IBeaconStartSchema).name === ARIA_QOS_NAME)) {
        const eventProperties: microsoft.applications.telemetry.EventProperties = new ariaTelemetry.EventProperties();
        const values: { [key: string]: any } = {
            "CorrelationVector": event.vector.toString(),
            "ValidationErrors": event.validationErrors,
            "WebLog_FullName": event.eventName,
            "WebLog_EventType": ClonedEventType[event.eventType]
        };

        if (event.eventType === ClonedEventType.End) {
            values['Duration'] = event.endTime - event.startTime;
        }

        for (const name of event.eventName.split(',')) {
            if (name) {
                values[`WebLog_Type_${name}`] = 1;
            }
        }

        const data = event.data;
        if (data) {
            for (const field in data) {
                const value = data[field];
                if (value === undefined || value === null) {
                    continue;
                }

                const propertyMetadata = event.metadata[field];
                if (propertyMetadata) {
                    const loggingName = propertyMetadata.isPrefixingDisabled ? `${capitalize(propertyMetadata.definedInName)}_${field}` : capitalize(field);
                    const type = propertyMetadata.type;

                    if (type === EventFieldType.Object) {
                        for (const subField in value) {
                            if (value[subField] !== undefined) {
                                values[`${loggingName}_${subField.replace('.', '_')}`] = value[subField];
                            }
                        }
                    } else {
                        values[loggingName] = type === EventFieldType.Enum ? propertyMetadata.typeRef[value] : value;
                    }
                }
            }
        }

        eventProperties.name = `ev_${event.shortEventName}`;

        setProperties(eventProperties, values);

        logger.logEvent(eventProperties);
    }
}

function setProperties(this: void, properties: microsoft.applications.telemetry.EventProperties, values: { [key: string]: any }) {
    // We are getting a lot of errorCode 3 aria errors complaining about invalid property keys
    // In order to fix the problem we need to know what the problematic keys are
    let key: string;
    try {
        for (key in values) {
            properties.setProperty(key, values[key]);
        }
    } catch (exception) {
        let errorCode;
        let error;
        if (exception instanceof ariaTelemetry.Exception) {
            errorCode = exception.ErrorCode();
            error = new Error(`Aria error: ${exception.toString()}`);
        }

        if (error) {
            // If it is an aria error that is thrown then log it with the error code and the key we tried to set
            exception.handled = true;
            ErrorHelper.logError(error, {
                errorCode: errorCode,
                propertyKey: key
            });
        }

        // Regardless of what kind of error it was, rethrow the error so we don't try to log the event
        throw exception;
    }
}