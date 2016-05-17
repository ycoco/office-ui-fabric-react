import * as React from 'react';
import { ExampleCard } from '../../index';
import { PropertiesTableSet } from '../../components/PropertiesTable/PropertiesTableSet';
import ItemTileExample from './examples/ItemTile.Example';
let ItemTileExampleCode = require('./examples/ItemTile.Example.tsx');

export default class ItemTilePage extends React.Component<any, any> {

  public render() {
    return (
      <div className='ItemTileExample'>
        <h1 className='ms-font-xxl'>Item Tile</h1>
        <div>Item Tile for ODSP sites, meant to display tiles.</div>
        <h2 className='ms-font-xl'>Examples</h2>
        <ExampleCard title='Item Tile' code={ ItemTileExampleCode }>
          <ItemTileExample />
        </ExampleCard>
        <br /><br />
        <PropertiesTableSet componentName='ItemTile' />
      </div>
    );
  }
}
