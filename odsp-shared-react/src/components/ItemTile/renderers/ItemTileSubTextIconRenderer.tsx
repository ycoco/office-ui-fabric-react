import * as React from 'react';

import { SubTextIconType } from '../Constants';
import { IItemTileProps, IItemTilePhotoProps, ItemTileType } from '../ItemTile.Props';
import { IItemTileRenderer } from './IItemTileRenderer';

export class ItemTileSubTextIconRenderer implements IItemTileRenderer {
  public render(props: IItemTileProps) {
    return (<i className={ this._computeSubTextIconClass(props) } />);
  }

  public dispose() {
    return;
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
        return baseClass + 'ms-ItemTile-sharingIcon ms-ItemTile-subTextIcon ms-Icon--People';
      case SubTextIconType.block:
        return baseClass + 'ms-ItemTile-blockIcon ms-ItemTile-subTextIcon ms-Icon--DRMalert';
      case SubTextIconType.notify:
        return baseClass + 'ms-ItemTile-subTextIcon ms-Icon--IncidentTriangle';
      case SubTextIconType.playButton:
        return baseClass + 'ms-ItemTile-playButton ms-Icon--Play';
      case SubTextIconType.badPhoto:
        return baseClass + 'ms-ItemTile-badPhotoIcon ms-Icon--IncidentTriangle';
      default:
        return '';
    }
  }
}
