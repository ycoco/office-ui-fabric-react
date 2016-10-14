import * as React from 'react';

import { ExampleCard } from '../../index';
import { PropertiesTableSet } from '../../components/PropertiesTable/PropertiesTableSet';

import { FolderBasicExample } from './examples/Folder.Basic.Example';
let FolderBasicExampleCode = require('./examples/Folder.Basic.Example.tsx');

export class FolderPage extends React.Component<any, any> {
  public render() {
    return (
      <div className='FolderExample'>
        <h1 className='ms-font-xxl'>Folder</h1>
        <div>
          <span>Folder glyphs are used to render a representation of a folder.</span>
        </div>
        <h2 className='ms-font-xl'>Examples</h2>

        <ExampleCard title='Folder' code={ FolderBasicExampleCode }>
          <FolderBasicExample />
        </ExampleCard>

        <PropertiesTableSet componentName='Folder' />

      </div>
    );
  }
}
