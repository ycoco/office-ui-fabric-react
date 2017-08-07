import { IThemeInfo } from '../../models/themes/ThemeInfo';
import { IThemingOptions } from '../../models/themes/ThemingOptions';
import Promise from '@ms/odsp-utilities/lib/async/Promise';
export interface ITenantThemeDataSource {
    /**
     * Saves the given theme to the site. This will persist and be visible to all visitors to this site.
     */
    setTheme(theme: IThemeInfo): Promise<string>;

    /**
     * Queries the server to get theme settings, including any server themes.
     */
    getThemingOptions(): Promise<IThemingOptions>;

    /**
     * Will clear the currently set theme for the site. Returns a boolean for whether or not it succeeded.
     */
    clearTheme(): Promise<boolean>;
}