import * as React from 'react';

import { ExampleCard } from '../../index';
import { PropertiesTableSet } from '../../components/PropertiesTable/PropertiesTableSet';

import { FilterSelectBasicExample } from './examples/FilterSelect.Basic.Example';
let FilterSelectBasicExampleCode = require('./examples/FilterSelect.Basic.Example.tsx');

export class FilterSelectPage extends React.Component<any, any> {
  public render() {
    return (
      <div className='FilterSelectExample'>
        <h1 className='ms-font-xxl'>Filter Select</h1>
        <div>
          <span>Component used to take inputs for list filtering.</span>
        </div>
        <h2 className='ms-font-xl'>Examples</h2>

        <ExampleCard title='FilterSelect' code={ FilterSelectBasicExampleCode }>
          <FilterSelectBasicExample />
        </ExampleCard>

        <PropertiesTableSet componentName='FilterSelect' />

      </div>
    );
  }
}
