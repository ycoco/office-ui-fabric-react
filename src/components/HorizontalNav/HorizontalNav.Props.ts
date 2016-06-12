import * as React from 'react';
import { HorizontalNav } from './HorizontalNav';

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
   * Behavior when nav item is clicked
   */
  onClick?: (item?: IHorizontalNavItem, evt?: React.MouseEvent) => void;

  /**
   * Child horizontal nav items. The control only looks at this property
   * for top level nav items (i.e. 2 level is supported at most).
   */
  childNavItems?: IHorizontalNavItem[];
}