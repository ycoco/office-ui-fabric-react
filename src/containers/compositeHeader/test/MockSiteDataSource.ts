import ISpPageContext from '@ms/odsp-datasources/lib/interfaces/ISpPageContext';
import Promise from '@ms/odsp-utilities/lib/async/Promise';
import { SiteDataSource, StatusBarInfo } from '@ms/odsp-datasources/lib/Site';

export class MockSiteDataSource extends SiteDataSource {
  public _isSiteReadOnly: boolean;
  public _hasMessageBar: boolean;

  constructor(hostSettings: ISpPageContext) {
    super(hostSettings);
  }

  public getReadOnlyState(): Promise<boolean> {
    return Promise.wrap(this._isSiteReadOnly);
  }

  public getStatusBarInfo(): Promise<StatusBarInfo> {
    if (this._hasMessageBar) {
      return Promise.wrap({
        StatusBarText: 'This is a message',
        StatusBarLinkText: 'This is a link',
        StatusBarLinkTarget: 'https://www.bing.com/search?q=msft'
      });
    } else {
      return Promise.wrap({
        StatusBarText: undefined,
        StatusBarLinkText: undefined,
        StatusBarLinkTarget: undefined
      });
    }
  }
}

export function createMockSiteDataSource(isSiteReadOnly: boolean, hasMessageBar: boolean): SiteDataSource {
  let mockSiteDataSource = new MockSiteDataSource(null);
  mockSiteDataSource._isSiteReadOnly = isSiteReadOnly;
  mockSiteDataSource._hasMessageBar = hasMessageBar;

  return mockSiteDataSource;
}
