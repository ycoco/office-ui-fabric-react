import * as React from 'react';
import { ItemTile, IItemTileProps, IItemTileItem } from '../../../../components/index';

export interface IItemTileExampleState {
  numberOfExampleItems: Number;
}

export default class ItemTileExample extends React.Component<any, IItemTileExampleState> {
  constructor() {
    super();
    this.state = { numberOfExampleItems: 5 };
  }

  public render() {
    let { numberOfExampleItems } = this.state;
    let arrayOfItems: IItemTileItem[] = [];

    for (let i = 0; i < numberOfExampleItems; i++) {
      arrayOfItems.push({
        tempText: `Item Tile ${i + 1}`,
        onClick: (item: IItemTileItem) => {
          alert(`You clicked on ${item.tempText}`);
        }
      });
    }

    let itemTileProps: IItemTileProps = { items: arrayOfItems };

    return (
      <ItemTile {...itemTileProps} />
    );
  }
}
