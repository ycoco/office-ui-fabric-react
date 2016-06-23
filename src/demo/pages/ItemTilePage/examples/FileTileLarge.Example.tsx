import * as React from 'react';
import { ItemTile, IItemTileProps, ItemTileType } from '../../../../components/index';

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
        tabIndex: 5,
        thumbnailUrl: `http://placekitten.com/${384 + this.state.randomCatX}/${256 + this.state.randomCatY}`,
        cellWidth: this.state.cellWidth,
        cellHeight: this.state.cellHeight
    };

    return (
      <div
        width={ this.state.cellWidth }
        height={ this.state.cellHeight }
        onMouseDown={ ((ev: React.MouseEvent) => {
          this.setState({
            isSelected: true,
            prevMouseX: undefined,
            prevMouseY: undefined
          });
          ev.preventDefault();
        }).bind(this) }
        onMouseUp={ (() => {
          this.setState({ isSelected: false });
        }).bind(this) }
        onMouseLeave={ (() => {
          this.setState({ isSelected: false });
        }).bind(this) }
        onMouseMove={ ((ev: React.MouseEvent) => {
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
        }).bind(this) }
        >
        <ItemTile {...itemTileProps} />
      </div>
    );
  }
}
