import * as React from 'react';
import { GridList } from '../../../../components/index';
import { createGridListItems } from '../../../utilities/data';

import { ItemTile, ItemTileType } from '../../../../components/index';
import {
  SelectionMode
} from '@ms/office-ui-fabric-react/lib/utilities/selection';

export class GridListExample extends React.Component<any, {}> {
  private _items;

  constructor() {
    super();

    this._items = createGridListItems(500);
  }

  public render() {
    return (
      <div className='GridListExample'>
        <GridList
          items={ this._items }
          onRenderCell={ this._renderItemTile }
          selectionMode={ SelectionMode.multiple }
          maximumHeight={ 384 }
          minimumCellRatio={ 3 / 4 }
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
        onClick={ () => alert("You've clicked on a tile") }
        />
    );
  }
}
