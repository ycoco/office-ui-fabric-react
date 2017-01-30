import * as React from 'react';
import { GridList } from '../../../../components/index';
import { createGridListFixedItems } from '../../../utilities/data';

import { ItemTile, ItemTileType } from '../../../../components/index';
import { SelectionMode } from 'office-ui-fabric-react/lib/utilities/selection';
import { autobind } from 'office-ui-fabric-react/lib/Utilities';

export class GridListFixedExample extends React.Component<any, {}> {
  private _items;

  constructor() {
    super();

    this._items = createGridListFixedItems(150);
  }

  public render() {
    // This gridlist doesn't use generics.
    return (
      <div className='GridListExample'>
        <GridList
          fixedCellRatio={ .75 }
          items={ this._items }
          onRenderCell={ this._renderItemTile }
          selectionMode={ SelectionMode.multiple }
          minimumHeight={ 256 }
          maximumHeight={ 384 }
          rowsPerPage={ 2 }
          />
      </div>
    );
  }

  @autobind
  private _renderItemTile(onRenderCellParams) {
    let {
      cellHeight,
      cellWidth,
      item,
      index,
      selection
    } = onRenderCellParams;

    return (
      <ItemTile
        cellWidth={ cellWidth }
        cellHeight={ cellHeight }
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
