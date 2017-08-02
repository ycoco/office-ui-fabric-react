
export interface IActivityBandwidthVerifierParams {
    timeout: number;
    totalBytes: number;
}

export interface IActivityBandwidthVerifierDependencies {
    performanceNow: () => number;
}

/**
 * Utility which verifies whether an activity has enough bandwidth to succeed within
 * a timeout based on current progress and total size.
 */
export class ActivityBandwidthVerifier {
    private readonly _performanceNow: () => number;

    private readonly _startTime: number;
    private readonly _expirationTime: number;

    private _progressPoints: number;
    private _totalBytes: number;

    constructor(params: IActivityBandwidthVerifierParams, dependencies: IActivityBandwidthVerifierDependencies) {
        this._performanceNow = dependencies.performanceNow;

        this._startTime = this._performanceNow();
        this._expirationTime = this._startTime + params.timeout;
        this._totalBytes = params.totalBytes;

        this._progressPoints = 0;
    }

    /**
     * Determines whether the activity will have enough time to complete based on
     * current progress.
     */
    public doesActivityHaveRemainingCapacity(completedBytes: number): boolean {
        const rateRatio = this._getRateRatio(completedBytes);

        return rateRatio !== undefined ? rateRatio <= 1 : true;
    }

    /**
     * Determines whether the activity completed with time to spare.
     */
    public didActivityHaveExtraCapacity(): boolean {
        const rateRatio = this._getRateRatio(this._totalBytes);

        return rateRatio <= 0.5;
    }

    /**
     * Calculates the ratio of the required remaining rate over the current rate.
     */
    private _getRateRatio(completedBytes: number): number {
        this._progressPoints++;

        const currentTime = this._performanceNow();

        const elapsedDuration = currentTime - this._startTime;
        const remainingDuration = this._expirationTime - currentTime;
        const remainingBytes = this._totalBytes - completedBytes;

        let rateRatio: number;

        if ((this._progressPoints >= 4 && elapsedDuration >= 4 * 1000 ||
            this._progressPoints > 0 && remainingBytes === 0) &&
            remainingDuration > 0) {
            rateRatio = (remainingBytes / remainingDuration) / (completedBytes / elapsedDuration);
        }

        return rateRatio;
    }
}
