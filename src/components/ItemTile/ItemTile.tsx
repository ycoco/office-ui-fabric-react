import * as React from 'react';
import './ItemTile.scss';
import { IItemTileProps, IItemTileItem } from './ItemTile.Props';

export interface IItemTileState {
}

let _instance = 0;

/**
 * Item Tile Control, meant to display tiles.
 */
export default class ItemTile extends React.Component<IItemTileProps, IItemTileState> {
  public render() {
    return (
      <div className='ms-ItemTile' ref='ItemTileRegion'>
        <h2 className='ms-font-xl'>Lorem Ipsum</h2>
      </div>
    );
  }
}
