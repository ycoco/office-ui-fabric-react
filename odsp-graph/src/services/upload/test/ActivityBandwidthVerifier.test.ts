
import { ActivityBandwidthVerifier } from '../ActivityBandwidthVerifier';
import * as sinon from 'sinon';
import { expect } from 'chai';

describe('ActivityBandwidthVerifier', () => {
    let activityBandwidthVerifier: ActivityBandwidthVerifier;

    let performanceNowStub: sinon.SinonStub;

    const BASE_TIME = 30000;

    function setTime(time: number) {
        performanceNowStub.returns(BASE_TIME + time);
    }

    beforeEach(() => {
        performanceNowStub = sinon.stub();

        setTime(0);

        activityBandwidthVerifier = new ActivityBandwidthVerifier({
            timeout: 10 * 1000,
            totalBytes: 100 * 1000
        }, {
                performanceNow: performanceNowStub
            });
    });

    it('becomes false when the rate has been too slow', () => {
        setTime(1000);
        expect(activityBandwidthVerifier.doesActivityHaveRemainingCapacity(5 * 1000)).equals(true);

        setTime(2000);
        expect(activityBandwidthVerifier.doesActivityHaveRemainingCapacity(10 * 1000)).equals(true);

        setTime(3000);
        expect(activityBandwidthVerifier.doesActivityHaveRemainingCapacity(15 * 1000)).equals(true);

        // There must be enough data recorded and enough time elapsed to make the decision.
        setTime(4000);
        expect(activityBandwidthVerifier.doesActivityHaveRemainingCapacity(20 * 1000)).equals(false);
    });

    it('stays true when the rate has been fast enough', () => {
        setTime(1000);
        expect(activityBandwidthVerifier.doesActivityHaveRemainingCapacity(10 * 1000)).equals(true);

        setTime(2000);
        expect(activityBandwidthVerifier.doesActivityHaveRemainingCapacity(20 * 1000)).equals(true);

        setTime(3000);
        expect(activityBandwidthVerifier.doesActivityHaveRemainingCapacity(30 * 1000)).equals(true);

        setTime(4000);
        expect(activityBandwidthVerifier.doesActivityHaveRemainingCapacity(40 * 1000)).equals(true);

        setTime(10000);
        expect(activityBandwidthVerifier.didActivityHaveExtraCapacity()).equals(false);
    });

    it('detects when there has been enough capacity', () => {
        setTime(1000);
        expect(activityBandwidthVerifier.doesActivityHaveRemainingCapacity(20 * 1000)).equals(true);

        setTime(2000);
        expect(activityBandwidthVerifier.doesActivityHaveRemainingCapacity(40 * 1000)).equals(true);

        setTime(3000);
        expect(activityBandwidthVerifier.doesActivityHaveRemainingCapacity(60 * 1000)).equals(true);

        setTime(4000);
        expect(activityBandwidthVerifier.doesActivityHaveRemainingCapacity(80 * 1000)).equals(true);

        setTime(6000);
        expect(activityBandwidthVerifier.didActivityHaveExtraCapacity()).equals(true);
    });

    it('handles very quick uploads', () => {
        setTime(1000);
        expect(activityBandwidthVerifier.doesActivityHaveRemainingCapacity(50 * 1000)).equals(true);

        setTime(2000);
        expect(activityBandwidthVerifier.didActivityHaveExtraCapacity()).equals(true);
    });

    it('ignores a lack of data', () => {
        setTime(10000);
        expect(activityBandwidthVerifier.didActivityHaveExtraCapacity()).equals(false);
    });
});
