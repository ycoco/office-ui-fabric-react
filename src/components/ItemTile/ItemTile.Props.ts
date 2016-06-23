import * as React from 'react';
import { ItemTile } from './ItemTile';

import { IImageProps } from '@ms/office-ui-fabric-react/lib/Image';
import { ISelection } from '@ms/office-ui-fabric-react/lib/utilities/selection/interfaces';
import {
  IDragDropContext,
  IDragDropEvents,
  IDragDropHelper
} from '@ms/office-ui-fabric-react/lib/utilities/dragdrop/interfaces';

export interface IItemTileProps extends React.Props<ItemTile> {
  /**
   * An accesibility label for when the element is not visible on screen.
   */
  ariaLabel?: string;

  /**
   * Height of the tile.
   * @default 192
   */
  cellHeight?: number;

  /**
   * Width of the tile.
   * @default 192
   */
  cellWidth?: number;

  /**
   * The name for the item tile to be displayed. Not displayed for photos and videos.
   */
  displayName?: string;

  /**
   * Map of callback functions related to drag and drop behavior.
   */
  dragDropEvents?: IDragDropEvents;

  /**
   * Optional drag and drop model to control drag and drop state.
   */
  dragDropHelper?: IDragDropHelper;

  /**
   * List of event names and callbacks that will be registered to the tile.
   */
  itemTileEventMap?: [{ eventName: string, callback: (context: IDragDropContext, event?: any) => void }];

  /**
   * True if the item is currently being shared to other user(s).
   * @default false
   */
  isShared?: boolean;

  /**
   * True if the item being displayed is in violation of the ToS.
   * @default false
   */
  isViolation?: boolean;

  /**
   * The arbitrary object being represented by this tile.
   * May be used by drag and drop callbacks.
   */
  item?: any;

  /**
   * Index of the item within the optional utility models. Required for selection and drag and drop.
   */
  itemIndex?: number;

  /**
   * The type of the itemTile.
   */
  itemTileType: ItemTileType;

  /**
   * Additional properties that may be defined for folder and photo tiles.
   */
  itemTileTypeProps?: IItemTileFolderProps | IItemTilePhotoProps;

  /**
   * Link associated with the tile.
   */
  linkUrl?: string;

  /**
   * Behavior when item is clicked. Specifying an onClick action does not disable the linkUrl.
   */
  onClick?: (item?: IItemTileProps, evt?: React.MouseEvent) => void;

  /**
   * Optional selection model to control selection state.
   */
  selection?: ISelection;

  /**
   * Used to control the visibility behavior of the selection region.
   * @default onHover
   */
  selectionVisibility?: SelectionVisibility;

  /**
   * Subtext which is displayed under the displayName for files and folders.
   */
  subText?: string;

  /**
   * Tabindex of the tile.
   * @default -1
   */
  tabIndex?: number;

  /**
   * Url of the tile's thumbnail. When the thumbnailUrl is updated, the new thumbnail will fade over the previous one.
   */
  thumbnailUrl?: string;

  /**
   * A description that appears when a user hovers over the tile.
   */
  tooltipText?: string;
}

export interface IItemTileFolderProps {
  /**
   * True if the subtext is visible for a folder.
   * @default false
   */
  isSubTextVisible?: boolean;

  /**
   * True if the folder is an album.
   * @default false
   */
  isAlbum?: boolean;

  /**
   * Used to display number indicating the quantity of items contained within this folder.
   */
  childCount?: number;

  /**
   * List of available thumbnails formatted as an IImageProp for the folder to pulse through.
   */
  pulseThumbnails?: IImageProps[];
}

export interface IItemTilePhotoProps {
  /**
   * True if the thumbnail cannot be displayed.
   * @default false
   */
  isBadPhoto?: boolean;
}

/**
 * Used to specify what kind of information the tile is representing.
 */
export enum ItemTileType {
  file,
  folder,
  photo,
  video
}

/**
 * Used to specify when the selection region should be visible on an itemtile
 */
export enum SelectionVisibility {
  none,
  onHover,
  always
}
