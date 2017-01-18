import * as React from 'react';
import { ExampleCard } from '../../index';
import { PropertiesTableSet } from '../../components/PropertiesTable/PropertiesTableSet';
import { ImagePreviewExample } from './examples/ImagePreview.Example';

const ImagePreviewExampleCode = require('./examples/ImagePreview.Example.tsx');

export class ImagePreviewPage extends React.Component<any, any> {
  public render() {
    return (
      <div className='ImagePreviewExample'>
        <h1 className='ms-font-xxl'>ImagePreview example</h1>
        <div>Used to display previews of selected images.</div>
        <h2 className='ms-font-xl'>Examples</h2>
        <ExampleCard title='ImagePreview' code={ ImagePreviewExampleCode }>
          <ImagePreviewExample />
        </ExampleCard>
        <br /><br />

        <PropertiesTableSet componentName='ImagePreview' />
      </div>
    );
  }
}
