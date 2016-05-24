import * as React from 'react';
import { ItemTile } from './ItemTile';

export interface IItemTileProps extends React.Props<ItemTile> {
  /**
   * The type of the itemTile.
   **/
  itemTileType: ItemTileType;

  /**
   * The name for the item tile to be displayed. Not displayed for photos and videos.
   **/
  displayName?: string;

  /**
   * Subtext which is displayed under the displayName for files and folders.
   **/
  subText?: string;

  /**
   * A description that appears when a user hovers over the tile.
   **/
  tooltipText?: string;

  /**
   * An accesibility label for when the element is not visible on screen.
   **/
  ariaLabel?: string;

  /**
   * Link associated with the tile.
   **/
  linkUrl?: string;

  /**
   * Url of the tile's thumbnail.
   **/
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
   **/
  onClick?: (item?: IItemTileProps, evt?: React.MouseEvent) => void;

  /**
   * Behavior when the checkbox is clicked in addition to changing the checked state.
   **/
  onCheckClick?: (item?: IItemTileProps, evt?: React.MouseEvent) => void;

  /**
   * Additional properties that may be defined for folder and photo tiles.
   **/
  itemTileTypeProps?: IItemTileFolderProps | IItemTilePhotoProps;

  /**
   * True if the itemTile should always have its checkCircle visible. Useful for indicating the selection region to mobile users.
   * @default false
   */
  showSelect?: boolean;

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
   **/
  childCount?: number;

  /**
   * List of available thumbnails for the folder to pulse through.
   **/
  pulseThumbnails?: string[];
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
