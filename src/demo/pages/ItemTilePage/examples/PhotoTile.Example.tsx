import * as React from 'react';
import { ItemTile, IItemTileProps, ItemTileType } from '../../../../components/index';

export class PhotoTileExample extends React.Component<React.Props<PhotoTileExample>, {}> {
  constructor() {
    super();
  }

  public render() {
    let itemTileProps: IItemTileProps = {
        itemTileType: ItemTileType.photo,
        displayName: `I am a folder`,
        onClick: (tile: IItemTileProps) => {
          alert(`You clicked on ${tile.displayName}`);
        },
        tooltipText: `Take me to kittens`,
        linkUrl: `http://windows.microsoft.com/en-us/windows/sleepy-kittens-download-theme`,
        tabIndex: 3,
        thumbnailUrl: `http://placekitten.com/240/232`
    };

    return (
      <ItemTile {...itemTileProps} />
    );
  }
}
