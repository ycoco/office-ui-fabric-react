import * as React from 'react';
import ItemTile from './ItemTile';
import { ItemTileType } from './constants';
import { IFolderCoverTileProps } from './FolderCoverTile';

export interface IItemTileProps extends React.Props<ItemTile> {
  /** The type of the itemTile. For now, can be a file, folder, photo, or video. */
  itemTileType: ItemTileType;

  /** The name for the item tile to be displayed */
  displayName?: string;

  /** Subtext for the tile */
  subText?: string;

  /** A description that appears when a user hovers over the tile */
  tooltipText?: string;

  /** Link associated with the tile */
  linkUrl?: string;

  /** Url of the tile's thumbnail */
  thumbnailUrl?: string;

  /**
   * Width of the tile
   * @default 192
  */
  cellWidth?: number;
  /**
   * Height of the tile
   * @default 192
  */
  cellHeight?: number;

  /**
   * Tabindex of the tile
   * @default -1
   */
  tabIndex?: number;

  /** Behavior when item is clicked */
  onClick?: (item?: IItemTileProps, evt?: React.MouseEvent) => void;

  /** Additional behavior when the checkbox is clicked */
  onRowCheckClick?: (item?: IItemTileProps, evt?: React.MouseEvent) => void;

  /** Specific properties for a cetain item tile types */
  itemTileTypeProps?: any;

  /**
   * If the item is currently being shared to other user(s)
   * @default false
   */
  isShared?: boolean;

  /**
   * The id of the user checking out the item
   * @default false
   */
  checkedOutUserId?: boolean;

  /**
   * If the item being displayed is in violation of the ToS
   * @default false
   */
  isViolation?: boolean;
}

export interface IItemTileFolderProps {
  /**
   * Whether the subtext is visible for a folder
   * @default false
   */
  isSubTextVisible?: boolean;

  /**
   * Whether a folder is an album
   * @default false
   */
  isAlbum?: boolean;

  /**
   * TODO: Describe this
   * @default false
   */
  isBundle?: boolean;

  /** Number of subitems to display for a folder */
  childCount?: number;

  /**
   * TODO: Describe this
   * @default false
   */
  faceGroup?: boolean;

  /** List of thumbnails to pulse through */
  pulseThumbnails?: string[];

  /**
   * The properties of the foldercovertile
   * @default generated from pulseThumbnails
   */
  folderCoverTileProps?: IFolderCoverTileProps;
}

export interface IItemTilePhotoProps {
  /**
   * If the thumbnail cannot be displayed
   * @default false
   */
  isBadPhoto?: boolean;
}
