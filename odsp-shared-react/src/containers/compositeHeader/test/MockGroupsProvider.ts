import {
  IGroupsProvider,
  GroupsProvider,
  Group,
  SourceType,
  Membership,
  MembersList
} from '@ms/odsp-datasources/lib/Groups';
import { IPerson } from '@ms/odsp-datasources/lib/PeoplePicker';
import Promise from '@ms/odsp-utilities/lib/async/Promise';

export interface IMockGroupsProviderCreationInfo {
  group: MockGroup;
  currentUser: MockUser;
  syncGroupProperties(): any;
  doesCachedGroupPropertiesDiffer(): boolean;
  isUserInGroup(): any;
  addUserToGroupMembership(): any;
  removeUserFromGroupMembership(): any;
  removeUserFromGroupOwnership(): any;
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
  public totalNumberOfMembers;
  public totalNumberOfOwner;
  public isOwner;
  public source = SourceType.Cache;
  public membersList = new MockMembersList();

  constructor(totalNumberOfMembers?: number, totalNumberOfOwners?: number, isOwner = true) {
    super();
    this.totalNumberOfMembers = totalNumberOfMembers ? totalNumberOfMembers : 5;
    this.totalNumberOfOwners = totalNumberOfOwners ? totalNumberOfOwners : 2;
    this.isOwner = isOwner === false ? false : true;
  }

  public loadWithOptions(): Promise<void> {
    return Promise.wrap(undefined);
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
  groupsProvider.removeUserFromGroupOwnership = groupsProviderCreationInfo.removeUserFromGroupOwnership;

  return groupsProvider;
}
