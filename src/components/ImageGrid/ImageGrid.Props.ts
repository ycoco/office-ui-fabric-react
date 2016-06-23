import * as React from 'react';
import {
  ISelection,
  SelectionMode
} from '@ms/office-ui-fabric-react/lib/utilities/selection/interfaces';
import {
  IDragDropEvents,
  IDragDropHelper
} from '@ms/office-ui-fabric-react/lib/utilities/dragdrop/interfaces';

export interface IImageGridProps {
  /**
   * Map of callback functions related to drag and drop functionality.
   */
  dragDropEvents?: IDragDropEvents;

  /**
   * True if all items are a fixed size.
   */
  isFixedSize?: boolean;

  /**
   * List of items to render in a grid.
   */
  items: IImageGridItem[];

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
  onRenderCell: (
    item?: IImageGridItem,
    index?: number,
    selection?: ISelection,
    dragDropEvents?: IDragDropEvents,
    dragDropHelper?: IDragDropHelper
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

export interface IImageGridItem {
  /**
   * The rendering height in pixels calculated after placing and sizing the cells.
   */
  cellHeight?: number;

  /**
   * The target aspect ratio for the cell. Calculated from the native ratio taking into account cell margins.
   */
  cellRatio?: number;

  /**
   * The rendering width in pixels calculated after placing and sizing the cells.
   */
  cellWidth?: number;

  /**
   * The native height of the cell in pixels.
   */
  imageHeight: number;

  /**
   * The native width of the cell in pixels.
   */
  imageWidth: number;

  /**
   * True if the cell is the rightmost cell in a row.
   */
  isRightCell?: boolean;
}
