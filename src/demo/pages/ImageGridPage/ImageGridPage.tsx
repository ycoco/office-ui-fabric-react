import * as React from 'react';
import './ImageGrid.Example.scss';
import { ExampleCard } from '../../index';
import { PropertiesTableSet } from '../../components/PropertiesTable/PropertiesTableSet';

import { ImageGridExample } from './examples/ImageGrid.Example';
import { ImageGridFixedExample } from './examples/ImageGrid.Fixed.Example';

const ImageGridExampleCode = require('./examples/ImageGrid.Example.tsx');
const ImageGridFixedExampleCode = require('./examples/ImageGrid.Fixed.Example.tsx');

export class ImageGridPage extends React.Component<any, any> {

  public render() {
    return (
      <div className='ImageGrid'>
        <h1 className='ms-font-xxl'>Image Grid</h1>
        <div>
          Image Grid for ODSP sites, meant to display a grid of tiles or images. Constructed using the fabric-react List component.
          By default, the ImageGrid control attempts to select and place images to justify each row while maintaining the image's native aspect ratio.
        </div>
        <h2 className='ms-font-xl'>Examples</h2>
        <ExampleCard title='Image Grid' code={ ImageGridExampleCode }>
          <ImageGridExample />
        </ExampleCard>
        <ExampleCard title='Fixed Image Grid' isOptIn={ true } code={ ImageGridFixedExampleCode }>
          <ImageGridFixedExample />
        </ExampleCard>
        <br /><br />
        <div>
          The IImageGridItem interface defines attributes necessary for items to be rendered by the ImageGrid.
          All IImageGridItem cell attributes are calculated and controlled by the ImageGrid contol.
          The user only needs to provide the imageHeight and imageWidth properties.
        </div>
        <PropertiesTableSet componentName='ImageGrid' />
      </div>
    );
  }
}
