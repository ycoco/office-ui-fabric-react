// OneDrive:IgnoreCodeCoverage

import { IThemeInfo } from '../../models/themes/ThemeInfo';
import Promise from '@ms/odsp-utilities/lib/async/Promise';


/**
 * Gets and sets the tenant level theme information
 */
export interface ITenantThemesProvider {
    /**
     * Get's all of the currently available themes.
     */
    getTenantThemes(): Promise<IThemeInfo[]>;
    /**
     * Sets the theme of the site to the one that has been passed in.
     */
    setTheme(theme: IThemeInfo): Promise<string>;
    /**
     * Clear the currently set theme for the site. Returns a boolean for whether or not it succeeded.
     */
    clearTheme(): Promise<boolean>;

}
