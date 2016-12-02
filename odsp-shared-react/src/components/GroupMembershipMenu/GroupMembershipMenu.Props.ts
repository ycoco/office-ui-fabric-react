import * as React from 'react';
import { GroupMembershipMenu } from './GroupMembershipMenu';
import { IContextualMenuItem } from 'office-ui-fabric-react/lib/components/ContextualMenu/index';

export interface IGroupMembershipMenuProps extends React.Props<GroupMembershipMenu> {
  /**
   * Menu title
   */
  title: string;

  /**
   * List of menu items.
   */
  menuItems?: IContextualMenuItem[];
}