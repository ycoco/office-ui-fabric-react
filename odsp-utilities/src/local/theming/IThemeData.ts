// OneDrive:IgnoreCodeCoverage

import RgbaColor from './RgbaColor';

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
    palette: { [key: string]: RgbaColor };

    /** The version of the theme data. Used to determine compatibility of cached data. */
    version: string;
}

export default IThemeData;
