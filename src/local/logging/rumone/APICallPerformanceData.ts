// OneDrive:IgnoreCodeCoverage

class APICallPerformanceData {
    url: string;
    duration: number;
    correlationId: string;
    status: number;
    startTime: string;
    endTime: string;
    name: string;
    constructor(
        url: string,
        duration: number,
        correlationid: string,
        status: number,
        startTime: string,
        endTime: string,
        name?: string) {
        this.url = url;
        this.duration = duration;
        this.correlationId = correlationid;
        this.status = status;
        this.startTime = startTime;
        this.endTime = endTime;
        this.name = name;
    }
}

export default APICallPerformanceData;