import * as React from 'react';
import { HorizontalNav } from './HorizontalNav';

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

export interface IHorizontalNavProps extends React.Props<HorizontalNav> {
  /**
   * Items to render on the nav, if possible.
   */
  items: IHorizontalNavItem[];

  /**
   * Items to always render in the overflow.
   */
  overflowItems?: IHorizontalNavItem[];

  /**
   * Represents aria-label value for accessibility.
   */
  ariaLabel?: string;
}

export interface IHorizontalNavItem {
  /**
   * The text displayed in the navigation item.
   */
  text: string;

  /**
   * Behavior when nav item is clicked.
   */
  onClick?: (item?: IHorizontalNavItem, evt?: React.MouseEvent) => void;

  /**
   * Child horizontal nav items. The control only looks at this property
   * for top level nav items (i.e. 2 level is supported at most).
   */
  childNavItems?: IHorizontalNavItem[];
}
