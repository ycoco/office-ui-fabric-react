// OneDrive:CoverageThreshold(85)

import { IEvent } from "./IEvent";
import IClonedEvent = require("./IClonedEvent");
import { ClonedEventType as ClonedEventTypeEnum } from "./EventBase";
import ObjectUtil = require("../object/ObjectUtil");

var handlers: Array<(e: IClonedEvent) => void> = [];
var buffer: Array<IClonedEvent> = [];
var maxBufferSize = 100;

function getStartDate() {
    'use strict';

    if (window.performance && window.performance.timing && window.performance.timing.navigationStart) {
        return new Date(window.performance.timing.navigationStart);
    } else {
        return new Date();
    }
}

var startDate = getStartDate();

export class Manager {
    static startDate: Date = startDate;
    static startTime: number = startDate.getTime();

    static getTime() {
        return (new Date()).getTime();
    }

    /** This is the overrideable evaluate sampling ramp function */
    static evaluateSamplingRampValue(str: string) {
        return true;
    }

    /** This is the overrideable clean string function */
    static cleanString(str: string): string {
        return str;
    }

    static addLogHandler(handler: (e: IClonedEvent) => void) {
        handlers.push(handler);

        // Return the buffer so the handler can get missed events
        return buffer;
    }

    static removeLogHandler(handler: (e: IClonedEvent) => void) {
        for (var x = 0; x < handlers.length; x++) {
            if (handlers[x] === handler) {
                // Remove the handler
                handlers.splice(x, 1);
                break;
            }
        }
    }

    static logEvent(event: IEvent, eventType: ClonedEventTypeEnum) {
        // Clone the object (do it natively because the browser can mark it as a type)
        var clonedEvent: IClonedEvent = Object.freeze({
            data: ObjectUtil.deepCopy(event.data),
            id: event.id,
            enabled: event.enabled,
            critical: event.critical,
            endTime: event.endTime,
            eventName: event.eventName,
            shortEventName: event.shortEventName,
            parentId: event.parentId,
            startTime: event.startTime,
            eventType: eventType,
            metadata: event.metadata,
            vector: event.vector
        });

        // Add to the buffer
        buffer.push(clonedEvent);

        if (buffer.length > maxBufferSize) {
            buffer = buffer.slice(1);

            // Make sure we have a handler before the buffer is overrun
            if (handlers.length === 0) {
                this.handleBaseLoggingError(new Error("Logging buffer overflow hit before any logging handler was registered"));
            }
        }

        // Let handlers know the log event has completed
        for (var x = 0; x < handlers.length; x++) {
            try {
                handlers[x](clonedEvent);
            } catch (e) {
                this.handleBaseLoggingError(e);
            }
        }
    }

    private static handleBaseLoggingError(error: Error) {
        // TODO: Log somewhere
    }
}

export default Manager;