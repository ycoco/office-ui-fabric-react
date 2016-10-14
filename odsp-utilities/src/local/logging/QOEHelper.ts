import QoeEvent from './events/Qoe.event';
import IClonedEvent from "./IClonedEvent";
import { Manager } from "./Manager";
import { Qos, ResultTypeEnum, IQosStartSchema, IQosEndSchema } from "./events/Qos.event";
import CaughtError from "./events/CaughtError.event";
import RequireJSError from "./events/RequireJSError.event";
import UnhandledError from "./events/UnhandledError.event";
import PLTEvent from "./events/PLT.event";
import ErrorHelper from "./ErrorHelper";

export enum Stages {
    AppLoad = 0,
    PLT,
    SessionError
}

let errorBeforeStage = false;
let errorDuringStage = false;
let lastStage = -1;

function fireSessionError() {
    "use strict";
    if (lastStage === Stages.SessionError - 1) {
        QoeHelper.markStage(Stages.SessionError);
    }
}

function updateErrors(event: IClonedEvent) {
    "use strict";
    if (Qos.isTypeOf(event)) {
        let data: IQosStartSchema & IQosEndSchema = event.data;
        if (data.resultType === ResultTypeEnum.Failure) {
            errorDuringStage = true;
            fireSessionError();
            errorBeforeStage = true;
        }
    } else if (
        CaughtError.isTypeOf(event) ||
        RequireJSError.isTypeOf(event) ||
        UnhandledError.isTypeOf(event)) {
        errorDuringStage = true;
        fireSessionError();
        errorBeforeStage = true;
    } else if (PLTEvent.isTypeOf(event)) {
        QoeHelper.markStage(Stages.PLT);

        if (errorBeforeStage) {
            fireSessionError();
        }
    }
}

let missedClonedEvents = Manager.addLogHandler(updateErrors);

for (let event of missedClonedEvents) {
    updateErrors(event);
}

export default class QoeHelper {
    public static markStage(stage: Stages) {
        // Make sure we go through the stages in order
        if (stage - 1 === lastStage || stage === Stages.AppLoad) {
            QoeEvent.logData({
                stage: Stages[stage],
                errorBeforeStage: errorBeforeStage,
                errorDuringStage: errorDuringStage
            });

            // reset the during stage errors
            errorDuringStage = false;

            lastStage = stage;
        } else {
            try {
                throw new Error(`Stage ${Stages[stage]} - ${stage} came out of order - previous stage ${Stages[lastStage]} - ${lastStage}`);
            } catch (e) {
                ErrorHelper.log(e);
            }
        }
    }

    /**
     * This will reset the state that tracks errors.
     * This should really only be used in testing.
     */
    public static reset() {
        lastStage = -1;
        errorBeforeStage = false;
        errorDuringStage = false;
    }
}

QoeHelper.markStage(Stages.AppLoad);