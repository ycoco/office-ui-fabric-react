
import ObservablesFactory from '../../../../odsp-shared/utilities/knockout/ObservablesFactory';
import ko = require('knockout');
import * as sinon from 'sinon';
import { expect } from 'chai';

describe('ObservablesFactory', () => {
    let observablesFactory: ObservablesFactory;

    let owner: {};

    beforeEach(() => {
        owner = {};

        observablesFactory = new ObservablesFactory({
            owner: owner
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
    });

    describe('#pureCompute', () => {
        it('creates an observable', () => {
            expect(ko.isObservable(observablesFactory.pureCompute(sinon.stub()))).to.be.true;
        });
    });

    describe('#backgroundCompute', () => {
        it('creates an observable', () => {
            expect(ko.isObservable(observablesFactory.backgroundCompute(sinon.stub()))).to.be.true;
        });
    });

    describe('#isObservable', () => {
        it('is true for an observable', () => {
            expect(observablesFactory.isObservable(ko.observable<void>())).to.be.true;
        });

        it('is false for an object', () => {
            expect(observablesFactory.isObservable({})).to.be.false;
        });
    });

    describe('#unwrap', () => {
        it('unwraps an observable', () => {
            let dependency = observablesFactory.create(10);
            let computed = observablesFactory.compute(() => {
                return observablesFactory.unwrap(dependency);
            });

            expect(computed.getDependenciesCount()).to.equal(1);
            expect(computed()).to.equal(10);
        });
    });

    describe('#peekUnwrap', () => {
        it('unwraps and peeks an observable', () => {
            let dependency = observablesFactory.create(10);
            let computed = observablesFactory.compute(() => {
                return observablesFactory.peekUnrap(dependency);
            });

            expect(computed.getDependenciesCount()).to.equal(0);
            expect(computed.peek()).to.equal(10);
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
