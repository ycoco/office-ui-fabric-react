import Promise from '@ms/odsp-utilities/lib/async/Promise';

export interface IChartProps {
  highchartsInstance: Promise<Highcharts.Static>;
  options: Highcharts.Options;
}

export interface IChartState {
  loadingSpinnerVisible?: boolean;
}