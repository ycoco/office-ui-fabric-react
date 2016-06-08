import * as React from 'react';
import { ImageGrid } from '../../../../components/index';
import { createImageGridItems } from '../../../utilities/data';

import { ItemTile, ItemTileType } from '../../../../components/index';
import {
  SelectionMode
} from '@ms/office-ui-fabric-react/lib/utilities/selection';

export class ImageGridExample extends React.Component<any, {}> {
  private _items;

  constructor() {
    super();

    this._items = createImageGridItems(50);
  }

  public render() {
    return (
      <div className='ImageGridExample'>
        <ImageGrid
          items={ this._items }
          onRenderCell={ this._renderItemTile }
          selectionMode={ SelectionMode.multiple }
          maximumHeight={ 384 }
          minimumCellRatio={ 3 / 4 }
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
