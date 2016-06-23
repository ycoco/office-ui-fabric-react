import * as React from 'react';
import './GridList.scss';
import { IGridListProps } from './GridList.Props';

import {
  FocusZone
} from '@ms/office-ui-fabric-react/lib/FocusZone';
import { List } from '@ms/office-ui-fabric-react/lib/List';
import {
  IObjectWithKey,
  ISelection,
  SelectionMode,
  SelectionZone,
  Selection
  } from '@ms/office-ui-fabric-react/lib/utilities/selection/index';
import {
  DragDropHelper
} from '@ms/office-ui-fabric-react/lib/utilities/dragdrop/DragDropHelper';
import { css } from '@ms/office-ui-fabric-react/lib/utilities/css';

// Default dimension constraints
const DEFAULT_MIN_HEIGHT = 192;

const CELL_MARGIN = 8;

export class GridList extends React.Component<IGridListProps, {}> {
  public static defaultProps = {
    maximumCellRatio: Infinity,
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

  private _dragDropHelper: DragDropHelper;
  private _selection: ISelection;

  constructor(props: IGridListProps) {
    super(props);

    this._selection = props.selection || new Selection();
    this._selection.setItems(props.items as IObjectWithKey[], false);
    this._dragDropHelper = props.dragDropEvents ? new DragDropHelper({ selection: this._selection }) : null;
  }

  public componentWillUnmount() {
    if (this._dragDropHelper) {
      this._dragDropHelper.dispose();
    }
  }

  public componentWillReceiveProps(newProps: IGridListProps) {
    let { items, selectionMode } = this.props;
    let shouldForceUpdates = false;

    if (newProps.items !== items) {
      this._selection.setItems(newProps.items, true);
    }

    if (newProps.selectionMode !== selectionMode) {
      shouldForceUpdates = true;
    }

    if (shouldForceUpdates) {
      this.refs.list.forceUpdate();
    }
  }

  public render() {
    let {
      items,
      selectionMode
    } = this.props;

    let selection = this._selection;

    return (
      <div className='ms-GridList'>
        <FocusZone>
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
        </FocusZone>
      </div>
    );
  }

  private _onRenderCell(item, index: number) {
    let {
      dragDropEvents,
      onRenderCell,
      onRenderMissingItem
    } = this.props;

    if (!item) {
      if (onRenderMissingItem) {
        return onRenderMissingItem(index);
      }

      return null;
    }

    let {
      cellHeight,
      cellWidth
    } = item;

    let selection = this._selection;
    let dragDropHelper = this._dragDropHelper;

    return (
      <div
        className={ css(
          'ms-GridList-cell',
          {
            'cell-right': item.isRightCell,
            'cell-last-row': item.isLastRow
          }) }
        height={ cellHeight }
        width={ cellWidth }
        >
        { onRenderCell({ item, index, selection, dragDropEvents, dragDropHelper }) }
      </div>
    );
  }

  /**
   * Returns a function that uses the props specified to calculate the Item Count per page in the list.
   */
  private _getItemCountForPage(): (itemIndex: number, surfaceRect: ClientRect) => number {
    let {
      fixedCellRatio,
      minimumCellRatio,
      maximumHeight,
      minimumHeight
    } = this.props;

    let
      fixedPageWidth = 0,
      fixedPageCount = null,
      fixedRatioScale = null,
      fixedCellHeight = null,
      fixedCellWidth = null;

    return ((itemIndex: number, surfaceRect: ClientRect): number => {
      let items: any[] = this.props.items;

      if (!items) {
        return 10;
      }

      if (itemIndex >= items.length) {
        return 1;
      }

      let targetRatio = surfaceRect.width / minimumHeight;

      if (fixedCellRatio) {
        // Calculate the fixed dimension properties for the page
        if (fixedPageWidth !== surfaceRect.width) {
          fixedPageCount = Math.floor(targetRatio / fixedCellRatio);
          fixedRatioScale = ((surfaceRect.width - (fixedPageCount - 1) * CELL_MARGIN) / minimumHeight) /
                            (fixedPageCount * fixedCellRatio);

          fixedCellHeight = Math.min(fixedRatioScale * minimumHeight, maximumHeight);
          fixedCellWidth = fixedCellHeight * fixedCellRatio;
        }

        let i = itemIndex;
        while (i < itemIndex + fixedPageCount && i < items.length) {
          let item = items[i];

          if (item) {
            item.cellHeight = fixedCellHeight;
            item.cellWidth = fixedCellWidth;

            item.isRightCell = false;
            if (itemIndex + fixedPageCount >= items.length) {
              item.isLastRow = true;
            } else {
              item.isLastRow = false;
            }
          } else {
            break;
          }

          i++;
        }

        if (items[i - 1]) {
          items[i - 1].isRightCell = true;
        }

        return fixedPageCount;
      }

      /**
       * Check if the first item in the page has too large of a aspect ratio to fit within the row.
       * If so, set the first item's width to the page width and the height to the minimum height.
       * This item will be cropped landscape style (the two sides will be cropped)
       */
      if (items[itemIndex]) {
        if (items[itemIndex].imageWidth / items[itemIndex].imageHeight > targetRatio) {
          items[itemIndex].cellWidth = Math.max(surfaceRect.width, minimumHeight * minimumCellRatio);
          items[itemIndex].cellHeight = minimumHeight;

          items[itemIndex].isRightCell = false;
          if (itemIndex + 1 === items.length) {
            items[itemIndex].isLastRow = true;
          } else {
            items[itemIndex].isLastRow = false;
          }
          return 1;
        }
      } else {
        return 1;
      }

      /**
       * Otherwise, select items until the added aspect ratios of the items selected are just under the target ratio.
       * As in selecting one more will exceed the target ratio.
       */
      let currentRatio = 0;
      let count = 0;
      while (itemIndex + count < items.length) {
        let item = items[itemIndex + count];
        if (item) {
          item.imageRatio = Math.max(item.imageWidth / item.imageHeight, minimumCellRatio);
          if (item.imageRatio + currentRatio < targetRatio) {
            currentRatio += item.imageRatio;
            count++;
          } else {
            break;
          }
        } else {
          break;
        }
      }

      count = Math.max(count, 1);

      // Re-adjust the targetRatio to take into consideration the margins between cells
      targetRatio = (surfaceRect.width - (count - 1) * CELL_MARGIN) / minimumHeight;
      let ratioScale = targetRatio / currentRatio;
      let cellHeight = minimumHeight * ratioScale;

      // Set the cell dimensions to fill the empty space in the row.
      for (let i = itemIndex; i < itemIndex + count; i++) {
        let item = items[i];

        if (item) {
          item.cellWidth = cellHeight * Math.max(item.imageRatio, minimumCellRatio);
          item.cellHeight = Math.max(Math.min(cellHeight, maximumHeight), minimumHeight);
          item.isRightCell = false;

          if (itemIndex + count >= items.length) {
            item.isLastRow = true;
          } else {
            item.isLastRow = false;
          }
        }
      }

      if (items[itemIndex + count - 1]) {
        items[itemIndex + count - 1].isRightCell = true;
      }

      return count;
    });
  }
}
