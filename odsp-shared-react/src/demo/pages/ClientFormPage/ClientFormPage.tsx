// external packages
import * as React from 'react';

// local packages
import { ExampleCard } from '../../index';
import { ClientFormBasicExample } from './examples/ClientForm.Basic.Example';

let ClientFormBasicExampleCode = require('./examples/ClientForm.Basic.Example.tsx');

export class ClientFormPage extends React.Component<any, any> {
  public render() {
    return (
      <div className='ClientFormExample'>
        <h1 className='ms-font-xxl'>ReactClientForm</h1>
        <div>
          <span>Component used to edit a list item.</span>
        </div>

        <h2 className='ms-font-xl'>Examples</h2>
        <ExampleCard title='ClientForm' code={ ClientFormBasicExampleCode }>
          <ClientFormBasicExample />
        </ExampleCard>
      </div>
    );
  }
}
