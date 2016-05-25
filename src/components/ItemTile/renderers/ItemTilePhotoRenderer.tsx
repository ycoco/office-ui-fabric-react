/* tslint:disable:no-unused-variable */
import * as React from 'react';
/* tslint:enable:no-unused-variable */

import { IItemTileProps, IItemTilePhotoProps, ItemTileType } from '../ItemTile.Props';
import { IItemTileRenderer } from './IItemTileRenderer';
import { ItemTileThumbnailRenderer } from './ItemTileThumbnailRenderer';
import { ItemTileSubTextIconRenderer } from './ItemTileSubTextIconRenderer';

export class ItemTilePhotoRenderer implements IItemTileRenderer {

  private _thumbnailRenderer;
  private _subTextIconRenderer;

  constructor() {
    this._thumbnailRenderer = new ItemTileThumbnailRenderer();
    this._subTextIconRenderer = new ItemTileSubTextIconRenderer();
  }

  public render(props: IItemTileProps) {
    return (
      <div className='ms-ItemTile-photo'>
        { this._thumbnailRenderer.render(props) }
        { this._isNamePlateVisible(props) && false && (
          <div className='ms-ItemTile-namePlate'>
            <div className='ms-ItemTile-name'>
              { props.displayName }
            </div>
            <div className='ms-ItemTile-subText'>
              { this._subTextIconRenderer.render(props) }
            </div>
          </div>
        ) }
      </div>
    );
  }

  private _isNamePlateVisible(props: IItemTileProps): boolean {
    if (props.itemTileType === ItemTileType.photo) {
      return props.itemTileTypeProps && (props.itemTileTypeProps as IItemTilePhotoProps).isBadPhoto;
    }
     return true;
  }
}
