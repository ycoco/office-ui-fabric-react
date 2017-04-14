import * as React from 'react';
import { ExampleCard } from '../../index';
import { PropertiesTableSet } from '../../components/PropertiesTable/PropertiesTableSet';
import { ChangeTheLookPanelExample } from './examples/ChangeTheLookPanel.Example';
let ChangeTheLookPanelExampleCode = require('./examples/ChangeTheLookPanel.Example.tsx');

export class ChangeTheLookPanelPage extends React.Component<any, any> {

  public render() {
    return (
      <div className='ListCreationPanelExample'>
        <h2 className='ms-font-xxl'>Change The Look Panel</h2>
        <div>Panel used to display and select themes</div>
        <h3 className='ms-font-xl'>Examples</h3>
        <ExampleCard title='List Creation Panel' code={ ChangeTheLookPanelExampleCode }>
          <ChangeTheLookPanelExample />
        </ExampleCard>
        <PropertiesTableSet componentName='ChangeTheLookPanel' />
      </div>
    );
  }
}
