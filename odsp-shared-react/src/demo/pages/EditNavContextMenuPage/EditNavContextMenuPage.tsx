import * as React from 'react';
import { ExampleCard } from '../../index';
import { EditNavContextMenuExample } from './examples/EditNavContextMenu.Example';
let EditNavContextMenuExampleCode = require('./examples/EditNavContextMenu.Example.tsx');

export class EditNavContextMenuPage extends React.Component<any, any> {

  public render() {
    return (
      <div className='EditNavContextMenuExample'>
        <h1 className='ms-font-xxl'>EditNavContextMenu</h1>
        <div>EditNavContextMenu is a component to edit nav links.</div>
        <h2 className='ms-font-xl'>Examples</h2>
        <ExampleCard title='EditNavContextMenu' code={ EditNavContextMenuExampleCode }>
          <EditNavContextMenuExample />
        </ExampleCard>
        <br /><br />
      </div>
    );
  }
}
