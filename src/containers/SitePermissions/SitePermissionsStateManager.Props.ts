// OneDrive:IgnoreCodeCoverage

import * as React from 'react';
import { ISitePermissionsProps } from '../../components/SitePermissions';
import ISpPageContext from '@ms/odsp-datasources/lib/interfaces/ISpPageContext';

/**
 * The state of the site permissions container control.
 */
export interface ISitePermissionsPanelContainerState {
    /**
     * Text for the title header of the site permissions panel.
     */
    title: string;

    /**
     * Array of SitePermissions controls.
     */
    sitePermissions?: ISitePermissionsProps[];
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
