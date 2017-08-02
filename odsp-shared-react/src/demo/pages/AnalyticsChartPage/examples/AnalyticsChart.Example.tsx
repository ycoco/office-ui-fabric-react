import * as React from 'react';
import { AnalyticsChart, IAnalyticsChartProps, IAnalyticsDataPoint } from '../../../../components/index';
import HighchartsInstance = require('@ms/odsp-highcharts');
import Promise from '@ms/odsp-utilities/lib/async/Promise';

export interface IAnalyticsChartExampleState {
}

interface IAnalyticsChartSampleData {
  uniqueVisitsData: IAnalyticsDataPoint[];
  totalUniqueVisits: number;

  pageViewsData: IAnalyticsDataPoint[];
  totalPageViews: number;

  visitsData: IAnalyticsDataPoint[];
  totalVisits: number;
}

function generateRandomSampleData(): IAnalyticsChartSampleData {
  const totalDays = 90;
  const maxVisitorsPerDay = 100;
  const maxPageViewsPerDay = 5000;
  const maxVisitsPerDay = 1000;

  let startDate = new Date();
  startDate.setDate(startDate.getDate() - totalDays);

  let uniqueVisitsData: IAnalyticsDataPoint[] = [];
  let pageViewsData: IAnalyticsDataPoint[] = [];
  let visitsData: IAnalyticsDataPoint[] = [];

  for (let day = 0; day < totalDays; day++) {
    let date = new Date(startDate);
    date.setDate(date.getDate() + day);

    let visitors = getRandomInteger(0, maxVisitorsPerDay);
    let pageViews = getRandomInteger(0, maxPageViewsPerDay);
    let siteVisits = getRandomInteger(0, maxVisitsPerDay);

    uniqueVisitsData.push({
      time: date,
      value: visitors
    });
    pageViewsData.push({
      time: date,
      value: pageViews
    });
    visitsData.push({
      time: date,
      value: siteVisits
    });
  }

  return {
    uniqueVisitsData: uniqueVisitsData,
    totalUniqueVisits: uniqueVisitsData.reduce<number>(sumAnalyticsData, 0),
    pageViewsData: pageViewsData,
    totalPageViews: pageViewsData.reduce<number>(sumAnalyticsData, 0),
    visitsData: visitsData,
    totalVisits: visitsData.reduce<number>(sumAnalyticsData, 0)
  };
}

function getRandomInteger(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function sumAnalyticsData(accumulator: number, dataPoint: IAnalyticsDataPoint): number {
  return accumulator + dataPoint.value;
}

function getDaysBetween(dateA: Date, dateB: Date): number {
  const deltaMilliseconds = Math.abs(dateA.getTime() - dateB.getTime());
  return deltaMilliseconds / (1000 * 60 * 60 * 24);
}

export class AnalyticsChartExample extends React.Component<React.Props<AnalyticsChartExample>, IAnalyticsChartExampleState> {
  private _sampleData: IAnalyticsChartSampleData;

  constructor() {
    super();

    this._sampleData = generateRandomSampleData();
  }

  public render() {
    const currentDate = new Date();

    const props: IAnalyticsChartProps = {
      highchartsInstance: Promise.wrap<Highcharts.Static>(HighchartsInstance),
      ranges: [
        {
          key: 'LastWeek',
          label: 'Last Week',
          filterData: (sourceData: IAnalyticsDataPoint[]) =>
            sourceData.filter((value: IAnalyticsDataPoint) =>
              getDaysBetween(currentDate, value.time) <= 7)
        },
        {
          key: 'LastMonth',
          label: 'Last 30 days',
          filterData: (sourceData: IAnalyticsDataPoint[]) =>
            sourceData.filter((value: IAnalyticsDataPoint) =>
              getDaysBetween(currentDate, value.time) <= 30)
        },
        {
          key: 'All',
          label: 'All Time'
        }
      ],
      sources: [
        {
          key: 'TotalViewers',
          label: 'Unique Viewers',
          total: this._sampleData.totalUniqueVisits,
          dataPromise: Promise.wrap<IAnalyticsDataPoint[]>(this._sampleData.uniqueVisitsData)
        },
        {
          key: 'TotalPageViews',
          label: 'Page Views',
          total: this._sampleData.totalPageViews,
          dataPromise: Promise.wrap<IAnalyticsDataPoint[]>(this._sampleData.pageViewsData)
        },
        {
          key: 'TotalSiteVisits',
          label: 'Site Visits',
          total: this._sampleData.totalVisits,
          dataPromise: Promise.wrap<IAnalyticsDataPoint[]>(this._sampleData.visitsData)
        }
      ]
    };

    return (
      <AnalyticsChart {...props} />
    );
  }
}