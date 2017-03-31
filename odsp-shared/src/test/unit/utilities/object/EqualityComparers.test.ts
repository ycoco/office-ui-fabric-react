import {
    objectStrictEquality,
    objectShallowEquality,
    arrayStrictEquality
} from '../../../../odsp-shared/utilities/object/EqualityComparers';
import { expect } from 'chai';

describe('EqualityComparers', () => {
    it('#objectStrictEquality', () => {
        const x = {};
        const y = [];
        expect(objectStrictEquality(x, x)).to.equal(true);
        expect(objectStrictEquality(y, y)).to.equal(true);
        expect(objectStrictEquality(2, 2)).to.equal(true);
        expect(objectStrictEquality(undefined, undefined)).to.equal(true);
        expect(objectStrictEquality(null, null)).to.equal(true);
        expect(objectStrictEquality('', '')).to.equal(true);
        expect(objectStrictEquality('a', 'a')).to.equal(true);
        expect(objectStrictEquality(true, true)).to.equal(true);
        expect(objectStrictEquality(false, false)).to.equal(true);

        expect(objectStrictEquality(x, y)).to.equal(false);
        expect(objectStrictEquality(x, null)).to.equal(false);
        expect(objectStrictEquality(y, null)).to.equal(false);

        expect(objectStrictEquality(NaN, NaN)).to.equal(NaN === NaN);
        expect(objectStrictEquality({}, {})).to.equal({} === {});
        expect(objectStrictEquality([], [])).to.equal([] === []);

        expect(objectStrictEquality(undefined, 0)).to.equal(false);
        expect(objectStrictEquality(undefined, null)).to.equal(false);
        expect(objectStrictEquality(undefined, '')).to.equal(false);
        expect(objectStrictEquality(undefined, false)).to.equal(false);

        expect(objectStrictEquality(null, 0)).to.equal(false);
        expect(objectStrictEquality(null, undefined)).to.equal(false);
        expect(objectStrictEquality(null, '')).to.equal(false);
        expect(objectStrictEquality(null, false)).to.equal(false);

        expect(objectStrictEquality(0, null)).to.equal(false);
        expect(objectStrictEquality(0, undefined)).to.equal(false);
        expect(objectStrictEquality(0, '')).to.equal(false);
        expect(objectStrictEquality(0, false)).to.equal(false);

        expect(objectStrictEquality('', 0)).to.equal(false);
        expect(objectStrictEquality('', null)).to.equal(false);
        expect(objectStrictEquality('', undefined)).to.equal(false);
        expect(objectStrictEquality('', false)).to.equal(false);

        expect(objectStrictEquality(false, 0)).to.equal(false);
        expect(objectStrictEquality(false, null)).to.equal(false);
        expect(objectStrictEquality(false, undefined)).to.equal(false);
        expect(objectStrictEquality(false, '')).to.equal(false);

        expect(objectStrictEquality(2, 3)).to.equal(false);
        expect(objectStrictEquality('a', 'b')).to.equal(false);
        expect(objectStrictEquality({ a: 0 }, { a: 1 })).to.equal(false);
    });

    describe.skip('#objectShallowEquality', () => {
        it('matches behavior of objectStrictEquality for primitives', () => {
            expect(objectShallowEquality(2, 2)).to.equal(true);
            expect(objectShallowEquality(undefined, undefined)).to.equal(true);
            expect(objectShallowEquality(null, null)).to.equal(true);
            expect(objectShallowEquality('', '')).to.equal(true);
            expect(objectShallowEquality('a', 'a')).to.equal(true);
            expect(objectShallowEquality(true, true)).to.equal(true);
            expect(objectShallowEquality(false, false)).to.equal(true);

            expect(objectShallowEquality(NaN, NaN)).to.equal(NaN === NaN);

            expect(objectShallowEquality(undefined, 0)).to.equal(false);
            expect(objectShallowEquality(undefined, null)).to.equal(false);
            expect(objectShallowEquality(undefined, '')).to.equal(false);
            expect(objectShallowEquality(undefined, false)).to.equal(false);

            expect(objectShallowEquality(null, 0)).to.equal(false);
            expect(objectShallowEquality(null, undefined)).to.equal(false);
            expect(objectShallowEquality(null, '')).to.equal(false);
            expect(objectShallowEquality(null, false)).to.equal(false);

            expect(objectShallowEquality(0, null)).to.equal(false);
            expect(objectShallowEquality(0, undefined)).to.equal(false);
            expect(objectShallowEquality(0, '')).to.equal(false);
            expect(objectShallowEquality(0, false)).to.equal(false);

            expect(objectShallowEquality('', 0)).to.equal(false);
            expect(objectShallowEquality('', null)).to.equal(false);
            expect(objectShallowEquality('', undefined)).to.equal(false);
            expect(objectShallowEquality('', false)).to.equal(false);

            expect(objectShallowEquality(false, 0)).to.equal(false);
            expect(objectShallowEquality(false, null)).to.equal(false);
            expect(objectShallowEquality(false, undefined)).to.equal(false);
            expect(objectShallowEquality(false, '')).to.equal(false);

            expect(objectShallowEquality(2, 3)).to.equal(false);
            expect(objectShallowEquality('a', 'b')).to.equal(false);
        });

        it('handles objects with matching keys', () => {
            const x = {};
            expect(objectShallowEquality({}, {})).to.equal(true);
            expect(objectShallowEquality([], [])).to.equal(true);
            expect(objectShallowEquality([1], [1])).to.equal(true);
            expect(objectShallowEquality({ a: 1 }, { a: 1 })).to.equal(true);
            expect(objectShallowEquality({ a: {} }, { a: {} })).to.equal(false);
            expect(objectShallowEquality({ a: x }, { a: x })).to.equal(true);
            expect(objectShallowEquality({ a: x, b: 1 }, { b: 1, a: x })).to.equal(true);
            expect(objectShallowEquality({ a: 1 }, { a: 2 })).to.equal(false);
        });

        it('handles objects with non-matching keys', () => {
            expect(objectShallowEquality({ a: 1 }, {})).to.equal(false);
            expect(objectShallowEquality({ a: 1 }, { a: 1, b: 2 })).to.equal(false);
        });

        it('handles undefined properties', () => {
            expect(objectShallowEquality({}, { a: undefined })).to.equal(true);
        });

        it('handles recursive objects', () => {
            const x = {};
            x[0] = x;
            expect(objectShallowEquality([1], x)).to.equal(false);
            expect(objectShallowEquality(x, [x])).to.equal(true);
        });
    });

    describe('#arrayStrictEquality', () => {
        it('matches behavior of objectStrictEquality for primitives', () => {
            expect(arrayStrictEquality(undefined, undefined)).to.equal(true);
            expect(arrayStrictEquality(null, null)).to.equal(true);

            expect(arrayStrictEquality(undefined, null)).to.equal(false);
            expect(arrayStrictEquality(null, undefined)).to.equal(false);
        });

        it('handles objects with matching keys', () => {
            const x = [];
            x[6] = true;
            expect(arrayStrictEquality([], [])).to.equal(true);
            expect(arrayStrictEquality([1], [1])).to.equal(true);
            expect(arrayStrictEquality([x], [x])).to.equal(true);
            expect(arrayStrictEquality([{}], [{}])).to.equal(false);
        });

        it('handles objects with non-matching keys', () => {
            expect(arrayStrictEquality([1], [])).to.equal(false);
            expect(arrayStrictEquality([1], [1, 2])).to.equal(false);
        });

        it('handles recursive objects', () => {
            const x = [];
            x[0] = x;
            expect(arrayStrictEquality([1], x)).to.equal(false);
            expect(arrayStrictEquality(x, [x])).to.equal(true);
        });
    });
});