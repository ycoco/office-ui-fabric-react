/* tslint:disable:no-unused-variable */
import * as React from 'react';
/* tslint:enable:no-unused-variable */

import { DEFAULT_ICON_CELLSIZE } from '../constants';
import { IItemTileProps } from '../ItemTile.props';
import { IItemTileRenderer } from './IItemTileRenderer';

import { Image, IImageProps } from '@ms/office-ui-fabric-react/lib/Image';

export default class ItemTileThumbnailRenderer implements IItemTileRenderer {
  public render(props: IItemTileProps) {
    let thumbnailImageProps: IImageProps = {
      src: props.thumbnailUrl,
      alt: 'No thumbnail available',
      width: (props.cellWidth || DEFAULT_ICON_CELLSIZE) - 2,
      height: (props.cellHeight || DEFAULT_ICON_CELLSIZE) - 2,
      shouldFadeIn: true
    };

    return (
      <div className='ms-ItemTile-thumbnail'>
        <Image { ...thumbnailImageProps } />
      </div>
    );
  }
}