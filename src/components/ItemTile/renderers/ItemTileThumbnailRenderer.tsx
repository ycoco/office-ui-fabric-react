/* tslint:disable:no-unused-variable */
import * as React from 'react';
/* tslint:enable:no-unused-variable */

import { DEFAULT_ICON_CELLSIZE } from '../Constants';
import { IItemTileProps } from '../ItemTile.Props';
import { IItemTileRenderer } from './IItemTileRenderer';

import {
  Image,
  ImageFit
} from '@ms/office-ui-fabric-react/lib/Image';

import { Async } from '@ms/office-ui-fabric-react/lib/utilities/Async/Async';

// The itemtile frame has an 1px outline that must be accounted for when displaying the thumbnail
const TILE_FRAME_OUTLINE_SIZE = 2;
// The amount of time in MS it takes for an Image component to fade its image in
const FADEIN_TRANSITION_DURATION = 400;

export class ItemTileThumbnailRenderer implements IItemTileRenderer {

  private _thumbnailUrl;
  private _nextThumbnailUrl;
  private _async;

  constructor() {
    this._async = new Async(this);
  }

  public dispose() {
    this._async.dispose();
  }

  public render(props: IItemTileProps) {
    if (!this._thumbnailUrl) {
      this._thumbnailUrl = props.thumbnailUrl;
    } else if (this._thumbnailUrl !== props.thumbnailUrl && !this._nextThumbnailUrl) {
      this._nextThumbnailUrl = props.thumbnailUrl;
      this._async.setTimeout(() => {
        this._thumbnailUrl = this._nextThumbnailUrl;
        this._nextThumbnailUrl = undefined;
      }, FADEIN_TRANSITION_DURATION);
    }

    let thumbnailImageProps = {
      alt: 'No thumbnail available',
      width: (props.cellWidth || DEFAULT_ICON_CELLSIZE) - TILE_FRAME_OUTLINE_SIZE,
      height: (props.cellHeight || DEFAULT_ICON_CELLSIZE) - TILE_FRAME_OUTLINE_SIZE,
      shouldFadeIn: true,
      imageFit: ImageFit.cover
    };

    return (
      <div className='ms-ItemTile-thumbnail'>
        <Image { ...thumbnailImageProps } src={ this._thumbnailUrl } />
        { !!this._nextThumbnailUrl &&
          <div className='ms-ItemTile-thumbnail-xfade'>
            <Image { ...thumbnailImageProps } src={ this._nextThumbnailUrl }  />
          </div>
        }
      </div>
    );
  }
}