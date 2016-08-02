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
  public load() {
    return;
  }
}

export class MockGroup extends Group {
  public source = SourceType.Cache;
  public membership: Membership;
  public inboxUrl = 'http://inboxUrl';
  public pictureUrl = 'https://placeimg.com/96/96/nature';
  public membersUrl = 'http://membersUrl';
  public isPublic = true;
  constructor(membership?: Membership) {
    super();
    if (membership) {
      this.membership = membership;
    } else {
      this.membership = new MockMembership();
    }
  }
}

export function createMockGroupsProvider(group: Group): IGroupsProvider {
  const groupsProvider = new GroupsProvider({});
  groupsProvider.group = group;
  return groupsProvider;
}
