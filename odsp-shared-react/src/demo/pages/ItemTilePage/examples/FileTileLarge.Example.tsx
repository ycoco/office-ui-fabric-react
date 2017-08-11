import * as React from 'react';
import { ItemTile, IItemTileProps, ItemTileType } from '../../../../components/index';
import { autobind } from 'office-ui-fabric-react/lib/Utilities';

export interface IItemTileScaleExampleState {
  isSelected?: boolean;
  cellWidth?: number;
  cellHeight?: number;
  prevMouseX?: number;
  prevMouseY?: number;
  randomCatX?: number;
  randomCatY?: number;
}

export class FileTileLargeExample extends React.Component<React.Props<FileTileLargeExample>, IItemTileScaleExampleState> {
  constructor() {
    super();

    this.state = {
      isSelected: false,
      cellWidth: 384,
      cellHeight: 256,
      prevMouseX: undefined,
      prevMouseY: undefined,
      randomCatX: Math.round(Math.random() * 300),
      randomCatY: Math.round(Math.random() * 300)
    };
  }

  public render() {
    let itemTileProps: IItemTileProps = {
        itemTileType: ItemTileType.file,
        displayName: `Large item tile`,
        subText: `Click and drag on me!`,
        thumbnailUrl: `http://placekitten.com/${384 + this.state.randomCatX}/${256 + this.state.randomCatY}`,
        cellWidth: this.state.cellWidth,
        cellHeight: this.state.cellHeight
    };

    return (
      <div
        width={ this.state.cellWidth }
        height={ this.state.cellHeight }
        onMouseDown={ this._onMouseDown }
        onMouseUp={ this._onMouseUp }
        onMouseLeave={ this._onMouseLeave }
        onMouseMove={ this._onMouseMove }
        >
        <ItemTile {...itemTileProps} />
      </div>
    );
  }

  @autobind
  private _onMouseDown(ev: React.MouseEvent<HTMLElement>) {
    this.setState({
      isSelected: true,
      prevMouseX: undefined,
      prevMouseY: undefined
    });
    ev.preventDefault();
  }

  @autobind
  private _onMouseUp() {
    this.setState({ isSelected: false });
  }

  @autobind
  private _onMouseLeave(ev: React.MouseEvent<HTMLElement>) {
    this.setState({ isSelected: false });
  }

  @autobind
  private _onMouseMove(ev: React.MouseEvent<HTMLElement>) {
    if (this.state.isSelected) {
      if (this.state.prevMouseX) {
        this.setState({
          cellWidth: Math.max(this.state.cellWidth + ev.screenX - this.state.prevMouseX, 100),
          cellHeight: Math.max(this.state.cellHeight + ev.screenY - this.state.prevMouseY, 100)
        });
      }
      this.setState({
        prevMouseX: ev.screenX,
        prevMouseY: ev.screenY
      });
    }
  }
}
