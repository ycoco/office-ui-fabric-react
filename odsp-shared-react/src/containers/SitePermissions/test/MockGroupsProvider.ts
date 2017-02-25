import {
  IGroupsProvider,
  GroupsProvider,
  Group,
  SourceType,
  MembersList
} from '@ms/odsp-datasources/lib/Groups';
import { PersonaInitialsColor } from 'office-ui-fabric-react/lib/Persona';
import { ISitePermissionsContextualMenuItem } from '../../../components/SitePermissions/SitePermissions.Props';

export enum PermissionLevel {
  FullControl,
  Edit,
  Read
}

export class MockSitePermissions extends MembersList {
  public source = SourceType.Cache;
  public sitePermissionsProps;

  constructor() {
    super();

    this.sitePermissionsProps = new Array();

    this.sitePermissionsProps.push({
      key: '0',
      title: `Site Owners`,
      permLevelTitle: PermissionLevel.FullControl,
      personas: [
        {
          name: 'Bill Murray',
          imageUrl: '//www.fillmurray.com/200/200',
          menuItems: this._getSitePermissionsContextualMenuItems(PermissionLevel.FullControl)
        }
      ]
    });

    this.sitePermissionsProps.push({
      key: '1',
      title: `Site Members`,
      permLevelTitle: PermissionLevel.Edit,
      personas: [
        {
          name: 'Bill Murray',
          imageUrl: '//www.fillmurray.com/200/200',
          menuItems: this._getSitePermissionsContextualMenuItems(PermissionLevel.Edit)
        },
        {
          name: 'Douglas Field',
          imageInitials: 'DF',
          initialsColor: PersonaInitialsColor.green,
          menuItems: this._getSitePermissionsContextualMenuItems(PermissionLevel.Edit)
        },
        {
          name: 'Marcus Laue',
          imageInitials: 'ML',
          initialsColor: PersonaInitialsColor.purple,
          menuItems: this._getSitePermissionsContextualMenuItems(PermissionLevel.Edit)
        }
      ]
    });

    this.sitePermissionsProps.push({
      key: '2',
      title: `Site Visitors`,
      permLevelTitle: PermissionLevel.Read,
      personas: [
        {
          name: 'Bill Murray',
          imageUrl: '//www.fillmurray.com/200/200',
          menuItems: this._getSitePermissionsContextualMenuItems(PermissionLevel.Read)
        },
        {
          name: 'Douglas Field',
          imageInitials: 'DF',
          initialsColor: PersonaInitialsColor.green,
          menuItems: this._getSitePermissionsContextualMenuItems(PermissionLevel.Read)
        },
        {
          name: 'Marcus Laue',
          imageInitials: 'ML',
          initialsColor: PersonaInitialsColor.purple,
          menuItems: this._getSitePermissionsContextualMenuItems(PermissionLevel.Read)
        }
      ]
    });
  }

  private _getSitePermissionsContextualMenuItems(level: PermissionLevel): ISitePermissionsContextualMenuItem[] {

    switch (level) {
      case PermissionLevel.FullControl:
        return [
          { name: "Read", key: 'read' },
          { name: "Edit", key: 'edit' },
          { name: "Remove", key: 'remove' }
        ];
      case PermissionLevel.Edit:
        return [
          { name: "Read", key: 'read' },
          { name: "Full Control", key: 'full' },
          { name: "Remove", key: 'remove' }
        ];

      case PermissionLevel.Read:
        return [
          { name: "Full Control", key: 'full' },
          { name: "Edit", key: 'edit' },
          { name: "Remove", key: 'remove' }
        ];
    }
  }
}

export class MockGroup extends Group {
  public source = SourceType.Cache;
  constructor() {
    super();
  }
}

export function createMockGroupsProvider(group: MockGroup): IGroupsProvider {
  const groupsProvider = new GroupsProvider({});
  groupsProvider.group = group;
  groupsProvider.currentUser = { userId: '0', name: 'User current', email: 'usercurrent@microsoft.com' };
  return groupsProvider;
}