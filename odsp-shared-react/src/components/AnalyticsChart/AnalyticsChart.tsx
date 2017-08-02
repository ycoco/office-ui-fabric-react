import './AnalyticsChart.scss';
import * as React from 'react';
import { Chart, IChartProps } from '../Chart/index';
import {
  IAnalyticsChartProps,
  IAnalyticsChartState,
  IAnalyticsDataPoint,
  IAnalyticsSource,
  IAnalyticsRange
} from './AnalyticsChart.Props';
import { autobind } from 'office-ui-fabric-react/lib/Utilities';
import Async from '@ms/odsp-utilities/lib/async/Async';
import {
  Pivot,
  PivotItem,
  PivotLinkFormat,
  IPivotItemProps
} from 'office-ui-fabric-react/lib/Pivot';
import { Spinner } from 'office-ui-fabric-react/lib/Spinner';

/**
 * Renders an interactive chart that displays usage analytics.
 */
export class AnalyticsChart extends React.PureComponent<IAnalyticsChartProps, IAnalyticsChartState> {
  private _async: Async;
  private _selectedSource: IAnalyticsSource;
  private _selectedRange: IAnalyticsRange;

  public refs: {
    [key: string]: React.ReactInstance,
    chart: Chart;
  };

  constructor(props: IAnalyticsChartProps) {
    super(props);

    this._selectedSource = this.props && this.props.sources && this.props.sources[0];
    this._selectedRange = this.props && this.props.ranges && this.props.ranges[0];

    this.state = {
      series: undefined
    };
  }

  public componentDidMount() {
    if (!this.props) {
      return;
    }

    this._async = new Async()

    this._invalidateChartSeries();
  }

  public componentWillUnmount() {
    if (this._async) {
      this._async.dispose();
      this._async = undefined;
    }
  }

  public render(): React.ReactElement<IAnalyticsChartProps> {
    if (!this.props || !this.props.sources || !this.props.ranges) {
      // bail out if component props are invalid
      return null;
    }

    const chartProps: IChartProps = this.state.series && {
      highchartsInstance: this.props.highchartsInstance,
      options: {
        chart: {
          backgroundColor: null,
          type: 'column'
        },
        legend: {
          enabled: false
        },
        series: [ this.state.series ],
        title: {
          text: null // hide the title
        }
      }
    };

    const sourcePivotItems = this.props.sources.map((source: IAnalyticsSource) => {
      const renderFunc = (item: IPivotItemProps, defaultRenderer: (link: IPivotItemProps) => JSX.Element): JSX.Element => {
        return (
          <div className='ms-AnalyticsChart-SourcesCell'>
            <div className='ms-font-xl ms-fontWeight-semibold'>{ source.total }</div>
            <div>{ source.label }</div>
          </div>
        );
      };

      return <PivotItem key={ source.key } itemKey={ source.key } onRenderItemLink={ renderFunc } />;
    });

    const rangePivotItems = this.props.ranges.map((range: IAnalyticsRange) =>
      <PivotItem key={ range.key } itemKey={ range.key } linkText={ range.label } />
    );

    return (
      <div className='ms-AnalyticsChart'>
        <div className='ms-AnalyticsChart-Sources'>
          <Pivot headersOnly={ true } linkFormat={ PivotLinkFormat.links } onLinkClick={ this._onSourceLinkClick }>{ sourcePivotItems }</Pivot>
        </div>
        { this.state.series ? <Chart ref="chart" { ...chartProps } /> : <Spinner /> }
        <div className='ms-AnalyticsChart-Ranges'>
          <Pivot headersOnly={ true } linkFormat={ PivotLinkFormat.links } onLinkClick={ this._onRangeLinkClick }>{ rangePivotItems }</Pivot>
        </div>
      </div>
    );
  }

