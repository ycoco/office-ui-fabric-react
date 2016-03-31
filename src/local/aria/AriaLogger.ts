// OneDrive:IgnoreCodeCoverage
/// <reference path='../../aria/aria.d.ts' />

/**
 * Make sure to not create any objects with AriaTelemetry (e.g. new AriaTelemetry.Logger).
 * This will make sure we dont have a direct dependency on aria and instead a lazy one.
 * Please use this._ariaTelemtry as the base for any created objects and then type case the output;
 * e.g.
 * var logger: AriaTelemetry.Logger  = new this._ariaTelemtry.Logger()
 */

import * as AriaTelemetry from 'aria';
import { ClonedEventType as ClonedEventTypeEnum } from "odsp-utilities/logging/EventBase";
import IClonedEvent = require("odsp-utilities/logging/IClonedEvent");
import { Manager } from "odsp-utilities/logging/Manager";
import Features from '../features/Features';
import IFeature = require('../features/IFeature');
import PlatformDetection = require('../browser/PlatformDetection');

export interface IContextData {
    isAuthenticated: boolean;
    market: string;
    userId: string;
    userMsaId?: string;
    userANID?: string;
    version: string;
    manifest: string;
    session: string;
    environment?: string;
    workload?: string;
    tenantId?: string;
    farmLabel?: string;
}

export default class AriaLogger {
    public static logStartEvents: boolean;
    private static _ariaTelemtry: any;
    private static _logger: AriaTelemetry.Logger;
    private static EnableAriaLogging: IFeature = { ODB: 588, ODC: 'EnableAriaLogging', Fallback: false };

    public static Init(
        tenantToken: string,
        context: IContextData) {
        if (Features.isFeatureEnabled(this.EnableAriaLogging)) {
            require(['aria'], (aria: any) => {
                this._ariaTelemtry = aria;
                this.logStartEvents = true;

                let platformDetection = new PlatformDetection();

                this._ariaTelemtry.LogManager.initialize(tenantToken);

                this._logger = new this._ariaTelemtry.Logger();

                this._logger.setContext("AppInfo.Session", context.session);
                this._logger.setContext("AppInfo.Version", context.version);
                this._logger.setContext("AppInfo.Manifest", context.manifest);

                this._logger.setContext("UserInfo.Language", context.market || '');
                this._logger.setContext("UserInfo.Id", context.userId);
                this._logger.setContext("UserInfo.MsaId", context.userMsaId);
                this._logger.setContext("UserInfo.ANID", context.userANID);
                this._logger.setContext("UserInfo.TimeZone", this.getAriaTimeZone((new Date()).getTimezoneOffset()));
                this._logger.setContext("Environment", context.environment);
                this._logger.setContext("Workload", context.workload);
                this._logger.setContext("IsAuthenticated", context.isAuthenticated ? 1 : 0);

                this._logger.setContext("DeviceInfo.OsName", platformDetection.osName);
                this._logger.setContext("DeviceInfo.OsVersion", platformDetection.osVersion);
                this._logger.setContext("BrowserName", platformDetection.browserName);
                this._logger.setContext("BrowserMajVer", platformDetection.browserMajor);
                this._logger.setContext("BrowserMinVer", platformDetection.browserMinor);
                this._logger.setContext("BrowserUserAgent", platformDetection.userAgent);
                this._logger.setContext("BrowserIsMobile", platformDetection.isMobile);

                if (context.farmLabel) {
                    this._logger.setContext("FarmLabel", context.farmLabel);
                }

                if (context.tenantId) {
                    this._logger.setContext("TenantID", context.tenantId);
                }

                let missedClonedEvents = Manager.addLogHandler((event: IClonedEvent) => {
                    this.logEvent(event);
                });

                for (let event of missedClonedEvents) {
                    this.logEvent(event);
                }
            });
        }
    }

    public static getAriaTimeZone(timezoneOffset: number) {
        // Format the timezone to something simlar to -08:00
        let absTimezoneOffset = Math.abs(timezoneOffset);
        let minutes = absTimezoneOffset % 60;
        let hours = Math.floor(absTimezoneOffset / 60);

        return `${timezoneOffset > 0 ? '-' : '+'}${hours >= 10 ? hours : `0${hours}`}:${minutes >= 10 ? minutes : `0${minutes}`}`;
    }

    private static logEvent(event: IClonedEvent) {
        let shouldLogEvent = (this.logStartEvents && event.eventType === ClonedEventTypeEnum.Start) ||
            (event.eventType !== ClonedEventTypeEnum.Start);

        if (shouldLogEvent && event.enabled) {
            let eventProperties: AriaTelemetry.EventProperties = new this._ariaTelemtry.EventProperties();

            eventProperties.setProperty("Vector", event.vector.toString());
            eventProperties.setProperty("ValidationErrors", event.validationErrors);

            let splitEventName = event.eventName.split(',');
            let eventName = `ev_${splitEventName[splitEventName.length - 2]}`;
            let fullEventName = `${event.eventName}`;

            if (event.eventType === ClonedEventTypeEnum.End) {
                eventProperties.setProperty("Duration", event.endTime - event.startTime);
            }

            let data = event.data;

            if (data) {
                for (let x in data) {
                    let propertyMetadata = event.metadata[x];

                    if (propertyMetadata) {
                        let loggingName = `${propertyMetadata.definedInName}_${x}`;
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
                                    eventProperties.setProperty(`${loggingName}_${y}`, dataObject[y]);
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