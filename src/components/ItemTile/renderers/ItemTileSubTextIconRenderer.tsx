/* tslint:disable:no-unused-variable */
import * as React from 'react';
/* tslint:enable:no-unused-variable */

import { SubTextIconType } from '../constants';
import { IItemTileProps, IItemTilePhotoProps, ItemTileType } from '../ItemTile.Props';
import { IItemTileRenderer } from './IItemTileRenderer';

export class ItemTileSubTextIconRenderer implements IItemTileRenderer {
  public render(props: IItemTileProps) {
    return (<i className={ this._computeSubTextIconClass(props) } />);
  }

  private _subTextIconType(props: IItemTileProps): SubTextIconType {
    if (props.itemTileType === ItemTileType.video) {
      return SubTextIconType.playButton;
    }
    if (props.isShared) {
      return SubTextIconType.sharing;
    }
    if (props.isViolation) {
      return SubTextIconType.block;
    }
    if (props.itemTileTypeProps && (props.itemTileTypeProps as IItemTilePhotoProps).isBadPhoto) {
      return SubTextIconType.badPhoto;
    }
    return SubTextIconType.none;
  }

  private _computeSubTextIconClass(props: IItemTileProps): string {
    let baseClass = 'ms-Icon ';
    switch (this._subTextIconType(props)) {
      case SubTextIconType.sharing:
        return baseClass + 'ms-ItemTIle-sharingIcon ms-ItemTile-subTextIcon ms-Icon--people';
      case SubTextIconType.block:
        return baseClass + 'ms-ItemTile-blockIcon ms-ItemTile-subTextIcon ms-Icon--drm';
      case SubTextIconType.notify:
        return baseClass + 'ms-ItemTile-subTextIcon ms-Icon--alert';
      case SubTextIconType.playButton:
        return baseClass + 'ms-ItemTile-playButton ms-Icon--play';
      case SubTextIconType.badPhoto:
        return baseClass + 'ms-ItemTile-badPhotoIcon ms-Icon--alert';
      default:
        return '';
    }
  }
}