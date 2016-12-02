import {
  IGroupsProvider,
  GroupsProvider,
  Group,
  SourceType,
  Membership,
  MembersList
} from '@ms/odsp-datasources/lib/Groups';

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
  constructor(membership?: Membership) {
    super();
    if (membership) {
      this.membership = membership;
    } else {
      this.membership = new MockMembership();
    }
  }
}

export function createMockGroupsProvider(group: MockGroup): IGroupsProvider {
  const groupsProvider = new GroupsProvider({});
  groupsProvider.group = group;
  return groupsProvider;
}