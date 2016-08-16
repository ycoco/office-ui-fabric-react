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
}

