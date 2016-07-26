import * as React from 'react';
import './GridList.scss';
import {
  IGridListProps,
  IOnRenderCellParams
} from './GridList.Props';

import {
  FocusZone
} from 'office-ui-fabric-react/lib/FocusZone';
import { List } from 'office-ui-fabric-react/lib/List';
import {
  IObjectWithKey,
  ISelection,
  SelectionMode,
  SelectionZone,
  Selection
  } from 'office-ui-fabric-react/lib/utilities/selection/index';
import {
  DragDropHelper
} from 'office-ui-fabric-react/lib/utilities/dragdrop/DragDropHelper';
import { css } from 'office-ui-fabric-react/lib/utilities/css';

// Default dimension constraints
const DEFAULT_MIN_HEIGHT = 192;

const CELL_MARGIN = 8;

export interface IGridListCellProps {
  height?: number;
  isLastRow?: boolean;
  isRightCell?: boolean;
  ratio?: number;
  width?: number;
}

export class GridList<T> extends React.Component<IGridListProps<T>, {}> {
  public static defaultProps = {
    defaultItemAspectRatio: 1,
    minimumCellRatio: 0,
    maximumHeight: Infinity,
    minimumHeight: DEFAULT_MIN_HEIGHT,
    selectionMode: SelectionMode.none
  };

  public refs: {
    [key: string]: React.ReactInstance;
    list: List;
  };

  private _dragDropHelper: DragDropHelper;
  private _selection: ISelection;

  private _cellProps: IGridListCellProps[];
  private _fixedPageWidth: number;
  private _fixedPageCount: number;
  private _fixedRatioScale: number;
  private _fixedCellHeight: number;
  private _fixedCellWidth: number;

  constructor(props: IGridListProps<T>) {
    super(props);

    this._selection = props.selection || new Selection();
    this._selection.setItems(props.items as IObjectWithKey[], false);
    this._dragDropHelper = props.dragDropEvents ? new DragDropHelper({ selection: this._selection }) : null;

    this._onRenderCell = this._onRenderCell.bind(this);
    this._getItemCountForPage = this._getItemCountForPage.bind(this);
    this._getPageHeight = this._getPageHeight.bind(this);
    this._onActiveItemChanged = this._onActiveItemChanged.bind(this);

    this._cellProps = new Array(props.items.length);
    this._fixedPageWidth = 0;
  }

  public componentWillUnmount() {
    if (this._dragDropHelper) {
      this._dragDropHelper.dispose();
    }
  }

  public componentWillReceiveProps(newProps: IGridListProps<T>) {
    let { items, selectionMode } = this.props;
    let shouldForceUpdates = false;

    if (newProps.items !== items) {
      this._cellProps = new Array(newProps.items.length);
      // Setting fixedPageWidth to 0 forces a recalculation of cellProps for fixed ratio gridlists.
      this._fixedPageWidth = 0;
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
      selectionMode,
      onItemInvoked
    } = this.props;

    let selection = this._selection;

    return (
      <div
        className='ms-GridList'
        data-automationid='GridList'
        role='grid'
        >
        <FocusZone
          onActiveElementChanged={ this._onActiveItemChanged }
          >
          <SelectionZone
            selection={ selection }
            selectionMode={ selectionMode }
            onItemInvoked={ onItemInvoked }
            >
            <List
              items={ items }
              onRenderCell={ this._onRenderCell }
              getItemCountForPage={ this._getItemCountForPage }
              getPageHeight={ this._getPageHeight }
              selection={ selection }
              ref='list'
              />
          </SelectionZone>
        </FocusZone>
      </div>
    );
  }

  private _getItemAspectRatio(item: T, index: number) {
    let {
      defaultItemAspectRatio,
      getItemAspectRatio
    } = this.props;

    if (item && getItemAspectRatio) {
      return getItemAspectRatio(item, index);
    } else {
      return defaultItemAspectRatio;
    }
  }

  private _onRenderCell(item: T, index: number) {
    let {
      dragDropEvents,
      onRenderCell,
      onRenderMissingItem
    } = this.props;

    if (!item || !this._cellProps[index]) {
      if (onRenderMissingItem) {
        return onRenderMissingItem(index);
      }

      return null;
    }

    let {
      height,
      isLastRow,
      isRightCell,
      width
    } = this._cellProps[index];

    let selection = this._selection;
    let dragDropHelper = this._dragDropHelper;

    let onRenderCellParams: IOnRenderCellParams<T> = {
      cellHeight: height,
      cellWidth: width,
      item: item,
      index: index,
      selection: selection,
      dragDropEvents: dragDropEvents,
      dragDropHelper: dragDropHelper
    };

    return (
      <div
        className={ css(
          'ms-GridList-cell',
          {
            'cell-right': isRightCell,
            'cell-last-row': isLastRow
          }) }
          role='gridcell'
        >
        { onRenderCell(onRenderCellParams) }
      </div>
    );
  }

