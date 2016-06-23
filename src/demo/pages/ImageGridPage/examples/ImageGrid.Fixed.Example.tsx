import * as React from 'react';
import { ImageGrid } from '../../../../components/index';
import { createImageGridFixedItems } from '../../../utilities/data';

import { ItemTile, ItemTileType } from '../../../../components/index';
import {
  SelectionMode
} from '@ms/office-ui-fabric-react/lib/utilities/selection';

export class ImageGridFixedExample extends React.Component<any, {}> {
  private _items;

  constructor() {
    super();

    this._items = createImageGridFixedItems(50);
  }

  public render() {
    return (
      <div className='ImageGridExample'>
        <ImageGrid
          isFixedSize={ true }
          items={ this._items }
          onRenderCell={ this._renderItemTile.bind(this) }
          selectionMode={ SelectionMode.multiple }
          minimumHeight={ 256 }
          maximumHeight={ 384 }
          maximumCellRatio={ .75 }
          />
      </div>
    );
  }

  private _renderItemTile(item, index, selection) {
    return (
      <ItemTile
        cellWidth={ item.cellWidth }
        cellHeight={ item.cellHeight }
        displayName={ item.displayName }
        itemIndex={ index }
        itemTileType={ ItemTileType.file }
        selection={ selection }
        subText={ item.subText }
        thumbnailUrl={ item.thumbnailUrl }
        />
    );
  }
}
