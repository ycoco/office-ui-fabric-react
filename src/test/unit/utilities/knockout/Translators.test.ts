import Translators = require('../../../../odsp-shared/utilities/knockout/Translators');
import EqualityComparsers = require('../../../../odsp-shared/utilities/object/EqualityComparers');
import ko = require('knockout');
import chai = require('chai');

var expect = chai.expect;

describe('Translators', () => {
    describe('#replicateArray', () => {
        var source: KnockoutObservableArray<{}>;
        var target: KnockoutObservableArray<{}>;
        let targetArray: {}[];

        var item1: {};
        var item2: {};
        var item3: {};

        var changeCount: number;

        var subscriptions: KnockoutSubscription[];

        beforeEach(() => {
            subscriptions = [];

            source = ko.observableArray<{}>();
            target = ko.observableArray<{}>();
            targetArray = target.peek();

            item1 = { a: 1 };
            item2 = { a: 2 };
            item3 = { a: 3 };

            source.push(item1, item2, item3);
            changeCount = 0;

            subscriptions.push(Translators.replicateArray(source, target));

            subscriptions.push(target.subscribe(() => changeCount++));
        });

        afterEach(() => {
            if (subscriptions) {
                subscriptions.forEach((subscription: KnockoutSubscription) => subscription.dispose());
                subscriptions = null;
            }
        });

        it('preserves target array', () => {
            expect(target.peek()).to.equal(targetArray);
        });

        it('copies source into target at start', () => {
            expect(EqualityComparsers.arrayStrictEquality(source.peek(), target.peek())).to.be.true;

            expect(changeCount).to.equal(0);
        });

        it('replicates addition', () => {
            source.splice(1, 0, {});

            expect(EqualityComparsers.arrayStrictEquality(source.peek(), target.peek())).to.be.true;

            expect(changeCount).to.equal(1);
        });

        it('replicates removal', () => {
            source.splice(1, 1);

            expect(EqualityComparsers.arrayStrictEquality(source.peek(), target.peek())).to.be.true;

            expect(changeCount).to.equal(1);
        });

        it('replicates moving', () => {
            var sourceArray = source();
            source([sourceArray[2], sourceArray[1], sourceArray[0]]);

            expect(target.peek()).to.deep.equal(source.peek());

            expect(changeCount).to.equal(1);
        });

        it('is agnostic to change order', () => {
            let item4: {} = { a: 4 };
            let item5: {} = { a: 5 };
            let item6: {} = { a: 6 };
            let item7: {} = { a: 7 };

            source([item5, item6, item7, item2, item4, item3]);

            expect(target.peek()).to.deep.equal(source.peek());

            expect(changeCount).to.equal(1);
        });

        it('replicates reduction', () => {
            let item4: {} = { a: 4 };

            source([item4]);

            expect(target.peek()).to.deep.equal(source.peek());

            expect(changeCount).to.equal(1);
        });
    });
});
