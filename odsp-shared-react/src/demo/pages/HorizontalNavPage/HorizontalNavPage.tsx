import * as React from 'react';
import { ExampleCard } from '../../index';
import { PropertiesTableSet } from '../../components/PropertiesTable/PropertiesTableSet';
import { HorizontalNavExample } from './examples/HorizontalNav.Example';
import { HorizontalNavFixedoverflowExample } from './examples/HorizontalNav.Fixedoverflow.Example';
import { HorizontalNavEmptyExample } from './examples/HorizontalNav.Empty.Example';

const HorizontalLogoExampleCode = require('./examples/HorizontalNav.Example.tsx');
const HorizontalNavFixedoverflowExampleCode = require('./examples/HorizontalNav.Fixedoverflow.Example.tsx');
const HorizontalNavEmptyExampleCode = require('./examples/HorizontalNav.Empty.Example.tsx');

export class HorizontalNavPage extends React.Component<any, any> {

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
        <ExampleCard title='Horizontal Nav without any node' code={ HorizontalNavEmptyExampleCode }>
          <HorizontalNavEmptyExample />
        </ExampleCard>
        <br /><br />
        <PropertiesTableSet componentName='HorizontalNav' />
      </div>
    );
  }
}
