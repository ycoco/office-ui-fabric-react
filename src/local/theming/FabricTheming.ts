import HslColor from './HslColor';
import RgbaColor from './RgbaColor';

class FabricTheming {
    /**
     * Generates a palette of Fabric colors from a primary RGB color value.
     * @param {RgbaColor} primaryRgb Primary RGB color used to generate a palette.
     */
    public static generateFabricColors(primaryRgb: RgbaColor): { [key: string]: RgbaColor } {
        // These magical numbers were provided by the Shell Service team. They are used by the data.theme service in O365.
        // We use these to generate a palette of colors based on the primary color.
        let hslDelta = [
            [ -0.00012626262626247442,  0,                      0.15294117647058825  ], // themeDarker
            [ -0.0010228870988364668,   0,                      0.0784313725490196   ], // themeDark
            [ -0.0010228870988364668,   0,                      0.0784313725490196   ], // themeDarkAlt
            [ 0,                        0,                      0                    ], // themePrimary
            [ 0.0014186811939621568,    0.2704918032786885,     -0.13333333333333336 ], // themeSecondary
            [ 0.002331002331002363,     0.44285714285714284,    -0.3372549019607843  ], // themeTertiary
            [ 0.0032467532467532756,    0.2758620689655177,     -0.49803921568627446 ], // themeLight
            [ 0.0032467532467532756,    0.2758620689655177,     -0.49803921568627446 ], // themeLightAlt
            [ 0.004040404040403955,     0.3333333333333339,     -0.5529411764705883  ], // themeLighter
            [ 0.004040404040403955,     0.3333333333333339,     -0.5529411764705883  ]  // themeLighterAlt
        ];

        // Names of the generated theme slots corresponding to elements of hslDelta.
        let generatedPaletteSlots = [
            "themeDarker",
            "themeDark",
            "themeDarkAlt",
            "themePrimary",
            "themeSecondary",
            "themeTertiary",
            "themeLight",
            "themeLightAlt",
            "themeLighter",
            "themeLighterAlt"
        ];

        let colors: { [key: string]: RgbaColor } = {};
        let primaryColor = RgbaColor.fromRgba(primaryRgb.R, primaryRgb.G, primaryRgb.B);
        let primaryHsl = HslColor.fromRgba(primaryColor);

        for (let iPaletteSlot = 0; iPaletteSlot < hslDelta.length; iPaletteSlot++) {
            let slotName: string = generatedPaletteSlots[iPaletteSlot];
            let slotDelta: Array<number> = hslDelta[iPaletteSlot];
            let hslValue = FabricTheming.applyHslDelta(primaryHsl, slotDelta[0], slotDelta[1], slotDelta[2]);
            let rgbaValue = hslValue.toRgbaColor();
            colors[slotName] = rgbaValue;
        }

        return colors;
    }

    /**
     * Applies an Hsl delta to an HslColor to produce a new HslColor.
     * @param {HslColor} primaryHsl Starting HSL color value.
     * @param {number} hDelta Delta to apply to the hue.
     * @param {number} sDelta Delta to apply to the saturation.
     * @param {number} lDelta Delta to apply to the luminance.
     */
    public static applyHslDelta(primaryHsl: HslColor, hDelta: number, sDelta: number, lDelta: number): HslColor {
        let hue = primaryHsl.hue - hDelta;
        if (hue > 1 || hue < 0) {
            hue = hue - Math.floor(hue);
        }

        let sat = primaryHsl.sat - sDelta;
        if (sat > 1) {
            sat = 1;
        } else if (sat < 0) {
            sat = 0;
        }

        let lum = primaryHsl.lum - lDelta;
        if (lum > 1) {
            lum = 1;
        } else if (lum < 0) {
            lum = 0;
        }

        let hslValue = new HslColor(hue, sat, lum);
        return hslValue;
    }
}

export default FabricTheming;