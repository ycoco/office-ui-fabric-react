import * as React from 'react';
import { Chart, IChartProps } from '../../../../components/index';
import HighchartsInstance = require('@ms/odsp-highcharts');
import Promise from '@ms/odsp-utilities/lib/async/Promise';

export interface IChartExampleState {
}

export class ChartExample extends React.Component<React.Props<ChartExample>, IChartExampleState> {
  constructor() {
    super();
  }

  public render() {
    let chartProps: IChartProps = {
      highchartsInstance: Promise.wrap<Highcharts.Static>(HighchartsInstance),
      options: {
        chart: {
          type: 'bar'
        },
        title: {
          text: 'Fruit Consumption'
        },
        xAxis: {
          categories: ['Apples', 'Bananas', 'Oranges']
        },
        yAxis: {
          title: {
            text: 'Fruit eaten'
          }
        },
        series: [{
          name: 'Jane',
          data: [1, 0, 4]
        }, {
          name: 'John',
          data: [5, 7, 3]
        }]
      }
    }

    return (
      <Chart {...chartProps} />
    );
  }
}
