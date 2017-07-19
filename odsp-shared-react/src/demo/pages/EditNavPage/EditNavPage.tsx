import * as React from 'react';
import { ExampleCard } from '../../index';
import { PropertiesTableSet } from '../../components/PropertiesTable/PropertiesTableSet';
import { EditNavExample } from './examples/EditNav.Example';
import { EditNavEmptyExample } from './examples/EditNavEmpty.Example';
import './EditNavPage.scss';

let EditNavExampleCode = require('./examples/EditNav.Example.tsx');
let EditNavEmptyExampleCode = require('./examples/EditNavEmpty.Example.tsx');

export class EditNavPage extends React.Component<any, any> {

  public render() {
    return (
      <div className='EditNavExample'>
        <h1 className='ms-font-xxl'>Edit Nav</h1>
        <div>Edit mode of Navigation nodes.</div>
        <h2 className='ms-font-xl'>Examples</h2>
        <ExampleCard title='Edit Nav' code={ EditNavExampleCode } >
          <EditNavExample />
        </ExampleCard>
        <ExampleCard title='Edit Empty Nav' code={ EditNavEmptyExampleCode } >
          <EditNavEmptyExample />
        </ExampleCard>
        <br /><br />
        <PropertiesTableSet componentName='EditNav' />
      </div>
    );
  }
}
