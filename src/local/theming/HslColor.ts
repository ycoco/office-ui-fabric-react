import RgbaColor from './RgbaColor';

/**
 * A color represented by hue, saturation, luminance, and alpha (opacity) components.
 */
class HslColor {
    public hue: number;
    public sat: number;
    public lum: number;
    public alpha: number;

    /**
     * Constructs a new HSL color object.
     * @param {number} h The hue (between 0 and 1) of the color.
     * @param {number} s The saturation (between 0 and 1) of the color.
     * @param {number} l The luminance (between 0 and 1) of the color.
     * @param {number} a The opacity (between 0 and 255) of the color.
     */
    constructor (h: number, s: number, l: number, a?: number) {
        function LimitNumberToUnitInterval(value: number) {
            return Math.min(1.0, Math.max(0.0, value));
        }

        this.hue = LimitNumberToUnitInterval(h);
        this.sat = LimitNumberToUnitInterval(s);
        this.lum = LimitNumberToUnitInterval(l);
        this.alpha = a == null ? RgbaColor.maxComponent : a;
    }

    /**
     * Constructs an HslColor from an RgbaColor.
     * @param {RgbaColor} color The color to convert to HSL.
     */
    public static fromRgba(color: RgbaColor): HslColor {
        // Using integer values as much as possible to make comparisons easier.
        // I will indicate non-integer values with a  "_float" suffix.
        // These integer values are each some integer multiple of the true value.
        var scaleFactor = RgbaColor.maxComponent;

        var h_float = 0.0;
        var s_float = 0.0;
        var l_float = 0.0;
        var r = color.R;
        var g = color.G;
        var b = color.B;
        var cMax = Math.max(Math.max(r, g), b);
        var cMin = Math.min(Math.min(r, g), b);
        var twiceL = cMax + cMin;
        l_float = twiceL / (2 * scaleFactor);

        if (cMax === cMin) {
            s_float = 0.0;
            h_float = -1.0;
        } else {
            var dmax = cMax - cMin;
            var pmax = cMax + cMin;

            // The scale factor cancels when we divide scaled values, so divisions can ignore it.
            if (twiceL <= 1 * scaleFactor) {
                s_float = dmax / pmax;
            } else {
                s_float = dmax / (2 * scaleFactor - pmax); // Safe, since cMax != cMin
            }

            var dr_float = (cMax - r) * (1 / 6) / dmax;
            var dg_float = (cMax - g) * (1 / 6) / dmax;
            var db_float = (cMax - b) * (1 / 6) / dmax;

            if (r === cMax) {
                h_float = db_float - dg_float;
            } else if (g === cMax) {
                h_float = (1 / 3) + dr_float - db_float;
            } else {
                h_float = (2 / 3) + dg_float - dr_float;
            }

            if (h_float < 0) {
                h_float += 1.0;
            }

            if (h_float > 1.0) {
                h_float -= 1.0;
            }
        }

        return new HslColor(h_float, s_float, l_float, color.A);
    }

    /**
     * Converts a hue, saturation, or luminance value between 0 and 1 into
     * an integer between 0 and 255.
     */
    private static _hslComponentToByte(value: number): number {
        var c_rgbaMax: number = RgbaColor.maxComponent;
        var result: number = Math.round(c_rgbaMax * value);
        return Math.min(c_rgbaMax, Math.max(0, result));
    }

    /**
     * Internal method which given the calculated magic numbers and the hue,
     * will calculate the appropriate RGB number.
     * This algorithm is intended to stay in-sync with the equivalent code in
     * mso\officespace\fscolorgallery.cpp.
     * @param {number} m1 The first magic number.
     * @param {number} m2 The second magic number.
     * @param {number} hue The hue to be converted using the magic numbers.
     */
    private static _hueToRgbComponent(m1: number, m2: number, hue: number): number {
        var result: number;

        if (hue < 0) {
            hue += 1;
        }

        if (hue > 1) {
            hue -= 1;
        }

        if (hue < 1 / 6) {
            result = m1 + (m2 - m1) * hue * 6;
        } else if (hue < 1 / 2) {
            result = m2;
        } else if (hue < 2 / 3) {
            result = m1 + (m2 - m1) * (2 / 3 - hue) * 6;
        } else {
            result = m1;
        }

        return HslColor._hslComponentToByte(result);
    }

    /**
     * Darkens the color by the provided factor.
     * @param {number} factor The factor (between 0 and 1) by which to scale the luminance.
     */
    public darken(factor: number) {
        // TODO: Validate input.
        this.lum *= factor;
    }

    /**
     * Lightens the color by the provided factor.
     * @param {number} factor The factor (between 0 and 1) by which to scale the luminance.
     */
    public lighten(factor: number) {
        // TODO: Validate input.
        this.lum = this.lum * factor + (1 - factor);
    }

    /**
     * Returns an RgbaColor representation of this HslColor.
     */
    public toRgbaColor(): RgbaColor {
        var r: number;
        var g: number;
        var b: number;

        var hue = this.hue;
        var saturation = this.sat;
        var luminance = this.lum;

        if (Math.round(saturation * RgbaColor.maxComponent) === 0) {
            r = g = b = HslColor._hslComponentToByte(luminance);
        } else {
            var m1: number;
            var m2: number;

            if (luminance <= 0.5) {
                m2 = luminance * (1 + saturation);
            } else {
                m2 = luminance + saturation - (luminance * saturation);
            }

            m1 = 2 * luminance - m2;
            r = HslColor._hueToRgbComponent(m1, m2, hue + (1 / 3));
            g = HslColor._hueToRgbComponent(m1, m2, hue);
            b = HslColor._hueToRgbComponent(m1, m2, hue - (1 / 3));
        }

        return RgbaColor.fromRgba(r, g, b, this.alpha);
    }
}

export default HslColor;