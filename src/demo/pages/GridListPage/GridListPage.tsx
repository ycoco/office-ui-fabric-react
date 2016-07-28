import * as React from 'react';
import './GridList.Example.scss';
import { ExampleCard } from '../../index';
import { PropertiesTableSet } from '../../components/PropertiesTable/PropertiesTableSet';

import { GridListExample } from './examples/GridList.Example';
import { GridListFixedExample } from './examples/GridList.Fixed.Example';
import { GridListGroupExample } from './examples/GridList.Group.Example';

const GridListExampleCode = require('./examples/GridList.Example.tsx');
const GridListFixedExampleCode = require('./examples/GridList.Fixed.Example.tsx');
const GridListGroupExampleCode = require('./examples/GridList.Group.Example.tsx');

export class GridListPage extends React.Component<any, any> {

  public render() {
    return (
      <div className='GridList'>
        <h1 className='ms-font-xxl'>Grid List</h1>
        <div>
          Grid Listfor ODSP sites, meant to display a grid of tiles or images. Constructed using the fabric-react List component.
          By default, the GridList control attempts to select and place images to justify each row while maintaining the image's native aspect ratio.
        </div>
        <h2 className='ms-font-xl'>Examples</h2>
        <ExampleCard title='Grid List' code={ GridListExampleCode }>
          <GridListExample />
        </ExampleCard>
        <ExampleCard title='Fixed Grid List' isOptIn={ true } code={ GridListFixedExampleCode }>
          <GridListFixedExample />
        </ExampleCard>
        <ExampleCard title='Grid List with grouping' isOptIn={ true } code={ GridListGroupExampleCode }>
          <GridListGroupExample />
        </ExampleCard>
        <br /><br />
        <PropertiesTableSet componentName='GridList' />
      </div>
    );
  }
}
