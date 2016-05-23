import * as React from 'react';
import { ItemTile } from './ItemTile';

export interface IItemTileProps extends React.Props<ItemTile> {
  // Contents
  /** Temporary text for testing */
  tempText : string;

  // Behavior
  /** On item clicked */
  onClick?: (item?: IItemTileProps, evt?: React.MouseEvent) => void;
}
