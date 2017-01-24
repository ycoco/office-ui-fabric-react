import * as React from 'react';
import { SitePermissionsPanel } from './SitePermissionsPanel';
import { ISitePermissionsProps } from '../SitePermissions/SitePermissions.Props';
import { IContextualMenuItem } from 'office-ui-fabric-react/lib/components/ContextualMenu/index';
import { ISpPageContext } from '@ms/odsp-datasources/lib/interfaces/ISpPageContext';
import Promise from '@ms/odsp-utilities/lib/async/Promise';

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
   * Boolean for showSavingSpinner link
   */
  showSavingSpinner?: boolean;

  /**
   * Text for the title of the InvitePeople button
   */
  invitePeople?: string;

  /**
   * Contextual information for the current host.
   */
  pageContext?: ISpPageContext;

  /**
   * Event handler for when Save button is clicked.
   */
  onSave?: (userLoginNames: string[]) => Promise<boolean>;

  /**
   * Event handler for when Close button is clicked.
   */
  onCancel?: () => void;

  /**
   *Title text for the 'Add' button.
   */
  saveButton?: string;

  /**
   * Title text for the 'Cancel' button.
  * */
  cancelButton?: string;

  /**
   * Description for the Share Site Only site permissions link.
   */
  shareSiteOnlyDescription?: string;

  /**
   * Helper text for the site permissions people picker.
   */
  addUserOrGroupText?: string;

  /**
   * Text for Advanced Permissions Settings site permissions link.
   */
  advancedPermSettings?: string;

  /**
   * URL for Advanced Permissions Settings site permissions link.
   */
  advancedPermSettingsUrl?: string;

  /**
   * URL to Members in OWA for a group.
   */
  membersUrl?: string;

  /**
   * Text for the outlook groups link.
   */
  goToOutlookLink?: string;

  /**
   * Helper text for the site permissions people picker.
   */
  goToOutlookText?: string;

  /**
   * Helper text for the site permissions panel.
   */
  manageSitePermissions?: string;

  /**
   * Title text for the 'Close' button.
   */
  closeButton?: string;
}

export interface IAddContextMenuState {
  isInvitePeopleContextualMenuVisible: boolean;
}