// OneDrive:IgnoreCodeCoverage

import Promise from '@ms/odsp-utilities/lib/async/Promise';
import IThemeData from '@ms/odsp-utilities/lib/theming/IThemeData';

export interface IThemeProvider {
    /**
     * Gets the token replacement values used to apply a theme to CSS on the page.
     * @param {boolean} forceUpdate If true, forces fresh data to be returned.
     */
    loadThemeSlotsMap(forceUpdate?: boolean): Promise<{ [key: string]: string }>;

    /**
     * Gets the full set of data used to specify a theme for CSS on the page.
     * @param {boolean} forceUpdate If true, forces fresh data to be returned.
     */
    loadFullThemeData(forceUpdate?: boolean): Promise<IThemeData>;
}