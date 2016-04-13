/// <reference path="../../../chai/chai.d.ts" />
/// <reference path="../../../mocha/mocha.d.ts" />
/// <reference path="../../../sinon/sinon.d.ts" />

import chai = require("chai");
import Semaphore from 'odsp-utilities/async/Semaphore';
import Signal from 'odsp-utilities/async/Signal';
import Promise from 'odsp-utilities/async/Promise';

var expect = chai.expect;

interface ITestCallback {
    callCount: number;
    signal: Signal<any>;
    callback: () => Promise<any>;
    enqueuePromise: Promise<any>;
    canceled: boolean;
}

describe('Semaphore', function() {

    describe('enqueue()', function() {

        it('executes when under concurrency', function() {
            var semaphore = new Semaphore();
            var signal = new Signal();
            var callbackCalled = false;
            var promiseCalled = false;

            semaphore.enqueue(() => {
                callbackCalled = true;
                return signal.getPromise();
            }).done(() => {
                promiseCalled = true;
            });

            expect(callbackCalled).to.be.true;
            expect(promiseCalled).to.be.false;

            signal.complete();
            expect(promiseCalled).to.be.true;
        });

        function getTestCallback(semaphore: Semaphore): ITestCallback {
            var result: ITestCallback = {
                callCount: 0,
                canceled: false,
                signal: new Signal(() => {
                    result.canceled = true;
                }),
                callback: () => {
                    result.callCount++;
                    return result.signal.getPromise();
                },
                enqueuePromise: null
            };
            result.enqueuePromise = semaphore.enqueue(result.callback);
            return result;
        }

        function getTestCallbacks(count: number, semaphore: Semaphore): ITestCallback[] {
            var calls: ITestCallback[] = [];
            for (var i = 0; i < count; i++) {
                var cb = getTestCallback(semaphore);
                calls.push(cb);
            }
            return calls;
        }

        it('defers when over concurrency', function() {
            var semaphore = new Semaphore(2);
            var calls = getTestCallbacks(5, semaphore);

            expect(calls[0].callCount).to.equal(1);
            expect(calls[1].callCount).to.equal(1);
            expect(calls[2].callCount).to.equal(0);
            expect(calls[3].callCount).to.equal(0);
            expect(calls[4].callCount).to.equal(0);

            calls[1].signal.error();
            expect(calls[2].callCount).to.equal(1);
            expect(calls[3].callCount).to.equal(0);
            expect(calls[4].callCount).to.equal(0);

            calls[2].signal.getPromise().cancel();
            expect(calls[3].callCount).to.equal(1);
            expect(calls[4].callCount).to.equal(0);

            calls[3].signal.complete();
            expect(calls[4].callCount).to.equal(1);
        });

        it('handles cancelation of deferred items', function() {
            var semaphore = new Semaphore();
            var calls = getTestCallbacks(2, semaphore);
            expect(calls[1].callCount).to.equal(0);
            calls[1].enqueuePromise.cancel();
            calls[0].signal.complete();
            expect(calls[1].callCount, 'cancelled callback should not fire').to.equal(0);
        });

        it('forwards cancelation to original promise', function() {
            var semaphore = new Semaphore();
            var calls = getTestCallbacks(2, semaphore);
            calls[0].signal.complete();
            expect(calls[1].callCount).to.equal(1);
            calls[1].enqueuePromise.cancel();
            expect(calls[1].canceled).to.be.true;
        });

        it('executes items after a canceled item', function() {
            var semaphore = new Semaphore();
            var calls = getTestCallbacks(3, semaphore);
            calls[1].enqueuePromise.cancel();
            calls[0].signal.complete();
            expect(calls[2].callCount, 'final callback should execute').to.equal(1);
        });


    });

});
