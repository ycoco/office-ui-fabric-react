import * as React from 'react';
import { ItemTile, IItemTileProps, ItemTileType } from '../../../../components/index';

export default class FileTileExample extends React.Component<React.Props<FileTileExample>, {}> {
  constructor() {
    super();
  }

  public render() {
    let itemTileProps: IItemTileProps = {
        itemTileType: ItemTileType.file,
        displayName: `I am an item tile`,
        subText: `Extremely long subtext for a sample item tile`,
        onClick: (tile: IItemTileProps) => {
          alert(`You clicked on ${tile.displayName}`);
        },
        tooltipText: `Take me to kittens`,
        linkUrl: `http://windows.microsoft.com/en-us/windows/sleepy-kittens-download-theme`,
        tabIndex: 1,
        thumbnailUrl: `http://placekitten.com/240/216`
    };

    let itemTileNoThumbProps: IItemTileProps = {
        itemTileType: ItemTileType.file,
        displayName: `I have no thumbnail`,
        onClick: (tile: IItemTileProps) => {
          alert(`You clicked on ${tile.displayName}`);
        },
        tooltipText: `Take me to kittens`,
        linkUrl: `http://windows.microsoft.com/en-us/windows/sleepy-kittens-download-theme`,
    };

    return (
      <div width='100%'>
        <ItemTile {...itemTileProps} />
        <ItemTile {...itemTileNoThumbProps} />
      </div>
    );
  }
}
