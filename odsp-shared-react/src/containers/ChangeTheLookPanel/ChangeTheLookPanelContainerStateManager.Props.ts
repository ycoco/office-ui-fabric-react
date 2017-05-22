import * as React from 'react';
import ISpPageContext from '@ms/odsp-datasources/lib/interfaces/ISpPageContext';
import { ChangeTheLookPanelStrings, IChangeTheLookPanelProps } from '../../components/ChangeTheLookPanel/ChangeTheLookPanel.Props';
import { IDefaultThemeDisplayStrings } from '../../components/Theme/ThemeManager';

export interface IChangeTheLookPanelContainerParams {
  /**
   * The Page context
   */
  pageContext: ISpPageContext;
  /**
   * A list of strings that will be used to populate the panel.
   */
  strings: ChangeTheLookPanelStrings;
  /**
   * Callback for what should happen when the save button is pressed.
   */
  onSave?: (event: React.MouseEvent<any>) => void;
  /**
   * Callback for what should happen when the cancel button is pressed.
   */
  onCancel?: (event: React.MouseEvent<any>) => void;
  /**
   * Callback for what should happen when the panel is dismissed.
   */
  onDismiss?: () => void;
  /**
   * The names that should display for the default themes.
   */
  defaultThemeDisplayNames?: IDefaultThemeDisplayStrings;

  errorStrings?: ChangeTheLookErrorStrings;
}

export interface ChangeTheLookErrorStrings {
  errorFetchingThemes: string;
  errorSettingTheme: string;
}

export interface IChangeTheLookPanelStateManagerParams extends IChangeTheLookPanelContainerParams {
  /**
   * The callback that the statemanager uses to actually manage the state.
   */
  updateState: (newState: IChangeTheLookPanelProps, callback?: () => void) => void;
}