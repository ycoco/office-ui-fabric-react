import * as React from 'react';
import { ExampleCard } from '../../index';
import { SitePermissionsExample } from './examples/SitePermissions.Example';
let SitePermissionsExampleCode = require('./examples/SitePermissions.Example.tsx');

export class SitePermissionsPage extends React.Component<any, any> {

  public render() {
    return (
      <div className='SitePermissionsExample'>
        <h1 className='ms-font-xxl'>Site Permissions</h1>
        <div>Site Permissions.</div>
        <h2 className='ms-font-xl'>Examples</h2>
        <ExampleCard title='SitePermissions' code={ SitePermissionsExampleCode }>
          <SitePermissionsExample />
        </ExampleCard>
        <br /><br />
      </div>
    );
  }
}
