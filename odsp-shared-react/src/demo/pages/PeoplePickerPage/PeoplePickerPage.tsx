import * as React from 'react';
import { ExampleCard } from '../../index';
import { PropertiesTableSet } from '../../components/PropertiesTable/PropertiesTableSet';
import { PeoplePickerExample } from './examples/PeoplePicker.Example';
import './PeoplePickerPage.scss';
let PeoplePickerExampleCode = require('./examples/PeoplePicker.Example.tsx');

export class PeoplePickerPage extends React.Component<any, any> {
  public render() {
    return (
      <div className='PeoplePickerExample'>
        <h2 className='ms-font-xxl'>PeoplePickerExample</h2>
        <div> Allows users to search and select people. </div>
        <h3 className='ms-font-xl'>Examples</h3>
        <ExampleCard title='PeoplePicker' code={PeoplePickerExampleCode}>
          <div className='example-Container'>
            <PeoplePickerExample />
          </div>
        </ExampleCard>
        <PropertiesTableSet componentName='PeoplePicker' />
      </div>
    );
  }
}
