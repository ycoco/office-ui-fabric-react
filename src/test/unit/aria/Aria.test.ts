/// <reference path="../../../chai/chai.d.ts" />
/// <reference path="../../../mocha/mocha.d.ts" />
/// <reference path="../../../sinon/sinon.d.ts" />

import chai = require("chai");
import AriaLogger from 'odsp-utilities/aria/AriaLogger';

var expect = chai.expect;

describe('AriaLogger', function() {

    describe('getAriaTimeZone', function() {
        it('-8', function() {
            expect(AriaLogger.getAriaTimeZone(480)).to.equal("-08:00");
        });

        it('-8:01', function() {
            expect(AriaLogger.getAriaTimeZone(481)).to.equal("-08:01");
        });

        it('-8:20', function() {
            expect(AriaLogger.getAriaTimeZone(500)).to.equal("-08:20");
        });

        it('+2', function() {
            expect(AriaLogger.getAriaTimeZone(-120)).to.equal("+02:00");
        });

        it('+2:01', function() {
            expect(AriaLogger.getAriaTimeZone(-121)).to.equal("+02:01");
        });
    });
});
