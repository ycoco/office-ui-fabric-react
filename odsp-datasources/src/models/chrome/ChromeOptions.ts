/**
 * Types of supported chrome controls
 */
export enum ChromeControlType {
  HEADER,
  NAV,
  FOOTER,
  SEARCHBOX
}

export enum NavPlacementType {
  LEFT,
  HORIZONTAL
}

/**
 * Defines supported layout type for composite header control.
 * Currently the layout type is indicated from nav placement.
 */
export enum HeaderLayoutType {
  /** Composite header control takes full width of the page */
  FULLBLEED,
  /** Composite header control is placed on a page with left nav */
  WITHLEFTNAV
}

/**
 * The configuration that determines how chrome would show up.
 */
export interface IChromeOptions {
  header?: IChromeControlOptions;
  nav?: INavControlOptions;
  footer?: IChromeControlOptions;
  search?: IChromeControlOptions;
};

/**
 * Base configuration for every chrome control
 */
export interface IChromeControlOptions {
  /**
   * Indicates if this control should be rendered in the page
   */
  hidden: boolean;
}

export interface INavControlOptions extends IChromeControlOptions {
  placement: NavPlacementType;
}

export default IChromeOptions;