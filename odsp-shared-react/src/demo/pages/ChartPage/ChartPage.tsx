import * as React from 'react';
import { ExampleCard } from '../../index';
import { ChartExample } from './examples/Chart.Example';
let ChartExampleCode = require('./examples/Chart.Example.tsx');

export class ChartPage extends React.Component<any, any> {
  public render() {
    return (
      <div className='ChartExample'>
        <h1 className='ms-font-xxl'>Chart</h1>
        <div>Chart renders an interactive chart using the Highcharts library.</div>
        <h2 className='ms-font-xl'>Examples</h2>
        <ExampleCard title='Chart' code={ ChartExampleCode }>
          <ChartExample />
        </ExampleCard>
        <br /><br />
      </div>
    );
  }
}
