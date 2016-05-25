/* tslint:disable:no-unused-variable */
import * as React from 'react';
/* tslint:enable:no-unused-variable */
import { IItemTileProps } from '../ItemTile.Props';
import { IItemTileRenderer } from './IItemTileRenderer';
import { ItemTileThumbnailRenderer } from './ItemTileThumbnailRenderer';
import { ItemTileSubTextIconRenderer } from './ItemTileSubTextIconRenderer';

import { css } from '@ms/office-ui-fabric-react/lib/utilities/css';

export class ItemTileFileRenderer implements IItemTileRenderer {

  private _thumbnailRenderer;
  private _subTextIconRenderer;

  constructor() {
    this._thumbnailRenderer = new ItemTileThumbnailRenderer();
    this._subTextIconRenderer = new ItemTileSubTextIconRenderer();
  }

  public render(props: IItemTileProps): JSX.Element {
    return (
      <div className='ms-ItemTile-file'>
        <div className='ms-ItemTile-fileContainer'>
          <div className={ css(
            'ms-ItemTile-fileIcon',
            {
              'ms-ItemTile-fileIcon--thumbnail': !!props.thumbnailUrl,
              'ms-ItemTile-fileIcon--noThumbnail': !props.thumbnailUrl
            }) }>
            <span className='ms-FileTypeIcon'>
              { /** TODO: Replace this span with the FileTypeIcon component */ }
            </span>
          </div>
          { this._thumbnailRenderer.render(props) }
          <div className='ms-ItemTile-namePlate'>
            <div className='ms-ItemTile-name'>
              { props.displayName }
            </div>
            <div className='ms-ItemTile-subText'>
              { this._subTextIconRenderer.render(props) }
              <span>
                { props.subText }
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
