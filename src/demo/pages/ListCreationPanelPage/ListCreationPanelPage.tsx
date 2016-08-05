import * as React from 'react';
import { ExampleCard } from '../../index';
import { PropertiesTableSet } from '../../components/PropertiesTable/PropertiesTableSet';
import { ListCreationPanelExample } from './examples/ListCreationPanel.Example';
let ListCreationPanelExampleCode = require('./examples/ListCreationPanel.Example.tsx');

export class ListCreationPanelPage extends React.Component<any, any> {

  public render() {
    return (
      <div className='ListCreationPanelExample'>
        <h2 className='ms-font-xxl'>List Creation Panel</h2>
        <div>List Creation Panel control for SP sites, utilized while the user try to create a new list under Home page or Site Contents page.</div>
        <h3 className='ms-font-xl'>Examples</h3>
        <ExampleCard title='List Creation Panel' code={ ListCreationPanelExampleCode }>
          <ListCreationPanelExample />
        </ExampleCard>
        <PropertiesTableSet componentName='ListCreationPanel' />
      </div>
    );
  }
}
