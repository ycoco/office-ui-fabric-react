// OneDrive:IgnoreCodeCoverage

import * as React from 'react';
import { ISitePermissionsProps } from '../../components/SitePermissions';
import ISpPageContext from '@ms/odsp-datasources/lib/interfaces/ISpPageContext';
import { IContextualMenuItem } from 'office-ui-fabric-react/lib/components/ContextualMenu/index';
import { IGroupsProvider } from '@ms/odsp-datasources/lib/Groups';
import { PermissionLevel } from './SitePermissionsStateManager'
import { IPerson } from '@ms/odsp-datasources/lib/PeoplePicker';

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
     * Boolean for showSavingSpinner link
     */
    showSavingSpinner?: boolean;

    /**
     * Text for the title of the InvitePeople button
     */
    invitePeople?: string;

    /**
     * Boolean that indicates that the Panel should be dimissed (this will be used when we are loading the Share Panel only)
     */
    shouldDismissPanel?: boolean;
}

/**
 * Holds the params of the manager that controls the state
 * of the SitePermissionsPanel.
 */
export interface ISitePermissionsPanelContainerStateManagerParams {
    /**
     * The SitePermissionsPanelContainer object.
     */
    sitePermissionsPanelContainer: React.Component<{}, ISitePermissionsPanelContainerState>;

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
     * Text for the full control option in the site permissions dropdown menu
     */
    fullControl?: string;

    /**
     * Text for the edit option in the site permissions dropdown menu
     */
    edit?: string;

    /**
     * Text for the read option in the site permissions dropdown menu
     */
    read?: string;

    /**
     * Text for the Owners group title
     */
    groupOwners?: string;

    /**
     * Text for the Members group title
     */
    groupMembers?: string;

    /**
     * Text for the remove spuser option in the site permissions dropdown menu
     */
    remove?: string;

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

    /**
     * Title text for the 'Add' button.
     */
    saveButton?: string;

    /**
     * Title text for the 'Cancel' button.
     */
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
     * Verbose text for Advanced Permissions Settings site permissions link.
     */
    verboseAdvancedPermSettings?: string;

    /**
     * URL for Advanced Permissions Settings site permissions link.
     */
    advancedPermSettingsUrl?: string;

    /**
     * URL to Members in OWA for a group.
     *  */
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
     *  The callback for the navigation to outlook.
     */
    goToOutlookOnClick?: () => void;

    /**
     * Title text for the 'Close' button.
     */
    closeButton?: string;

    /**
     * Text for the Site Owners(Full Control) permissions spgroup.
     */
    siteOwners?: string;

    /**
     * Text for the Site Members(Edit) permissions spgroup.
     */
    siteMembers?: string;

    /**
     * Text for the Site Visitors(Read) permissions spgroup.
     */
    siteVisitors?: string;

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
     * Office 365 Groups service provider.
     */
    groupsProvider?: IGroupsProvider;

    /**
     * Text for empty group.
     */
    emptyGroupText?: string;

    /**
     * Text for the the title header of the site permissions panel share site view.
     */
    shareSiteTitle?: string;

    /**
     * Specify the default permission while adding new user, if the user or group already has a permissionLevel, then this default won't be applied.
     */
    addMemberDefaultPermissionLevel?: PermissionLevel;

    /**
    * Site Preview Control
    */
    sitePreviewLoader?: JSX.Element;

    /**
    * Load up the Share Panel Only
    */
    shouldLoadSharePanelOnly?: boolean;

    /**
    * Boolean that indicates that the Panel should be dimissed (this will be used when we are loading the Share Panel only)
    */
    shouldDismissPanel?: boolean;

    /**
    * Call Back for sending email
    */
    onSendEmail?: (mailMessage: string, users: IPerson[]) => void;

    /**
     * Label for Send Email button
     */
     sendEmailText?: string;

    /**
     * Placeholder text for Message Textbox
     */
     messagePlaceHolderText?: string;

    /**
     * boolean to inidcate if email sharing is enabled
     */
     isEmailSharingEnabled?: boolean;

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
