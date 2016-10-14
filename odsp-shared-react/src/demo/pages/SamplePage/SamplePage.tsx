import * as React from 'react';
import { ExampleCard } from '../../index';
import { PropertiesTableSet } from '../../components/PropertiesTable/PropertiesTableSet';
import { SampleExample } from './examples/Sample.Example';

const SampleExampleCode = require('./examples/Sample.Example.tsx');

export class SamplePage extends React.Component<any, any> {

  public render() {
    return (
      <div className='SampleExample'>
        <h1 className='ms-font-xxl'>Sample</h1>
        <div>Sample component that renders text with an onClick event.</div>
        <h2 className='ms-font-xl'>Examples</h2>
        <ExampleCard title='Sample' code={ SampleExampleCode }>
          <SampleExample />
        </ExampleCard>
        <br /><br />
        <PropertiesTableSet componentName='Sample' />
      </div>
    );
  }
}
