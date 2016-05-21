import * as React from 'react';
import { ItemTile, IItemTileProps, ItemTileType } from '../../../../components/index';

export default class VideoTileExample extends React.Component<React.Props<VideoTileExample>, {}> {
  constructor() {
    super();
  }

  public render() {
    let itemTileProps: IItemTileProps = {
        itemTileType: ItemTileType.video,
        displayName: `I am a folder`,
        onClick: (tile: IItemTileProps) => {
          alert(`You clicked on ${tile.displayName}`);
        },
        tooltipText: `Take me to kittens`,
        linkUrl: `http://windows.microsoft.com/en-us/windows/sleepy-kittens-download-theme`,
        tabIndex: 4,
        thumbnailUrl: `http://placekitten.com/240/240`
    };

    return (
      <ItemTile {...itemTileProps} />
    );
  }
}
