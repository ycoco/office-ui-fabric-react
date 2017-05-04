// OneDrive:IgnoreCodeCoverage

import { IThemeInfo } from '../../models/themes/ThemeInfo';
import Promise from '@ms/odsp-utilities/lib/async/Promise';


/**
 * Gets and sets the tenant level theme information
 */
export interface ITenantThemesProvider {
    getTenantThemes(): Promise<IThemeInfo[]>;

    setTheme(theme: IThemeInfo): void;

}
