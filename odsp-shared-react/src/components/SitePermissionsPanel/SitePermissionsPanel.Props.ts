import * as React from 'react';
import { SitePermissionsPanel } from './SitePermissionsPanel';
import { ISitePermissionsProps, ISitePermissionsContextualMenuItem, IPermissionPerson } from '../SitePermissions/SitePermissions.Props';
import { IContextualMenuItem } from 'office-ui-fabric-react/lib/components/ContextualMenu/index';
import { ISpPageContext } from '@ms/odsp-datasources/lib/interfaces/ISpPageContext';
import { PermissionLevel } from '../../containers/SitePermissions/SitePermissionsStateManager';
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
   * Boolean for ShareSiteOnly link.
   */
  showShareSiteOnly?: boolean;

  /**
   * Boolean for showSavingSpinner link.
   */
  showSavingSpinner?: boolean;

  /**
   * Text for the title of the InvitePeople button.
   */
  invitePeople?: string;

  /**
   * Contextual information for the current host.
   */
  pageContext?: ISpPageContext;

  /**
   * Event handler for when Save button is clicked.
   */
  onSave?: (users: IPermissionPerson[]) => Promise<boolean>;

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

  sitePermissionsContextualMenuItems?: ISitePermissionsContextualMenuItem[];

  permissionStrings?: { [key: number]: string }

  /**
   * Text to inform user that sharing the site will not
   * automatically provide recipients with access to other group resources.
   */
  shareSiteOnlyVerboseText?: string;

  /**
   * Text for link to the Group Membership panel in site permissions ppl picker view.
   */
  shareSiteOnlyAddMembersLinkText?: string;

  /**
   *  The callback for the navigation to outlook.
   */
  goToOutlookOnClick?: () => void;

  /**
   * Text for the the title header of the site permissions panel share site view.
   */
  shareSiteTitle?: string;

  /**
   * Specify the default permission while adding new user, if the user or group already has a permissionLevel, then this default won't be applied.
   */
  addMemberDefaultPermissionLevel?: PermissionLevel;
}

export interface IAddContextMenuState {
  isInvitePeopleContextualMenuVisible: boolean;
}
