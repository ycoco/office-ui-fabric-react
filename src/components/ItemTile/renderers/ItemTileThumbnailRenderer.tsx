/* tslint:disable:no-unused-variable */
import * as React from 'react';
/* tslint:enable:no-unused-variable */

import { DEFAULT_ICON_CELLSIZE } from '../constants';
import { IItemTileProps } from '../ItemTile.Props';
import { IItemTileRenderer } from './IItemTileRenderer';

import { Image, IImageProps } from '@ms/office-ui-fabric-react/lib/Image';

// The itemtile frame has an 1px outline that must be accounted for when displaying the thumbnail
const TILE_FRAME_OUTLINE_SIZE = 2;

export class ItemTileThumbnailRenderer implements IItemTileRenderer {
  public render(props: IItemTileProps) {
    let thumbnailImageProps: IImageProps = {
      src: props.thumbnailUrl,
      alt: 'No thumbnail available',
      width: (props.cellWidth || DEFAULT_ICON_CELLSIZE) - TILE_FRAME_OUTLINE_SIZE,
      height: (props.cellHeight || DEFAULT_ICON_CELLSIZE) - TILE_FRAME_OUTLINE_SIZE,
      shouldFadeIn: true
    };

    return (
      <div className='ms-ItemTile-thumbnail'>
        <Image { ...thumbnailImageProps } />
      </div>
    );
  }
}