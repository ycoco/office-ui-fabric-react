import IThemeData from '@ms/odsp-utilities/lib/theming/IThemeData';

export interface IThemeInfo {
    /**
     * The name of the theme as it's stored on the server.
     */
    name: string;
    /**
     * The Theme. It's primary function is to provide palette which contains the actual colors.
     */
    theme: IThemeData;
    /**
     * Whether or not there was an error fetching this theme.
     */
    error?: boolean;
}