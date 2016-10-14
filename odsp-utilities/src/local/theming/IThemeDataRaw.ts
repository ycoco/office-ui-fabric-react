import RgbaColor from './RgbaColor';

// These interface fields are Pascal-cased since the server generates data this way.

/**
 * Represents theme data returned from a SharePoint server.
 */
interface IThemeDataRaw {
    /** Add comments for all these fields! */
    BackgroundImageUri: string;

    /** Font replacement data. */
    Fonts: {
        [key: string]: { PreviewFontFaceBlock: string; Name: string; IsWebFont: boolean; }
    };

    /** Whether this represents the default theme. */
    IsDefault: boolean;

    /**
     * Whether this theme is inverted. Inverted themes have dark backgrounds and
     * reverse the meanings of darker or lighter.
     */
    IsInverted: boolean;

    /** A map from color slots to color values. */
    Palette: {
        Colors: { [key: string]: { DefaultColor: RgbaColor } };
    };

    /** Token that will be used to determine whether cached data is still valid. */
    ThemeCacheToken: string;

    /** The server version of the theme data. Used to determine compatibility of cached data. */
    Version: string;
}

export default IThemeDataRaw;