// OneDrive:IgnoreCodeCoverage

import * as React from 'react';
import { ISitePermissionsProps } from '../../components/SitePermissions';
import IContext from '@ms/odsp-datasources/lib/dataSources/base/IContext';

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
    context: IContext;

    /**
     * Text for the title header of the site permissions panel.
     */
    title: string;

    acronymParam?: React.Component<any, IAcronymParam>;
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
