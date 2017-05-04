// OneDrive:IgnoreCodeCoverage

import TenantThemeDataSource from '../../dataSources/theming/spList/TenantThemeDataSource';
import { ITenantThemeDataSource } from '../../dataSources/theming/ITenantThemeDataSource';
import ISpPageContext from '../../interfaces/ISpPageContext';
import { IThemeInfo } from '../../models/themes/ThemeInfo';
import ThemeCache from '@ms/odsp-utilities/lib/theming/ThemeCache';
import Promise from '@ms/odsp-utilities/lib/async/Promise';
import { ITenantThemesProvider } from './ITenantThemesProvider';


export interface ITenantThemesProviderParams {
    pageContext: ISpPageContext;
    tenantThemeDataSource?: ITenantThemeDataSource;
}

/**
 * Provides theme data for the context web, either from a cache or from the server.
 */
export class TenantThemesProvider implements ITenantThemesProvider {
    private _pageContext: ISpPageContext;
    private _themeDataSource: ITenantThemeDataSource;

    constructor(params: ITenantThemesProviderParams) {
        this._pageContext = params.pageContext;
        this._themeDataSource = params.tenantThemeDataSource ? params.tenantThemeDataSource : new TenantThemeDataSource(params.pageContext);
    }

    public getTenantThemes(): Promise<IThemeInfo[]> {
        return this._themeDataSource.getAvailableThemes();
    }

    public setTheme(theme: IThemeInfo) {
        this._themeDataSource.setTheme(theme).then(data => {
            if (data) {
                ThemeCache.updateThemeCache(theme.theme, data)
            }
        });
    }

}
