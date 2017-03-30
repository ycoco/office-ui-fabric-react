import * as React from 'react';
import { ExampleCard } from '../../index';
import { PolicyTipExample } from './examples/PolicyTip.Example';
import { PropertiesTableSet } from '../../components/PropertiesTable/PropertiesTableSet';

const PolicyTipExampleCode = require('./examples/PolicyTip.Example.tsx');

export class PolicyTipPage extends React.Component<any, any> {
  public render() {
    return (
      <div className='PolicyTipExample'>
        <h2 className='ms-font-xxl'>PolicyTip</h2>
        <span>
            Component to display and handle policy tips on SharePoint items.
        </span>

        <h3 className='ms-font-xl'>Example</h3>
        <ExampleCard title='PolicyTip' code={PolicyTipExampleCode}>
          <div className='example-Container'>
            <PolicyTipExample />
          </div>
        </ExampleCard>

        <PropertiesTableSet componentName='PolicyTip' />
      </div>
    );
  }
}
