import * as React from 'react';
import './GridList.Example.scss';
import { ExampleCard } from '../../index';
import { PropertiesTableSet } from '../../components/PropertiesTable/PropertiesTableSet';

import { GridListExample } from './examples/GridList.Example';
import { GridListFixedExample } from './examples/GridList.Fixed.Example';

const GridListExampleCode = require('./examples/GridList.Example.tsx');
const GridListFixedExampleCode = require('./examples/GridList.Fixed.Example.tsx');

export class GridListPage extends React.Component<any, any> {

  public render() {
    return (
      <div className='GridList'>
        <h1 className='ms-font-xxl'>Image Grid</h1>
        <div>
          Image Grid for ODSP sites, meant to display a grid of tiles or images. Constructed using the fabric-react List component.
          By default, the GridList control attempts to select and place images to justify each row while maintaining the image's native aspect ratio.
        </div>
        <h2 className='ms-font-xl'>Examples</h2>
        <ExampleCard title='Image Grid' code={ GridListExampleCode }>
          <GridListExample />
        </ExampleCard>
        <ExampleCard title='Fixed Image Grid' isOptIn={ true } code={ GridListFixedExampleCode }>
          <GridListFixedExample />
        </ExampleCard>
        <br /><br />
        <div>
          The IGridListItem interface defines attributes necessary for items to be rendered by the GridList.
          All IGridListItem cell attributes are calculated and controlled by the GridList contol.
          The user only needs to provide the imageHeight and imageWidth properties.
        </div>
        <PropertiesTableSet componentName='GridList' />
      </div>
    );
  }
}
