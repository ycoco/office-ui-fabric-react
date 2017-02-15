import * as React from 'react';

import { DEFAULT_ICON_CELLSIZE } from '../Constants';
import { IItemTileProps } from '../ItemTile.Props';
import { IItemTileRenderer } from './IItemTileRenderer';

import {
  Image,
  ImageFit
} from 'office-ui-fabric-react/lib/Image';

import { Async } from 'office-ui-fabric-react/lib/Utilities';

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
    let {
      thumbnailAlt,
      thumbnailUrl
    } = props;

    if (!this._thumbnailUrl) {
      this._thumbnailUrl = thumbnailUrl;
    } else if (this._thumbnailUrl !== thumbnailUrl && !this._nextThumbnailUrl) {
      this._nextThumbnailUrl = thumbnailUrl;
      this._async.setTimeout(() => {
        this._thumbnailUrl = this._nextThumbnailUrl;
        this._nextThumbnailUrl = undefined;
      }, FADEIN_TRANSITION_DURATION);
    }

    let thumbnailImageProps = {
      alt: thumbnailAlt ? thumbnailAlt : '',
      width: (props.cellWidth || DEFAULT_ICON_CELLSIZE) - TILE_FRAME_OUTLINE_SIZE,
      height: (props.cellHeight || DEFAULT_ICON_CELLSIZE) - TILE_FRAME_OUTLINE_SIZE,
      shouldFadeIn: true,
      imageFit: ImageFit.cover,
      role: 'presentation'
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
