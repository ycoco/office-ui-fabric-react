/**
 * Contains the name of the the theme and a serialized version of IThemeData.
 */
export interface IRawThemeInfo {
    /**
     * The name of the theme.
     */
    name: string;
    /**
     * themeJson provides a serialized version of IThemeData (found in '@ms/odsp-utilities/lib/theming/IThemeData').
     */
    themeJson: string;
}