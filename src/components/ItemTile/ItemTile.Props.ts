import * as React from 'react';
import { ItemTile } from './ItemTile';

import { IImageProps } from '@ms/office-ui-fabric-react/lib/Image';
import { ISelection } from '@ms/office-ui-fabric-react/lib/utilities/selection/interfaces';

export interface IItemTileProps extends React.Props<ItemTile> {
  /**
   * The type of the itemTile.
   */
  itemTileType: ItemTileType;

  /**
   * The name for the item tile to be displayed. Not displayed for photos and videos.
   */
  displayName?: string;

  /**
   * Subtext which is displayed under the displayName for files and folders.
   */
  subText?: string;

  /**
   * A description that appears when a user hovers over the tile.
   */
  tooltipText?: string;

  /**
   * An accesibility label for when the element is not visible on screen.
   */
  ariaLabel?: string;

  /**
   * Link associated with the tile.
   */
  linkUrl?: string;

  /**
   * Url of the tile's thumbnail. When the thumbnailUrl is updated, the new thumbnail will fade over the previous one.
   */
  thumbnailUrl?: string;

  /**
   * Width of the tile.
   * @default 192
   */
  cellWidth?: number;
  /**
   * Height of the tile.
   * @default 192
   */
  cellHeight?: number;

  /**
   * Tabindex of the tile.
   * @default -1
   */
  tabIndex?: number;

  /**
   * Behavior when item is clicked. Specifying an onClick action does not disable the linkUrl.
   */
  onClick?: (item?: IItemTileProps, evt?: React.MouseEvent) => void;

  /**
   * Additional properties that may be defined for folder and photo tiles.
   */
  itemTileTypeProps?: IItemTileFolderProps | IItemTilePhotoProps;

  /**
   * Optional selection model to control selection state.
   */
  selection?: ISelection;

  /**
   * Index of the item within the selection mode. Required for selection.
   */
  selectionIndex?: number;

  /**
   * Used to control the visibility behavior of the selection region.
   * @default onHover
   */
  selectionVisiblity?: SelectionVisiblity;

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
};

/**
 * Used to specify when the selection region should be visible on an itemtile
 */
export enum SelectionVisiblity {
  none,
  onHover,
  always
}
