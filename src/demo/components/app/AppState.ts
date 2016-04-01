import SamplePage from '../../pages/SamplePage/SamplePage';
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
          name: 'Sample',
          url: '#/sample',
          component: SamplePage
        },
        {
          name: 'SiteHeader',
          url: '#/siteHeader',
          component: SiteHeader
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
