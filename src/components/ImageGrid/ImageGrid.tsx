import * as React from 'react';
import './ImageGrid.scss';
import { IImageGridProps } from './ImageGrid.Props';

import { List } from '@ms/office-ui-fabric-react/lib/List';
import {
  IObjectWithKey,
  ISelection,
  SelectionMode,
  SelectionZone,
  Selection
  } from '@ms/office-ui-fabric-react/lib/utilities/selection/index';

// Default dimension constraints
const DEFAULT_MIN_HEIGHT = 192;

const CELL_MARGIN = 8;

export class ImageGrid extends React.Component<IImageGridProps, {}> {
  public static defaultProps = {
    minimumCellRatio: 0,
    maximumHeight: Infinity,
    minimumWidth: 0,
    minimumHeight: DEFAULT_MIN_HEIGHT,
    selectionMode: SelectionMode.none
  };

  public refs: {
    [key: string]: React.ReactInstance;
    list: List;
  };

  private _hasMounted: boolean;
  private _selection: ISelection;

  constructor(props) {
    super(props);

    this._onSelectionChanged = this._onSelectionChanged.bind(this);

    this._hasMounted = false;
    this._selection = new Selection(this._onSelectionChanged);
    this._selection.setItems(props.items as IObjectWithKey[], false);
  }

  public componentDidMount() {
    this._hasMounted = true;
  }

  public render() {
    let {
      items,
      selectionMode
    } = this.props;

    let selection = this._selection;

    return (
      <div className='ms-ImageGrid'>
        <SelectionZone
          selection={ selection }
          selectionMode={ selectionMode }
          >
          <List
            items={ items }
            onRenderCell={ this._onRenderCell.bind(this) }
            getItemCountForPage={ this._getItemCountForPage() }
            selection={ selection }
            ref='list'
            />
        </SelectionZone>
      </div>
    );
  }

  private _onRenderCell(item, index: number) {
    let { onRenderCell } = this.props;

    let selection = this._selection;

    return (
      <div className={ 'ms-ImageGrid-cell ' + (item.isRightCell && 'cell-right') }>
        { onRenderCell(item, index, selection) }
      </div>
    );
  }

  private _onSelectionChanged() {
    if (this._hasMounted) {
      this.refs.list.forceUpdate();
    }
  }

  /**
   * Returns a lambda depending on whether the ImageGrid cells are fixed or dynamic sized.
   */
  private _getItemCountForPage(): (itemIndex: number, surfaceRect: ClientRect) => number {
    let {
      isFixedSize,
      minimumCellRatio,
      maximumHeight,
      minimumHeight
    } = this.props;

    if (isFixedSize) {
      let fixedCellHeight = 0;
      let fixedCellWidth = 0;
      let fixedItemCountForPage = 0;

      return ((itemIndex: number, surfaceRect: ClientRect): number => {
        let items = this.props.items;

        if (!items) {
          return 10;
        }

        if (itemIndex >= items.length) {
          return 1;
        }

        // Calculate the cell size and item count for page on the first item as all these numbers are uniform across all cells.
        if (itemIndex === 0) {
          // The ratio to not exceed while selecting cells for the row.
          let maxRatio = surfaceRect.width / minimumHeight;

          let item = items[0];
          let cellWidth = item.imageWidth + CELL_MARGIN;
          let cellHeight = item.imageHeight + CELL_MARGIN;
          let cellRatio = Math.max(cellWidth / cellHeight, minimumCellRatio);
          // If image aspect ratio is too large for the row, adjust width to be exactly the row width.
          if (cellRatio > maxRatio) {
            fixedCellHeight = minimumHeight;
            fixedCellWidth = surfaceRect.width;
            fixedItemCountForPage = 1;
          } else {
            // Otherwise, count how many items can fit in the row without exceeding the max ratio.
            let count = 0;
            let currentRatio = 0;

            while (currentRatio < maxRatio && count + itemIndex < items.length) {
              if (currentRatio + cellRatio < maxRatio) {
                count++;
                currentRatio += cellRatio;
              } else {
                break;
              }
            }

            let rowHeight = minimumHeight * maxRatio / currentRatio;
            fixedCellHeight = Math.min(rowHeight, maximumHeight);
            fixedCellWidth = (cellRatio * rowHeight) - CELL_MARGIN;
            fixedItemCountForPage = Math.max(count, 1);
          }
        }

        let i = itemIndex;
        while (i < itemIndex + fixedItemCountForPage && i < items.length) {
          let item = items[i];
          item.cellHeight = fixedCellHeight;
          item.cellWidth = fixedCellWidth + CELL_MARGIN / fixedItemCountForPage;
          item.isRightCell = false;
          i++;
        }

        items[i - 1].isRightCell = true;

        return fixedItemCountForPage;
      });
    } else {
      return ((itemIndex: number, surfaceRect: ClientRect): number => {
        let items = this.props.items;

        if (!items) {
          return 10;
        }

        if (itemIndex >= items.length) {
          return 1;
        }

        let maxRatio = surfaceRect.width / minimumHeight;
        // If image aspect ratio is too large for the row, adjust width to be exactly the row width.
        if ((items[itemIndex].imageWidth + CELL_MARGIN) / (items[itemIndex].imageHeight + CELL_MARGIN) > maxRatio) {
          let item = items[itemIndex];
          item.cellWidth = surfaceRect.width;
          item.cellHeight = minimumHeight;
          return 1;
        }

        // Otherwise, count how many items can fit in the row without exceeding the max ratio.
        let count = 0;
        let currentRatio = 0;

        while (currentRatio < maxRatio && count + itemIndex < items.length) {
          let item = items[itemIndex + count];
          if (!item.cellRatio) {
            let cellWidth = item.imageWidth + CELL_MARGIN;
            let cellHeight = item.imageHeight + CELL_MARGIN;
            item.cellRatio = Math.max(cellWidth / cellHeight, minimumCellRatio);
          }

          if (currentRatio + item.cellRatio < maxRatio) {
            count++;
            currentRatio += item.cellRatio;
          } else {
            break;
          }
        }

        // Count is ever 0, the page freezes
        count = Math.max(count, 1);

        let rowHeight = minimumHeight * maxRatio / currentRatio;
        // Sets cell dimensions to justify the row
        for (let i = itemIndex; i < itemIndex + count; i++) {
          let item = items[i];
          item.cellWidth = (item.cellRatio * rowHeight) + CELL_MARGIN * (1 / count - 1);
          item.cellHeight =  Math.min(rowHeight, maximumHeight);
          item.isRightCell = false;
        }

        items[itemIndex + count - 1].isRightCell = true;

        return count;
      });
    }
  }
}
