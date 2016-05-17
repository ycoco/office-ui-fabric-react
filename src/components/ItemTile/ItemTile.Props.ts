import * as React from 'react';
import ItemTile from './ItemTile';

export interface IItemTileProps extends React.Props<ItemTile> {
  /** List of tile items to render */
  items: IItemTileItem[];
}

export interface IItemTileItem {
  // Contents
  /** Temporary text for testing */
  tempText : string;

  // Behavior
  /** On item clicked */
  onClick?: (item?: IItemTileItem, evt?: React.MouseEvent) => void;
}
