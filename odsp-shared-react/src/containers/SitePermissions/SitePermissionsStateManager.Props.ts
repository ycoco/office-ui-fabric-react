// OneDrive:IgnoreCodeCoverage

import * as React from 'react';
import { ISitePermissionsProps } from '../../components/SitePermissions';
import ISpPageContext from '@ms/odsp-datasources/lib/interfaces/ISpPageContext';
import { IContextualMenuItem } from 'office-ui-fabric-react/lib/components/ContextualMenu/index';

/**
 * The state of the site permissions container control.
 */
export interface ISitePermissionsPanelContainerState {
    /**
     * Text for the title header of the site permissions panel.
     */
    title?: string;

    /**
     * Array of SitePermissions controls.
     */
    sitePermissions?: ISitePermissionsProps[];

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

/**
 * Holds the params of the manager that controls the state
 * of the SitePermissionsPanel.
 */
export interface ISitePermissionsPanelContainerStateManagerParams {
    /**
     * The SitePermissionsPanel object.
     */
    sitePermissionsPanel: React.Component<any, ISitePermissionsPanelContainerState>;

    /**
     * Contextual information for the current host.
     */
    pageContext: ISpPageContext;

    /**
     * Text for the title header of the site permissions panel.
     */
    title: string;

    /**
     * Description of the site permissions panel.
     */
    panelDescription?: string;

    /**
     * The metadata about the site actonym.
     */
    acronymParam?: React.Component<any, IAcronymParam>;

    /**
     * Text for the title of the owners group permissions
     */
    fullControl?: string;

    /**
     * Text for the title of the members group permissions
     */
    edit?: string;

    /**
     * Text for the title of the visitor group permissions
     */
    read?: string;

    /**
     * Text for the title of the Add Members to your Group link
     */
    addMembersToGroup?: string;

    /**
     * Text for the title of the Share Site Only link
     */
    shareSiteOnly?: string;

    /**
     * Text for the title of the InvitePeople button
     */
    invitePeople?: string;
}

export interface IAcronymParam {
    /**
     * The site logo color.
     */
    siteLogoColor?: string;

    /**
     * The metadata about the site actonym containig the acronym
     * and the colors.
     */
    siteAcronym?: string;
}
