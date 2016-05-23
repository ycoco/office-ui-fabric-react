import * as React from 'react';
import { ExampleCard } from '../../index';
import RowCheckExample from './examples/RowCheck.Example';
let RowCheckExampleCode = require('./examples/RowCheck.Example.tsx');

export default class RowCheckPage extends React.Component<any, any> {

  public render() {
    return (
      <div className='RowCheckExample'>
        <h1 className='ms-font-xxl'>RowCheck</h1>
        <div>RowCheck is used for controlling selection for other componenets.</div>
        <h2 className='ms-font-xl'>Examples</h2>
        <ExampleCard title='RowCheck' code={ RowCheckExampleCode }>
          <RowCheckExample />
        </ExampleCard>
        <br /><br />
      </div>
    );
  }
}
