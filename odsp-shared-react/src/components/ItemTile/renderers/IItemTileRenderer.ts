import { IItemTileProps, ItemTileType } from '../ItemTile.Props';
import { ItemTileFileRenderer } from './ItemTileFileRenderer';
import { ItemTileFolderRenderer } from './ItemTileFolderRenderer';
import { ItemTilePhotoRenderer } from './ItemTilePhotoRenderer';
import { ItemTileVideoRenderer } from './ItemTileVideoRenderer';

export interface IItemTileRenderer {
  dispose: () => void;
  render: (props: IItemTileProps) => JSX.Element;
}

/**
 * A constant map for selecting a content renderer for the tile.
 */
export const TILE_RENDERERS: {
  [key: number]: new (...args: any[]) => IItemTileRenderer;
} = {
  [ ItemTileType.file ]: ItemTileFileRenderer,
  [ ItemTileType.folder ]: ItemTileFolderRenderer,
  [ ItemTileType.photo ]: ItemTilePhotoRenderer,
  [ ItemTileType.video ]: ItemTileVideoRenderer
};