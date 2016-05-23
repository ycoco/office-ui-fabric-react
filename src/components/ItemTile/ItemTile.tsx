import * as React from 'react';
import './ItemTile.scss';
import { IItemTileProps } from './ItemTile.Props';

let _instance = 0;

/**
 * Item Tile Control, meant to display tiles.
 */
export class ItemTile extends React.Component<IItemTileProps, {}> {

  private _instanceIdPrefix: string;

  constructor(props: IItemTileProps, context?: any) {
    super(props, context);
    this._instanceIdPrefix = 'ItemTile-' + (_instance++) + '-';

  }

  public render() {
    return (
      <div className='ms-ItemTile' ref='ItemTileRegion' onClick={ this._onClick.bind(this, this.props) }>
        { this.props.tempText }
      </div>
    );
  }

  private _onClick(tile: IItemTileProps, ev: React.MouseEvent) {
    if (this.props.onClick) {
      this.props.onClick(tile, ev);

      ev.stopPropagation();
      ev.preventDefault();
    }
  }
}
