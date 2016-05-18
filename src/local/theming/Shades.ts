import HslColor from './HslColor';
import RgbaColor from './RgbaColor';

// Various constants used for generated shades of a color.
const WhiteShadeTable = [0.95, 0.85, 0.75, 0.65, 0.50];
const BlackTintTable = [0.50, 0.65, 0.75, 0.85, 0.95];
const ColorTintTable = [0.20, 0.40, 0.60];
const ColorShadeTable = [0.75, 0.50];
const LumTintTable = [0.10, 0.25, 0.50, 0.75, 0.90];
const LumShadeTable = [0.90, 0.75, 0.50, 0.25, 0.10];
const c_LuminanceLow = 0.2;
const c_LuminanceHigh = 0.8;
const rgbaMax = RgbaColor.maxComponent;
const rgbaWhite = RgbaColor.fromRgba(rgbaMax, rgbaMax, rgbaMax);
const rgbaBlack = RgbaColor.fromRgba(0, 0, 0);

/** Shades of a given color, from Lightest to Darkest. */
export enum Shades {
    Unshaded = 0,
    Lightest = 1,
    Lighter  = 2,
    Medium   = 3,
    Darker   = 4,
    Darkest  = 5
}

/**
 * Returns true if the argument is a valid Shades value
 * @param {Shades} shade The Shades value to validate.
 */
function _isValidShade(shade: Shades): boolean {
    'use strict';
    return (shade >= Shades.Unshaded) && (shade <= Shades.Darkest);
}

/**
 * Given an RgbaColor and a shade specification, generates the requested shade of the color.
 * @param {RgbaColor} color The base color whose shades are to be computed
 * @param {Shades} shade The shade of the base color to compute.
 */
export function getShade(color: RgbaColor, shade: Shades) {
    'use strict';
    if (!color || shade === Shades.Unshaded || !_isValidShade(shade)) {
        return color;
    }

    let hsl = HslColor.fromRgba(color);
    let lum = hsl.lum;
    let tableIndex = shade - 1;
    if (RgbaColor.equals(color, rgbaWhite)) {
        hsl.darken(WhiteShadeTable[tableIndex]);
    } else if (RgbaColor.equals(color, rgbaBlack)) {
        hsl.lighten(BlackTintTable[tableIndex]);
    } else if (lum < c_LuminanceLow) {
        hsl.lighten(LumTintTable[tableIndex]);
    } else if (lum > c_LuminanceHigh) {
        hsl.darken(LumShadeTable[tableIndex]);
    } else {
        if (tableIndex < ColorTintTable.length) {
            hsl.lighten(ColorTintTable[tableIndex]);
        } else {
            hsl.darken(ColorShadeTable[tableIndex - ColorTintTable.length]);
        }
    }

    color = hsl.toRgbaColor();
    return color;
}