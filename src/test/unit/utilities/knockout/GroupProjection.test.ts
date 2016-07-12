
/// <reference path='../../../../mocha/mocha.d.ts' />
/// <reference path='../../../../chai/chai.d.ts' />

import ko = require('knockout');
import GroupProjection = require('../../../../odsp-shared/utilities/knockout/GroupProjection');
import IGrouping = require('../../../../odsp-shared/utilities/knockout/IGrouping');
import chai = require('chai');

var expect = chai.expect;

interface IKeyedValue {
    key: KnockoutObservable<string>;
    value: number;
}

describe('GroupProjection', () => {
    var source: KnockoutObservableArray<IKeyedValue>;

    beforeEach(() => {
        source = ko.observableArray([
            {
                key: ko.observable('a'),
                value: 1
            },
            {
                key: ko.observable('b'),
                value: 2
            },
            {
                key: ko.observable('c'),
                value: 3
            }
        ]);
    });

    describe('#group', () => {
        var target: KnockoutObservableArray<IGrouping<string, IKeyedValue>>;

        beforeEach(() => {
            target = GroupProjection.group(source, (item: IKeyedValue) => item.key());
        });

        it('creates an item per key', () => {
            expect(target().length).to.equal(3);

            var group1 = target()[0];
            expect(group1.key).to.equal('a');
            expect(group1.values().length).to.equal(1);

            var group2 = target()[1];
            expect(group2.key).to.equal('b');
            expect(group2.values().length).to.equal(1);

            var group3 = target()[2];
            expect(group3.key).to.equal('c');
            expect(group3.values().length).to.equal(1);
        });

        it('removes an item when a key goes away', () => {
            // Remove item with key 'b'.
            source.splice(1, 1);

            var group3 = target()[1];
            expect(group3.key).to.equal('c');
            expect(group3.values().length).to.equal(1);
        });

        it('adds new keys for new items', () => {
            source.push({
                key: ko.observable('d'),
                value: 4
            });

            var group4 = target()[3];
            expect(group4.key).to.equal('d');
            expect(group4.values().length).to.equal(1);
        });

        it('adds new items to existing key', () => {
            source.push({
                key: ko.observable('b'),
                value: 4
            });

            var group2 = target()[1];
            expect(group2.values().length).to.equal(2);
        });

        it('remaps item when key changes', () => {
            source()[1].key('d');

            var group2 = target()[1];
            expect(group2.key).to.equal('c');

            var group3 = target()[2];
            expect(group3.key).to.equal('d');
            expect(group3.values().length).to.equal(1);
        });
    });
});
