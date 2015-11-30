import IClonedEvent = require("../IClonedEvent");

interface IBeaconHandlers {
    ignoredEventsHandler: (event: IClonedEvent) => boolean;

    qosEventNameHandler: (event: IClonedEvent, currentName: string) => string;

    qosEventExtraDataHandler: (event: IClonedEvent, qosData: any) => void;
}

export = IBeaconHandlers;