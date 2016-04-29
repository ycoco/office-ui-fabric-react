import * as React from 'react';
import { ExampleCard } from '../../index';
import { PropertiesTableSet } from '../../components/PropertiesTable/PropertiesTableSet';
import CompositeHeaderExample from './examples/CompositeHeader.Example';
let CompositeHeaderExampleCode = require('./examples/CompositeHeader.Example.tsx');

export default class CompositeHeaderPage extends React.Component<any, any> {

  public render() {
    return (
      <div className='CompositeHeaderExample'>
        <h1 className='ms-font-xxl'>Composite Header</h1>
        <div>Control that composites the site header and horizontal nav control.</div>
        <h2 className='ms-font-xl'>Examples</h2>
        <ExampleCard title='Composite Header' code={ CompositeHeaderExampleCode }>
          <CompositeHeaderExample />
        </ExampleCard>

        <br /><br />
        <PropertiesTableSet componentName='CompositeHeader' />
      </div>
    );
  }
}
