/* tslint:disable:no-unused-variable */
import * as React from 'react';
/* tslint:enable:no-unused-variable */

import { SubTextIconType, ItemTileType } from '../constants';
import { IItemTileProps } from '../ItemTile.props';
import { IItemTileRenderer } from './IItemTileRenderer';

import { Image, IImageProps } from '@ms/office-ui-fabric-react/lib/Image';

export default class ItemTileSubtextIconRenderer implements IItemTileRenderer {
  public render(props: IItemTileProps) {
    let subTextIconUrl = this._computeSubTextIconUrl(props);

    let subTextIconImageProps: IImageProps = {
      src: props.thumbnailUrl,
      shouldFadeIn: true
    };

    if (!!subTextIconUrl) {
      return (<Image className='ms-ItemTile-subTextImage' { ...subTextIconImageProps } />);
    } else {
      return (<i className={ this._computeSubTextIconClass(props) } />);
    }
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
    if (props.itemTileTypeProps && props.itemTileTypeProps.isBadPhoto) {
      return SubTextIconType.badPhoto;
    }
    if (props.checkedOutUserId) {
      return SubTextIconType.checkOut;
    }
    return SubTextIconType.none;
  }

  private _computeSubTextIconClass(props: IItemTileProps): string {
    let baseClass = 'ms-Icon ';
    switch (this._subTextIconType(props)) {
      case SubTextIconType.sharing:
        return baseClass + 'ms-ItemTIle-sharingIcon ms-ItemTile-subTextIcon ms-Icon--people';
      case SubTextIconType.checkOut:
        return baseClass + 'ms-ItemTile-subTextImageShort';
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

  // TODO: Acquire the subtext icon for checkout
  private _computeSubTextIconUrl(props: IItemTileProps): string {
    // Check out uses an image. Other subtext icons use the icon font.
    if (this._subTextIconType(props) !== SubTextIconType.checkOut) {
      return '';
    }

    return '';
  }
}