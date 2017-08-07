import { IThemeInfo } from './ThemeInfo';

export interface IThemingOptions {
    /**
     * Whether to hide the out of box themes.
     */
    hideDefaultThemes: boolean;
    /**
     * An array of themes from the server.
     */
    themes: IThemeInfo[];
}