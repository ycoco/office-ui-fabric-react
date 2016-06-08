import * as React from 'react';
import { ItemTile, IItemTileProps, ItemTileType } from '../../../../components/index';

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
        onClick: ((tile: IItemTileProps) => {
          this._thumbnailHeight += 8;
          this.forceUpdate();
        }).bind(this),
        tooltipText: `Tooltip text`,
        thumbnailUrl: this._thumbnailUrl + String(this._thumbnailHeight)
    };

    let itemTileNoThumbProps: IItemTileProps = {
        itemTileType: ItemTileType.file,
        displayName: `I have no thumbnail`,
        subText: `Extremely long subtext for a sample item tile to test the ellipses on text overflow`,
        onClick: (tile: IItemTileProps) => {
          alert(`You clicked on ${tile.displayName}`);
        },
        tooltipText: `Tooltip Text`
    };

    return (
      <div width='100%'>
        <ItemTile {...itemTileProps} />
        <ItemTile {...itemTileNoThumbProps} />
      </div>
    );
  }
}
