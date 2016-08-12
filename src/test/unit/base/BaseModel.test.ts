
/// <reference path='../../../mocha/mocha.d.ts' />
/// <reference path='../../../chai/chai.d.ts' />
/// <reference path='../../../sinon/sinon.d.ts' />

import BaseModel = require('../../../odsp-shared/base/BaseModel');
import IBaseModelParams = require('../../../odsp-shared/base/IBaseModelParams');
import IBaseModelDependencies from '../../../odsp-shared/base/IBaseModelDependencies';
import { IDisposable } from '@ms/odsp-utilities/lib/interfaces/IDisposable';
import Async from '@ms/odsp-utilities/lib/async/Async';
import EventGroup from '@ms/odsp-utilities/lib/events/EventGroup';
import Promise from '@ms/odsp-utilities/lib/async/Promise';
import Signal from '@ms/odsp-utilities/lib/async/Signal';
import ko = require('knockout');
import * as sinon from 'sinon';
import { expect } from 'chai';

class Example extends BaseModel {
    public baseAsync: Async;
    public baseEvents: EventGroup;

    constructor(params: IBaseModelParams = {}, dependencies: IBaseModelDependencies = {}) {
        super(params, dependencies);

        this.baseAsync = this.async;
        this.baseEvents = this.events;
    }

    public baseAddDisposable(instance: IDisposable) {
        return this.addDisposable(instance);
    }

    public baseTrackPromise<T>(promise: Promise<T>) {
        return this.trackPromise(promise);
    }

    public baseWrapObservable<T>(value: T | KnockoutObservable<T>) {
        return this.wrapObservable(value);
    }

    public basePeekUnwrapObservable<T>(possibleObservable: T | KnockoutObservable<T>) {
        return this.peekUnwrapObservable(possibleObservable);
    }

    public baseCreateBackgroundComputed(callback: () => void) {
        return this.createBackgroundComputed(callback);
    }
}

describe('BaseModel', () => {
    let model: Example;
    let lastSetImmediateCallback: () => void;
    let lastSetImmediateOwner: any;

    beforeEach(() => {
        let getAsync = (owner: any) => {
            let async: Async = <any>{
                setImmediate: (callback: () => void) => {
                    lastSetImmediateCallback = callback;
                    lastSetImmediateOwner = owner;
                }
            };

            return async;
        };

        let asyncType: typeof Async = <any>((owner: any) => getAsync(owner));

        model = new Example({}, {
            Async: asyncType
        });
    });

    describe('#resources', () => {
        it('is not set by default', () => {
            expect(model.resources).not.to.be.ok;
        });
    });

    describe('#events', () => {
        it('exists', () => {
            expect(model.baseEvents).to.be.ok;
        });
    });

    describe('#async', () => {
        it('exists', () => {
            expect(model.baseAsync).to.be.ok;
        });
    });

    describe('#addDisposable', () => {
        let disposeStub: SinonStub;

        let child: IDisposable;

        beforeEach(() => {
            disposeStub = sinon.stub();

            child = {
                dispose: disposeStub
            };

            model.baseAddDisposable(child);
        });

        it('ensures child is disposed when parent is disposed', () => {
            model.dispose();

            expect(disposeStub.calledOnce).to.be.true;
        });

        it('ensures child is disposed only once', () => {
            child.dispose();

            model.dispose();

            expect(disposeStub.calledOnce).to.be.true;
        });
    });

    describe('#trackPromise', () => {
        let cancelStub: SinonStub;

        let signal: Signal<void>;
        let promise: Promise<void>;

        beforeEach(() => {
            cancelStub = sinon.stub();

            signal = new Signal<void>(cancelStub);
            promise = signal.getPromise();
        });

        it('cancels promise on disposal', () => {
            model.baseTrackPromise(promise);

            expect(cancelStub.called).to.be.false;

            model.dispose();

            expect(cancelStub.calledOnce).to.be.true;
        });

        it('does not cancel completed promise', () => {
            model.baseTrackPromise(promise);

            signal.complete();
            model.dispose();

            expect(cancelStub.called).to.be.false;
        });

        it('does not cancel failed promise', () => {
            model.baseTrackPromise(promise);

            signal.error();
            model.dispose();

            expect(cancelStub.called).to.be.false;
        });

        it('does not cancel canceled promise', () => {
            model.baseTrackPromise(promise);

            promise.cancel();
            model.dispose();

            expect(cancelStub.calledOnce).to.be.true;
        });
    });

    describe('#managed', () => {
        let disposeStub: SinonStub;
        let fakeInstance: any;
        let fakeType: any;

        beforeEach(() => {
            disposeStub = sinon.stub();

            fakeInstance = <any>{
                dispose: disposeStub
            };

            let fakeTypeStub = sinon.stub();
            fakeTypeStub.returns(fakeInstance);

            fakeType = <any>fakeTypeStub;
        });

        describe('normal', () => {
            it('creates the correct instance', () => {
                let instance = new (model['managed'](fakeType))();

                expect(instance).to.equal(fakeInstance);
            });

            it('disposes the instance', () => {
                new (model['managed'](fakeType))();

                model.dispose();

                expect(disposeStub.called).to.be.true;
            });
        });
    });

    describe('#wrapObservable', () => {
        it('should create an observable from a non-observable passed in', () => {
            let value = 'hello world';
            let newObservable = model.baseWrapObservable(value);

            expect(ko.isObservable(newObservable)).to.be.true;
        });

        it('should return the observable passed in', () => {
            let value = ko.observable('hello world');
            let sameObservable = model.baseWrapObservable(value);

            expect(sameObservable).to.equal(value);
        });
    });

    describe('#peekUnwrapObservable', () => {
        it('should return the unwrapped value of an observable passed in', () => {
            let expectedString = 'hello world';
            let value = ko.observable(expectedString);
            let peekedValue = model.basePeekUnwrapObservable(value);

            expect(peekedValue).to.equal(expectedString);
        });

        it('should return the value of a non-observable passed in', () => {
            let expectedString = 'hello world';
            let peekedValue = model.basePeekUnwrapObservable(expectedString);

            expect(peekedValue).to.equal(expectedString);
        });
    });

    describe('#createBackgroundComputed', () => {
        it('respects async dependency', () => {
            let callback = sinon.stub();

            model.baseCreateBackgroundComputed(callback);

            expect(callback.called).to.be.false;

            lastSetImmediateCallback.call(lastSetImmediateOwner);

            expect(callback.called).to.be.true;
        });
    });
});
