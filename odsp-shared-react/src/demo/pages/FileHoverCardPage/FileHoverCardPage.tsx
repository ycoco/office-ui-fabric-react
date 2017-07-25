import * as React from 'react';
import { ExampleCard } from '../../index';
import { FileHoverCardExample } from './examples/FileHoverCard.Example';
let FileHoverCardExampleCode = require('./examples/FileHoverCard.Example.tsx');

export class FileHoverCardPage extends React.Component<any, any> {
  public render() {
    return (
      <div className='FileHoverCardExample'>
        <h1 className='ms-font-xxl'>File Hover Card</h1>
        <div>Description</div>
        <h2 className='ms-font-xl'>Examples</h2>
        <ExampleCard title='FileHoverCard' code={ FileHoverCardExampleCode }>
          <FileHoverCardExample />
        </ExampleCard>
        <br /><br />
      </div>
    );
  }
}
