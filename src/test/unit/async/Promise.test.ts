import chai = require("chai");
import Promise from '../../../odsp-utilities/async/Promise';

/* tslint:disable:ban-native-functions */
var expect = chai.expect;
var assert = chai.assert;

describe('Promise', function() {

    describe('cancel()', function() {

        it('cancels a promise chain', function(done: () => void) {
            var executedFirst = false;
            var executedSecond = false;

            var p = new Promise(function (complete: (result?: any) => void, error: () => void) {
                setTimeout(function() {
                    console.log('Completed original promise execution.');
                    complete();
                }, 500);
            });

            p = p.then(function() {
                executedFirst = true;
                console.log('Finishing first then callback.');
            })
            .then(function () {
                return Promise.timeout(500);
            })
            .then(function() {
                console.log('Finishing second then. This should not hit.');
                executedSecond = true;
            });

            setTimeout(function() {
                console.log('Canceling promise.');
                p.cancel();
            }, 750);

            setTimeout(function() {
                console.log('Evaluating promise then calls.');
                expect(executedFirst).to.equal(true);
                expect(executedSecond).to.equal(false);
                done();
            }, 1100);
        });
    });

    describe("PromiseOfNumberThen", function () {
        it('complete callback returns a number', function (done: () => void) {
            var p = new Promise<number>(function (complete: (result?: number) => void, error: () => void) {
                setTimeout(function () {
                    complete(3);
                }, 50);
            });

            p.then(function (value: number) {
                expect(value).to.equal(3);
                done();
            });
        });
    });

    describe("PromiseOfStringDone", function () {
        it('complete callback returns a number', function (done: () => void) {
            var p = new Promise<string>(function (complete: (result?: string) => void, error: () => void) {
                setTimeout(function () {
                    complete("hi");
                }, 50);
            });

            p.done(function (value: string) {
                expect(value).to.equal("hi");
                done();
            });
        });
    });

    describe("PromiseWithError", function () {
        it('should invoke the error callback', function (done: () => void) {
            var p = new Promise<string>(function (complete: (result?: string) => void, error: (info: string) => void) {
                setTimeout(function () {
                    error("very bad error");
                }, 0);
            });

            p.done(function (value: string) {
                // success does not get called
                expect(true).to.equal(false);
                done();
            }, function (info: any) {
                expect(info).to.equal("very bad error");
                done();
            });
        });
    });

    describe("wrap()", function () {
        it('should invoke the success callback passing the data', function (done: () => void) {
            var p = Promise.wrap(2);
            p.then((result?: any) => {
                expect(result).to.equal(2);
                p.done((result2: any) => {
                    expect(result2).to.equal(2);
                    done();
                });
            });
        });
    });

    describe('all()', function () {
        it('wait untill all promises complete', function (done: () => void) {
            var firstPromiseComplete = false;
            var secondPromiseComplete = false;

            var p1 = new Promise(function (complete: (result?: any) => void, error: () => void) {
                setTimeout(function () {
                    firstPromiseComplete = true;
                    complete();
                }, 500);
            });

            var p2 = new Promise(function (complete: (result?: any) => void, error: () => void) {
                setTimeout(function () {
                    secondPromiseComplete = true;
                    complete();
                }, 800);
            });

            Promise.all([p1, p2]).then(function () {
                expect(firstPromiseComplete).to.equal(true);
                expect(secondPromiseComplete).to.equal(true);
                done();
            });
        });

        it('should return falsey values in chains', (done: () => void) => {
            var returnsUndefined = new Promise(function (complete: (result?: any) => void, error: () => void) {
                setTimeout(function () {
                    complete(undefined);
                }, 100);
            }).then((result: any) => {
                return result;
            });

            var returnsNull = new Promise(function (complete: (result?: any) => void, error: () => void) {
                setTimeout(function () {
                    complete(null);
                }, 100);
            }).then((result: any) => {
                return result;
            });

            var returnsFalse = new Promise(function (complete: (result?: any) => void, error: () => void) {
                setTimeout(function () {
                    complete(false);
                }, 200);
            }).then((result: any) => {
                return result;
            });

            var returnsZero = new Promise(function (complete: (result?: any) => void, error: () => void) {
                setTimeout(function () {
                    complete(0);
                }, 200);
            }).then((result: any) => {
                return result;
            });

            Promise.all([returnsUndefined, returnsNull, returnsFalse, returnsZero]).then((results?: any[]) => {
                assert.strictEqual(results[0], undefined);
                assert.strictEqual(results[1], null);
                assert.strictEqual(results[2], false);
                assert.strictEqual(results[3], 0);
                done();
            });
        });
    });

    describe('chaining promises', function () {
        it('should return new wrapped value if modified on then callback', function (done: () => void) {

            var p1 = new Promise<number>((complete: (result?: number) => void, error: () => void) => {
                setTimeout(function () {
                    complete(1);
                }, 500);
            });

            var p2 = p1.then((result?: number) => {
                return result * 10;
            });

            p2.then((result: number) => {
                expect(result).to.equal(10);
                done();
            });
        });
        it('should return new promise if modified on then callback', function (done: () => void) {

            var p1 = new Promise<number>((complete: (result?: number) => void, error: () => void) => {
                setTimeout(function () {
                    complete(1);
                }, 500);
            });

            var p2 = p1.then((result?: number) => {
                return Promise.wrap(result * 10);
            });

            p2.then((result: number) => {
                expect(result).to.equal(10);
                done();
            });
        });
    });

    describe('Promise.serial', function() {
        it('should execute tasks in order', function(done: () => void) {
            var tasks = [];
            var count = 0;
            tasks.push(() => {
                expect(count).to.equal(0);
                count++;
            });
            tasks.push(() => {
                expect(count).to.equal(1);
                count++;
            });
            tasks.push(() => {
                expect(count).to.equal(2);
                count++;
            });

            Promise.serial(tasks).then(() => {
                expect(count).to.equal(3);
            }).done(done, done);
        });
    });
});