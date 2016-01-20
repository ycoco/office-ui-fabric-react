// OneDrive:CoverageThreshold(85)
import { IEvent } from "./IEvent";
import { Manager} from './Manager';
import { ValidationErrorType } from "./EventBase";
import ValidationError from './events/ValidationError.event';

Manager.logValidationError = (event: IEvent, type: ValidationErrorType) => {
    let typeString = ValidationErrorType[type];

    ValidationError.logData({
        message: `Validation error for ${event.shortEventName} of type ${typeString}`,
        validatedEventName: event.shortEventName,
        validatedFullEventName: event.eventName,
        validationType: typeString,
        stack: Manager.getStack()
    },
        event);
};