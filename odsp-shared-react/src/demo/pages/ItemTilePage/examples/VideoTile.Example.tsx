import * as React from 'react';
import { ItemTile, IItemTileProps, ItemTileType } from '../../../../components/index';

export class VideoTileExample extends React.Component<React.Props<VideoTileExample>, {}> {
  constructor() {
    super();
  }

  public render() {
    let itemTileProps: IItemTileProps = {
        itemTileType: ItemTileType.video,
        onClick: (itemTile: ItemTile) => {
          alert(`You clicked on a tile ${itemTile.props.tooltipText}`);
        },
        tooltipText: `I am a video`,
        thumbnailUrl: `http://placekitten.com/240/240`
    };

    return (
      <ItemTile {...itemTileProps} />
    );
  }
}
