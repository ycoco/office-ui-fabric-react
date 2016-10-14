import RgbaColor from '../../../odsp-utilities/theming/RgbaColor';
import chai = require('chai');

var expect = chai.expect;

describe('RgbaColor', () => {
    describe('#constructor', () => {
        it('takes no arguments', () => {
            var rgb = new RgbaColor();

            expect(rgb.R).to.equal(0);
            expect(rgb.G).to.equal(0);
            expect(rgb.B).to.equal(0);
            expect(rgb.A).to.equal(RgbaColor.maxComponent);
        });
    });

    describe('#fromRGBA', () => {
        it('rounds components to integers', () => {
            var r = 123.45;
            var g = 212.7;
            var b = 85;
            var a = 222.22;
            var rgb = RgbaColor.fromRgba(r, g, b, a);
            expect(rgb.R).to.equal(Math.round(r));
            expect(rgb.G).to.equal(Math.round(g));
            expect(rgb.B).to.equal(Math.round(b));
            expect(rgb.A).to.equal(Math.round(a));
        });
    });

    describe('#fromHtmlColor', () => {
        it('handles #AARRGGBB', () => {
            var rgb = RgbaColor.fromHtmlColor("#CCe62b07");
            expect(rgb.A).to.equal(0xcc);
            expect(rgb.R).to.equal(0xe6);
            expect(rgb.G).to.equal(0x2b);
            expect(rgb.B).to.equal(0x07);
        });

        it('handles #RRGGBB', () => {
            var rgb = RgbaColor.fromHtmlColor("#abcdef");
            expect(rgb.A).to.equal(RgbaColor.maxComponent);
            expect(rgb.R).to.equal(0xab);
            expect(rgb.G).to.equal(0xcd);
            expect(rgb.B).to.equal(0xef);
        });

        it('handles #RGB', () => {
            var rgb = RgbaColor.fromHtmlColor("#30E");
            expect(rgb.A).to.equal(RgbaColor.maxComponent);
            expect(rgb.R).to.equal(0x33);
            expect(rgb.G).to.equal(0x00);
            expect(rgb.B).to.equal(0xee);
        });
    });

    describe('#toHtmlString', () => {
        it('handles fully opaque colors', () => {
            var originalHtmlColor = "#00d30a";
            var rgb = RgbaColor.fromHtmlColor(originalHtmlColor);
            expect(RgbaColor.toHtmlString(rgb)).to.equal(originalHtmlColor);
        });

        it('handles colors with opacity', () => {
            var r = 170;
            var g = 43;
            var b = 62;
            var a = Math.round(RgbaColor.maxComponent / 4);
            var rgb = RgbaColor.fromRgba(r, g, b, a);
            var htmlString = RgbaColor.toHtmlString(rgb);
            var splitHtmlString = htmlString.split(/[,()]/);
            var split_a = Math.round(RgbaColor.maxComponent * parseFloat(splitHtmlString[4]));
            expect(splitHtmlString.length).to.equal(6);
            expect(splitHtmlString[0]).to.equal('rgba');
            expect(parseFloat(splitHtmlString[1])).to.equal(r);
            expect(parseFloat(splitHtmlString[2])).to.equal(g);
            expect(parseFloat(splitHtmlString[3])).to.equal(b);
            expect(split_a).to.equal(a);
            expect(splitHtmlString[5].trim()).to.equal('');
        });
    });
});
