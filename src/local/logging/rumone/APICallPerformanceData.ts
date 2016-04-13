// OneDrive:IgnoreCodeCoverage

class APICallPerformanceData {
    url: string;
    duration: number;
    correlationId: string;
    status: number;
    startTime: string;
    endTime: string;
    constructor(
        url: string,
        duration: number,
        correlationid: string,
        status: number,
        startTime: string,
        endTime: string) {
        this.url = url;
        this.duration = duration;
        this.correlationId = correlationid;
        this.status = status;
        this.startTime = startTime;
        this.endTime = endTime;
    }
}

export default APICallPerformanceData;