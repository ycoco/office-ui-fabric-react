import * as React from 'react';
import { ItemTile, IItemTileProps, ItemTileType } from '../../../../components/index';
import { autobind } from 'office-ui-fabric-react/lib/Utilities';

export class FileTileExample extends React.Component<React.Props<FileTileExample>, {}> {
  private _thumbnailUrl;
  private _thumbnailHeight;

  constructor() {
    super();

    this._thumbnailUrl = 'http://placekitten.com/240/';
    this._thumbnailHeight = 240;
  }

  public render() {
    let itemTileProps: IItemTileProps = {
        itemTileType: ItemTileType.file,
        displayName: `I am an item tile`,
        subText: `Click on me to test thumbnail crossfading`,
        onClick: this._onClick,
        tooltipText: `Tooltip text`,
        thumbnailUrl: this._thumbnailUrl + String(this._thumbnailHeight),
        itemTileTypeProps: {
          fileTypeIconUrl: 'dist/icon-ppt.png'
        }
    };

    let itemTileNoThumbProps: IItemTileProps = {
        itemTileType: ItemTileType.file,
        displayName: `I have no thumbnail`,
        subText: `Extremely long subtext for a sample item tile to test the ellipses on text overflow`,
        onClick: () => {
          alert(`You clicked on a tile`);
        },
        tooltipText: `Tooltip Text`,
        itemTileTypeProps: {
          fileTypeIconUrl: 'dist/icon-one-96.png'
        }
    };

    return (
      <div width='100%'>
        <ItemTile {...itemTileProps} />
        <ItemTile {...itemTileNoThumbProps} />
      </div>
    );
  }

  @autobind
  private _onClick() {
    this._thumbnailHeight += 8;
    this.forceUpdate();
  }
}
