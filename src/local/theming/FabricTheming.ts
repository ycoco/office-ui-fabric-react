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
            [ 0.002331002331002363,     0.44285714285714284,    -0.3372549019607843  ], // themeTertiaryAlt
            [ 0.0032467532467532756,    0.2758620689655177,     -0.49803921568627446 ], // themeLight
            [ 0.0032467532467532756,    0.2758620689655177,     -0.49803921568627446 ], // themeLightAlt
            [ 0.004040404040403955,     0.3333333333333339,     -0.5529411764705883  ], // themeLighter
            [ 0.004040404040403955,     0.3333333333333339,     -0.5529411764705883  ], // themeLighterAlt
            [ 0.029966965549787616,     0.19811560988031574,    -0.18039215686274518 ]  // themeAccent
        ];

        // Names of the generated theme slots corresponding to elements of hslDelta.
        let generatedPaletteSlots = [
            "themeDarker",
            "themeDark",
            "themeDarkAlt",
            "themePrimary",
            "themeSecondary",
            "themeTertiary",
            "themeTertiaryAlt",
            "themeLight",
            "themeLightAlt",
            "themeLighter",
            "themeLighterAlt",
            "themeAccent"
        ];

        // Expected color slots. Start each defaulting to null to avoid warnings about missing slots.
        let colors: { [key: string]: RgbaColor } = FabricTheming._getDefaultThemeTokenMap();

        // Starting points for the generated palette.
        let primaryColor = RgbaColor.fromRgba(primaryRgb.R, primaryRgb.G, primaryRgb.B);
        let primaryHsl = HslColor.fromRgba(primaryColor);
        const lumBase = 0.36666666666666664; // luminance of the primary color of our default theme

        for (let iPaletteSlot = 0; iPaletteSlot < hslDelta.length; iPaletteSlot++) {
            let slotName: string = generatedPaletteSlots[iPaletteSlot];
            let slotDelta: Array<number> = hslDelta[iPaletteSlot];
            let hslValue = FabricTheming.applyHslDelta(primaryHsl, slotDelta[0], slotDelta[1], 0);
            let lumDelta = slotDelta[2];

            // The Shell Service applies the lum delta linearly, but this ends up pushing many of our
            // OOB theme primary colors all the way to lum > 1, and white is not a good highlight color.
            // So, here we will scale the lum in a way that produces the same values for the default theme
            // but scales properly for primary colors which have lum close to 0 or 1.
            if (lumDelta < 0) {
                hslValue.lighten((lumBase - lumDelta - 1) / (lumBase - 1));
            } else {
                hslValue.darken((lumBase - lumDelta) / lumBase);
            }
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

    private static _getDefaultThemeTokenMap(): { [key: string]: RgbaColor } {
        return {
            themeDarker: null,
            themeDark: null,
            themeDarkAlt: null,
            themePrimary: null,
            themeSecondary: null,
            themeTertiary: null,
            themeLight: null,
            themeLighter: null,
            themeLighterAlt: null,
            black: null,
            neutralDark: null,
            neutralPrimary: null,
            neutralSecondary: null,
            neutralSecondaryAlt: null,
            neutralTertiary: null,
            neutralTertiaryAlt: null,
            neutralLight: null,
            neutralLighter: null,
            neutralLighterAlt: null,
            white: null,
            blackTranslucent40: null,
            whiteTranslucent40: null,
            yellow: null,
            yellowLight: null,
            orange: null,
            orangeLight: null,
            redDark: null,
            red: null,
            magentaDark: null,
            magenta: null,
            magentaLight: null,
            purpleDark: null,
            purple: null,
            purpleLight: null,
            blueDark: null,
            blueMid: null,
            blue: null,
            blueLight: null,
            tealDark: null,
            teal: null,
            tealLight: null,
            greenDark: null,
            green: null,
            greenLight: null,
            error: null,
            errorBackground: null,
            success: null,
            successBackground: null,
            alert: null,
            alertBackground: null,
            infoBackground: null,
            info: null,
            orangeLighter: null
        };
    }
}

export default FabricTheming;