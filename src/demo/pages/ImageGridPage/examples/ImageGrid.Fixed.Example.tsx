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
          maximumHeight={ 512 }
          />
      </div>
    );
  }

  private _renderItemTile(item, index, selection) {
    return (
      <ItemTile
        itemTileType={ ItemTileType.file }
        displayName={ item.displayName }
        subText={ item.subText }
        cellWidth={ item.cellWidth }
        cellHeight={ item.cellHeight }
        selection={ selection }
        selectionIndex={ index }
        thumbnailUrl={ item.thumbnailUrl }
        />
    );
  }
}
