import Extenders = require('../../../../odsp-shared/utilities/knockout/Extenders');
import Async from '@ms/odsp-utilities/lib/async/Async';
import ko = require('knockout');
import chai = require('chai');

var expect = chai.expect;

describe('Extenders', () => {
    var target: KnockoutComputed<any>;
    var source: KnockoutObservable<any>;

    beforeEach(() => {
        source = ko.observable({ test: 5 });
        /* tslint:disable:ban */
        target = ko.computed(() => {
            return { test: source().test + 1 };
        });
        /* tslint:enable:ban */
    });

    afterEach(() => {
        target.dispose();
    });

    describe('#skipAnimationFrame', () => {
        var async: Async;
        var animationFrameCallback: () => void;
        var animationFrameId: number;

        beforeEach(() => {
            animationFrameId = 0;

            async = <any>{
                requestAnimationFrame: (callback: () => void) => {
                    animationFrameCallback = callback;
                    return ++animationFrameId;
                },
                cancelAnimationFrame: (id: number) => {
                    // Nothing needed.
                }
            };

            target = Extenders.skipAnimationFrame(target, async);
        });

        it('does not update initially', () => {
            var value = target.peek();

            source({ test: 10 });

            expect(target.peek().test).to.equal(value.test);
        });

        it('does not update on first frame', () => {
            var value = target.peek();

            source({ test: 10 });

            animationFrameCallback();

            expect(target.peek().test).to.equal(value.test);
        });

        it('updates on second frame', () => {
            source({ test: 10 });

            animationFrameCallback();
            animationFrameCallback();

            expect(target.peek().test).to.equal(source.peek().test + 1);
        });
    });
});
