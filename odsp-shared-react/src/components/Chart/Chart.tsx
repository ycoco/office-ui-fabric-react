import * as React from 'react';
import { IChartProps, IChartState } from './Chart.Props';
import { Spinner } from 'office-ui-fabric-react/lib/Spinner';

/** Renders a chart using the Highcharts library. */
export class Chart extends React.Component<IChartProps, IChartState> {
  public refs: {
    [key: string]: React.ReactInstance,
    chartHost: HTMLElement
  };

  private _chart: Highcharts.ChartObject;
  private _highcharts: Highcharts.Static;

  constructor(props: IChartProps) {
    super(props);

    // set initial state
    this.state = {
      // show loading state until Highcharts is ready
      loadingSpinnerVisible: true
    };
  }

  public componentDidMount() {
    // Component mounted but Highcharts isn't ready yet, wait for Promise to be satisfied
    if (this.props.highchartsInstance) {
      this.props.highchartsInstance.then((value: Highcharts.Static) => {
        this._highcharts = value;

        // if component is already mounted before Promise completed, disable loading state and invalidate chart
        this.setState({
          loadingSpinnerVisible: false
        });
      });
    }
  }

  public componentDidUpdate(prevProps: IChartProps) {
    this._invalidateChart(this.props.options);
  }

  public componentWillUnmount() {
    if (this._chart) {
      this._chart.destroy();
      this._chart = undefined;
    }
  }

  public getChart() {
    return this._chart;
  }

  public render(): React.ReactElement<IChartProps> {
    return (
      <div>
        { this.state.loadingSpinnerVisible ? <Spinner /> : <div ref="chartHost" /> }
      </div>
    );
  }

  private _invalidateChart(options: Highcharts.Options) {
    if (!this._highcharts || !options || !this.refs.chartHost) {
      return;
    }

    if (this._chart) {
      this._chart.destroy();
    }

    this._chart = new this._highcharts.Chart({
      ...options,
      credits: {
        enabled: false // always hide credits footer
      },
      chart: {
        ...options.chart,
        renderTo: this.refs.chartHost
      }
    });
  }
}