
import { INavNode } from '@ms/odsp-datasources/lib/interfaces/ISpPageContext';

/**
 * 5 links, link 1 and link 4 are nested.
 */
export const nestedMockNavData = <INavNode[]>[
  {
    'Id': 2009,
    'Title': '1',
    'Url': 'http://www.sg',
    'IsDocLib': false,
    'IsExternal': false,
    'ParentId': 1002,
    'Children': [
      {
        'Id': 2010,
        'Title': 'nested 1',
        'Url': 'http://www.tv.com/shows/smurfs',
        'IsDocLib': false,
        'IsExternal': false,
        'ParentId': 2009,
        'Children': []
      }
    ]
  },
  {
    'Id': 2006,
    'Title': '2',
    'Url': 'http://www.facebook.com/SmurfHappens',
    'IsDocLib': false,
    'IsExternal': false,
    'ParentId': 1002,
    'Children': []
  },
  {
    'Id': 2008,
    'Title': '3',
    'Url': 'http://www.bing.com',
    'IsDocLib': false,
    'IsExternal': false,
    'ParentId': 1002,
    'Children': []
  },
  {
    'Id': 2007,
    'Title': '4',
    'Url': 'http://www.smurf.com',
    'IsDocLib': false,
    'IsExternal': false,
    'ParentId': 1002,
    'Children':
    [
      {
        'Id': 2012,
        'Title': 'nested 2',
        'Url': 'https://en.wikipedia.org/wiki/The_Smurfs',
        'IsDocLib': false,
        'IsExternal': false,
        'ParentId': 2007,
        'Children': []
      }
    ]
  },
  {
    'Id': 2011,
    'Title': '5',
    'Url': '/teams/CliffTest/NoNav/',
    'IsDocLib': false,
    'IsExternal': false,
    'ParentId': 1002,
    'Children': []
  }
];
