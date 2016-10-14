import * as React from 'react';
import { ExampleCard } from '../../index';
import { CheckCircleExample } from './examples/CheckCircle.Example';
let CheckCircleExampleCode = require('./examples/CheckCircle.Example.tsx');

export class CheckCirclePage extends React.Component<any, any> {

  public render() {
    return (
      <div className='CheckCircleExample'>
        <h1 className='ms-font-xxl'>Check Circle</h1>
        <div>CheckCircle is used for controlling selection for other componenets.</div>
        <h2 className='ms-font-xl'>Examples</h2>
        <ExampleCard title='CheckCircle' code={ CheckCircleExampleCode }>
          <CheckCircleExample />
        </ExampleCard>
        <br /><br />
      </div>
    );
  }
}
