// OneDrive:IgnoreCodeCoverage

import Promise from '@ms/odsp-utilities/lib/async/Promise';
import IThemeData from '@ms/odsp-utilities/lib/theming/IThemeData';
import ThemeProvider from '@ms/odsp-utilities/lib/theming/ThemeProvider';
import WebThemeDataSource from '../../dataSources/theming/spList/WebThemeDataSource';
import ISpPageContext from '../../interfaces/ISpPageContext';
import IThemeDataSource from '../../dataSources/theming/IThemeDataSource';
import { IThemeProvider } from './IThemeProvider';


export interface IWebThemeProviderParams {
    pageContext?: ISpPageContext;
}
/**
 * Provides theme data for the context web, either from a cache or from the server.
 */
export class WebThemeProvider implements IThemeProvider {
    private _pageContext: ISpPageContext;
    private _themeProvider: ThemeProvider;

    constructor(params: IWebThemeProviderParams) {
        // Accessing _spPageContextInfo via window since this code needs to run before app boot.
        this._pageContext = params.pageContext ? params.pageContext : window["_spPageContextInfo"];
        this._themeProvider = new ThemeProvider(this._loadTheme.bind(this));
    }

    /**
     * Loads a map from theme tokens (slots) to values (usually colors).
     * @param {boolean} forceUpdate If true, load fresh server data, ignoring the cache.
     */
    public loadThemeSlotsMap(forceUpdate?: boolean): Promise<{ [key: string]: string }> {
        let cacheToken: string = this._getThemeCacheToken();
        if (cacheToken) {
            return this._themeProvider.loadThemeTokenMap(cacheToken, forceUpdate);
        } else {
            // No theme.
            return Promise.wrap();
        }
    }

    /**
     * Loads relevant information about the site theme. For just the colors, use loadThemeTokenMap.
     * @param {boolean} forceUpdate If true, load fresh server data, ignoring the cache.
     */
    public loadFullThemeData(forceUpdate?: boolean): Promise<IThemeData> {
        let cacheToken: string = this._getThemeCacheToken();
        if (cacheToken) {
            return this._themeProvider.loadThemeData(cacheToken, forceUpdate);
        } else {
            // No theme.
            let noThemeData: IThemeData;
            return Promise.wrap(noThemeData);
        }
    }

    /**
     * Gets the theme cache token for the current page load.
     */
    private _getThemeCacheToken(): string {
        let cacheToken: string;
        const pageContext = this._pageContext;

        // Return the themedCssFolderUrl instead of the themeCacheToken, since
        // we do not depend on the web or its version. Those would be needed if
        // we required foreground-image theming rules, as in classic theming.
        if (pageContext) {
            // If themedCssFolderUrl is null or empty, there is no web theme.
            // But if groupColor is set, we can extend that to a theme for the page.
            // Add the web template ID into a groupColor-based token since some templates
            // will behave differently (e.g. ODB will not apply the groupColor).
            let groupColorToken = pageContext.groupColor ?
                pageContext.groupColor + ";web#" + pageContext.webTemplate : null;
            cacheToken = pageContext.themedCssFolderUrl || groupColorToken || null;
        }

        return cacheToken;
    }

    /**
     * Loads the theme data from an appopriate data source.
     * @param {boolean} forceUpdate If true, load fresh server data, ignoring the cache.
     */
    private _loadTheme(forceUpdate?: boolean): Promise<IThemeData> {
        // Only load this module if it has been bundled with the app.
        // This way, only SPO apps need a WebThemeDataSource.
        let shouldTheme = !!this._getThemeCacheToken();
        if (shouldTheme) {
            return new Promise<IThemeData>((complete: (themeData: IThemeData) => void, error: (errVal: any) => void) => {
                    let ds: IThemeDataSource = new WebThemeDataSource(this._pageContext);
                    ds.loadTheme(forceUpdate).then(complete, error);
            });
        }

        return Promise.wrap();
    }
 }
