import * as React from 'react';
import { HorizontalNav } from './HorizontalNav';
import { IReactDeferredComponentCapability } from '../ReactDeferredComponent/index';
import { INavLink } from 'office-ui-fabric-react/lib/Nav';
import { IBaseProps } from 'office-ui-fabric-react/lib/Utilities';

/**
 * HorizontalNav class interface.
 */
export interface IHorizontalNav {
  /**
   * By default, the horizontal nav relies on window.resize events to trigger measure for
   * layout purposes (specifically the extent to which items end up in overflow). This method
   * provides a mechanism to force a layout measurement should there be a need, such as when
   * containing element is resized without the window resizing.
   */
  measureLayout(): void;
}

export interface IHorizontalNavProps extends React.Props<HorizontalNav>, IReactDeferredComponentCapability, IBaseProps {
  /**
   * Items to render on the nav, if possible.
   */
  items: INavLink[];

  /**
   * Items to always render in the overflow.
   */
  overflowItems?: INavLink[];

  /**
   * If horizontal nodes are editable, caller can set editLink.
   */
  editLink?: INavLink;

  /**
   * Represents aria-label value for accessibility.
   */
  ariaLabel?: string;

  /**
   * Flag if HorizontalNav is in edit mode.
   */
  isEditMode?: boolean;

  /**
 * Flag if HorizontalNav has selected state.
 */
  hasSelectedState?: boolean;

  /**
 * HorizontalNav current selected key.
 */
  selectedKey?: string;

  /**
   * Represents aria-label value for accessibility.
   */
  splitButtonAriaLabel?: string;
}