  /**
   * Method borrowed from DetailsList in office-ui-fabric-react
   */
  private _onActiveItemChanged(el?: HTMLElement, ev?: React.FocusEvent) {
    let { items, onActiveItemChanged } = this.props;

    if (!onActiveItemChanged || !el) {
      return;
    }
    let index = Number(el.getAttribute('data-selection-index'));
    if (index >= 0) {
      onActiveItemChanged(items[index], index, ev);
    }
  };

  /**
   * Returns a function that uses the props specified to calculate the Item Count per page in the list.
   */
  private _getItemCountForPage(itemIndex: number, surfaceRect: ClientRect): number {
    let {
      fixedCellRatio,
      minimumCellRatio,
      maximumHeight,
      minimumHeight,
      items
    } = this.props;

    if (!items) {
      return 10;
    }

    if (itemIndex >= items.length) {
      return 1;
    }

    let targetRatio = surfaceRect.width / minimumHeight;

    /**
     * For fixed cell ratio gridLists, calculate the itemCountPerPage only once.
     */
    if (fixedCellRatio) {
      // Calculate the fixed dimension properties for the page
      if (this._fixedPageWidth !== surfaceRect.width) {
        this._fixedPageCount = Math.floor(targetRatio / fixedCellRatio);
        this._fixedRatioScale = ((surfaceRect.width - (this._fixedPageCount - 1) * CELL_MARGIN) / minimumHeight) /
                          (this._fixedPageCount * fixedCellRatio);

        this._fixedCellHeight = Math.min(this._fixedRatioScale * minimumHeight, maximumHeight);
        this._fixedCellWidth = this._fixedCellHeight * fixedCellRatio;
      }

      let i = itemIndex;
      while (i < itemIndex + this._fixedPageCount && i < this._cellProps.length) {
        this._cellProps[i] = {
          height: this._fixedCellHeight,
          width: this._fixedCellWidth,
          isRightCell: false,
          isLastRow: itemIndex + this._fixedPageCount >= items.length
        };

        i++;
      }

      if (this._cellProps && this._cellProps.length >= i - 1 && this._cellProps[i - 1]) {
        this._cellProps[i - 1].isRightCell = true;
      }

      return this._fixedPageCount;
    }

    /**
     * Check if the first item in the page has too large of a aspect ratio to fit within the row.
     * If so, set the first item's width to the page width and the height to the minimum height.
     * This item will be cropped landscape style (the two sides will be cropped)
     */
    if (items[itemIndex]) {
      let item = items[itemIndex];
      let itemRatio = this._getItemAspectRatio(item, itemIndex);
      if (itemRatio > targetRatio) {
        this._cellProps[itemIndex] = {
          width: Math.max(surfaceRect.width, minimumHeight * minimumCellRatio),
          height: minimumHeight,
          isRightCell: false,
          isLastRow: !items[itemIndex + 1]
        };
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

      let itemRatio = this._getItemAspectRatio(item, itemIndex);
      let ratio = Math.max(itemRatio, minimumCellRatio);
      this._cellProps[itemIndex + count] = {
        ratio: ratio
      };
      if (ratio + currentRatio < targetRatio) {
        currentRatio += ratio;
        count++;
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
      let ratio = this._cellProps[i].ratio;
      this._cellProps[i] = {
        width: cellHeight * Math.max(ratio, minimumCellRatio),
        height: Math.max(Math.min(cellHeight, maximumHeight), minimumHeight),
        isRightCell: false,
        isLastRow: itemIndex + count >= items.length
      };
    }

    const rightCellIndex: number = itemIndex + count - 1;
    if (this._cellProps && this._cellProps.length >= rightCellIndex && this._cellProps[rightCellIndex]) {
      this._cellProps[rightCellIndex].isRightCell = true;
    }

    return count;
  }

  private _getPageHeight(itemIndex?: number, visibleRect?: ClientRect) {
    // Individual cell heights should already be calculated.
    if (itemIndex >= this._cellProps.length) {
      return 0;
    }
    return this._cellProps[itemIndex].height + CELL_MARGIN;
  }
}
