import * as React from 'react';
import './ItemTile.scss';
import { IItemTileProps, IItemTileItem } from './ItemTile.Props';
import EventGroup from '@ms/office-ui-fabric-react/lib/utilities/eventGroup/EventGroup';

export interface IItemTileState {
  /** Tiles to be rendered */
  renderedItems?: IItemTileItem[];
}

let _instance = 0;

/**
 * Item Tile Control, meant to display tiles.
 */
export default class ItemTile extends React.Component<IItemTileProps, IItemTileState> {

  private _instanceIdPrefix: string;
  private _events: EventGroup;

  constructor(props: IItemTileProps, context?: any) {
    super(props, context);
    this._instanceIdPrefix = 'ItemTile-' + (_instance++) + '-';
    this._events = new EventGroup(this);

    this.state = this._getStateFromProps(this.props);
  }

  public render() {
    return (
      <div className='ms-ItemTile' ref='ItemTileRegion'>
        <h2 className='ms-font-xl'>Lorem Ipsum</h2>
        <div className='ms-ItemTileItems'>
        { this._renderItemTileItems() }
        </div>
      </div>
    );
  }

  private _renderItemTileItems() {
    let { renderedItems } = this.state;

    return renderedItems.map((item, index) => (
      <span className='ms-ItemTileItem' key={ index } ref={ String(index) }>
        <button className='ms-ItemTileItem-link' onClick={ this._onItemClick.bind(this, item) }>
          { item.tempText }
          </button>
        </span>
    ));
  }

  private _onItemClick(item: IItemTileItem, ev: React.MouseEvent) {
    if (item.onClick) {
      item.onClick(item, ev);

      ev.stopPropagation();
      ev.preventDefault();
    }
  }

  private _getStateFromProps(props: IItemTileProps): IItemTileState {
    return {
      renderedItems: props.items,
    };
  }
}
