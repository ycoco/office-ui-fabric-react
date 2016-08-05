import { CompositeHeaderPage } from '../../pages/CompositeHeaderPage/CompositeHeaderPage';
import { GridListPage } from '../../pages/GridListPage/GridListPage';
import { HorizontalNavPage } from '../../pages/HorizontalNavPage/HorizontalNavPage';
import { ItemTilePage } from '../../pages/ItemTilePage/ItemTilePage';
import { CardListPage } from '../../pages/CardListPage/CardListPage';
import { CheckCirclePage } from '../../pages/CheckCirclePage/CheckCirclePage';
import { SiteHeaderPage } from '../../pages/SiteHeaderPage/SiteHeaderPage';
import { GroupCardPage } from '../../pages/GroupCardPage/GroupCardPage';
import { MemberCountPage } from '../../pages/MemberCountPage/MemberCountPage';
import { SiteLogoPage } from '../../pages/SiteLogoPage/SiteLogoPage';
import { ListCreationPanelPage } from '../../pages/ListCreationPanelPage/ListCreationPanelPage';
import { FolderPage } from '../../pages/FolderPage/FolderPage';
import { SiteSettingsPanelPage } from '../../pages/SiteSettingsPanelPage/SiteSettingsPanelPage';

export enum ExampleStatus {
  generic
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
      name: 'Subcomponents',
      links: [
        {
          name: 'CheckCircle',
          url: '#/CheckCircle',
          component: CheckCirclePage,
          status: ExampleStatus.generic
        },
        {
          name: 'SiteLogo',
          url: '#/SiteLogo',
          component: SiteLogoPage,
          status: ExampleStatus.generic
        },
        {
          name: 'MemberCount',
          url: '#/MemberCount',
          component: MemberCountPage
        },
        {
          name: 'ItemTile',
          url: '#/itemTile',
          component: ItemTilePage,
          status: ExampleStatus.generic
        }
      ]
    },
    {
      name: 'Header',
      links: [
        {
          name: 'HorizontalNav',
          url: '#/horizontalNav',
          component: HorizontalNavPage,
          status: ExampleStatus.generic
        },
        {
          name: 'SiteHeader',
          url: '#/siteHeader',
          component: SiteHeaderPage
        },
        {
          name: 'GroupCard',
          url: '#/groupCard',
          component: GroupCardPage
        },
        {
          name: 'CompositeHeader',
          url: '#/compositeHeader',
          component: CompositeHeaderPage
        }
      ]
    },
    {
      name: 'List controls',
      links: [
        {
          name: 'GridList',
          url: '#/gridList',
          component: GridListPage,
          status: ExampleStatus.generic
        },
        {
          name: 'CardList',
          url: '#/CardList',
          component: CardListPage
        }
      ]
    },
    {
      name: 'Glyphs',
      links: [
        {
          name: 'Folder',
          url: '#/Folder',
          component: FolderPage
        }
      ]
    },
    {
      name: 'Panels',
      links: [
        {
          name: 'SiteSettingsPanel',
          url: '#/SiteSettingsPanel',
          component: SiteSettingsPanelPage
        },
        {
          name: 'ListCreationPanel',
          url: '#/listCreationPanel',
          component: ListCreationPanelPage
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
