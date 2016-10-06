// OneDrive:IgnoreCodeCoverage

import Features from '../features/Features';
import IFeature = require('../features/IFeature');
import AriaLoggerCore, { IContextData } from './AriaLoggerCore';

export default class AriaLogger {
    private static EnableAriaLogging: IFeature = { ODB: 588, ODC: 'EnableAriaLogging', Fallback: false };

    public static Init(
        tenantToken: string,
        context: IContextData) {
        if (context.forceEnabled || Features.isFeatureEnabled(this.EnableAriaLogging)) {
            require(['aria'], (aria: typeof microsoft.applications.telemetry) => {
                AriaLoggerCore.Init(tenantToken, context, aria);
            });
        }
    }

    public static get logStartEvents(): boolean {
        return AriaLoggerCore.logStartEvents;
    }

    public static set logStartEvents(b: boolean) {
        AriaLoggerCore.logStartEvents = b;
    }

    public static getAriaTimeZone(timezoneOffset: number) {
        // Format the timezone to something simlar to -08:00
        let absTimezoneOffset = Math.abs(timezoneOffset);
        let minutes = absTimezoneOffset % 60;
        let hours = Math.floor(absTimezoneOffset / 60);

        return `${timezoneOffset > 0 ? '-' : '+'}${hours >= 10 ? hours : `0${hours}`}:${minutes >= 10 ? minutes : `0${minutes}`}`;
    }

}