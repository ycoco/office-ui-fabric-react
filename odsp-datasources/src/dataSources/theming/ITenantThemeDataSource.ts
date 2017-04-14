import { IThemeInfo } from '../../models/themes/ThemeInfo';
import Promise from '@ms/odsp-utilities/lib/async/Promise';
export interface ITenantThemeDataSource {
    /**
     * Saves the given theme to the site. This will persist and be visible to all visitors to this site.
     */
    setTheme(theme: IThemeInfo): Promise<string>;

    /**
     * Queries the server to return all available themes from the tenant level store
     */
    getAvailableThemes(): Promise<IThemeInfo[]>;
}