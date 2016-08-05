import * as React from 'react';
import { SitePermissionsPanel } from './SitePermissionsPanel';
import { ISitePermissionsProps } from '../SitePermissions/SitePermissions.Props';

export interface ISitePermissionsPanelProps extends React.Props<SitePermissionsPanel> {
  /**
  * Event handler for when the panel is closed.
  */
  onDismiss?: () => void;

  showPanel?: boolean;

  sitePermissions?: ISitePermissionsProps[];

  title: string;
}
