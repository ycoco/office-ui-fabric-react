
/// <reference path='../../../mocha/mocha.d.ts' />
/// <reference path='../../../chai/chai.d.ts' />
/// <reference path='../../../sinon/sinon.d.ts' />

import BaseModel = require('odsp-shared/base/BaseModel');
import IDisposable = require('odsp-shared/base/IDisposable');
import Async = require('odsp-utilities/async/Async');
import EventGroup = require('odsp-utilities/events/EventGroup');
import Promise from 'odsp-utilities/async/Promise';
import Signal = require('odsp-utilities/async/Signal');
import sinon = require('sinon');
import { expect } from 'chai';

class Example extends BaseModel {
    public baseAsync: Async;
    public baseEvents: EventGroup;

    constructor() {
        super();

        this.baseAsync = this.async;
        this.baseEvents = this.events;
    }

    public baseAddDisposable(instance: IDisposable) {
        return this.addDisposable(instance);
    }

    public baseTrackPromise<T>(promise: Promise<T>) {
        return this.trackPromise(promise);
    }
}

describe('BaseModel', () => {
    let model: Example;

    beforeEach(() => {
        model = new Example();
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

        if (BaseModel.prototype['managed_min']) {
            describe('minified', () => {
                it('creates the correct instance', () => {
                    let instance = new (model['managed_min'](fakeType))();

                    expect(instance).to.equal(fakeInstance);
                });

                it('disposes the instance', () => {
                    new (model['managed_min'](fakeType))();

                    model.dispose();

                    expect(disposeStub.called).to.be.true;
                });
            });
        }
    });
});
