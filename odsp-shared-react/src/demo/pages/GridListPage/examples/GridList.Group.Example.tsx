import * as React from 'react';
import {
  GridList,
  IGridListProps
} from '../../../../components/index';
import { IGridListExampleItem, createGridListItems } from '../../../utilities/data';

import { ItemTile, ItemTileType } from '../../../../components/index';
import {
  SelectionMode
} from 'office-ui-fabric-react/lib/utilities/selection';

// In order to use a generic with the GridList, a new constructor must be created extending GridList with your generic type.
const ExampleGridList = GridList as new (props: IGridListProps<IGridListExampleItem>) => GridList<IGridListExampleItem>;

export class GridListGroupExample extends React.Component<any, {}> {
  private _items;

  constructor() {
    super();
    this._items = createGridListItems(60);
  }

  public render() {
    return (
     <ExampleGridList
      items={ this._items }
      getItemAspectRatio={ (item: IGridListExampleItem, index: number) => item.imageWidth / item.imageHeight }
      onRenderCell={ this._renderItemTile }
      selectionMode={ SelectionMode.multiple }
      maximumHeight={ 384 }
      minimumCellRatio={ 3 / 4 }
      groups={
        [
          {
            key: 'group0',
            name: 'group0',
            startIndex: 0,
            count: 20
          },
          {
            key: 'group1',
            name: 'group1',
            startIndex: 20,
            count: 20
          },
          {
            key: 'group2',
            name: 'group2',
            startIndex: 40,
            count: 20
          }
        ]
      }
      />
    );
  }

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
        onClick={ (itemTile: ItemTile) => alert(`You've clicked on ${itemTile.props.displayName}`) }
        linkUrl='index.html#/itemTile'
        />
    );
  }
}
