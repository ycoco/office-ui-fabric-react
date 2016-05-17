import * as React from 'react';
import { ItemTile, IItemTileProps, IItemTileItem } from '../../../../components/index';

export interface IItemTileExampleState {
}

export default class ItemTileExample extends React.Component<any, IItemTileExampleState> {
  constructor() {
    super();
  }

  public render() {
    return (
      <ItemTile />
    );
  }
}
