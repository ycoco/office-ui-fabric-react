/// <reference path="../../../chai/chai.d.ts" />
/// <reference path="../../../mocha/mocha.d.ts" />
/// <reference path="../../../sinon/sinon.d.ts" />

import chai = require("chai");
import sinon = require("sinon");
import Async from 'odsp-utilities/async/Async';

/* tslint:disable:ban-native-functions */
var expect = chai.expect;

describe('Async', function() {

    var clock: SinonFakeTimers;

    before(function () {
        clock = sinon.useFakeTimers();
    });

    after(function() {
        clock.restore();
    });

    describe('setTimeout()', function() {

        it('calls back after the timeout', function() {
            var async = new Async();
            var callback = sinon.spy();
            async.setTimeout(callback, 10);

            clock.tick(10);
            expect(callback.calledOnce).to.be.true;
        });

        it('executes in the parent context', function() {
            var parent = {};
            var async = new Async(parent);
            var callback = sinon.spy();
            async.setTimeout(callback, 10);

            clock.tick(10);
            expect(callback.calledOnce).to.be.true;
            expect(callback.thisValues[0]).to.equal(parent);
        });
    });

    describe('dispose()', function() {

        it('removes a scheduled timeout', function() {
            var async = new Async();
            var callback = sinon.spy();
            async.setTimeout(callback, 10);
            async.setImmediate(callback);
            async.dispose();
            clock.tick(10);
            expect(callback.calledOnce).to.be.false;
        });
    });

    describe('clearTimeout()', function() {

        it('removes a scheduled timeout', function() {
            var async = new Async();
            var callback = sinon.spy();
            var id = async.setTimeout(callback, 10);
            async.clearTimeout(id);
            clock.tick(10);
            expect(callback.calledOnce).to.be.false;
        });
    });

    describe('setImmediate()', function() {

        it('calls back immediately', function() {
            var async = new Async();
            var callback = sinon.spy();
            async.setImmediate(callback);

            clock.tick(1);
            expect(callback.calledOnce).to.be.true;
        });
    });

    describe('clearImmediate()', function() {

        it('removes a scheduled setImmediate', function() {
            var async = new Async();
            var callback = sinon.spy();
            var id = async.setImmediate(callback);
            async.clearImmediate(id);
            clock.tick(1);
            expect(callback.calledOnce).to.be.false;
        });
    });

    describe('throttle()', function() {

        it('executes a called function', function() {
            var async = new Async();
            var spy = sinon.spy();
            var callback = async.throttle(spy, 10);
            callback();
            expect(spy.calledOnce).to.be.true;
        });

        it('passes arguments to original function', function() {
            var async = new Async();
            var spy = sinon.spy();
            var callback = async.throttle(spy, 10);
            callback(42);
            expect(spy.calledOnce).to.be.true;
            expect(spy.calledWith(42), "argument should be 42").to.be.true;
        });

        it('executes in the parent context', function() {
            var parent = {};
            var async = new Async(parent);
            var spy = sinon.spy();
            var callback = async.throttle(spy, 10, { leading: false });
            callback();
            clock.tick(10);
            expect(spy.calledOnce).to.be.true;
            expect(spy.thisValues[0]).to.equal(parent);
        });

        it('callback only executes once per wait period', function() {
            var async = new Async();
            var spy = sinon.spy();
            var callback = async.throttle(spy, 10);
            callback();
            callback();
            expect(spy.callCount).to.equal(1);
            clock.tick(10);
            expect(spy.callCount).to.equal(2);
        });

        it('callback schedules correctly', function() {
            var async = new Async();
            var spy = sinon.spy();
            var callback = async.throttle(spy, 10);
            callback();
            expect(spy.callCount).to.equal(1);
            clock.tick(5);
            callback();
            expect(spy.callCount).to.equal(1);
            clock.tick(5);
            expect(spy.callCount).to.equal(2);
        });

        it('ignores extra calls', function() {
            var async = new Async();
            var spy = sinon.spy();
            var callback = async.throttle(spy, 10);
            callback();
            callback();
            callback();
            callback();
            expect(spy.callCount).to.equal(1);
            clock.tick(10);
            expect(spy.callCount).to.equal(2);
        });

        it('respects leading = false', function() {
            var async = new Async();
            var spy = sinon.spy();
            var callback = async.throttle(spy, 10, { leading: false });
            callback();
            callback();
            expect(spy.callCount).to.equal(0);
            clock.tick(10);
            expect(spy.callCount).to.equal(1);
        });

        it('respects trailing = false', function() {
            var async = new Async();
            var spy = sinon.spy();
            var callback = async.throttle(spy, 10, { trailing: false });
            callback();
            callback();
            expect(spy.callCount).to.equal(1);
            clock.tick(10);
            expect(spy.callCount).to.equal(1);
        });

        it('wait = 0, leading = false', function() {
            var async = new Async();
            var spy = sinon.spy();
            var callback = async.throttle(spy, 0, { leading: false });
            callback();
            callback();
            expect(spy.callCount).to.equal(0);
            clock.tick(1);
            expect(spy.callCount).to.equal(1);
        });
    });

    describe('debounce()', function() {

        it('executes a called function', function() {
            var async = new Async();
            var spy = sinon.spy();
            var callback = async.debounce(spy, 10);
            callback();
            expect(spy.calledOnce).to.be.false;
            clock.tick(10);
            expect(spy.calledOnce).to.be.true;
        });

        it('passes arguments to original function', function() {
            var async = new Async();
            var spy = sinon.spy();
            var callback = async.debounce(spy, 10);
            callback(42);
            clock.tick(10);
            expect(spy.calledOnce).to.be.true;
            expect(spy.calledWith(42), "argument should be 42").to.be.true;
        });

        it('executes in the parent context', function() {
            var parent = {};
            var async = new Async(parent);
            var spy = sinon.spy();
            var callback = async.debounce(spy, 10);
            callback();
            clock.tick(10);
            expect(spy.calledOnce).to.be.true;
            expect(spy.thisValues[0]).to.equal(parent);
        });

        it('callback defers execution', function() {
            var async = new Async();
            var spy = sinon.spy();
            var callback = async.debounce(spy, 10);
            callback();
            expect(spy.callCount).to.equal(0);
            clock.tick(5);
            expect(spy.callCount).to.equal(0);
            callback();
            clock.tick(5); // 10
            expect(spy.callCount).to.equal(0);
            clock.tick(5); // 15
            expect(spy.callCount).to.equal(1);
        });

        it('ignores extra calls', function() {
            var async = new Async();
            var spy = sinon.spy();
            var callback = async.debounce(spy, 10);
            callback();
            callback();
            callback();
            callback();
            expect(spy.callCount).to.equal(0);
            clock.tick(10);
            expect(spy.callCount).to.equal(1);
        });

        it('honors maxWait', function() {
            var async = new Async();
            var spy = sinon.spy();
            var callback = async.debounce(spy, 11, { maxWait: 45 });
            callback();
            clock.tick(10);
            callback();
            clock.tick(10); // 20
            callback();
            clock.tick(10); // 30
            callback();
            clock.tick(10); // 40
            callback();
            expect(spy.callCount).to.equal(0);
            clock.tick(5); // 45
            expect(spy.callCount).to.equal(1);
        });

        it('leading = true, trailing = true', function() {
            var async = new Async();
            var spy = sinon.spy();
            var callback = async.debounce(spy, 10, { leading: true });
            callback();
            expect(spy.callCount).to.equal(1);
            callback();
            expect(spy.callCount).to.equal(1);
            clock.tick(10);
            expect(spy.callCount).to.equal(2);
        });

        it('leading = true, trailing = false', function() {
            var async = new Async();
            var spy = sinon.spy();
            var callback = async.debounce(spy, 10, { leading: true, trailing: false });
            callback();
            expect(spy.callCount).to.equal(1);
            clock.tick(10);
            expect(spy.callCount).to.equal(1);
        });

        it('leading = true, trailing = false handles multiple calls', function() {
            var async = new Async();
            var spy = sinon.spy();
            var callback = async.debounce(spy, 10, { leading: true, trailing: false });
            callback();
            callback();
            expect(spy.callCount).to.equal(1);
            clock.tick(5);
            callback();
            expect(spy.callCount).to.equal(1);
            clock.tick(5);
            expect(spy.callCount).to.equal(1);
            clock.tick(5);
            expect(spy.callCount).to.equal(1);
            callback();
            expect(spy.callCount).to.equal(2);
        });

        it('re-entrant callback', function() {
            var async = new Async();
            var callCount = 0;
            var debounced;
            function callback() {
                callCount++;
                if (callCount === 1) {
                    debounced();
                }
            }
            debounced = async.debounce(callback, 10);
            debounced();
            expect(callCount).to.equal(0);
            clock.tick(10);
            expect(callCount).to.equal(1);
            clock.tick(10);
            expect(callCount).to.equal(2);
        });

        it('ignores maxWait between calls', function() {
            var async = new Async();
            var spy = sinon.spy();
            var callback = async.debounce(spy, 10, { maxWait: 50});
            callback();
            clock.tick(10);
            expect(spy.callCount).to.equal(1);
            clock.tick(50); // go past maxWait
            callback();
            expect(spy.callCount).to.equal(1);
            clock.tick(10);
            expect(spy.callCount).to.equal(2);
        });

        it('ignores maxWait when never called', function() {
            var async = new Async();
            var spy = sinon.spy();
            var callback = async.debounce(spy, 10, { maxWait: 50});
            clock.tick(50);
            callback();
            expect(spy.callCount).to.equal(0);
            clock.tick(10);
            expect(spy.callCount).to.equal(1);
        });
    });

});
