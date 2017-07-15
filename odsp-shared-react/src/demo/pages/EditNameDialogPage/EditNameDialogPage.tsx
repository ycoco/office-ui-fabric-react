import * as React from 'react';
import { ExampleCard } from '../../index';
import { PropertiesTableSet } from '../../components/PropertiesTable/PropertiesTableSet';
import { EditNameDialogExample } from './examples/EditNameDialog.Simple.Example';

const EditNameDialogExampleCode = require('./examples/EditNameDialog.Simple.Example.tsx');

export class EditNameDialogPage extends React.Component<any, any> {

  public render() {
    return (
      <div>
        <h1 className='ms-font-xxl'>EditNameDialog</h1>
        <div>EditNameDialog component</div>
        <h2 className='ms-font-xl'>Examples</h2>
        <ExampleCard title='Simple Edit Name Dialog' code={ EditNameDialogExampleCode }>
          <EditNameDialogExample />
        </ExampleCard>
        <br /><br />
        <PropertiesTableSet componentName='EditNameDialog' />
      </div>
    );
  }
}
