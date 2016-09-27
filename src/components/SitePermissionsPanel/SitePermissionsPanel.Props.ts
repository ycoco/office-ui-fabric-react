import * as React from 'react';
import { SitePermissionsPanel } from './SitePermissionsPanel';
import { ISitePermissionsProps } from '../SitePermissions/SitePermissions.Props';
import { IContextualMenuItem } from 'office-ui-fabric-react/lib/components/ContextualMenu/index';

export interface ISitePermissionsPanelProps extends React.Props<SitePermissionsPanel> {
  /**
  * Event handler for when the panel is closed.
  */
  onDismiss?: () => void;

  showPanel?: boolean;

  sitePermissions?: ISitePermissionsProps[];

  title: string;

  /**
   * List of menu items.
   */
  menuItems?: IContextualMenuItem[];

  /**
   * Description of the site permissions panel.
   */
  panelDescription?: string;

  /**
   * Boolean for ShareSiteOnly link
   */
  showShareSiteOnly?: boolean;

  /**
   * Text for the title of the InvitePeople button
   */
  invitePeople?: string;
}

export interface IAddContextMenuState {
  isInvitePeopleContextualMenuVisible: boolean;
}
