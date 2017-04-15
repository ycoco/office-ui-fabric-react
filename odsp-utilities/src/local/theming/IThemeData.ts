// OneDrive:IgnoreCodeCoverage

import RgbaColor from './RgbaColor';
export type Palette = {
    primaryColor?: RgbaColor;
    primaryColorShade1?: RgbaColor;
    primaryColorShade2?: RgbaColor;
    primaryColorShade3?: RgbaColor;
    primaryColorShade4?: RgbaColor;
    primaryColorShade5?: RgbaColor;
    primaryColorShade6?: RgbaColor;
    primaryColorShade7?: RgbaColor;
    primaryColorShade8?: RgbaColor;
    backgroundColor?: RgbaColor;
    backgroundColorShade1?: RgbaColor;
    backgroundColorShade2?: RgbaColor;
    backgroundColorShade3?: RgbaColor;
    backgroundColorShade4?: RgbaColor;
    backgroundColorShade5?: RgbaColor;
    backgroundColorShade6?: RgbaColor;
    backgroundColorShade7?: RgbaColor;
    backgroundColorShade8?: RgbaColor;
    foregroundColor?: RgbaColor;
    foregroundColorShade1?: RgbaColor;
    foregroundColorShade2?: RgbaColor;
    foregroundColorShade3?: RgbaColor;
    foregroundColorShade4?: RgbaColor;
    foregroundColorShade5?: RgbaColor;
    foregroundColorShade6?: RgbaColor;
    foregroundColorShade7?: RgbaColor;
    foregroundColorShade8?: RgbaColor;
    themePrimary?: RgbaColor;
    themeLighterAlt?: RgbaColor;
    themeLighter?: RgbaColor;
    themeLight?: RgbaColor;
    themeTertiary?: RgbaColor;
    themeSecondary?: RgbaColor;
    themeDarkAlt?: RgbaColor;
    themeDark?: RgbaColor;
    themeDarker?: RgbaColor;
    neutralLighterAlt?: RgbaColor;
    neutralLighter?: RgbaColor;
    neutralLight?: RgbaColor;
    neutralQuaternaryAlt?: RgbaColor;
    neutralQuaternary?: RgbaColor;
    neutralTertiaryAlt?: RgbaColor;
    neutralTertiary?: RgbaColor;
    neutralSecondaryAlt?: RgbaColor;
    neutralSecondary?: RgbaColor;
    neutralPrimary?: RgbaColor;
    neutralDark?: RgbaColor;
    black?: RgbaColor;
    white?: RgbaColor;
    primaryBackground?: RgbaColor;
    primaryText?: RgbaColor;
    errorText?: RgbaColor;
    bodyBackground?: RgbaColor;
    bodyText?: RgbaColor;
    bodyTextAlt?: RgbaColor;
    bodyTextDisabled?: RgbaColor;
    bodyTextHover?: RgbaColor;
    bodyTextPrimary?: RgbaColor;
    bodyTextPrimaryAlt?: RgbaColor;
    bodyTextStrong?: RgbaColor;
    focusBorder?: RgbaColor;
    controlText?: RgbaColor;
    controlBackground?: RgbaColor;
    controlBackgroundDisabled?: RgbaColor;
    controlBackgroundHover?: RgbaColor;
    controlBackgroundSelected?: RgbaColor;
    controlBackgroundSelectedHover?: RgbaColor;
    controlForegroundSelected?: RgbaColor;
    controlForegroundDisabled?: RgbaColor;
    controlBorder?: RgbaColor;
    controlBorderDisabled?: RgbaColor;
    controlBorderHover?: RgbaColor;
    controlUnfilled?: RgbaColor;
    controlFilled?: RgbaColor;
    controlFilledHover?: RgbaColor;
    commandBarBackground?: RgbaColor;
    commandBarHover?: RgbaColor;
    commandBarIcon?: RgbaColor;
    commandBarIconSelected?: RgbaColor;
    [key: string]: RgbaColor | undefined;
};

/** Represents data which specifies theme settings. */
interface IThemeData {
    /** The page background image URI. */
    backgroundImageUri: string;

    /** Token that will be used to determine whether cached data is still valid. */
    cacheToken: string;

    /** Whether this represents the default theme. */
    isDefault: boolean;

    /**
     * Whether this theme is inverted. Inverted themes have dark backgrounds and
     * reverse the meanings of darker or lighter.
     */
    isInverted: boolean;

    /** A map from color slots to color values. */
    palette: Palette;

    /** The version of the theme data. Used to determine compatibility of cached data. */
    version: string;
}

export default IThemeData;
