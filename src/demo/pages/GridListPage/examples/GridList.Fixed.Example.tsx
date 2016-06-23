import * as React from 'react';
import { GridList } from '../../../../components/index';
import { createGridListFixedItems } from '../../../utilities/data';

import { ItemTile, ItemTileType } from '../../../../components/index';
import {
  SelectionMode
} from '@ms/office-ui-fabric-react/lib/utilities/selection';

export class GridListFixedExample extends React.Component<any, {}> {
  private _items;

  constructor() {
    super();

    this._items = createGridListFixedItems(50);
  }

  public render() {
    return (
      <div className='GridListExample'>
        <GridList
          fixedCellRatio={ .75 }
          items={ this._items }
          onRenderCell={ this._renderItemTile.bind(this) }
          selectionMode={ SelectionMode.multiple }
          minimumHeight={ 256 }
          maximumHeight={ 384 }
          />
      </div>
    );
  }

  private _renderItemTile(onRenderCellParams) {
    let {
      item,
      index,
      selection
    } = onRenderCellParams;

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
