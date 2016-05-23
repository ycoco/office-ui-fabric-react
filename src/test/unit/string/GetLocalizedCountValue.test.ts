/// <reference path="../../../chai/chai.d.ts" />
/// <reference path="../../../mocha/mocha.d.ts" />

import chai = require('chai');
import { getLocalizedCountValue } from 'odsp-utilities/string/StringHelper';

const expect = chai.expect;

describe("getLocalizedCountValue", () => {
    it('can handle single intervals', () => {
        expect(getLocalizedCountValue('a', '0-', 5)).to.equal('a');
    });

    it('can handle multiple intervals (basic english scenario)', () => {
        expect(getLocalizedCountValue('items||item||items', '0||1||2-', 0)).to.equal('items');
    });

    it('can handle range syntax (using - symbol)', () => {
        expect(getLocalizedCountValue('few items||some items||lots of items', '0-4||5-9||10-', 6)).to.equal('some items');
    });

    it('respects precedence rules', () => {
        expect(getLocalizedCountValue('items||item||items', '0||5||1-', 5)).to.equal('item');
    });

    it('handles czech style rules correctly', () => {
        let parts = 'a||b||c';
        let intervals = '1||2-4||0,5-';

        expect(getLocalizedCountValue(parts, intervals, 2)).to.equal('b');
        expect(getLocalizedCountValue(parts, intervals, 0)).to.equal('c');
        expect(getLocalizedCountValue(parts, intervals, 1)).to.equal('a');
    });

    it('handles wildcards core correctly', () => {
        {
            // all numbers ending with 1, 2, 3 to be of form b, except for 1,2,3 themselves, which are form a.
            // Everything else is form c.
            let parts = 'a||b||c';
            let intervals = '1,2,3||*1,*2,*3||0-';

            expect(getLocalizedCountValue(parts, intervals, 1)).to.equal('a');
            expect(getLocalizedCountValue(parts, intervals, 0)).to.equal('c');
            expect(getLocalizedCountValue(parts, intervals, 8)).to.equal('c');
            expect(getLocalizedCountValue(parts, intervals, 3)).to.equal('a');
            expect(getLocalizedCountValue(parts, intervals, 23)).to.equal('b');
            expect(getLocalizedCountValue(parts, intervals, 31)).to.equal('b');
            expect(getLocalizedCountValue(parts, intervals, 9391)).to.equal('b');
        }

        {
            // All numbers ending with 1 and preceded by {1, 2 or 3}, must be of style a. Otherwise b
            let parts = 'b||a||b';
            let intervals = '1,*01,*41,*51,*61,*71,*81,*91||*1,||0-';

            expect(getLocalizedCountValue(parts, intervals, 1)).to.equal('b');
            expect(getLocalizedCountValue(parts, intervals, 11)).to.equal('a');
            expect(getLocalizedCountValue(parts, intervals, 8)).to.equal('b');
            expect(getLocalizedCountValue(parts, intervals, 4231)).to.equal('a');
            expect(getLocalizedCountValue(parts, intervals, 4311)).to.equal('a');
            expect(getLocalizedCountValue(parts, intervals, 0)).to.equal('b');
            expect(getLocalizedCountValue(parts, intervals, 21)).to.equal('a');
            expect(getLocalizedCountValue(parts, intervals, 4141)).to.equal('b');
            expect(getLocalizedCountValue(parts, intervals, 81)).to.equal('b');
        }
    });

    it('handles handles edge cases of wildcards correctly', () => {
        {
            // 1, 11 , etc. returns a. everything else returns b.
            let parts = 'a||b';
            let intervals = '*1||0-';

            expect(getLocalizedCountValue(parts, intervals, 1)).to.equal('a');
            expect(getLocalizedCountValue(parts, intervals, 11)).to.equal('a');
            expect(getLocalizedCountValue(parts, intervals, 21)).to.equal('a');
            expect(getLocalizedCountValue(parts, intervals, 12)).to.equal('b');
        }

    });

    it('handles handles multi wildcard correctly', () => {
        {
            // multi-wildcard support
            let parts = 'a||b||c';
            let intervals = '2*1||*2*1||0-';

            expect(getLocalizedCountValue(parts, intervals, 21)).to.equal('a');
            expect(getLocalizedCountValue(parts, intervals, 201)).to.equal('a');
            expect(getLocalizedCountValue(parts, intervals, 2221)).to.equal('a');
            expect(getLocalizedCountValue(parts, intervals, 321)).to.equal('b');
            expect(getLocalizedCountValue(parts, intervals, 1221)).to.equal('b');
            expect(getLocalizedCountValue(parts, intervals, 12)).to.equal('c');
            expect(getLocalizedCountValue(parts, intervals, 1)).to.equal('c');
            expect(getLocalizedCountValue(parts, intervals, 213)).to.equal('c');
            expect(getLocalizedCountValue(parts, intervals, 0)).to.equal('c');
            expect(getLocalizedCountValue(parts, intervals, 2010)).to.equal('c');

        }
    });
});
