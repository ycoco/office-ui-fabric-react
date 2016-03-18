import * as React from 'react';
import {
  Link
} from '@ms/office-ui-fabric-react';
import {
  ExampleCard,
  PropertiesTable
} from '../../components/index';
import SampleProps from './SampleProps';
import { SampleBasicExample } from './examples/Sample.Basic.Example';
let SampleBasicExampleCode = require('./examples/Sample.Basic.Example.tsx');

export default class SampleExample extends React.Component<any, any> {
  public render() {
    return (
      <div className='SampleExample'>
        <h1 className='ms-font-xxl'>Sample</h1>
        <div><Link target='_blank' text='Samples' url='http://dev.office.com/fabric/components/Sample' /> are used to represent a given path.</div>
        <h2 className='ms-font-xl'>Examples</h2>
        <ExampleCard title='Simple Sample' code={ SampleBasicExampleCode }>
          <SampleBasicExample />
        </ExampleCard>
        <PropertiesTable properties={ SampleProps } />
      </div>
    );
  }

}
