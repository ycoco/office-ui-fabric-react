import * as React from 'react';
import { ItemTile, IItemTileProps } from '../../../../components/index';

export class ItemTileExample extends React.Component<React.Props<ItemTileExample>, {}> {
  constructor() {
    super();
  }

  public render() {
    let itemTileProps: IItemTileProps = {
        tempText: `Sample Item Tile`,
        onClick: (tile: IItemTileProps) => {
          alert(`You clicked on ${tile.tempText}`);
        }
    };

    return (
      <ItemTile {...itemTileProps} />
    );
  }
}
