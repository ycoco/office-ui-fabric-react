/// <reference path="../../../../chai/chai.d.ts" />
/// <reference path="../../../../mocha/mocha.d.ts" />
/// <reference path="../../../../sinon/sinon.d.ts" />

import sinon = require("sinon");
import chai = require("chai");
import Signal = require('../../../../local/utilities/async/Signal');
import Retry = require('../../../../local/utilities/async/Retry');
import Async = require('../../../../local/utilities/async/Async');

var expect = chai.expect;

describe('Retry', function() {

    it('completes the promise on success', function() {
        var async = new Async();
        var signal = new Signal<number>();
        var callback = sinon.stub().returns(signal.getPromise());
        var canRetry = sinon.stub().returns(true);
        var result = Retry<number>({
            async: async,
            retries: 1,
            delay: 0,
            callback: callback,
            canRetry: canRetry
        });

        var resultSpy = sinon.spy();
        result.then(resultSpy);

        expect(resultSpy.called).to.be.false;

        signal.complete(42);
        expect(resultSpy.calledOnce).to.be.true;
        expect(resultSpy.calledWith(42)).to.be.true;

        async.dispose();
    });

    it('retries on failure', function() {
        var async = new Async();
        var setTimeoutStub = sinon.stub(async, 'setTimeout');
        var signal = new Signal<number>();
        var delay = 16;
        var callback = sinon.stub().returns(signal.getPromise());
        var canRetry = sinon.stub().returns(true);
        var result = Retry<number>({
            async: async,
            retries: 1,
            delay: delay,
            callback: callback,
            canRetry: canRetry
        });

        var resultSpy = sinon.spy();
        result.then(resultSpy);

        signal.error("bad");

        expect(canRetry.calledOnce, "can retry is called").to.be.true;
        expect(canRetry.calledWith("bad"), "can retry receives error").to.be.true;
        expect(resultSpy.called, "result is not called yet").to.be.false;

        expect(setTimeoutStub.calledOnce, "setTimeout is called").to.be.true;
        expect(setTimeoutStub.firstCall.args[1], "setTimeout is called with correct delay").to.equal(delay);

        signal = new Signal<number>();
        callback.returns(signal.getPromise());
        setTimeoutStub.yield();
        expect(callback.calledTwice, "callback is executed again").to.be.true;

        signal.complete(42);
        expect(resultSpy.calledOnce, "result is called after success").to.be.true;
        expect(resultSpy.calledWith(42), "result is passed correctly").to.be.true;

        async.dispose();
    });

    it('gives up after the maximum number of retries', function() {
        var async = new Async();
        var setTimeoutStub = sinon.stub(async, 'setTimeout');
        var signal = new Signal<number>();
        var delay = 16;
        var callback = sinon.stub().returns(signal.getPromise());
        var canRetry = sinon.stub().returns(true);
        var result = Retry<number>({
            async: async,
            retries: 1,
            delay: delay,
            callback: callback,
            canRetry: canRetry
        });

        var errorSpy = sinon.spy();
        result.then(null, errorSpy);

        signal.error("bad");
        setTimeoutStub.yield();

        expect(errorSpy.calledOnce, "error is propagated after max retries").to.be.true;
        expect(errorSpy.calledWith("bad"), "error is passed correctly").to.be.true;

        async.dispose();
    });

    it('forwards cancellation to the callback promise', function() {
        var async = new Async();
        var cancelSpy = sinon.spy();
        var signal = new Signal<number>(cancelSpy);
        var callback = sinon.stub().returns(signal.getPromise());
        var canRetry = sinon.stub().returns(true);
        var result = Retry<number>({
            async: async,
            retries: 1,
            delay: 0,
            callback: callback,
            canRetry: canRetry
        });

        result.cancel();
        expect(cancelSpy.called).to.be.true;

        async.dispose();
    });

    it('calls beforeRetry before retrying', function() {
        var async = new Async();
        sinon.stub(async, 'setTimeout');
        var signal = new Signal<number>();
        var delay = 16;
        var callback = sinon.stub().returns(signal.getPromise());
        var canRetry = sinon.stub().returns(true);
        var beforeRetry = sinon.spy();
        var result = Retry<number>({
            async: async,
            retries: 1,
            delay: delay,
            callback: callback,
            canRetry: canRetry,
            beforeRetry: beforeRetry
        });

        var resultSpy = sinon.spy();
        result.then(resultSpy);

        signal.error("bad");

        expect(beforeRetry.calledOnce).to.be.true;
        expect(callback.calledOnce).to.be.true;

        async.dispose();
    });

    it('does not retry when canRetry returns false', function() {
        var async = new Async();
        sinon.stub(async, 'setTimeout');
        var signal = new Signal<number>();
        var delay = 16;
        var callback = sinon.stub().returns(signal.getPromise());
        var canRetry = sinon.stub().returns(false);
        var result = Retry<number>({
            async: async,
            retries: 1,
            delay: delay,
            callback: callback,
            canRetry: canRetry
        });

        var errorSpy = sinon.spy();
        result.then(null, errorSpy);

        signal.error("bad");

        expect(errorSpy.calledOnce).to.be.true;

        async.dispose();
    });

    it('calls shouldRestart before completing', function() {
        var async = new Async();
        var signal = new Signal<number>();
        var callback = sinon.stub().returns(signal.getPromise());
        var canRetry = sinon.stub().returns(true);
        var shouldRestart = sinon.spy();
        var result = Retry<number>({
            async: async,
            retries: 1,
            delay: 0,
            callback: callback,
            canRetry: canRetry,
            shouldRestart: shouldRestart
        });

        var resultSpy = sinon.spy();
        result.then(resultSpy);

        signal.complete(42);
        expect(shouldRestart.calledOnce).to.be.true;
        expect(resultSpy.calledOnce).to.be.true;
        expect(shouldRestart.calledBefore(resultSpy), "shouldRestart is called before result").to.be.true;

        async.dispose();
    });

    it('shouldRestart can re-trigger the callback', function() {
        var async = new Async();
        var signal = new Signal<number>();
        var callback = sinon.spy(() => {
            signal = new Signal<number>();
            return signal.getPromise();
        });
        var canRetry = sinon.stub().returns(true);
        var shouldRestart = sinon.stub();
        shouldRestart.onFirstCall().returns(true);
        var result = Retry<number>({
            async: async,
            retries: 1,
            delay: 0,
            callback: callback,
            canRetry: canRetry,
            shouldRestart: shouldRestart
        });

        var resultSpy = sinon.spy();
        result.then(resultSpy);
        signal.complete(42);
        expect(callback.calledTwice, "callback is called again due to shouldRestart").to.be.true;
        signal.complete(24);
        expect(resultSpy.calledWith(24), "result has the last return value").to.be.true;

        async.dispose();
    });

    it('allows shouldRestart to reset the number of retries', function() {
        var async = new Async();
        var setTimeoutStub = sinon.stub(async, 'setTimeout');
        var signal: Signal<number>;
        var callback = sinon.spy(() => {
            signal = new Signal<number>();
            return signal.getPromise();
        });
        var canRetry = sinon.stub().returns(true);
        var shouldRestart = sinon.stub();
        shouldRestart.onFirstCall().returns(true);
        var result = Retry<number>({
            async: async,
            retries: 1,
            delay: 0,
            resetAttemptsOnRestart: true,
            callback: callback,
            canRetry: canRetry,
            shouldRestart: shouldRestart
        });

        var resultSpy = sinon.spy();
        result.then(resultSpy);
        // fail once to use up a retry
        signal.error("bad");
        setTimeoutStub.yield();
        signal.complete(42);
        // shouldRestart triggers another call
        // fail again, which should allow us to retry if retries have been reset
        signal.error("bad again");
        setTimeoutStub.yield();
        signal.complete(24);
        expect(resultSpy.calledWith(24)).to.be.true;

        async.dispose();

    });

    it('adjusts retries', function() {
        var async = new Async();
        sinon.stub(async, 'setTimeout');
        var signal = new Signal<number>();
        var delay = 16;
        var callback = sinon.stub().returns(signal.getPromise());
        var canRetry = sinon.stub().returns(true);
        var adjustRetries = sinon.stub().returns(0);
        var result = Retry<number>({
            async: async,
            retries: 1,
            delay: delay,
            callback: callback,
            canRetry: canRetry,
            adjustRetries: adjustRetries
        });

        var errorSpy = sinon.spy();
        result.then(null, errorSpy);
        signal.error("bad");

        expect(adjustRetries.calledOnce).to.be.true;
        expect(errorSpy.calledOnce).to.be.true;

        async.dispose();
    });

});
