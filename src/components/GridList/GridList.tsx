import * as React from 'react';
import './GridList.scss';
import {
  IGridListProps,
  IOnRenderCellParams
} from './GridList.Props';

import {
  FocusZone
} from 'office-ui-fabric-react/lib/FocusZone';
import {
  GroupedList
} from 'office-ui-fabric-react/lib/GroupedList';
import {
  List
} from 'office-ui-fabric-react/lib/List';
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
import { getRTLSafeKeyCode } from 'office-ui-fabric-react/lib/utilities/rtl';
import { KeyCodes } from 'office-ui-fabric-react/lib/utilities/KeyCodes';
import { withViewport } from 'office-ui-fabric-react/lib/utilities/decorators/withViewport';

// Default dimension constraints
const DEFAULT_MIN_HEIGHT = 192;

const CELL_MARGIN = 8;

export interface IGridListCellProps {
  height?: number;
  isLastRow?: boolean;
  isRightCell?: boolean;
  itemsInRow?: number;
  ratio?: number;
  width?: number;
}

export interface IGridListState {
  isFocusedOnCell?: boolean;
}

@withViewport
export class GridList<T> extends React.Component<IGridListProps<T>, IGridListState> {
  public static defaultProps = {
    defaultItemAspectRatio: 1,
    minimumCellRatio: 0,
    maximumHeight: Infinity,
    minimumHeight: DEFAULT_MIN_HEIGHT,
    rowsPerPage: 1,
    selectionMode: SelectionMode.none
  };

