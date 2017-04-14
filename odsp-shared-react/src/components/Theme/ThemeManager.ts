import { loadTheme } from '@microsoft/load-themed-styles';
import { getDefaultThemes } from './DefaultThemes';
import { getThemeProvider, IThemeProvider, TenantThemeProvider, IThemeInfo } from '@ms/odsp-datasources/lib/Theming';
import RgbaColor from '@ms/odsp-utilities/lib/theming/RgbaColor';
import ISpPageContext from '@ms/odsp-datasources/lib/interfaces/ISpPageContext';
import { ITheme, IThemeColors } from './Theme';

export type ThemeDictionary = { [key: string]: ITheme };

export interface IThemeManagerParams {
  themeProvider?: IThemeProvider;
  pageContext?: ISpPageContext;
}

export class ThemeManager {
  private _themeProvider: IThemeProvider;
  private _tenantThemeProvider: TenantThemeProvider;
  private _themeDictionary: ThemeDictionary;
  private _loadingThemes: Promise<ThemeDictionary>;
  private _currentTheme: ITheme;
  private _currentThemePromise: Promise<ITheme>;
  private _themeDictionaryPromise: Promise<ThemeDictionary>

  constructor(params: IThemeManagerParams) {
    this._themeProvider = params.themeProvider ? params.themeProvider : getThemeProvider(params.pageContext);
    this._themeDictionary = this._getDefaultThemes();
    this._tenantThemeProvider = new TenantThemeProvider({ pageContext: params.pageContext });
    this._currentThemePromise = this._loadCurrentTheme(true);
    this._themeDictionaryPromise = this._loadThemeDictionary();
  }

  /**
   * Removes any theme that has been loaded with loadTheme and returns it to the theme
   * that is currently applied to the site.
   */
  public resetTheme() {
    loadTheme(this._currentTheme.theme);
  }

  public loadTheme(theme: ITheme) {
    loadTheme(theme.theme);
  }

  /**
   * Returns all of the themes that a user may have access to apply.
   */
  public getThemes() {
    return this._themeDictionary;
  }

  public getThemeDictionary() {
    return this._themeDictionaryPromise;
  }

  public getLoadingThemes(): Promise<ThemeDictionary> {
    return this._loadingThemes;
  }

  public getCurrentTheme(): Promise<ITheme> {
    if (!this._currentTheme && this._currentThemePromise) {
      return this._currentThemePromise;
    } else {
      return Promise.resolve(this._currentTheme);
    }
  }

  /**
   * Saves/applies the ITheme to the site. This theme will now appear on this site even when refreshed.
   */
  public setTheme(theme: ITheme) {
    let colors: { [key: string]: RgbaColor } = {};

    for (let color in theme.theme) {
      colors[color] = RgbaColor.fromHtmlColor(theme.theme[color]);
    }

    let themeInfo: IThemeInfo = {
      name: theme.name,
      theme: {
        backgroundImageUri: '',
        palette: colors,
        cacheToken: '',
        isDefault: true,
        isInverted: false,
        version: ''
      },
    };

    this._tenantThemeProvider.setTheme(themeInfo);
    this._tenantThemeProvider.getTenantThemes();
  }

  /**
   * Gets the theme that's currently applied to the site.
   */
  private _loadCurrentTheme(forceUpdate?: boolean): Promise<ITheme> {
    return new Promise<ITheme>(resolve => this._themeProvider.loadFullThemeData(forceUpdate).then(data => {
      let currentTheme: ITheme = {
        name: 'Current',
        theme: {}
      };
      for (let color in data.palette) {
        if (data.palette[color]) {
          currentTheme.theme[color] = RgbaColor.toHtmlString(data.palette[color]);
        }
      }
      this._currentTheme = currentTheme;
      this._currentThemePromise = null;
      resolve(currentTheme);
    }));
  }

  /**
   * Gets the theme that's currently applied to the site.
   */
  private _loadThemeDictionary(forceUpdate?: boolean): Promise<ThemeDictionary> {

    return new Promise<ThemeDictionary>(resolve => {
      this._tenantThemeProvider.getTenantThemes().then(data => {
        let themeDictionary: ThemeDictionary = {};
        data.forEach(theme => {
          themeDictionary[theme.name] = {
            name: theme.name,
            theme: this._convertPaletteToHTMLStrings(theme.theme.palette)
          }
        });

        resolve(themeDictionary);
      });
    });
  }

  private _convertPaletteToHTMLStrings(palette: { [key: string]: RgbaColor }) {
    let htmlPalette: IThemeColors = {}
    for (let color in palette) {
      if (palette[color]) {
        htmlPalette[color] = RgbaColor.toHtmlString(palette[color]);
      }
    }
    return htmlPalette;
  }
  private _getDefaultThemes() {
    let themes = getDefaultThemes();
    return this._getThemesFromArray(themes);
  }

  /**
   * Get's a dictionary of themes from an array.
   */
  private _getThemesFromArray(themes: ITheme[]): ThemeDictionary {
    let themeDictionary: ThemeDictionary = {};
    for (let i = 0; i < themes.length; i++) {
      let theme = themes[i];
      // Cache this eventually.
      themeDictionary[theme.name] = theme;
    }
    return themeDictionary;
  }
}
export default ThemeManager;