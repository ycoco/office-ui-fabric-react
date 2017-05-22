import { ITheme } from '../Theme/Theme';

export interface ChangeTheLookPanelStrings {
  saveButton: string;
  cancelButton: string;
  title: string;
  themeSampleText: string;
  changeTheLookPageLinkText: string;
  clearThemeButtonText?: string;
  noThemesFoundText?: string;
}

export interface IChangeTheLookPanelProps extends React.HTMLAttributes<HTMLElement> {
  /**
   * List of available themes.
   */
  themes: ITheme[];
  /**
   * Callback for what should happen when a theme item is clicked.
   */
  onThemeClick: (event?: React.MouseEvent<HTMLElement>, theme?: ITheme) => void;
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
  onSave?: (event: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => void;
  /**
   * Callback for what should happen when the cancel button is pressed.
   */
  onCancel?: (event: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => void;
  /**
   * Callback to clear the currently set site theme. Resets to the default theme.
   */
  onClearTheme?: (event: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => void;
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
  /**
   * Whether or not themes are currently loading.
   */
  loading?: boolean;
  /**
   * Text that will appear when there is an error. Should only be passed in if there is an error.
   */
  errorText?: string;
}