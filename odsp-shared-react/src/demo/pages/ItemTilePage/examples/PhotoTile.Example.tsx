import * as React from 'react';
import { ItemTile, IItemTileProps, ItemTileType } from '../../../../components/index';

export class PhotoTileExample extends React.Component<React.Props<PhotoTileExample>, {}> {
  constructor() {
    super();
  }

  public render() {
    let itemTileProps: IItemTileProps = {
        itemTileType: ItemTileType.photo,
        onClick: (itemTile: ItemTile) => {
          alert(`You clicked on a tile ${itemTile.props.tooltipText}`);
        },
        tooltipText: `I am a photo`,
        thumbnailUrl: `http://placekitten.com/240/232`
    };

    return (
      <ItemTile {...itemTileProps} />
    );
  }
}
