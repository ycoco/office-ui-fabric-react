import * as React from 'react';
import ISpPageContext from '@ms/odsp-datasources/lib/interfaces/ISpPageContext';
import Promise from '@ms/odsp-utilities/lib/async/Promise';
import { IGroupsProvider } from '@ms/odsp-datasources/lib/Groups';
import { IGroupMemberPersona } from '../../components/GroupMembershipPanel/GroupMembershipPanel.Props';

/**
 * The state of the group membership container control.
 */
export interface IGroupMembershipPanelContainerState {
    /**
     * Text for the title header of the group membership panel.
     */
    title: string;
    /**
     * List of group members to display
     */
    personas?: IGroupMemberPersona[];
}

/**
 * Holds the params of the manager that controls the state
 * of the GroupMembershipPanel.
 */
export interface IGroupMembershipPanelContainerStateManagerParams {
    /**
     * The GroupMembershipPanel object.
     */
    groupMembershipPanel: React.Component<any, IGroupMembershipPanelContainerState>;

    /**
     * Contextual information for the current host.
     */
    pageContext: ISpPageContext;

    /**
     * Text for the title header of the group membership panel.
     */
    title: string;

    /** 
     * Requests a groups provider. 
     */
    getGroupsProvider: () => Promise<IGroupsProvider>;

    acronymParam?: React.Component<any, IAcronymParam>;
}

export interface IAcronymParam {
    /**
     * The site logo color.
     */
    siteLogoColor?: string;

    /**
     * The metadata about the site acronym containig the acronym
     * and the colors.
     */
    siteAcronym?: string;
}
