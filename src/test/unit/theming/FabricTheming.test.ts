
/// <reference path='../../../mocha/mocha.d.ts' />
/// <reference path='../../../chai/chai.d.ts' />

import FabricTheming from 'odsp-utilities/theming/FabricTheming';
import HslColor from 'odsp-utilities/theming/HslColor';
import RgbaColor from 'odsp-utilities/theming/RgbaColor';
import chai = require('chai');

var expect = chai.expect;

describe('FabricTheming', () => {
    describe('#applyHslDelta', () => {
        it('subtracts small positive deltas', () => {
            var hue = 0.52, sat = 0.67, lum = 0.83;
            var hsl = new HslColor(hue, sat, lum);
            var delta = 0.1;
            var newHsl = FabricTheming.applyHslDelta(hsl, delta, delta, delta);
            expect(newHsl.hue).to.equal(hue - delta);
            expect(newHsl.sat).to.equal(sat - delta);
            expect(newHsl.lum).to.equal(lum - delta);
            expect(newHsl.alpha).to.equal(RgbaColor.maxComponent);
        });

        it('subtracts small negative deltas', () => {
            var hue = 0.52, sat = 0.67, lum = 0.83;
            var hsl = new HslColor(hue, sat, lum);
            var delta = -0.17;
            var newHsl = FabricTheming.applyHslDelta(hsl, delta, delta, delta);
            expect(newHsl.hue).to.equal(hue - delta);
            expect(newHsl.sat).to.equal(sat - delta);
            expect(newHsl.lum).to.equal(lum - delta);
            expect(newHsl.alpha).to.equal(RgbaColor.maxComponent);
        });

        it('subtracts large positive deltas', () => {
            var hue = 0.52, sat = 0.67, lum = 0.83;
            var hsl = new HslColor(hue, sat, lum);
            var delta = 0.9;
            var newHsl = FabricTheming.applyHslDelta(hsl, delta, delta, delta);
            var expectedHue = hue - delta;
            expectedHue -= Math.floor(expectedHue);
            expect(newHsl.hue).to.equal(expectedHue);
            expect(newHsl.sat).to.equal(0);
            expect(newHsl.lum).to.equal(0);
            expect(newHsl.alpha).to.equal(RgbaColor.maxComponent);
        });

        it('subtracts large negative deltas', () => {
            var hue = 0.52, sat = 0.67, lum = 0.83;
            var hsl = new HslColor(hue, sat, lum);
            var delta = -0.7;
            var newHsl = FabricTheming.applyHslDelta(hsl, delta, delta, delta);
            var expectedHue = hue - delta;
            expectedHue -= Math.floor(expectedHue);
            expect(newHsl.hue).to.equal(expectedHue);
            expect(newHsl.sat).to.equal(1);
            expect(newHsl.lum).to.equal(1);
            expect(newHsl.alpha).to.equal(RgbaColor.maxComponent);
        });
    });

    describe('#generateFabricColors', () => {
        it('preserves the primary color in the generated palette', () => {
            var r = 0x44, g = 0x88, b = 0xaa;
            var rgb = RgbaColor.fromRgba(r, g, b);
            var colors = FabricTheming.generateFabricColors(rgb);
            var themePrimary = colors["themePrimary"];
            expect(themePrimary.R).to.equal(Math.round(r));
            expect(themePrimary.G).to.equal(Math.round(g));
            expect(themePrimary.B).to.equal(Math.round(b));
            expect(themePrimary.A).to.equal(RgbaColor.maxComponent);
        });
    });
});
