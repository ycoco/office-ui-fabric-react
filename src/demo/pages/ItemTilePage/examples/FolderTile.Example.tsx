import * as React from 'react';
import { ItemTile, IItemTileProps, ItemTileType } from '../../../../components/index';

import { Async } from '@ms/office-ui-fabric-react/lib/utilities/Async/Async';

export class FolderTileExample extends React.Component<React.Props<FolderTileExample>, {}> {

  public refs: {
    [key: string]: React.ReactInstance;
    tile: ItemTile;
  };

  private _async;

  constructor() {
    super();

    this._async = new Async(this);
  }

  public componentDidMount() {
    this._async.setInterval(this._pulse, 2000);
  }

  public componentWillUnmount() {
    this._async.dispose();
  }

  public render() {
    let pulseThumbnails = [
      { src: `http://placekitten.com/200/192` },
      { src: `http://placekitten.com/240/192` },
      { src: `http://placekitten.com/280/192` },
      { src: `http://placekitten.com/320/192` },
      { src: `http://placekitten.com/360/192` },
      { src: `http://placekitten.com/400/192` },
      { src: `http://placekitten.com/440/192` }
    ];

    let itemTileProps: IItemTileProps = {
        itemTileType: ItemTileType.folder,
        displayName: `I am a folder`,
        subText: `Folder subtext`,
        onClick: (tile: IItemTileProps) => {
          alert(`You clicked on ${tile.displayName}`);
        },
        isShared: true,
        itemTileTypeProps: {
          childCount: 4,
          isSubTextVisible: true,
          pulseThumbnails: (pulseThumbnails || [])
        }
    };

    let itemTilePropsNoPulse: IItemTileProps = {
        itemTileType: ItemTileType.folder,
        displayName: `This folder doesn't pulse`,
        thumbnailUrl: `http://placekitten.com/248/248`,
        itemTileTypeProps: {
          pulseThumbnails: []
        }
    };

    return (
      <div>
        <ItemTile ref='tile' {...itemTileProps} />
        <ItemTile {...itemTilePropsNoPulse} />
      </div>
    );
  }

  private _pulse() {
    this.refs.tile.pulse();
  }
}
