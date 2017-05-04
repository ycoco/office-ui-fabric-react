
import { IChangeTheLookPanelProps, ChangeTheLookPanelStrings } from '../../components/ChangeTheLookPanel/ChangeTheLookPanel.Props'
import { IChangeTheLookPanelStateManagerParams } from './ChangeTheLookPanelContainerStateManager.Props';
import ISpPageContext from '@ms/odsp-datasources/lib/interfaces/ISpPageContext';
import { ThemeManager, ThemeDictionary } from '../../components/Theme/ThemeManager';
import { ITheme } from '../../components/Theme/Theme';
import { loadTheme } from '@microsoft/load-themed-styles';
import { autobind } from 'office-ui-fabric-react/lib/Utilities';

const CHANGE_THE_LOOK_PAGE_LINK = '/_layouts/15/designgallery.aspx';
export class ChangeTheLookPanelStateManager {

  private _params: IChangeTheLookPanelStateManagerParams;
  private _pageContext: ISpPageContext;
  private _themeManager: ThemeManager;
  private _currentlySelectedTheme: ITheme;
  private _themes: ThemeDictionary;
  private _isOpen: boolean;
  private _currentlyAppliedTheme: ITheme;
  private _themeApplied: boolean;

  constructor(params: IChangeTheLookPanelStateManagerParams) {
    this._params = params;
    this._pageContext = params.pageContext;
    this._themeManager = new ThemeManager({
      pageContext: params.pageContext,
      defaultThemeDisplayNames: params.defaultThemeDisplayNames
    });
    this._themes = this._themeManager.getThemes();
    this._isOpen = true;
    this._themeApplied = false;
    this._themeManager.getCurrentTheme().then(data => this._currentlyAppliedTheme = data);
  }

  public getRenderProps(): IChangeTheLookPanelProps {
    let strings: ChangeTheLookPanelStrings = this._params.strings;
    let themes = [];

    for (let themeKey in this._themes) {
      themes.push(this._themes[themeKey]);
    }

    let panelProps: IChangeTheLookPanelProps = {
      strings: strings,
      onSave: this._onSave,
      saveEnabled: !!this._currentlySelectedTheme,
      onCancel: this._onCancel,
      themes: themes,
      onThemeClick: this._onThemeClick,
      isOpen: this._isOpen,
      onDismiss: this._onDismiss,
      changeTheLookPageLink: CHANGE_THE_LOOK_PAGE_LINK
    }

    return panelProps;
  }

  public componentDidMount() {
    this._themeManager.getThemePromiseDictionary().then(value => {
      for (let themeKey in value) {
        this._themes[themeKey] = value[themeKey];
      }
      this._params.updateState(this.getRenderProps());
    });
  }

  @autobind
  private _onDismiss() {
    // Only dismiss the panel if it's currently open to prevent it from attempting to dismiss twice.
    if (this._isOpen) {
      this._isOpen = false;

      this._params.updateState(
        this.getRenderProps(),
        () => {
          if (this._params.onDismiss) {
            this._params.onDismiss();
          }
          if (!this._themeApplied) {
            this._themeManager.resetTheme();
          }
        }
      );
    }
  }

  @autobind
  private _onSave() {
    this._currentlyAppliedTheme && this._themeManager.setTheme(this._currentlySelectedTheme);
    this._themeApplied = true;
  }

  @autobind
  private _onCancel() {
    this._verifyAndCallFunction(this._params.onCancel);
  }

  @autobind
  private _onThemeClick(ev: React.MouseEvent<any>, theme: ITheme) {
    if (theme) {
      this._applyTheme(theme);
      this._currentlySelectedTheme = theme;
      this._params.updateState(this.getRenderProps());
    }
  }

  @autobind
  private _applyTheme(theme: ITheme) {
    loadTheme(theme.theme);
  }

  private _verifyAndCallFunction(propertyFunction: Function) {
    if (propertyFunction && typeof propertyFunction === 'function') {
      propertyFunction();
    }

  }
}

export default ChangeTheLookPanelStateManager;