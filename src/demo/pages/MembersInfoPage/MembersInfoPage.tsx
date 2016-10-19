import * as React from 'react';
import { ExampleCard } from '../../index';
import { PropertiesTableSet } from '../../components/PropertiesTable/PropertiesTableSet';
import { MembersInfoExample } from './examples/MembersInfo.Simple.Example';

const MembersInfoExampleCode = require('./examples/MembersInfo.Simple.Example.tsx');

export class MembersInfoPage extends React.Component<any, any> {

  public render() {
    return (
      <div>
        <h1 className='ms-font-xxl'>MembersInfo</h1>
        <div>MembersInfo sub-component </div>
        <h2 className='ms-font-xl'>Examples</h2>
        <ExampleCard title='Simple Members Info' code={ MembersInfoExampleCode }>
          <MembersInfoExample />
        </ExampleCard>
        <br /><br />
        <PropertiesTableSet componentName='MembersInfo' />
      </div>
    );
  }
}
