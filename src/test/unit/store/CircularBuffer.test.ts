/// <reference path="../../../chai/chai.d.ts" />
/// <reference path="../../../mocha/mocha.d.ts" />

import chai = require('chai');
var expect = chai.expect;

import CircularBuffer from "odsp-utilities/store/CircularBuffer";

var DEFAULT_SIZE = 4;

describe("CircularBuffer", () => {
    var buf: CircularBuffer<number>;

    beforeEach(() => {
        buf = new CircularBuffer<number>(DEFAULT_SIZE);
    });

    it('returns null when popping empty buffer', () => {
        expect(buf.popOldest()).to.be.null;
    });

    it('pops oldest items in correct order', () => {
        buf.push(1);
        buf.push(2);
        buf.push(3);
        expect(buf.popOldest()).to.equal(1);
        expect(buf.popOldest()).to.equal(2);
        expect(buf.popOldest()).to.equal(3);
        expect(buf.popOldest()).to.be.null;
    });

    it('stores only defined number of items', () => {
        for (var i = 0; i < DEFAULT_SIZE + 2; i++) {
            buf.push(i);
        }
        for (var j = 2; j < DEFAULT_SIZE + 2; j++) {
            expect(buf.popOldest()).to.equal(j);
        }
        expect(buf.popOldest()).to.be.null;
    });

    it('throws if desired size is non-positive', () => {
        expect(() => {
            buf = new CircularBuffer<number>(0);
        }).to.throw();
    });
});