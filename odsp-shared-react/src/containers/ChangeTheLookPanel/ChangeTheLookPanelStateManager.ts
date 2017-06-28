
import { IChangeTheLookPanelProps, ChangeTheLookPanelStrings } from '../../components/ChangeTheLookPanel/ChangeTheLookPanel.Props'
import { IChangeTheLookPanelStateManagerParams } from './ChangeTheLookPanelContainerStateManager.Props';
import ISpPageContext from '@ms/odsp-datasources/lib/interfaces/ISpPageContext';
import { ThemeManager, ThemeDictionary } from '../../components/Theme/ThemeManager';
import { ITheme } from '../../components/Theme/Theme';
import { autobind } from 'office-ui-fabric-react/lib/Utilities';
import { Qos, ResultTypeEnum } from '@ms/odsp-utilities/lib/logging/events/Qos.event';
import { Engagement } from '@ms/odsp-utilities/lib/logging/events/Engagement.event';

const CHANGE_THE_LOOK_PAGE_LINK = 'designgallery.aspx';
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
    Engagement.logData({
      name: 'ChangeTheLookPanelStateManager.LoadPanel'
    });
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
      changeTheLookPageLink: this._getClassicChangeTheLookUrl(),
      onClearTheme: this._onClearTheme
    }

    return panelProps;
  }

  public componentDidMount() {
    this._loadThemes();
  }

  private _loadThemes() {
    let loadThemesQos = new Qos({ name: 'ChangeTheLookPanelStateManager.LoadThemes' });
    this._themeManager.getThemePromiseDictionary().then(value => {
      for (let themeKey in value) {
        this._themes[themeKey] = value[themeKey];
      }
      this._params.updateState(this.getRenderProps());
      loadThemesQos.end({ resultType: ResultTypeEnum.Success });
    }, error => {
      loadThemesQos.end({
        resultType: ResultTypeEnum.Failure,
        error: 'There was an error while loading the themes ' + JSON.stringify(error)
      });
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
            Engagement.logData({
              name: 'ChangeTheLookPanelStateManager.Cancel.Click'
            });
            let cancelQos = new Qos({ name: 'ChangeTheLookPanelStateManager.CancelClick' });
            try {
              this._themeManager.resetTheme();
              cancelQos.end({ resultType: ResultTypeEnum.Success });
            } catch (error) {
              cancelQos.end({ resultType: ResultTypeEnum.Failure, error: error });
            }
          }
        }
      );
    }
  }

  @autobind
  private _onSave() {
    let saveQos = new Qos({ name: 'ChangeTheLookPanelStateManager.SaveTheme' });
    Engagement.logData({
      name: 'ChangeTheLookPanelStateManager.SaveTheme.Click'
    });
    if (this._currentlyAppliedTheme) {
      this._themeApplied = true;
      this._themeManager.setTheme(this._currentlySelectedTheme).then(result => {
        saveQos.end({ resultType: ResultTypeEnum.Success });
      },
        error => {
          saveQos.end({ resultType: ResultTypeEnum.Failure, error: error })
        });
    }

  }

  @autobind
  private _onClearTheme() {
    let clearQos = new Qos({ name: 'ChangeTheLookPanelStateManager.ClearTheme' });
    Engagement.logData({
      name: 'ChangeTheLookPanelStateManager.ClearTheme.Click'
    });
    this._themeManager.clearSetTheme().then(() =>
      this._themeManager.getCurrentTheme(true).then(data => {
        clearQos.end({ resultType: ResultTypeEnum.Success });
        location.reload();
      },
        error => {
          clearQos.end({
            resultType: ResultTypeEnum.Failure,
            error: error
          });
        }));

  }

  @autobind
  private _onCancel() {
    this._verifyAndCallFunction(this._params.onCancel);
  }

  @autobind
  private _onThemeClick(ev: React.MouseEvent<any>, theme: ITheme) {
    let themeClickQos = new Qos({ name: 'ChangeTheLookPanelStateManager.PreviewThemeClick' });
    Engagement.logData({
      name: 'ChangeTheLookPanelStateManager.PreviewTheme.Click'
    });
    if (theme) {
      this._applyTheme(theme);
      this._currentlySelectedTheme = theme;
      this._params.updateState(this.getRenderProps());
      themeClickQos.end({ resultType: ResultTypeEnum.Success });
    } else {
      themeClickQos.end({ resultType: ResultTypeEnum.Failure, error: 'No theme was provided to preview' });
    }

  }

  @autobind
  private _applyTheme(theme: ITheme) {
    this._themeManager.loadTheme(theme);
  }

  private _getClassicChangeTheLookUrl(): string {
    const webAbsoluteUrl = this._pageContext.webAbsoluteUrl;
    const layoutsUrl = this._pageContext.layoutsUrl;

    return `${webAbsoluteUrl}/${layoutsUrl}/${CHANGE_THE_LOOK_PAGE_LINK}`;
  }

  private _verifyAndCallFunction(propertyFunction: Function) {
    if (propertyFunction && typeof propertyFunction === 'function') {
      propertyFunction();
    }

  }
}

export default ChangeTheLookPanelStateManager;