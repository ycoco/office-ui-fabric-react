import { CompositeHeaderPage } from '../../pages/CompositeHeaderPage/CompositeHeaderPage';
import { GridListPage } from '../../pages/GridListPage/GridListPage';
import { HorizontalNavPage } from '../../pages/HorizontalNavPage/HorizontalNavPage';
import { ItemTilePage } from '../../pages/ItemTilePage/ItemTilePage';
import { CardListPage } from '../../pages/CardListPage/CardListPage';
import { CheckCirclePage } from '../../pages/CheckCirclePage/CheckCirclePage';
import { SamplePage } from '../../pages/SamplePage/SamplePage';
import { SiteHeaderPage } from '../../pages/SiteHeaderPage/SiteHeaderPage';

export enum ExampleStatus {
  placeholder,
  started,
  beta,
  release
}

export interface ILink {
  name: string;
  url: string;
  component?: any;
  status?: ExampleStatus;
}

export interface ILinkGroup {
  links: ILink[];
  name: string;
}

export interface IAppState {
  appTitle: string;
  examplePages: ILinkGroup[];
  headerLinks: ILink[];
}

export const AppState: IAppState = {
  appTitle: 'ODSP Shared React Controls',

  examplePages: [
    {
      name: 'Basic Controls',
      links: [
        {
          name: 'Sample',
          url: '#/sample',
          component: SamplePage
        },
        {
          name: 'SiteHeader',
          url: '#/siteHeader',
          component: SiteHeaderPage
        },
        {
          name: 'HorizontalNav',
          url: '#/horizontalNav',
          component: HorizontalNavPage
        },
        {
          name: 'CompositeHeader',
          url: '#/compositeHeader',
          component: CompositeHeaderPage
        },
        {
          name: 'ItemTile',
          url: '#/itemTile',
          component: ItemTilePage
        },
        {
          name: 'GridList',
          url: '#/gridList',
          component: GridListPage
        },
        {
          name: 'CardList',
          url: '#/CardList',
          component: CardListPage
        }
      ]
    },
    {
      name: 'Subcomponents',
      links: [
        {
          name: 'CheckCircle',
          url: '#/CheckCircle',
          component: CheckCirclePage
        }
      ]
    }
  ],

  headerLinks: [
    {
      name: 'Getting started',
      url: '#/'
    }
  ]

};
