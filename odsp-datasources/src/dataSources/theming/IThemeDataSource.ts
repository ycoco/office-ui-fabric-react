import IThemeData from '@ms/odsp-utilities/lib/theming/IThemeData';
import Promise from '@ms/odsp-utilities/lib/async/Promise';

/**
 * Data source for a theme.
 */
interface IThemeDataSource {
    /**
     * Gets the data used to apply a theme to CSS on the page.
     * If forceUpdate is false and loadData has already been called, the promise returned
     * will be the one most recently created by a standard loadData call.
     * @param {boolean} forceUpdate If true, forces fresh data to be returned.
     */
    loadTheme(forceUpdate?: boolean): Promise<IThemeData>;

    /**
     * Gets a token that will be used to determine whether cached data is valid.
     * If a cached version of this string does not match the current version,
     * cached data will be considered invalid.
     */
    getCacheToken?(): string;
}

export default IThemeDataSource;