  public shouldComponentUpdate(nextProps: IAnalyticsChartProps, nextState: IAnalyticsChartState) {
    // prop changes always cause a full render
    if (nextProps.highchartsInstance !== this.props.highchartsInstance ||
        nextProps.ranges !== this.props.ranges ||
        nextProps.sources !== this.props.sources) {
      return true;
    }

    // only render on initial population of series state, this allows the Chart series to be dynamically updated
    // instead of performing a full render on every change
    if (!this.state.series && nextState.series) {
      return true;
    }

    return false;
  }

  private _computeChartSeries(data: IAnalyticsDataPoint[]): Highcharts.IndividualSeriesOptions {
    // only one series at a time is supported for now
    let columnSeries = {
      data: this._computeSeriesData(data),
      name: this._selectedSource && this._selectedSource.label
    };

    return columnSeries;
  }

  private _computeSeriesData(data: IAnalyticsDataPoint[]): any[] {
    let seriesData = [];

    if (data) {
      const selectedRange = this._selectedRange;

      // apply the selected Range filter if it's set
      const analyticsData =
        selectedRange && selectedRange.filterData ?
        selectedRange.filterData(data) :
        data;

      seriesData = analyticsData.map((point: IAnalyticsDataPoint, index: number) => {
        return {
          name: point.time && point.time.toLocaleDateString(), // TODO: Is this the right Date format?
          x: index + 1,
          y: point.value
        };
      });
    }

    return seriesData;
  }

  private _invalidateChartSeries() {
    // clear active data until newly active Promise is resolved
    this.setState({
      series: undefined
    });

    if (this._selectedSource && this._selectedSource.dataPromise) {
      this._selectedSource.dataPromise.then((value: IAnalyticsDataPoint[]) => {
        const newSeries = this._computeChartSeries(value);

        if (this.state.series) {
          // if series already exists then try to perform a dynamic Chart update
          // otherwise the state change will cause a full render
          this._scheduleDynamicSeriesUpdate(this.state.series, newSeries);
        }

        this.setState({
          series: newSeries
        });
      }, (error: any) => {
        // TODO: Error getting data, show error state
      })
    }
  }

  @autobind
  private _onRangeLinkClick(newRangeItem: PivotItem) {
    const newRange =
      this.props && this.props.ranges && this.props.ranges.filter(
        (range: IAnalyticsRange) => range.key === newRangeItem.props.itemKey
      )[0];

    this._selectedRange = newRange;
    this._invalidateChartSeries();
  }

  @autobind
  private _onSourceLinkClick(newSourceItem: PivotItem) {
    const newSource =
      this.props && this.props.sources && this.props.sources.filter(
        (source: IAnalyticsSource) => source.key === newSourceItem.props.itemKey
      )[0];

    this._selectedSource = newSource;
    this._invalidateChartSeries();
  }

  /**
   * Tries to dynamically update the series of the Chart to allow it to animate properly and to minimize
   * rendering overhead. Falls back to a full update if the Chart hasn't been rendered before.
   */
  private _scheduleDynamicSeriesUpdate(oldSeries: Highcharts.IndividualSeriesOptions, newSeries: Highcharts.IndividualSeriesOptions) {
    if (oldSeries === newSeries) {
      // early return
      return;
    }

    if (this._async) {
      this._async.requestAnimationFrame(() => {
        const chart = this.refs && this.refs.chart && this.refs.chart.getChart();

        if (chart) {
          const chartSeries = chart.series[0];

          // if data length is inequal, clear the series first to force the initial
          // animation to play again
          if (chartSeries && chartSeries.data &&
              newSeries && newSeries.data &&
              chartSeries.data.length !== newSeries.data.length) {
            chartSeries.remove(false /*redraw*/);
            chart.addSeries(newSeries);
          } else {
            chartSeries.setData(newSeries.data as Highcharts.DataPoint[]);
          }
        } else {
          // minimal update failed, force a re-render
          this.forceUpdate();
        }
      });
    }
  }
}