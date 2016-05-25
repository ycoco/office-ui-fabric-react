import { IItemTileProps, ItemTileType } from '../ItemTile.Props';
import { ItemTileFileRenderer } from './ItemTileFileRenderer';
import { ItemTileFolderRenderer } from './ItemTileFolderRenderer';
import { ItemTilePhotoRenderer } from './ItemTilePhotoRenderer';
import { ItemTileVideoRenderer } from './ItemTileVideoRenderer';

/**
 * A constant map for selecting a content renderer for the tile.
 */
export const TILE_RENDERERS = {
  [ ItemTileType.file ]: ItemTileFileRenderer,
  [ ItemTileType.folder ]: ItemTileFolderRenderer,
  [ ItemTileType.photo ]: ItemTilePhotoRenderer,
  [ ItemTileType.video ]: ItemTileVideoRenderer
};

export interface IItemTileRenderer {
  render: (props: IItemTileProps) => JSX.Element;
}
