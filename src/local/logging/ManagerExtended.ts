// OneDrive:CoverageThreshold(85)
import { IEvent } from "./IEvent";
import { Manager} from './Manager';
import { ValidationErrorType } from "./EventBase";
import ValidationError from './events/ValidationError.event';

Manager.logValidationError = (event: IEvent, type: ValidationErrorType) => {
    let typeString = ValidationErrorType[type];

    // Dont send validation errors unless its enabled, this way
    // people wont be confused by seeing these in the debug window
    if (ValidationError.enabled) {
        ValidationError.logData({
            message: `Validation error for ${event.shortEventName} of type ${typeString}`,
            validatedEventName: event.shortEventName,
            validatedFullEventName: event.eventName,
            validationType: typeString,
            stack: Manager.getStack()
        },
            event);
    }
};