import * as React from 'react';
import { ExampleCard } from '../../index';
import { AnalyticsChartExample } from './examples/AnalyticsChart.Example';
let AnalyticsChartExampleCode = require('./examples/AnalyticsChart.Example.tsx');

export class AnalyticsChartPage extends React.Component<any, any> {
  public render() {
    return (
      <div className='ChartExample'>
        <h1 className='ms-font-xxl'>Analytics Chart</h1>
        <div>Renders an interactive chart that displays usage analytics.</div>
        <h2 className='ms-font-xl'>Examples</h2>
        <ExampleCard title='Analytics Chart' code={ AnalyticsChartExampleCode }>
          <AnalyticsChartExample />
        </ExampleCard>
        <br /><br />
      </div>
    );
  }
}
