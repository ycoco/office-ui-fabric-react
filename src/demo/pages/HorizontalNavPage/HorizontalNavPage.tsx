import * as React from 'react';
import { ExampleCard, PropertiesTableSet } from '../../components/index';
import HorizontalNavExample from './examples/HorizontalNav.Example';
let HorizontalLogoExampleCode = require('./examples/HorizontalNav.Example.tsx');
import HorizontalNavFixedoverflowExample from './examples/HorizontalNav.Fixedoverflow.Example';
let HorizontalNavFixedoverflowExampleCode = require('./examples/HorizontalNav.Fixedoverflow.Example.tsx');

export default class HorizontalNavPage extends React.Component<any, any> {

  public render() {
    return (
      <div className='HorizontalNavExample'>
        <h1 className='ms-font-xxl'>Horizontal Nav</h1>
        <div>Horizontal Nav for SP sites, meant to contain the top navigation nodes.</div>
        <h2 className='ms-font-xl'>Examples</h2>
        <ExampleCard title='Horizontal Nav' code={ HorizontalLogoExampleCode }>
          <HorizontalNavExample />
        </ExampleCard>
        <ExampleCard title='Horizontal Nav with fixed overflow elements' code={ HorizontalNavFixedoverflowExampleCode }>
          <HorizontalNavFixedoverflowExample />
        </ExampleCard>
        <br /><br />
        <PropertiesTableSet componentName='HorizontalNav' />
        </div>
    );
  }
}
