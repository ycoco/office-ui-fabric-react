import * as React from 'react';
import {
  ISelection,
  SelectionMode
} from 'office-ui-fabric-react/lib/utilities/selection/interfaces';
import {
  IDragDropContext,
  IDragDropEvents,
  IDragDropHelper
} from 'office-ui-fabric-react/lib/utilities/dragdrop/interfaces';
import {
  IGroup,
  IGroupRenderProps
} from 'office-ui-fabric-react/lib/GroupedList';
import { IViewport } from 'office-ui-fabric-react/lib/utilities/decorators/withViewport';

export interface IGridListProps<T> {
  /**
   * Default aspect ratio to use if no callback specified.
   * An item's aspect ratio is used to calculate how to place cells in each row.
   * It is a ratio of its width to its height.
   * @default 1
   */
  defaultItemAspectRatio?: number;

  /**
   * Map of callback functions related to drag and drop functionality.
   */
  dragDropEvents?: IDragDropEvents;

  /**
   * Event names and corresponding callbacks that will be registered to groups and rendered elements.
   */
  eventsToRegister?: [{ eventName: string, callback: (context: IDragDropContext, event?: any) => void }];

  /**
   * If specified, assumes that all tiles have a fixed cell ratio that matches this number.
   * When this is set, the minimumCellRatio property is ignored.
   */
  fixedCellRatio?: number;

  /** Optional grouping instructions. */
  groups?: IGroup[];

  /** Optional override properties to render groups. */
  groupProps?: IGroupRenderProps;

  /**
   * List of items to render in a grid.
   */
  items: T[];

  /**
   * Callback to get the item's aspect ratio.
   */
  getItemAspectRatio?: (item?: T, index?: number) => number;

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
   * Minimum height in pixels for each row of images.
   * The algorithm used to size and place images attempts to get as close to this height without going under it.
   * When the minimum height is greater than the maximum height, the GridList will behave as if the maximum height
   *  property was equal to the minimum height.
   * @default 192
   */
  minimumHeight?: number;

  /**
   * Callback for when an item in the list becomes active by clicking anywhere inside the cell or navigating to it with keyboard.
   */
  onActiveItemChanged?: (item?: any, index?: number, ev?: React.FocusEvent) => void;

  /**
   * Callback for when a given row has been invoked (by pressing enter while it is selected.)
   */
  onItemInvoked?: (item?: any, index?: number, ev?: Event) => void;

  /**
   * Function to call when attempting to render an item.
   * The size of the node returned must match the cellHeight and cellWidth provided by item.
   */
  onRenderCell: (onRenderCellParams: IOnRenderCellParams<T>) => React.ReactNode;

  /**
   * Function to call when the item to render is missing.
   */
  onRenderMissingItem?: (
    index?: number
  ) => React.ReactNode;

  /**
   * The number of rows to render in each virtualized list page.
   * @default 1
   */
  rowsPerPage?: number;

  /**
   * Optional selection model to track selection state.
   * If a selection property is passed to this component, it is assumed that the selection's items have already been set.
   */
  selection?: ISelection;

  /**
   * Controls how or if the details list manages selection.
   */
  selectionMode?: SelectionMode;

  /**
   * Viewport, provided by the withViewport decorator.
   */
  viewport?: IViewport;
}

export interface IOnRenderCellParams<T> {
  /**
   * The actual height of the cell.
   */
  cellHeight: number;

  /**
   * The actual width of the cell.
   */
  cellWidth: number;

  /**
   * The item whose associated cell is being rendered.
   */
  item?: T;

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