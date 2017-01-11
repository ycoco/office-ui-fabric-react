import Promise from '@ms/odsp-utilities/lib/async/Promise';
import { GroupSiteProvider, IGroupSiteProviderParams, IGroupSiteProvider, IGroupCreationContext } from '@ms/odsp-datasources/lib/GroupSite';

export class MockGroupSiteProvider extends GroupSiteProvider {
  public usageGuideLineUrl: string;

  constructor(params: IGroupSiteProviderParams) {
    super(params);
  }

  public getGroupCreationContext(): Promise<IGroupCreationContext> {
    let groupCreationContext: IGroupCreationContext = {
      usageGuidelineUrl: this.usageGuideLineUrl,
      requireSecondaryContact: false,
      dataClassificationOptions: undefined,
      customFormUrl: undefined,
      allowToAddGuests: false,
      sitePath: undefined
    }
    return Promise.wrap(groupCreationContext);
  }
}

export function createGroupSiteProvider(usageGuideLineUrl: string): IGroupSiteProvider {
  let mockParms: IGroupSiteProviderParams = {
    pageContext: null,
    dataSource: null
  }
  let mockGroupSiteProvider = new MockGroupSiteProvider(mockParms);
  mockGroupSiteProvider.usageGuideLineUrl = usageGuideLineUrl;

  return mockGroupSiteProvider;
}
