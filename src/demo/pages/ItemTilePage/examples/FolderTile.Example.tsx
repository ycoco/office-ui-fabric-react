import * as React from 'react';
import { ItemTile, IItemTileProps, ItemTileType } from '../../../../components/index';

import Async from '@ms/office-ui-fabric-react/lib/utilities/Async/Async';

export default class FolderTileExample extends React.Component<React.Props<FolderTileExample>, {}> {

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
      `http://placekitten.com/260/260`,
      `http://placekitten.com/280/280`,
      `http://placekitten.com/300/300`,
      `http://placekitten.com/320/320`,
      `http://placekitten.com/340/340`,
      `http://placekitten.com/360/360`,
      `http://placekitten.com/380/380`
    ];

    let itemTileProps: IItemTileProps = {
        itemTileType: ItemTileType.folder,
        displayName: `I am a folder`,
        subText: `I fold things`,
        onClick: (tile: IItemTileProps) => {
          alert(`You clicked on ${tile.displayName}`);
        },
        isShared: true,
        tooltipText: `Take me to kittens`,
        tabIndex: 2,
        itemTileTypeProps: {
          isSubTextVisible: true,
          pulseThumbnails: (pulseThumbnails || [])
        }
    };

    return (
      <ItemTile ref='tile' {...itemTileProps} />
    );
  }

  private _pulse() {
    this.refs.tile.pulse();
  }
}
