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
}