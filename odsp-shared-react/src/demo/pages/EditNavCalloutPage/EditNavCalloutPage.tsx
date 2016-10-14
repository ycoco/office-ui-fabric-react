import * as React from 'react';
import { ExampleCard } from '../../index';
import { EditNavCalloutExample } from './examples/EditNavCallout.Example';
let EditNavCalloutExampleCode = require('./examples/EditNavCallout.Example.tsx');

export class EditNavCalloutPage extends React.Component<any, any> {

  public render() {
    return (
      <div className='EditNavCalloutExample'>
        <h1 className='ms-font-xxl'>EditNav Callout</h1>
        <div>EditNavCallout is used for add or edit a Nav link for user inputs new link data.</div>
        <h2 className='ms-font-xl'>Examples</h2>
        <ExampleCard title='EditNavCallout' code={ EditNavCalloutExampleCode }>
          <EditNavCalloutExample />
        </ExampleCard>
        <br /><br />
      </div>
    );
  }
}