  public refs: {
    [key: string]: React.ReactInstance;
    groups: GroupedList;
    list: List;
    focusZone: FocusZone;
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
    this._isInnerZoneKeystroke = this._isInnerZoneKeystroke.bind(this);

    this._cellProps = new Array(props.items.length);
    this._fixedPageWidth = 0;

    this.state = {
      isFocusedOnCell: false
    };
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
      this.refs.groups.forceUpdate();
    }
  }

  public render() {
    let {
      dragDropEvents,
      eventsToRegister,
      groups,
      groupProps,
      items,
      onItemInvoked,
      selectionMode,
      viewport
    } = this.props;

    let selection = this._selection;
    let dragDropHelper = this._dragDropHelper;
    let additionalListProps = {
      getItemCountForPage: this._getItemCountForPage,
      getPageHeight: this._getPageHeight
    };

    return (
      <div
        className='ms-GridList'
        data-automationid='GridList'
        role='grid'
        >
        <FocusZone
          ref='focusZone'
          isInnerZoneKeystroke={ this._isInnerZoneKeystroke }
          onActiveElementChanged={ this._onActiveItemChanged }
          >
          <SelectionZone
            selection={ selection }
            selectionMode={ selectionMode }
            onItemInvoked={ onItemInvoked }
            >
            { groups ? (
              <GroupedList
                groups={ groups }
                groupProps={ groupProps }
                items={ items }
                listProps={ additionalListProps }
                onRenderCell={ this._onRenderCell }
                selection={ selection }
                selectionMode={ selectionMode }
                dragDropEvents={ dragDropEvents }
                dragDropHelper={ dragDropHelper }
                eventsToRegister={ eventsToRegister }
                viewport={ viewport }
                ref='groups'
                />
              ) : (
                <List
                  items={ items }
                  onRenderCell={ (item, itemIndex) => this._onRenderCell(0, item, itemIndex) }
                  { ...additionalListProps }
                  ref='list'
                  />
              )
            }
          </SelectionZone>
        </FocusZone>
      </div>
    );
  }

  public forceUpdate() {
    super.forceUpdate();
    if (this.refs.groups) {
      this.refs.groups.forceUpdate();
    }
    if (this.refs.list) {
      this.refs.list.forceUpdate();
    }
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

  private _onRenderCell(nestingDepth: number, item: T, index: number) {
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

  private _onActiveItemChanged(el?: HTMLElement, ev?: React.FocusEvent) {
    let {
      items,
      onActiveItemChanged
    } = this.props;

    if (!el) {
      return;
    }

    let isGroupHeader = el.className.indexOf('ms-GroupHeader');
    if (isGroupHeader > -1) {
      if (this.state.isFocusedOnCell) {
        this.setState({
          isFocusedOnCell: false
        });
      }
    } else {
      if (!this.state.isFocusedOnCell) {
        this.setState({
          isFocusedOnCell: true
        });
      }
    }

    if (!onActiveItemChanged) {
      return;
    }
    let index = Number(el.getAttribute('data-selection-index'));
    if (index >= 0) {
      onActiveItemChanged(items[index], index, ev);
    }
  };

  private _isInnerZoneKeystroke(ev: React.KeyboardEvent): boolean {
    if (!this.state.isFocusedOnCell) {
      return ev.which === getRTLSafeKeyCode(KeyCodes.right);
    }
    return false;
  }

  // Returns a function that uses the props specified to calculate the Item Count per page in the list.
  private _getItemCountForPage(itemIndex: number, surfaceRect: ClientRect): number {
    let {
      fixedCellRatio,
      minimumCellRatio,
      maximumHeight,
      minimumHeight,
      items,
      rowsPerPage
    } = this.props;

    if (!items) {
      return 10;
    }

    let itemCount = 0;
    let currentIndex = itemIndex;
    let targetRatio = surfaceRect.width / minimumHeight;
    if (surfaceRect.width === 0) {
      targetRatio = this._fixedPageWidth / minimumHeight;
    }
    for (let rows = 0; rows < rowsPerPage; rows++) {
      if (currentIndex >= items.length) {
        return itemCount;
      }

      // For fixed cell ratio gridLists, calculate the itemCountPerPage only once.
      if (fixedCellRatio) {
        // Calculate the fixed dimension properties for the page
        if (this._fixedPageWidth !== surfaceRect.width && surfaceRect.width > 0) {
          this._fixedPageCount = Math.max(Math.floor(targetRatio / fixedCellRatio), 1);
          this._fixedRatioScale = ((surfaceRect.width - (this._fixedPageCount - 1) * CELL_MARGIN) / minimumHeight) /
                            (this._fixedPageCount * fixedCellRatio);

          this._fixedCellHeight = Math.min(this._fixedRatioScale * minimumHeight, maximumHeight);
          this._fixedCellWidth = this._fixedCellHeight * fixedCellRatio;
          this._fixedPageWidth = surfaceRect.width;
        }

        let i = currentIndex;
        while (i < currentIndex + this._fixedPageCount && i < this._cellProps.length) {
          this._cellProps[i] = {
            height: this._fixedCellHeight,
            width: this._fixedCellWidth,
            isRightCell: false,
            isLastRow: currentIndex + this._fixedPageCount >= items.length,
            itemsInRow: this._fixedPageCount
          };

          i++;
        }

        if (this._cellProps && this._cellProps.length >= i - 1 && this._cellProps[i - 1]) {
          this._cellProps[i - 1].isRightCell = true;
        }

        itemCount += this._fixedPageCount;
        currentIndex += this._fixedPageCount;
        continue;
      }

      if (surfaceRect.width > 0) {
        this._fixedPageWidth = surfaceRect.width;
      }
      // Check if the first item in the page has too large of a aspect ratio to fit within the row.
      // If so, set the first item's width to the page width and the height to the minimum height.
      // This item will be cropped landscape style (the two sides will be cropped)
      if (items[currentIndex]) {
        let item = items[currentIndex];
        let itemRatio = this._getItemAspectRatio(item, currentIndex);
        if (itemRatio > targetRatio) {
          this._cellProps[currentIndex] = {
            width: Math.max(this._fixedPageWidth, minimumHeight * minimumCellRatio),
            height: minimumHeight,
            isRightCell: false,
            isLastRow: !items[currentIndex + 1],
            itemsInRow: 1
          };
          itemCount += 1;
          currentIndex += 1;
          continue;
        }
      } else {
        itemCount += 1;
        currentIndex += 1;
        continue;
      }

      // Otherwise, select items until the added aspect ratios of the items selected are just under the target ratio.
      // As in selecting one more will exceed the target ratio.
      let currentRatio = 0;
      let count = 0;
      while (currentIndex + count < items.length) {
        let item = items[currentIndex + count];

        let itemRatio = this._getItemAspectRatio(item, currentIndex);
        let ratio = Math.max(itemRatio, minimumCellRatio);
        this._cellProps[currentIndex + count] = {
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
      targetRatio = (this._fixedPageWidth - (count - 1) * CELL_MARGIN) / minimumHeight;
      let ratioScale = targetRatio / currentRatio;
      let cellHeight = minimumHeight * ratioScale;

      // Set the cell dimensions to fill the empty space in the row.
      for (let i = currentIndex; i < currentIndex + count; i++) {
        let ratio = this._cellProps[i].ratio;
        this._cellProps[i] = {
          width: cellHeight * Math.max(ratio, minimumCellRatio),
          height: Math.max(Math.min(cellHeight, maximumHeight), minimumHeight),
          isRightCell: false,
          isLastRow: currentIndex + count >= items.length,
          itemsInRow: count
        };
      }

      const rightCellIndex: number = currentIndex + count - 1;
      if (this._cellProps && this._cellProps.length >= rightCellIndex && this._cellProps[rightCellIndex]) {
        this._cellProps[rightCellIndex].isRightCell = true;
      }

      itemCount += count;
      currentIndex += count;
      continue;
    }

    return itemCount;
  }

  private _getPageHeight(itemIndex?: number, visibleRect?: ClientRect) {
    if (itemIndex >= this._cellProps.length) {
      return 0;
    }
    let {
      fixedCellRatio,
      minimumHeight,
      rowsPerPage
    } = this.props;
    let pageHeight = 0;
    let rowIndex = itemIndex;

    if (fixedCellRatio) {
      if (this._fixedCellHeight > 0) {
        for (let i = 0; i < rowsPerPage; i++) {
          pageHeight += this._fixedCellHeight;
          if (this._cellProps[rowIndex]) {
            if (!this._cellProps[rowIndex].isLastRow) {
              pageHeight += CELL_MARGIN;
            }
          }
          rowIndex += this._fixedPageCount;
          rowIndex = Math.min(rowIndex, this._cellProps.length - 1);
        }
        return pageHeight;
      }
    }

    for (let i = 0; i < rowsPerPage; i++) {
      if (this._cellProps[rowIndex]) {
        pageHeight += this._cellProps[rowIndex].height;
        if (!this._cellProps[rowIndex].isLastRow) {
          pageHeight += CELL_MARGIN;
        }
        rowIndex += this._cellProps[rowIndex].itemsInRow;
      } else {
        pageHeight += minimumHeight + CELL_MARGIN;
        rowIndex += 1;
      }
    }
    return pageHeight;
  }
}
