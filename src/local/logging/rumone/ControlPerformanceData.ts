// OneDrive:IgnoreCodeCoverage
import RUMOneLogger = require("./RUMOneLogger");

class ControlPerformanceData {
    public controlId: string;
    public startTime: number;
    public endTime: number;
    public renderTimeCalculator: (rumone: RUMOneLogger, controlData: ControlPerformanceData) => number;
    public renderTimeRequiredDataChecker: (rumone: RUMOneLogger, controlData: ControlPerformanceData) => boolean;
    public renderTime: number;
    constructor(
        controlId: string,
        startTime: number,
        endTime: number,
        renderTimeCalculator: (rumone: RUMOneLogger, controlData: ControlPerformanceData) => number,
        renderTimeRequiredDataChecker: (rumone: RUMOneLogger, controlData: ControlPerformanceData) => boolean) {
        this.controlId = controlId;
        this.startTime = startTime;
        this.endTime = endTime;
        this.renderTimeCalculator = renderTimeCalculator;
        this.renderTimeRequiredDataChecker = renderTimeRequiredDataChecker;
    }
}

export = ControlPerformanceData;