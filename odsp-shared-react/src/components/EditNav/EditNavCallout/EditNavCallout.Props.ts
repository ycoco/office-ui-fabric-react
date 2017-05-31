import { INavLink } from 'office-ui-fabric-react/lib/Nav';

export interface IEditNavCalloutProps {
  /**
   * Element to anchor the callout to.
   */
  targetElement?: HTMLElement;

  /**
   * callout Title string.
   */
  title: string;

 /**
   * callout ok button label.
   */
  okLabel: string;

 /**
   * callout cancel button label.
   */
  cancelLabel: string;

  /**
   * callout address text field label.
   */
  addressLabel: string;

  /**
   * callout display text label.
   */
  displayLabel: string;

  /**
   * callout address text placeholder.
   */
  addressPlaceholder?: string;

  /**
   * callout display text placeholder.
   */
  displayPlaceholder?: string;

  /**
   * callout address text field value.
   */
  addressValue?: string;

  /**
   * callout display field value.
   */
  displayValue?: string;

  /**
   * Optional callback on OK clicked.
   */
  onOKClicked?: Function;

  /**
   * Optional callback on cancel clicked.
   */
  onCancelClicked?: Function;

  /**
   * Gap space between callout beak and target element.
   */
  gapspace?: number;

  /**
   * Callback when the Callout tries to close.
   */
  onDismiss?: (ev?: any) => void;

  /**
   * callout invalid url error message.
   */
  errorMessage?: string;

  /**
   * callout checkbox open in new tab.
   */
  openInNewTabText?: string;

  /**
   * callout Link to dropdown list label.
   */
  linkToLabel?: string;

  /** List of known resources links. */
  linkToLinks?: INavLink[];

  /** Default key for dropdown control of known group resource links. */
  defaultSelectedKey?: string;

  /** insert mode or not for engagement log 1 insert 0 edit mode. */
  insertMode?: number;
}
