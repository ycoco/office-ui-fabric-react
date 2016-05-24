import * as React from 'react';
import { ExampleCard } from '../../index';

import { GridListExample } from './examples/GridList.Example';

const GridListExampleCode = require('./examples/GridList.Example.tsx');

export class GridListPage extends React.Component<any, any> {

  public render() {
    return (
      <div className='GridList'>
        <h1 className='ms-font-xxl'>Grid List</h1>
        <div>Grid List for ODSP sites, meant to display a grid of items or tiles.</div>
        <h2 className='ms-font-xl'>Examples</h2>
        <ExampleCard title='Grid List' code={ GridListExampleCode }>
          <GridListExample />
        </ExampleCard>
        <br /><br />
      </div>
    );
  }
}
