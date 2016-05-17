
import CompositeHeader from '../../pages/CompositeHeaderPage/CompositeHeaderPage';
import HorizontalNav from '../../pages/HorizontalNavPage/HorizontalNavPage';
import ItemTile from '../../pages/ItemTilePage/ItemTilePage';
import SiteHeader from '../../pages/SiteHeaderPage/SiteHeaderPage';

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
      name: 'Basic components',
      links: [
        {
          name: 'SiteHeader',
          url: '#/siteHeader',
          component: SiteHeader
        },
        {
          name: 'HorizontalNav',
          url: '#/horizontalNav',
          component: HorizontalNav
        },
        {
          name: 'CompositeHeader',
          url: '#/compositeHeader',
          component: CompositeHeader
        },
        {
          name: 'ItemTile',
          url: '#/itemTile',
          component: ItemTile
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

export default AppState;
