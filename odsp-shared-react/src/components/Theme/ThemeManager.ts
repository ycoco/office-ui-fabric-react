import { loadTheme, createTheme } from 'office-ui-fabric-react/lib/Styling';
import { getDefaultThemes } from './DefaultThemes';
import { getThemeProvider, IThemeProvider, TenantThemesProvider, IThemeInfo, ITenantThemesProvider } from '@ms/odsp-datasources/lib/Theming';
import RgbaColor from '@ms/odsp-utilities/lib/theming/RgbaColor';
import ISpPageContext from '@ms/odsp-datasources/lib/interfaces/ISpPageContext';
import { ITheme, IThemeColors } from './Theme';
import Promise from '@ms/odsp-utilities/lib/async/Promise';
import { assign } from 'office-ui-fabric-react/lib/Utilities';

export interface IDefaultThemeDisplayStrings {
    default_Office: string;
    default_Orange: string;
    default_Red: string;
    default_Purple: string;
    default_Green: string;
    default_Gray: string;
    default_DarkYellow: string;
    default_DarkBlue: string;
}
export interface IThemeManagerParams {
    themeProvider?: IThemeProvider;
    TenantThemesProvider?: ITenantThemesProvider;
    pageContext?: ISpPageContext;
    defaultThemeDisplayNames?: IDefaultThemeDisplayStrings;
}

export class ThemeManager {
    private _themeProvider: IThemeProvider;
    private _tenantThemeProvider: ITenantThemesProvider;
    private _themes: ITheme[];
    private _loadingThemes: Promise<ITheme[]>;
    private _currentTheme: ITheme;
    private _currentThemePromise: Promise<ITheme>;
    private _themesPromise: Promise<ITheme[]>;
    private _params: IThemeManagerParams;

    constructor(params: IThemeManagerParams) {
        this._params = params;
        this._themeProvider = params.themeProvider ? params.themeProvider : getThemeProvider(params.pageContext);
        this._themes = this._getDefaultThemes();
        this._tenantThemeProvider = params.TenantThemesProvider ? params.TenantThemesProvider : new TenantThemesProvider({ pageContext: params.pageContext });
        this._currentThemePromise = this._loadCurrentTheme(true);
        this._themesPromise = this._loadThemes();
    }

    /**
     * Removes any theme that has been loaded with loadTheme and returns it to the theme
     * that is currently applied to the site.
     */
    public resetTheme() {
        this.loadTheme(this._currentTheme);
    }

    public loadTheme(theme: ITheme) {
        const backgroundImageUri = theme.backgroundImageUri ? `url("${theme.backgroundImageUri}")` : 'none';
        const backgroundOverlay = theme.theme.backgroundOverlay ? theme.theme.backgroundOverlay : '';
        const newTheme = {
            ...theme.theme,
            backgroundImageUri: backgroundImageUri,
            backgroundOverlay: backgroundOverlay
        };
        loadTheme({ palette: newTheme });
    }

    /**
     * Returns all of the themes that a user may have access to apply.
     */
    public getThemes() {
        return this._themes;
    }

    public getThemesPromise() {
        return this._themesPromise;
    }

    public getLoadingThemes(): Promise<ITheme[]> {
        return this._loadingThemes;
    }

    public getCurrentTheme(force?: boolean): Promise<ITheme> {
        if (force) {
            this._currentTheme = null;
            this._currentThemePromise = this._loadCurrentTheme(true);
        }
        if (!this._currentTheme && this._currentThemePromise) {
            return this._currentThemePromise;
        } else {
            return Promise.wrap(this._currentTheme);
        }
    }

    public clearSetTheme(): Promise<boolean> {
        return this._tenantThemeProvider.clearTheme();
    }

    /**
     * Saves/applies the ITheme to the site. This theme will now appear on this site even when refreshed.
     */
    public setTheme(theme: ITheme): Promise<string> {
        let colors: { [key: string]: RgbaColor } = {};

        for (let color in theme.theme) {
            colors[color] = RgbaColor.fromHtmlColor(theme.theme[color]);
        }

        let themeInfo: IThemeInfo = {
            name: theme.name,
            theme: {
                backgroundImageUri: theme.backgroundImageUri || '',
                palette: colors,
                cacheToken: '',
                isDefault: true,
                isInverted: theme.isInverted,
                version: ''
            },
        };

        return this._tenantThemeProvider.setTheme(themeInfo).then(result => {
            // Need to make sure that we get the newly set theme from the server.
            this._loadCurrentTheme(true);
            return result;
        });
    }

    /**
     * Gets the theme that's currently applied to the site.
     */
    private _loadCurrentTheme(forceUpdate?: boolean): Promise<ITheme> {
        return this._themeProvider.loadFullThemeData(forceUpdate).then(data => {
            let currentTheme: ITheme = {
                name: 'Current',
                isInverted: data.isInverted,
                backgroundImageUri: data.backgroundImageUri,
                theme: {}
            };
            for (let color in data.palette) {
                if (data.palette[color]) {
                    currentTheme.theme[color] = RgbaColor.toHtmlString(data.palette[color]);
                }
            }
            currentTheme.theme = assign({}, currentTheme.theme, createTheme({ palette: currentTheme.theme }).palette);
            this._currentTheme = currentTheme;
            this._currentThemePromise = null;
            return currentTheme;
        });
    }

    /**
     * Gets the themes that are currently available.
     */
    private _loadThemes(): Promise<ITheme[]> {

        return this._tenantThemeProvider.getTenantThemes().then(data => {
            let themes: ITheme[] = [];
            data.forEach(theme => {
                themes.push({
                    name: theme.name,
                    isInverted: theme.theme.isInverted,
                    backgroundImageUri: theme.theme.backgroundImageUri,
                    theme: this._convertPaletteToHTMLStrings(theme.theme.palette),
                    error: theme.error
                });
            });

            return themes;
        });
    };

    private _convertPaletteToHTMLStrings(palette: { [key: string]: RgbaColor }) {
        let htmlPalette: IThemeColors = {}
        for (let color in palette) {
            if (palette[color]) {
                htmlPalette[color] = RgbaColor.toHtmlString(palette[color]);
            }
        }
        return htmlPalette;
    }

    private _getDefaultThemes(): ITheme[] {
        let themeStrings = this._params.defaultThemeDisplayNames;
        let defaultThemes = getDefaultThemes();
        let themes = [];
        if (themeStrings) {
            for (let key in themeStrings) {
                if (defaultThemes[key]) {
                    defaultThemes[key].name = themeStrings[key];
                    themes.push(defaultThemes[key]);
                }
            }
        }
        return themes;
    }
}

export default ThemeManager;