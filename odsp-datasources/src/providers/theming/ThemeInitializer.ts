// OneDrive:IgnoreCodeCoverage

import { loadTheme } from '@microsoft/load-themed-styles';

import { getThemeProvider } from './ThemeProviderFactory';
import { IThemeProvider } from './IThemeProvider';

/**
 * Chooses the appropriate method of loading theme data for the current page.
 * As soon as the theme data is available, it will be set via the loadTheme
 * method of load-themed-styles.
 */
export class ThemeInitializer {
    /**
     * Uses context information to load the appropriate theme.
     */
    public static initializeTheme() {
        window["__loadTheme"] = loadTheme; // so we can access it in console for testing purposes
        // If there is a themeProvider, request and load the theme.
        let themeProvider: IThemeProvider = getThemeProvider();
        if (themeProvider) {
            themeProvider.loadThemeSlotsMap().done(loadTheme);
        }
    }
}

ThemeInitializer.initializeTheme();
