import {
  IGroupsProvider,
  GroupsProvider,
  Group,
  SourceType,
  Membership,
  MembersList
} from '@ms/odsp-datasources/lib/Groups';
import { IPerson } from '@ms/odsp-datasources/lib/PeoplePicker';

export interface IMockGroupsProviderCreationInfo {
  group: MockGroup;
  currentUser: MockUser;
  syncGroupProperties(): any;
  doesCachedGroupPropertiesDiffer(): boolean;
  isUserInGroup(): any;
  addUserToGroupMembership(): any;
  removeUserFromGroupMembership(): any;
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
  public totalNumberOfMembers = 5;
  public membersList = new MockMembersList();
  public load() {
    return;
  }
}

export class MockGroup extends Group {
  public source = SourceType.Cache;
  public membership: Membership;
  public id = 'g1';
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

export class MockUser implements IPerson {
  public userId = '1';
  public name = 'User 1';
  public email = 'user1@microsoft';
}

export function createMockGroupsProvider(groupsProviderCreationInfo: IMockGroupsProviderCreationInfo): IGroupsProvider {
  const groupsProvider = new GroupsProvider({});

  groupsProvider.group = groupsProviderCreationInfo.group;
  groupsProvider.currentUser = groupsProviderCreationInfo.currentUser;
  groupsProvider.doesCachedGroupPropertiesDiffer = groupsProviderCreationInfo.doesCachedGroupPropertiesDiffer;
  groupsProvider.syncGroupProperties = groupsProviderCreationInfo.syncGroupProperties;
  groupsProvider.isUserInGroup = groupsProviderCreationInfo.isUserInGroup;
  groupsProvider.addUserToGroupMembership = groupsProviderCreationInfo.addUserToGroupMembership;
  groupsProvider.removeUserFromGroupMembership = groupsProviderCreationInfo.removeUserFromGroupMembership;

  return groupsProvider;
}
