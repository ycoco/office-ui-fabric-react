import * as React from 'react';

import { IItemTileProps } from '../ItemTile.Props';
import { IItemTileRenderer } from './IItemTileRenderer';
import { ItemTileThumbnailRenderer } from './ItemTileThumbnailRenderer';
import { ItemTileSubTextIconRenderer } from './ItemTileSubTextIconRenderer';

export class ItemTileVideoRenderer implements IItemTileRenderer {

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
