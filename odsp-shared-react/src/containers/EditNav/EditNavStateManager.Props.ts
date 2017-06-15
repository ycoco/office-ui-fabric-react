import * as React from 'react';

import IHostSettings from '@ms/odsp-datasources/lib/interfaces/ISpPageContext';
import { INavLinkGroup } from 'office-ui-fabric-react/lib/Nav';
import { IGroupsProvider } from '@ms/odsp-datasources/lib/providers/groups/GroupsProvider';
import Promise from '@ms/odsp-utilities/lib/async/Promise';

export interface IGroupLinkParams {
    /**
     * Specifies the key name used in IGroup to map to the cooresponding url, such as mail for conversationUrl,
     * group calendarUrl.
     */
    keyName: string;
    /**
     * Localized string that is the title of this link. Optional, but one of title or icon or both must be specified.
     */
    title?: string;
    /**
     * Icon string to specify the icon to display. Optional, but on of title or icon or both must be specified.
     */
    icon?: string;
}

/**
 * Holds the params of the manager that controls the state
 * of the EditNav.
 */
export interface IEditNavStateManagerParams {
    /** The host settings */
    hostSettings: IHostSettings;
    /** The parentContainer object */
    parentContainer: React.Component<any, any>;
    /** The callback when save button has been clicked */
    onSaved?: Function;
    /** The callback when cancel button has been clicked */
    onCancel?: Function;
    /** Groups of GroupLinks to be edited. */
    groups?: INavLinkGroup[];
    /** Collection of localized strings used by EditNav UI */
    strings: IEditNavStateManagerStrings;
    /** Flag isOnTop set when EditNav is on top of content page usually in mobile device or small screen size. */
    isOnTop?: boolean;
    /** Requests a modern Groups provider. */
    getGroupsProvider?: () => Promise<IGroupsProvider>;
    /** This is optional dropdown group link resources strings. */
    groupLinkToInfo?: IGroupLinkParams[];
}

export interface IEditNavStateManagerStrings {
    /** Save button label text */
    saveButtonLabel: string;
    /** Cancel button label text */
    cancelButtonLabel: string;
    /** Expanded icon text */
    expandedStateText: string;
    /** Add a link callout title text */
    addLinkTitle: string;
    /** Edit a link callout title text */
    editLinkTitle: string;
    /** Address textfield label */
    addressLabel: string;
    /** Link to dropdown label */
    linkToLabel?: string;
    /** Display textfield label */
    displayLabel: string;
    /** OK button label */
    okLabel: string;
    /** Address placeholder label */
    addressPlaceholder: string;
    /** Display placeholder label */
    displayPlaceholder: string;
    /** move up menu text */
    moveupText: string;
    /** move down menu text */
    movedownText: string;
    /** remove menu text */
    removeText: string;
    /** indent link menu text */
    indentlinkText: string;
    /** promote menu text */
    promotelinkText: string;
    /** url validation error meesage */
    errorMessage?: string;
    /** Pages node Title */
    pagesTitle?: string;
    /** Edit menu text */
    editText?: string;
    /** CheckBox Open in new tab text */
    openInNewTabText?: string;
    /** ContextMenu button aria label. */
    ariaLabelContextMenu?: string;
    /** EditNav panel aria label. */
    ariaLabel?: string;
}
