import { loadTheme } from 'office-ui-fabric-react/lib/Styling';
import { getDefaultThemes } from './DefaultThemes';
import { getThemeProvider, IThemeProvider, TenantThemesProvider, IThemeInfo, ITenantThemesProvider } from '@ms/odsp-datasources/lib/Theming';
import RgbaColor from '@ms/odsp-utilities/lib/theming/RgbaColor';
import ISpPageContext from '@ms/odsp-datasources/lib/interfaces/ISpPageContext';
import { ITheme, IThemeColors } from './Theme';
import Promise from '@ms/odsp-utilities/lib/async/Promise';

export type ThemeDictionary = { [key: string]: ITheme };

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
  private _themeDictionary: ThemeDictionary;
  private _loadingThemes: Promise<ThemeDictionary>;
  private _currentTheme: ITheme;
  private _currentThemePromise: Promise<ITheme>;
  private _themeDictionaryPromise: Promise<ThemeDictionary>;
  private _params: IThemeManagerParams;

  constructor(params: IThemeManagerParams) {
    this._params = params;
    this._themeProvider = params.themeProvider ? params.themeProvider : getThemeProvider(params.pageContext);
    this._themeDictionary = this._getDefaultThemes();
    this._tenantThemeProvider = params.TenantThemesProvider ? params.TenantThemesProvider : new TenantThemesProvider({ pageContext: params.pageContext });
    this._currentThemePromise = this._loadCurrentTheme(true);
    this._themeDictionaryPromise = this._loadThemeDictionary();
  }

  /**
   * Removes any theme that has been loaded with loadTheme and returns it to the theme
   * that is currently applied to the site.
   */
  public resetTheme() {
    const backgroundImageUri = `url("${this._currentTheme.backgroundImageUri}")`;
    const theme = {
      ...this._currentTheme.theme,
      backgroundImageUri: backgroundImageUri
    };

    loadTheme({ palette: theme });
  }

  public loadTheme(theme: ITheme) {
    loadTheme({ palette: theme.theme });
  }

  /**
   * Returns all of the themes that a user may have access to apply.
   */
  public getThemes() {
    return this._themeDictionary;
  }

  public getThemePromiseDictionary() {
    return this._themeDictionaryPromise;
  }

  public getLoadingThemes(): Promise<ThemeDictionary> {
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
      this._currentTheme = currentTheme;
      this._currentThemePromise = null;
      return currentTheme;
    });
  }

  /**
   * Gets the themes that are currently available.
   */
  private _loadThemeDictionary(): Promise<ThemeDictionary> {

    return this._tenantThemeProvider.getTenantThemes().then(data => {
      let themeDictionary: ThemeDictionary = {};
      data.forEach(theme => {
        themeDictionary[theme.name] = {
          name: theme.name,
          isInverted: theme.theme.isInverted,
          backgroundImageUri: theme.theme.backgroundImageUri,
          theme: this._convertPaletteToHTMLStrings(theme.theme.palette)
        }
      });

      return themeDictionary;
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

  private _getDefaultThemes() {
    let themeStrings = this._params.defaultThemeDisplayNames;
    let themes = getDefaultThemes();
    if (themeStrings) {
      for (let key in themeStrings) {
        if (themes[key]) {
          themes[key].name = themeStrings[key];
        }
      }
    }
    return themes;
  }
}

export default ThemeManager;