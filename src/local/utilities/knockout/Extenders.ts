
/// <reference path='../../../knockout/knockout.d.ts' />

import Async = require('odsp-utilities/async/Async');
import Disposable from '../../base/Disposable';

module Extenders {
    'use strict';

    /**
     * Modifies an observable to perform a throttle across the next two animation frames.
     * If the target observable requires a re-compute, this extender ensures that the
     * re-compute and subsequent notifications skip at least one frame before firing.
     *
     * Use this extender if an update to an observable will trigger DOM updates which need
     * to wait for previous updates to render.
     */
    export function skipAnimationFrame<O extends KnockoutObservable<any>>(target: O, async: Async): O {
        if (target['limit']) {
            // If Knockout exposes the limit function on observables, use it to set up the throttling.

            target['limit']((callback: () => void) => {
                var animationFrameId: number;

                return () => {
                    async.cancelAnimationFrame(animationFrameId);

                    animationFrameId = async.requestAnimationFrame(() => {
                        // Do nothing during this frame, since it could still be the frame on which
                        // the observed values changed.
                        animationFrameId = async.requestAnimationFrame(() => {
                            animationFrameId = (void 0);
                            callback();
                        });
                    });
                };
            });
        } else {
            // Otherwise, simulate the above by using animation frames to enforce a rateLimit extender.

            target.extend({ rateLimit: { timeout: 1, method: 'notifyWhenChangesStop' } });

            var animationFrameId: number;

            var subscription = target.subscribe((value: any) => {
                async.cancelAnimationFrame(animationFrameId);
                animationFrameId = async.requestAnimationFrame(() => {
                    // Do nothing during this frame, since it could still be the frame on which
                    // the observed values changed.
                    animationFrameId = async.requestAnimationFrame(() => {
                        animationFrameId = (void 0);
                        target();
                    });
                });
            }, null, 'beforeChange');

            target = <any>Disposable.hook(target, () => {
                subscription.dispose();
            });
        }

        return target;
    }
}

export = Extenders;
