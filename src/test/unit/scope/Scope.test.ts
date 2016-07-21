
import Scope from '../../../odsp-utilities/scope/Scope';
import IDisposable from '../../../odsp-utilities/disposable/IDisposable';
import * as sinon from 'sinon';
import { expect } from 'chai';

describe('Scope', () => {
    let scope: Scope;

    beforeEach(() => {
        scope = new Scope();
    });

    describe('#attach', () => {
        it('adds an object to be disposed', () => {
            let dispose = sinon.stub();

            let object = {
                dispose: dispose
            };

            scope.attach(object);

            scope.dispose();

            expect(dispose.called).to.be.true;
        });
    });

    describe('#attached', () => {
        it('creates an attached instance', () => {
            let dispose = sinon.stub();

            let object: IDisposable = {
                dispose: dispose
            };

            let type: new () => IDisposable = <any>(() => object);

            let instance = new (scope.attached(type));

            expect(instance).to.equal(object);

            scope.dispose();

            expect(dispose.called).to.be.true;
        });
    });

    describe('#isDisposed', () => {
        it('is true after disposal', () => {
            scope.dispose();

            expect(scope.isDisposed).to.be.true;
        });
    });
});
