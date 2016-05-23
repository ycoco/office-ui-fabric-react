/* tslint:disable:no-unused-variable */
import * as React from 'react';
/* tslint:enable:no-unused-variable */

import { ItemTileType } from '../constants';
import { IItemTileProps } from '../ItemTile.props';
import { IItemTileRenderer } from './IItemTileRenderer';
import ItemTileThumbnailRenderer from './ItemTileThumbnailRenderer';
import ItemTileSubTextIconRenderer from './ItemTileSubTextIconRenderer';

export default class ItemTilePhotoRenderer implements IItemTileRenderer {

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
      return props.itemTileTypeProps && props.itemTileTypeProps.isBadPhoto;
    }
     return true;
  }
}
