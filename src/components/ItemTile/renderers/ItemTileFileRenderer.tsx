/* tslint:disable:no-unused-variable */
import * as React from 'react';
/* tslint:enable:no-unused-variable */
import {
  IItemTileProps,
  IItemTileFileProps
} from '../ItemTile.Props';
import { IItemTileRenderer } from './IItemTileRenderer';
import { ItemTileThumbnailRenderer } from './ItemTileThumbnailRenderer';
import { ItemTileSubTextIconRenderer } from './ItemTileSubTextIconRenderer';

import {
  Image
} from '@ms/office-ui-fabric-react/lib/Image';
import { css } from '@ms/office-ui-fabric-react/lib/utilities/css';

export class ItemTileFileRenderer implements IItemTileRenderer {

  private _thumbnailRenderer;
  private _subTextIconRenderer;

  constructor() {
    this._thumbnailRenderer = new ItemTileThumbnailRenderer();
    this._subTextIconRenderer = new ItemTileSubTextIconRenderer();
  }

  public dispose() {
    this._thumbnailRenderer.dispose();
    this._subTextIconRenderer.dispose();
  }

  public render(props: IItemTileProps): JSX.Element {
    let {
      displayName,
      itemTileTypeProps,
      subText,
      thumbnailUrl
    } = props;

    return (
      <div className='ms-ItemTile-file'>
        <div className='ms-ItemTile-fileContainer'>
          { !!(itemTileTypeProps && (itemTileTypeProps as IItemTileFileProps).fileTypeIconUrl) &&
            (
            <div className='ms-ItemTile-fileIconContainer'>
              <div className={ css(
                'ms-ItemTile-fileIcon',
                {
                  'ms-ItemTile-fileIcon--thumbnail': !!thumbnailUrl,
                  'ms-ItemTile-fileIcon--noThumbnail': !thumbnailUrl
                }) }>
                <span className='ms-FileTypeIcon'>
                  <Image
                    className='ms-FileTypeIcon-icon'
                    src={ (itemTileTypeProps as IItemTileFileProps).fileTypeIconUrl }
                    alt=''
                    role='presentation'
                    />
                </span>
              </div>
            </div>
            )
          }
          { this._thumbnailRenderer.render(props) }
          <div className='ms-ItemTile-namePlate'>
            <div className='ms-ItemTile-name'>
              { displayName }
            </div>
            <div className='ms-ItemTile-subText'>
              { this._subTextIconRenderer.render(props) }
              <span>
                { subText }
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
