import ISpPageContext from '@ms/odsp-datasources/lib/interfaces/ISpPageContext';
import Promise from '@ms/odsp-utilities/lib/async/Promise';
import { EditNavDataSource } from '@ms/odsp-datasources/lib/EditNav';
import { INavLinkGroup } from 'office-ui-fabric-react/lib/Nav';

export class MockEditNavDataSource extends EditNavDataSource {

  constructor(hostSettings: ISpPageContext, pagesTitle?: string, providerName?: string) {
    super(hostSettings, pagesTitle, providerName);
  }

  public geMenuState(): Promise<INavLinkGroup[]> {
      return Promise.wrap([{
            links: [
                {
                    name: 'TopNavItem1',
                    url: 'http://example.com',
                    position: 0,
                    links: [{ name: 'Item1 child1', url: 'http://msn.com', position: 1 },
                        { name: 'Item2 child2', url: 'http://msn.com', position: 2 }],
                    isExpanded: true
                },
                {
                    name: 'TopNavItem2',
                    url: 'http://example.com',
                    position: 3
                }
            ]}
      ]);
  }
}

export function createMockEditNavDataSource(): EditNavDataSource {
  let mockEditNavDataSource = new MockEditNavDataSource(null);
  return mockEditNavDataSource;
}