/* tslint:disable:no-unused-variable */
import * as React from 'react';
/* tslint:enable:no-unused-variable */

import { IItemTileProps } from '../ItemTile.props';
import { IItemTileRenderer } from './IItemTileRenderer';
import ItemTileThumbnailRenderer from './ItemTileThumbnailRenderer';
import ItemTileSubTextIconRenderer from './ItemTileSubTextIconRenderer';

export default class ItemTileVideoRenderer implements IItemTileRenderer {

  private _thumbnailRenderer;
  private _subTextIconRenderer;

  constructor() {
    this._thumbnailRenderer = new ItemTileThumbnailRenderer();
    this._subTextIconRenderer = new ItemTileSubTextIconRenderer();
  }

  public render(props: IItemTileProps) {
    return (
      <div className='ms-ItemTile-video'>
        { this._thumbnailRenderer.render(props) }
        <span className='ms-ItemTile-playButton'>
          { this._subTextIconRenderer.render(props) }
        </span>
      </div>
    );
  }
}
