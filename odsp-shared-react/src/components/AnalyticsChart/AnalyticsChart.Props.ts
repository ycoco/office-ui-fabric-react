import Promise from '@ms/odsp-utilities/lib/async/Promise';

export interface IAnalyticsChartProps {
  /**
   * A promise of the Highcharts static instance
   */
  highchartsInstance: Promise<Highcharts.Static>;

  /**
   * A list of available ranges for the analytics chart.
   */
  ranges: IAnalyticsRange[];

  /**
   * A list of available data sources for the analytics chart
   */
  sources: IAnalyticsSource[];
}

export interface IAnalyticsChartState {
  series?: Highcharts.IndividualSeriesOptions
}

export interface IAnalyticsDataPoint {
  /**
   * Timestamp for the analytics data point (x-axis)
   */
  time: Date;

  /**
   * Value of the analytics data point (y-axis)
   */
  value: number;
}

/**
 * Describes a user-selectable analytics data source
 */
export interface IAnalyticsSource {
  /**
   * A promise for a series of analytics data points
   */
  dataPromise: Promise<IAnalyticsDataPoint[]>;

  /**
   * A key that uniquely identifies this data source
   */
  key: string;

  /**
   * Display name to show for this data source (i.e. Views, Unique Visitors)
   */
  label: string;

  /**
   * The sum total of all data points in the source
   */
  // TODO: This should really be a Promise
  total: number;
}

/**
 * Describes a user-selectable chart range
 */
export interface IAnalyticsRange {
  /**
   * Function that filters source data to a subset based on this Range
   */
  filterData?(sourceData: IAnalyticsDataPoint[]): IAnalyticsDataPoint[];

  /**
   * A key that unique identifies this chart range
   */
  key: string;

  /**
   * Display name to show for this chart range (i.e. Last week, Last month, All Data)
   */
  label: string;
}