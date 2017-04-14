import { ITheme } from '../Theme/Theme';

export interface ChangeTheLookPanelStrings {
  saveButton: string;
  cancelButton: string;
  title: string;
  themeSampleText: string;
  changeTheLookPageLinkText: string;
}

export interface IChangeTheLookPanelProps extends React.HTMLAttributes<HTMLElement> {
  /**
   * List of available themes.
   */
  themes: ITheme[];
  /**
   * Callback for what should happen when a theme item is clicked.
   */
  onThemeClick: (event?: React.MouseEvent<any>, theme?: ITheme) => void;
  /**
   * Indicates whether or not the panel is open.
   */
  isOpen?: boolean;
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
   * The link at the bottom of the footer that will take users back to a change the look page.
   */
  changeTheLookPageLink?: string;
  /**
   * Whether or not the save button is enabled.
   */
  saveEnabled?: boolean;
}