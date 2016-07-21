
import { hook } from '../../../odsp-utilities/disposable/Disposable';

import * as sinon from 'sinon';
import { expect } from 'chai';

describe('Disposable', () => {
    describe('#hook', () => {
        it('makes an object disposable', () => {
            let test = {};

            let dispose = sinon.stub();

            let testDispoable = hook(test, dispose);

            testDispoable.dispose();

            expect(dispose.called).to.be.true;
        });
    });
});
