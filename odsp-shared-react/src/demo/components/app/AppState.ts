import { CompositeHeaderPage } from '../../pages/CompositeHeaderPage/CompositeHeaderPage';
import { GridListPage } from '../../pages/GridListPage/GridListPage';
import { HorizontalNavPage } from '../../pages/HorizontalNavPage/HorizontalNavPage';
import { ItemTilePage } from '../../pages/ItemTilePage/ItemTilePage';
import { CardListPage } from '../../pages/CardListPage/CardListPage';
import { CheckCirclePage } from '../../pages/CheckCirclePage/CheckCirclePage';
import { SiteHeaderPage } from '../../pages/SiteHeaderPage/SiteHeaderPage';
import { GroupCardPage } from '../../pages/GroupCardPage/GroupCardPage';
import { CustomFormatterPage } from '../../pages/CustomFormatterPage/CustomFormatterPage';
import { MembersInfoPage } from '../../pages/MembersInfoPage/MembersInfoPage';
import { SiteLogoPage } from '../../pages/SiteLogoPage/SiteLogoPage';
import { SitePermissionsPage } from '../../pages/SitePermissionsPage/SitePermissionsPage';
import { ListCreationPanelPage } from '../../pages/ListCreationPanelPage/ListCreationPanelPage';
import { FolderPage } from '../../pages/FolderPage/FolderPage';
import { SiteSettingsPanelPage } from '../../pages/SiteSettingsPanelPage/SiteSettingsPanelPage';
import { EditNavPage } from '../../pages/EditNavPage/EditNavPage';
import { EditNavCalloutPage } from '../../pages/EditNavCalloutPage/EditNavCalloutPage';
import { EditNavContextMenuPage } from '../../pages/EditNavContextMenuPage/EditNavContextMenuPage';
import { EditNameDialogPage } from '../../pages/EditNameDialogPage/EditNameDialogPage';
import { PeoplePickerPage } from '../../pages/PeoplePickerPage/PeoplePickerPage';
import { ImagePreviewPage } from '../../pages/ImagePreviewPage/ImagePreviewPage';
import { PolicyTipPage } from '../../pages/PolicyTipPage/PolicyTipPage';
import { DesignPackageSelectorPage } from '../../pages/DesignPackageSelectorPage/DesignPackageSelectorPage';
import { ChangeTheLookPanelPage } from '../../pages/ChangeTheLookPanelPage/ChangeTheLookPanelPage';
import { FilterSelectPage } from '../../pages/FilterSelectPage/FilterSelectPage';
import { ClientFormPage } from '../../pages/ClientFormPage/ClientFormPage';
import { FileHoverCardPage } from '../../pages/FileHoverCardPage/FileHoverCardPage';
import { ChartPage } from '../../pages/ChartPage/ChartPage';
import { AnalyticsChartPage } from '../../pages/AnalyticsChartPage/AnalyticsChartPage';
import { ItemActivityFeedPage } from '../../pages/ItemActivityFeedPage/ItemActivityFeedPage';

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
          name: 'EditNameDialog',
          url: '#/EditNameDialog',
          component: EditNameDialogPage
        },
        {
          name: 'SiteLogo',
          url: '#/SiteLogo',
          component: SiteLogoPage,
          status: ExampleStatus.generic
        },
        {
          name: 'ImagePreview',
          url: '#/ImagePreview',
          component: ImagePreviewPage,
          status: ExampleStatus.generic
        },
        {
          name: 'MembersInfo',
          url: '#/MembersInfo',
          component: MembersInfoPage
        },
        {
          name: 'ItemTile',
          url: '#/itemTile',
          component: ItemTilePage,
          status: ExampleStatus.generic
        },
        {
          name: 'PeoplePicker',
          url: '#/PeoplePicker',
          component: PeoplePickerPage,
          status: ExampleStatus.generic
        },
        {
          name: 'CustomFormatter',
          url: '#/CustomFormatter',
          component: CustomFormatterPage,
          status: ExampleStatus.generic
        },
        {
          name: 'PolicyTip',
          url: '#/PolicyTip',
          component: PolicyTipPage
        },
        {
          name: 'FilterSelect',
          url: '#/FilterSelect',
          component: FilterSelectPage
        },
        {
          name: 'Chart',
          url: '#/Chart',
          component: ChartPage
        },
        {
          name: 'ItemActivityFeed',
          url: '#/ItemActivityFeed',
          component: ItemActivityFeedPage
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
          name: 'SitePermissions',
          url: '#/SitePermissions',
          component: SitePermissionsPage
        },
        {
          name: 'CardList',
          url: '#/CardList',
          component: CardListPage
        },
        {
          name: 'ClientForm',
          url: '#/ClientForm',
          component: ClientFormPage
        }
      ]
    },
    {
      name: 'Analytics',
      links: [
        {
          name: 'FileHoverCard',
          url: '#/FileHoverCard',
          component: FileHoverCardPage
        },
        {
          name: 'AnalyticsChartPage',
          url: '#/AnalyticsChartPage',
          component: AnalyticsChartPage
        },
      ]
    },
    {
      name: 'Navigation',
      links: [
        {
          name: 'EditNav',
          url: '#/EditNav',
          component: EditNavPage,
          status: ExampleStatus.generic
        },
        {
          name: 'EditNavCallout',
          url: '#/EditNavCallout',
          component: EditNavCalloutPage
        },
        {
          name: 'EditNavContextMenu',
          url: '#/EditNavContextMenu',
          component: EditNavContextMenuPage
        }
      ]
    },
    {
      name: 'Glyphs',
      links: [
        {
          name: 'Folder',
          url: '#/Folder',
          component: FolderPage,
          status: ExampleStatus.generic
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
        },
        {
          name: 'DesignPackageSelectorPage',
          url: '#/DesignPackageSelectorPage',
          component: DesignPackageSelectorPage
        },
        {
          name: 'ChangeTheLookPanel',
          url: '#/ChangeTheLookPanel',
          component: ChangeTheLookPanelPage
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
