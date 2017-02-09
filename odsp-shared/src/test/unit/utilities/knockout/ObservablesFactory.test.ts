
import ObservablesFactory, { isObservable, peekUnwrap, unwrap } from '../../../../odsp-shared/utilities/knockout/ObservablesFactory';
import Async from '@ms/odsp-utilities/lib/async/Async';
import ko = require('knockout');
import * as sinon from 'sinon';
import { expect } from 'chai';

describe('ObservablesFactory', () => {
    let observablesFactory: ObservablesFactory;

    let owner: {};

    let lastAsyncCallback: () => void;

    function invokeLastAsyncCallback() {
        lastAsyncCallback.call(observablesFactory);
    }

    beforeEach(() => {
        owner = {};

        let async: Async = <any>{
            setImmediate: (callback: () => void) => {
                lastAsyncCallback = callback;
            }
        };

        let asyncType: new (owner: any) => Async = <any>(() => async);

        observablesFactory = new ObservablesFactory({
            owner: owner
        }, {
            asyncType: asyncType
        });
    });

    describe('#create', () => {
        it('creates an observable', () => {
            expect(ko.isObservable(observablesFactory.create<void>())).to.be.true;
        });
    });

    describe('#compute', () => {
        it('creates an observable', () => {
            expect(ko.isObservable(observablesFactory.compute(sinon.stub()))).to.be.true;
        });

        it('evaluates synchronously', () => {
            let callback = sinon.stub();

            observablesFactory.compute(callback);

            expect(callback.called).to.be.true;
        });
    });

    describe('#pureCompute', () => {
        it('creates an observable', () => {
            expect(ko.isObservable(observablesFactory.pureCompute(sinon.stub()))).to.be.true;
        });

        it('does not evaluate synchronously', () => {
            let callback = sinon.stub();

            observablesFactory.pureCompute(callback);

            expect(callback.called).to.be.false;
        });
    });

    describe('#backgroundCompute', () => {
        it('creates an observable', () => {
            expect(ko.isObservable(observablesFactory.backgroundCompute(sinon.stub()))).to.be.true;
        });

        it('does not evaluate synchronously', () => {
            let callback = sinon.stub();

            observablesFactory.backgroundCompute(callback);

            expect(callback.called).to.be.false;
        });

        it('evaluates on an immediate callback', () => {
            let callback = sinon.stub();

            observablesFactory.backgroundCompute(callback);

            invokeLastAsyncCallback();

            expect(callback.called).to.be.true;
        });
    });

    describe('#isObservable', () => {
        it('is true for an observable', () => {
            expect(isObservable(ko.observable<void>())).to.be.true;
        });

        it('is false for an object', () => {
            expect(isObservable({})).to.be.false;
        });
    });

    describe('#unwrap', () => {
        it('unwraps an observable', () => {
            let dependency = observablesFactory.create(10);
            let computed = observablesFactory.compute(() => {
                return unwrap(dependency);
            });

            expect(computed()).to.equal(10);
            expect(computed.getDependenciesCount()).to.equal(1);
        });
    });

    describe('#peekUnwrap', () => {
        it('unwraps and peeks an observable', () => {
            let dependency = observablesFactory.create(10);
            let computed = observablesFactory.compute(() => {
                return peekUnwrap(dependency);
            });

            expect(computed.peek()).to.equal(10);
            expect(computed.getDependenciesCount()).to.equal(0);
        });
    });

    describe('#wrap', () => {
        it('wraps an observable', () => {
            let observable = observablesFactory.wrap(1);

            expect(ko.isObservable(observable)).to.be.true;
            expect(observable.peek()).to.equal(1);
        });
    });
});
