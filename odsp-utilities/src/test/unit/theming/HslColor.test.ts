import HslColor from '../../../odsp-utilities/theming/HslColor';
import RgbaColor from '../../../odsp-utilities/theming/RgbaColor';
import chai = require('chai');

var expect = chai.expect;

describe('HslColor', () => {
    describe('#constructor', () => {
        it('accepts HSL values without alpha', () => {
            var hue = 0.1234;
            var sat = 0.47;
            var lum = 0.83;
            var hsl = new HslColor(hue, sat, lum);

            expect(hsl.hue).to.equal(hue);
            expect(hsl.sat).to.equal(sat);
            expect(hsl.lum).to.equal(lum);
            expect(hsl.alpha).to.equal(RgbaColor.maxComponent);
        });

        it('accepts HSL values with alpha', () => {
            var hue = 0.1234;
            var sat = 0.47;
            var lum = 0.83;
            var alpha = Math.round(RgbaColor.maxComponent / 2);
            var hsl = new HslColor(hue, sat, lum, alpha);

            expect(hsl.hue).to.equal(hue);
            expect(hsl.sat).to.equal(sat);
            expect(hsl.lum).to.equal(lum);
            expect(hsl.alpha).to.equal(alpha);
        });
    });

    describe('#RGBA conversion', () => {
        it('converts from RGBA to HSL and back', () => {
            var r = 68;
            var g = 136;
            var b = 204;
            var a = 238;
            var rgba = RgbaColor.fromRgba(r, g, b, a);
            var hsl = HslColor.fromRgba(rgba);
            var afterRgba = hsl.toRgbaColor();
            expect(afterRgba.R).to.equal(Math.round(r));
            expect(afterRgba.G).to.equal(Math.round(g));
            expect(afterRgba.B).to.equal(Math.round(b));
            expect(afterRgba.A).to.equal(Math.round(a));
        });
    });
});
