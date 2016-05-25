import * as React from 'react';
import { ItemTile, IItemTileProps, ItemTileType } from '../../../../components/index';

export class FolderTileAlbumExample extends React.Component<React.Props<FolderTileAlbumExample>, {}> {

  public refs: {
    [key: string]: React.ReactInstance;
    tile: ItemTile;
  };

  constructor() {
    super();
  }

  public render() {
    let pulseThumbnails = [
      `http://placekitten.com/224/224`,
      `http://placekitten.com/232/232`,
      `http://placekitten.com/240/240`
    ];

    let itemTileProps: IItemTileProps = {
        itemTileType: ItemTileType.folder,
        displayName: `I am an album`,
        subText: `Here is some album subtext`,
        onClick: (tile: IItemTileProps) => {
          alert(`You clicked on ${tile.displayName}`);
        },
        itemTileTypeProps: {
          pulseThumbnails: (pulseThumbnails || []),
          isAlbum: true
        }
    };

    return (
      <ItemTile {...itemTileProps} />
    );
  }
}
