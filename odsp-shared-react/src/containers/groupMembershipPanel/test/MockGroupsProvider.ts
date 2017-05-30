import {
  IGroupsProvider,
  GroupsProvider,
  Group,
  SourceType,
  Membership,
  MembersList,
  IMembershipPager,
  IMembershipPage,
  IMembershipPagingOptions
} from '@ms/odsp-datasources/lib/Groups';
import {
  //IGroupSiteProvider,
  GroupSiteProvider,
  IGroupCreationContext
} from '@ms/odsp-datasources/lib/GroupSite';
import Promise from '@ms/odsp-utilities/lib/async/Promise';

export interface IMockGroupsProviderCreationInfo {
  group: MockGroup;
  addUsersToGroupStub(): any;
  mockMembershipPager?: MockMembershipPager;
}

export class MockMembersList extends MembersList {
  public source = SourceType.Cache;
  public members;

  constructor() {
    super();
    this.members = new Array();
    for (let i = 0; i < 5; i++) {
      this.members.push({
        userId: i.toString(),
        name: `User ${i}`,
        email: `user${i}@microsoft.com`
      });
    }
  }
}

export class MockMembership extends Membership {
  public source = SourceType.Cache;
  public membersList = new MockMembersList();
  public totalNumberOfMembers;
  public totalNumberOfOwner;
  public isOwner;

  constructor(totalNumberOfMembers?: number, totalNumberOfOwners?: number, isOwner = true) {
    super();
    this.totalNumberOfMembers = totalNumberOfMembers ? totalNumberOfMembers : 5;
    this.totalNumberOfOwners = totalNumberOfOwners ? totalNumberOfOwners : 2;
    this.isOwner = isOwner === false ? false : true;
  }

  public load() {
    return;
  }
}

export class MockGroup extends Group {
  public source = SourceType.Cache;
  public membership: Membership;
  public allowToAddGuests: boolean; // Whether guests permitted at group level
  constructor(membership?: Membership, allowToAddGuests?: boolean) {
    super();
    if (membership) {
      this.membership = membership;
    } else {
      this.membership = new MockMembership();
    }
    if (allowToAddGuests) {
      this.allowToAddGuests = allowToAddGuests;
    }
  }
}

export class MockMembershipPager implements IMembershipPager {
  public totalNumberOfMembers;
  public totalNumberOfOwners;
  public isOwner;
  public error: any = undefined;
  private _page: any = new Array();
  constructor(totalNumberOfMembers?: number, totalNumberOfOwners?: number, isOwner = true) {
    this.totalNumberOfMembers = totalNumberOfMembers ? totalNumberOfMembers : 5;
    this.totalNumberOfOwners = totalNumberOfOwners ? totalNumberOfOwners : 2;
    this.isOwner = isOwner === false ? false : true;
    for (let i = 0; i < 5; i++) {
      this._page.push({
        userId: i.toString(),
        name: `User ${i}`,
        email: `user${i}@microsoft.com`
      });
    }
  }

  public loadPage(membersToSkip?: number): Promise<IMembershipPage> {
    return Promise.wrap({page: this._page, getNextPagePromise: undefined} as IMembershipPage);
  }
}

export class MockGroupsProvider extends GroupsProvider {
  public currentUser = { userId: '0', name: 'User current', email: 'usercurrent@microsoft.com'};
  private _membershipPager: MockMembershipPager;

  constructor(group: MockGroup, membershipPager?: MockMembershipPager) {
    super({});
    this.group = group;
    this._membershipPager = membershipPager ? membershipPager : new MockMembershipPager();
  }

  public getMembershipPager(membershipPagingOptions?: IMembershipPagingOptions): IMembershipPager {
    return this._membershipPager;
  }
}

export class MockGroupSiteProvider extends GroupSiteProvider {
  private _allowToAddGuests: boolean; // Whether guests permitted at tenant level

  constructor(allowToAddGuests?: boolean) {
    super({});
    this._allowToAddGuests = allowToAddGuests ? true : false;
  }

  public getGroupCreationContext(): Promise<IGroupCreationContext> {
    let context: IGroupCreationContext = {
      requireSecondaryContact: false,
      usageGuidelineUrl: '',
      dataClassificationOptions: [],
      customFormUrl: '',
      allowToAddGuests: this._allowToAddGuests,
      sitePath: ''
    };
    return Promise.wrap(context);
  }
}

export function createMockGroupsProvider(creationInfo: IMockGroupsProviderCreationInfo): IGroupsProvider {
  let mockGroupsProvider = new MockGroupsProvider(creationInfo.group, creationInfo.mockMembershipPager);
  mockGroupsProvider.addUsersToGroup = creationInfo.addUsersToGroupStub;
  return mockGroupsProvider;
}

export function createMockGroupSiteProvider(allowToAddGuests?: boolean) {
  return new MockGroupSiteProvider(allowToAddGuests);
}
