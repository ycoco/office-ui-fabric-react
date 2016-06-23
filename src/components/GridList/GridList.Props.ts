import * as React from 'react';
import {
  ISelection,
  SelectionMode
} from '@ms/office-ui-fabric-react/lib/utilities/selection/interfaces';
import {
  IDragDropEvents,
  IDragDropHelper
} from '@ms/office-ui-fabric-react/lib/utilities/dragdrop/interfaces';

export interface IGridListProps {
  /**
   * Map of callback functions related to drag and drop functionality.
   */
  dragDropEvents?: IDragDropEvents;

  /**
   * If specified, assumes that all tiles have a fixed cell ratio that matches this number.
   * When this is set, the minimumCellRatio property is ignored.
   */
  fixedCellRatio?: number;

  /**
   * List of items to render in a grid.
   */
  items: IGridListItem[];

  /**
   * Maximum height in pixels that will not be exceeded for each row of images.
   * @default Infinity
   */
  maximumHeight?: number;

  /**
   * The minimum aspect ratio for each cell.
   * When this is set, the width of cells may be increased until the aspect ratio of the cell meets this number.
   * The aspect ratio is a cell's width divided by its height.
   * @default 0
   */
  minimumCellRatio?: number;

  /**
   * The maximum aspect ratio for each cell.
   * When this is set, the aspect ratio of any cell will not exceed this number.
   * In the case that the minimumCellRatio is greater than the maximumCellRatio, the maximum will take precedence.
   * @default Infinity
   */
  maximumCellRatio?: number;

  /**
   * Minimum height in pixels for each row of images.
   * The algorithm used to size and place images attempts to get as close to this height without going under it.
   * @default 192
   */
  minimumHeight?: number;

  /**
   * Function to call when attempting to render an item.
   * The size of the node returned must match the cellHeight and cellWidth provided by item.
   */
  onRenderCell: (onRenderCellParams: IOnRenderCellParams) => React.ReactNode;

  /**
   * Function to call when the item to render is missing.
   */
  onRenderMissingItem?: (
    index?: number
  ) => React.ReactNode;

  /**
   * Optional selection model to track selection state.
   */
  selection?: ISelection;

  /**
   * Controls how or if the details list manages selection.
   */
  selectionMode?: SelectionMode;
}

export interface IGridListItem {
  /**
   * The native height of the cell in pixels.
   */
  imageHeight: number;

  /**
   * The native width of the cell in pixels.
   */
  imageWidth: number;
}

export interface IOnRenderCellParams {
  /**
   * The item whose associated cell is being rendered.
   */
  item?: IGridListItem;

  /**
   * The index of the item being rendered.
   */
  index?: number;

  /**
   * The selection state of the GridList.
   */
  selection?: ISelection;

  /**
   * Drag drop events that may be bound to the cell to control drag and drop.
   */
  dragDropEvents?: IDragDropEvents;

  /**
   * The drag and drop model that may be subscribed to the item.
   */
  dragDropHelper?: IDragDropHelper;
}