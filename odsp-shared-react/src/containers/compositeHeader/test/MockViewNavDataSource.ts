import ISpPageContext from '@ms/odsp-datasources/lib/interfaces/ISpPageContext';
import Promise from '@ms/odsp-utilities/lib/async/Promise';
import { ViewNavDataSource } from '@ms/odsp-datasources/lib/ViewNav';
import { INavLinkGroup } from 'office-ui-fabric-react/lib/Nav';

export class MockViewNavDataSource extends ViewNavDataSource {

  constructor(hostSettings: ISpPageContext, pagesTitle?: string, providerName?: string) {
    super(hostSettings, pagesTitle, providerName);
  }

  public getMenuState(): Promise<INavLinkGroup[]> {
      return Promise.wrap([{
            links: [
                {
                    name: 'TopNavItem1',
                    url: 'http://example.com',
                    key: '0',
                    links: [{ name: 'Item1 child1', url: 'http://msn.com', key: '1' },
                        { name: 'Item2 child2', url: 'http://msn.com', key: '2' }],
                    isExpanded: true
                },
                {
                    name: 'TopNavItem2',
                    url: 'http://example.com',
                    key: '3'
                }
            ]}
      ]);
  }
}

export function createMockViewNavDataSource(): ViewNavDataSource {
  let mockViewNavDataSource = new MockViewNavDataSource(null);
  return mockViewNavDataSource;
}