import * as React from 'react';
import { ItemTile, IItemTileProps, ItemTileType } from '../../../../components/index';

export class FolderTileAlbumExample extends React.Component<React.Props<FolderTileAlbumExample>, {}> {
  constructor() {
    super();
  }

  public render() {
    let itemTileProps: IItemTileProps = {
        itemTileType: ItemTileType.folder,
        displayName: `I am an album`,
        subText: `Here is some album subtext`,
        onClick: (tile: IItemTileProps) => {
          alert(`You clicked on ${tile.displayName}`);
        },
        itemTileTypeProps: {
          pulseThumbnails: [
            { src: `http://placekitten.com/224/224` },
            { src: `http://placekitten.com/232/232` },
            { src: `http://placekitten.com/240/240` }
          ],
          isAlbum: true
        }
    };

    return (
      <ItemTile {...itemTileProps} />
    );
  }
}
