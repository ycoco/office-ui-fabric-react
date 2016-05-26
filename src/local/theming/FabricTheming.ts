import HslColor from './HslColor';
import RgbaColor from './RgbaColor';
import { Shades, getShade } from './Shades';

/**
 * Utility class with static methods to work with Fabric-style themes.
 */
export default class FabricTheming {
    /**
     * Generates a palette of Fabric colors from a primary RGB color value.
     * @param {RgbaColor} primaryRgb Primary RGB color used to generate a palette.
     * @param {boolean} inverted Whether the theme is inverted, with a dark background and light foreground.
     */
    public static generateFabricColors(primaryRgb: RgbaColor, inverted: boolean = false): { [key: string]: RgbaColor } {
        const generatedShades = {
            "themeDarker": Shades.Darkest,
            "themeDark": Shades.Darker,
            "themeDarkAlt": Shades.Darker,
            "themeLight": Shades.Lighter,
            "themeLightAlt": Shades.Lighter,
            "themeLighter": Shades.Lightest,
            "themeLighterAlt": Shades.Lightest,
            "themePrimary": Shades.Unshaded,
            "themeAccent": Shades.Unshaded,
            "themeSecondary": Shades.Medium,
            "themeTertiary": Shades.Lighter,
            "themeTertiaryAlt": Shades.Lighter
        };

        // Expected color slots. Start each defaulting to null to avoid warnings about missing slots.
        let colors: { [key: string]: RgbaColor } = FabricTheming._getDefaultThemeTokenMap();

        // Starting points for the generated palette.
        let primaryColor = RgbaColor.fromRgba(primaryRgb.R, primaryRgb.G, primaryRgb.B);

        for (let shadeName in generatedShades) {
            let shade = generatedShades[shadeName];
            if (inverted && shade !== Shades.Unshaded) {
                shade = Shades.Darkest + Shades.Lightest - shade;
            }
            colors[shadeName] = getShade(primaryColor, shade);
        }

        let accent = colors["themeAccent"];
        colors["themeAccentTranslucent10"] = accent ?
            RgbaColor.fromRgba(accent.R, accent.G, accent.B, 0.1 * RgbaColor.maxComponent) : null;

        // Handle neutral slots for inverted themes
        if (inverted) {
            const invertedNeutralColors = {
                'black': '#fff',
                'blackTranslucent40': '#66ffffff',
                'cmdbarSelected': '#444',
                'cmdbarSelectedHover': '#555',
                'neutralDark': '#dedede',
                'neutralPrimary': '#cccccc',
                'neutralPrimaryTranslucent50': '#7fcccccc',
                'neutralSecondary': '#999999',
                'neutralSecondaryAlt': '#898989',
                'neutralTertiary': '#707070',
                'neutralTertiaryAlt': '#666666',
                'neutralLight': '#333',
                'neutralLighter': '#222',
                'neutralLighterAlt': '#1a1a1a',
                'primaryText': '#fff',
                'primaryBackground': '#000',
                'white': '#000',
                'whiteTranslucent40': '#66000000'
            };

            for (let neutralSlot in invertedNeutralColors) {
                if (invertedNeutralColors.hasOwnProperty(neutralSlot)) {
                    colors[neutralSlot] =
                        RgbaColor.fromHtmlColor(invertedNeutralColors[neutralSlot]);
                }
            }
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
            backgroundOverlay: null,
            primaryBackground: null,
            primaryText: null,
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
            cmdbarSelected: null,
            cmdbarSelectedHover: null,
            neutralDark: null,
            neutralPrimary: null,
            neutralSecondary: null,
            neutralPrimaryTranslucent50: null,
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