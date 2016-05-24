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
      `http://placekitten.com/192/192`,
      `http://placekitten.com/200/200`,
      `http://placekitten.com/208/208`,
      `http://placekitten.com/216/216`,
      `http://placekitten.com/224/224`,
      `http://placekitten.com/232/232`,
      `http://placekitten.com/240/240`
    ];

    let itemTileProps: IItemTileProps = {
        itemTileType: ItemTileType.folder,
        displayName: `I am a folder`,
        subText: `Folder subtext`,
        onClick: (tile: IItemTileProps) => {
          alert(`You clicked on ${tile.displayName}`);
        },
        isShared: true,
        tabIndex: 2,
        itemTileTypeProps: {
          childCount: 4,
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
