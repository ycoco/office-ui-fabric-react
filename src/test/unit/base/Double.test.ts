/// <reference path='../../../mocha/mocha.d.ts' />
/// <reference path='../../../chai/chai.d.ts' />

import Double from 'odsp-shared/base/Double';
import chai = require('chai');

const expect = chai.expect;

describe('Double', () => {
    const NOTHING = { High: 0, Low: 0 };

    it('parses hex string', () => {
        // Not a number
        expect(Double.fromHexString('hi')).to.eql(NOTHING, 'hi is not a number');
        expect(Double.fromHexString('hi', true /*defaultAll*/)).to.eql({ High: 0x7FFFFFFF, Low: 0x7FFFFFFF }, 'hi is not a number');

        // Partially not a number
        expect(Double.fromHexString('hi12345678')).to.eql(NOTHING, 'hi12345678 is not a number');
        expect(Double.fromHexString('12345678zzzzzzzz')).to.eql(NOTHING, '12345678zzzzzzzz is not a number');
        expect(Double.fromHexString('12345678abcdefgh')).to.eql(NOTHING, '12345678abcdefgh is not a hex number');

        // Small number (with or without prefix)
        expect(Double.fromHexString('0x')).to.eql(NOTHING);
        expect(Double.fromHexString('0x', true /*defaultAll*/)).to.eql(NOTHING);
        expect(Double.fromHexString('1')).to.eql({ High: 0, Low: 1 });
        expect(Double.fromHexString('1', true /*defaultAll*/)).to.eql({ High: 0, Low: 1 });
        expect(Double.fromHexString('0x1')).to.eql({ High: 0, Low: 1 });
        expect(Double.fromHexString('0x1234abc')).to.eql({ High: 0, Low: 0x1234abc });
        expect(Double.fromHexString('7FFFFFFF')).to.eql({ High: 0, Low: 0x7FFFFFFF });
        expect(Double.fromHexString('FFFFFFFF')).to.eql({ High: 0, Low: 0xFFFFFFFF });
        // with leading 0s
        expect(Double.fromHexString('0000000000abc')).to.eql({ High: 0, Low: 0xabc });
        expect(Double.fromHexString('0x00000000000001234abcd')).to.eql({ High: 0, Low: 0x1234abcd });

        // Big number (with or without prefix)
        expect(Double.fromHexString('0x100000000')).to.eql({ High: 1, Low: 0 });
        expect(Double.fromHexString('100000000')).to.eql({ High: 1, Low: 0 });
        expect(Double.fromHexString('0x1234abcd1234abcd')).to.eql({ High: 0x1234abcd, Low: 0x1234abcd });
        expect(Double.fromHexString('0x7FFFFFFF00000001')).to.eql({ High: 0x7FFFFFFF, Low: 1 });
        expect(Double.fromHexString('7FFFFFFF7FFFFFFF')).to.eql({ High: 0x7FFFFFFF, Low: 0x7FFFFFFF });
        expect(Double.fromHexString('FFFFFFFFFFFFFFFF')).to.eql({ High: 0xFFFFFFFF, Low: 0xFFFFFFFF });
        // with leading 0s
        expect(Double.fromHexString('0x0000abcd11111111')).to.eql({ High: 0xabcd, Low: 0x11111111 });

        // Too big (takes Low 16 digits)
        expect(Double.fromHexString('12341234abcd1234abcd')).to.eql({ High: 0x1234abcd, Low: 0x1234abcd });
    });

    // Workaround for lack of 0b... literals
    function fromBinary(values: string[]) {
        return { High: parseInt(values[0], 2), Low: parseInt(values[1], 2) };
    }

    function fromBinaryAll(valueses: Array<string[]>) {
        return valueses.map((values: string[]) => fromBinary(values));
    }

    it('does or correctly', () => {
        expect(Double.or(null)).to.eql(NOTHING, 'or 1');
        expect(Double.or([])).to.eql(NOTHING, 'or 2');
        expect(Double.or([ { High: 0x1234, Low: 0x5678 } ])).to.eql({ High: 0x1234, Low: 0x5678 }, 'or 3');
        expect(Double.or([
            { High: 0x1234, Low: 0x5678 },
            NOTHING
        ])).to.eql({ High: 0x1234, Low: 0x5678 }, 'or 4');
        expect(Double.or(fromBinaryAll([
            ['00000000000010000000000000000000', '00000000000000000000000010000000'],
            ['00000010000000000000000000000100', '00000100000000000000000000000110']
        ]))).to.eql(fromBinary(['00000010000010000000000000000100', '00000100000000000000000010000110']), 'or 5');
        expect(Double.or(fromBinaryAll([ // commutative
            ['00000010000000000000000000000100', '00000100000000000000000000000110'],
            ['00000000000010000000000000000000', '00000000000000000000000010000000']
        ]))).to.eql(fromBinary(['00000010000010000000000000000100', '00000100000000000000000010000110']), 'or 6');
        expect(Double.or(fromBinaryAll([
            ['01000001000000100000000000000000', '00000000000000000000000000000000'],
            ['01001000000000000000000001000000', '01000000010000000001000000000000'],
            ['00000000000100000000110000000000', '00000100000000001000001000000000'],
            ['00111000000000010000000110000010', '00110000011111111111111000000110']
        ]))).to.eql(fromBinary(['01111001000100110000110111000010', '01110100011111111111111000000110']), 'or 7');
    });

    it('does and correctly', () => {
        expect(Double.and(null)).to.eql(NOTHING, 'and 1');
        expect(Double.and([])).to.eql(NOTHING, 'and 2');
        expect(Double.and([{ High: 0x1234, Low: 0x5678 }])).to.eql({ High: 0x1234, Low: 0x5678 }, 'and 3');
        expect(Double.and([
            { High: 0x1234, Low: 0x5678 },
            NOTHING
        ])).to.eql(NOTHING, 'and 4');
        expect(Double.and(fromBinaryAll([
            ['01111000000111110000001111100000', '01111111111111110111110000001111'],
            ['01111111100000000111110000000100', '00011111111110000000000011111000']
        ]))).to.eql(fromBinary(['01111000000000000000000000000000', '00011111111110000000000000001000']), 'and 5');
        expect(Double.and(fromBinaryAll([ // commutative
            ['01111111100000000111110000000100', '00011111111110000000000011111000'],
            ['01111000000111110000001111100000', '01111111111111110111110000001111']
        ]))).to.eql(fromBinary(['01111000000000000000000000000000', '00011111111110000000000000001000']), 'and 6');
        expect(Double.and(fromBinaryAll([
            ['01000001000000100000000000000000', '00000000000000001000000000000000'],
            ['01111111111111111111111111111111', '01111111111111111111111111111111'],
            ['00000011111100000000110000000000', '00000100000000001000001000000000'],
            ['00111001000000010000000110000010', '00110000011111111111111000000110']
        ]))).to.eql(fromBinary(['00000001000000000000000000000000', '00000000000000001000000000000000']), 'and 7');
    });
});