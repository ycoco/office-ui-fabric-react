
import {
    EngagementHelper,
    EngagementPart,
    EngagementPartType,
    IEngagementSingleSchema,
    ENGAGEMENT_ROOT
} from '../../../../odsp-utilities/logging/engagement/Engagement';
import * as sinon from 'sinon';
import { expect } from 'chai';

describe('EngagementHelper', () => {
    let engagementHelper: EngagementHelper;

    let logDataStub: sinon.SinonStub;

    function expectLogDataToPass(data: IEngagementSingleSchema) {
        const actualData: IEngagementSingleSchema = logDataStub.args[0][0];

        expect(actualData).to.deep.equal(data);
    }

    beforeEach(() => {
        logDataStub = sinon.stub();
    });

    describe('with no default context', () => {
        beforeEach(() => {
            engagementHelper = new EngagementHelper({}, {
                logData: logDataStub
            });
        });

        it('does not fire an event without a name', () => {
            engagementHelper.logData();

            expect(logDataStub.called).to.be.false;
        });

        it('fires an unintentional event with a name', () => {
            engagementHelper.logData({
                name: 'test'
            });

            expectLogDataToPass({
                name: 'test',
                isIntentional: false,
                extraData: {},
                experiment: {}
            });
        });

        it('sets intentional flag', () => {
            engagementHelper.logData({
                name: 'test',
                isIntentional: true
            });

            expectLogDataToPass({
                name: 'test',
                isIntentional: true,
                extraData: {},
                experiment: {}
            });
        });

        it('passes extra data', () => {
            engagementHelper.logData({
                name: 'test',
                extraData: {
                    'foo': 'bar'
                }
            });

            expectLogDataToPass({
                name: 'test',
                isIntentional: false,
                extraData: {
                    'foo': 'bar'
                },
                experiment: {}
            });
        });

        it('does not fail when adding no context', () => {
            engagementHelper.fromSource(undefined);
        });

        describe('with added context', () => {
            const part1 = new EngagementPart('part1', EngagementPartType.subject);

            it('builds a name', () => {
                engagementHelper.withPart(part1).logData();

                expectLogDataToPass({
                    name: part1.name,
                    isIntentional: false,
                    extraData: {},
                    experiment: {}
                });
            });

            it('builds extra data', () => {
                engagementHelper.withPart(part1, {
                    extraData: {
                        'foo': 'bar'
                    }
                }).logData();

                expectLogDataToPass({
                    name: part1.name,
                    isIntentional: false,
                    extraData: {
                        [`${part1.name}_foo`]: 'bar'
                    },
                    experiment: {}
                });
            });

            describe('with more added context', () => {
                const part2 = new EngagementPart('part2', EngagementPartType.intent);
                const part3 = new EngagementPart('part3', EngagementPartType.component);
                const part4 = new EngagementPart('part4', EngagementPartType.event);

                it('builds a sorted name', () => {
                    engagementHelper.withPart(part4, {
                        extraData: {
                            'foo': 4
                        }
                    }).withPart(part2, {
                        extraData: {
                            'foo': 2
                        }
                    }).withPart(part3, {
                        extraData: {
                            'foo': 3
                        }
                    }).withPart(part1, {
                        extraData: {
                            'foo': 1
                        }
                    }).logData({
                        extraData: {
                            'foo': 'bar'
                        }
                    });

                    expectLogDataToPass({
                        name: `${part1.name}.${part2.name}.${part3.name}.${part4.name}`,
                        isIntentional: false,
                        extraData: {
                            [`${part1.name}_foo`]: 1,
                            [`${part2.name}_foo`]: 2,
                            [`${part3.name}_foo`]: 3,
                            [`${part4.name}_foo`]: 4,
                            'foo': 'bar'
                        },
                        experiment: {}
                    });
                });
            });
        });
    });

    describe('with a default context', () => {
        const part1 = new EngagementPart('part1', EngagementPartType.component);

        beforeEach(() => {
            engagementHelper = new EngagementHelper({}, {
                engagementSource: ENGAGEMENT_ROOT.withPart(part1),
                logData: logDataStub
            });
        });

        it('fires a default event', () => {
            engagementHelper.logData();

            expect(logDataStub.called).to.be.true;

            expectLogDataToPass({
                name: 'part1',
                isIntentional: false,
                extraData: {},
                experiment: {}
            });
        });
    });
});
