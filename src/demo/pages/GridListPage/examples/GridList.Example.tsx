import * as React from 'react';
import './GridList.Example.scss';
import { ItemTile, IItemTileProps, ItemTileType } from '../../../../components/index';
import { List, IListProps } from '@ms/office-ui-fabric-react/lib/List';
import { createGridListItems } from '../../../utilities/data';

export class GridListExample extends React.Component<any, {}> {

  private _items;

  constructor() {
    super();

    this._items = createGridListItems(1000);
  }

  public render() {
    let listProps: IListProps = {
      items: this._items,
      onRenderCell: this._renderItemTile,
      getItemCountForPage: this._getItemCountForPage
    };

    return (
      <List { ...listProps } />
    );
  }

  private _renderItemTile(item, index: number) {
    let itemTileProps: IItemTileProps = {
      itemTileType: ItemTileType.file,
      displayName: String(index + 1) + '. ' + item.displayName,
      subText: item.subText,
      cellWidth: item.cellWidth - 16,
      tabIndex: index
    };

    return (
      <div
        className='ms-GridListExample-cell'
        style={ {
          margin: '8px'
        } }
        >
        <ItemTile { ...itemTileProps } />
      </div>
    );
  }

  private _getItemCountForPage(itemIndex: number, surfaceRect: ClientRect): number {
    if (!this.props.items) {
      return 10;
    }

    if (itemIndex >= this.props.items.length) {
      return 1;
    }
    let count = 0;
    let remainingWidth = surfaceRect.width;
    while (this.props.items[itemIndex + count].cellWidth < remainingWidth) {
      remainingWidth -= this.props.items[itemIndex + count].cellWidth;
      count++;
      if (itemIndex + count >= this.props.items.length) {
        break;
      }
    }

    if (remainingWidth < surfaceRect.width / 4) {
      for (let i = itemIndex; i < itemIndex + count; i++) {
        // I don't know how 17 was divined
        this.props.items[i].cellWidth += (remainingWidth - 17) / count;
      }
    }

    return count;
  }
}
