import * as React from 'react';
import { ItemTile, ItemTileType } from '../../../../components/index';
import { createExampleItems } from '../../../utilities/data';

import { Button } from '@ms/office-ui-fabric-react/lib/Button';
import { FocusZone } from '@ms/office-ui-fabric-react/lib/FocusZone';
import {
  IObjectWithKey,
  Selection,
  SelectionMode,
  SelectionZone
} from '@ms/office-ui-fabric-react/lib/utilities/selection';

export class FileTileSelectionExample extends React.Component<React.Props<FileTileSelectionExample>, {}> {
  private _hasMounted: boolean;
  private _items;
  private _selection;

  constructor() {
    super();

    this._onSelectionChanged = this._onSelectionChanged.bind(this);
    this._onToggleSelectAll = this._onToggleSelectAll.bind(this);
    this._hasMounted = false;

    this._items = createExampleItems(10);
    this._selection = new Selection(this._onSelectionChanged);
    /**
     * Adds the items to be used with the selection control.
     * The items must be cast to an IObjectWithKey in order to be recognized by the selection control.
     */
    this._selection.setItems(this._items as IObjectWithKey[], false);
  }

  public componentDidMount() {
    this._hasMounted = true;
  }

  public render() {
    /**
     * The items must be contained within a SelectionZone component in order for selection change events to be handled.
     */
    return (
      <div className='ms-SelectionBasicExample'>
        <Button onClick={ this._onToggleSelectAll }>
          { this._selection.isAllSelected() ? 'Unselect all' : 'Select all'}
        </Button>
        <FocusZone>
          <SelectionZone
            selection={ this._selection }
            selectionMode={ SelectionMode.multiple }
            >
            { this._items.map((item, index) => (
                <ItemTile
                  itemIndex={ index }
                  itemTileType={ ItemTileType.file }
                  displayName={ item.displayName }
                  selection={ this._selection }
                  />
              )) }
          </SelectionZone>
        </FocusZone>
      </div>
    );
  }

  private _onSelectionChanged() {
    if (this._hasMounted) {
      this.forceUpdate();
    }
  }

  private _onToggleSelectAll() {
    this._selection.toggleAllSelected();
  }
}
