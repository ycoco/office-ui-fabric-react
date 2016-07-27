import * as React from 'react';
import { ExampleCard } from '../../index';
import { PropertiesTableSet } from '../../components/PropertiesTable/PropertiesTableSet';
import { MemberCountExample } from './examples/MemberCount.Simple.Example';

const MemberCountExampleCode = require('./examples/MemberCount.Simple.Example.tsx');

export class MemberCountPage extends React.Component<any, any> {

  public render() {
    return (
      <div>
        <h1 className='ms-font-xxl'>MemberCount</h1>
        <div>MemberCount sub-component </div>
        <h2 className='ms-font-xl'>Examples</h2>
        <ExampleCard title='Simple Member Count' code={ MemberCountExampleCode }>
          <MemberCountExample />
        </ExampleCard>
        <br /><br />
        <PropertiesTableSet componentName='MemberCount' />
      </div>
    );
  }
}
