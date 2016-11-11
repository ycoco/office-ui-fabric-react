import * as React from 'react';

import IHostSettings from '@ms/odsp-datasources/lib/interfaces/ISpPageContext';
import { INavLinkGroup }  from 'office-ui-fabric-react/lib/Nav';

/**
 * Holds the params of the manager that controls the state
 * of the EditNav.
 */
export interface IEditNavStateManagerParams {
    /** The host settings */
    hostSettings: IHostSettings;
    /** The SiteHeaderContainer object */
    reactLeftNav: React.Component<any, any>;
    /** The callback when save button has been clicked */
    onSaved: Function;
    /** The callback when cancel button has been clicked */
    onCancel: Function;
    /** The callback when cancel button has been clicked */
    groups: INavLinkGroup[];
    /** Collection of localized strings used by EditNav UI */
    strings: IEditNavStateManagerStrings;
    /** Flag isOnTop set when EditNav is on top of content page usually in T-Narrow or devices cases */
    isOnTop?: boolean;
    /** The none-default left navigation provider name */
    navigationProviderName?: string;
    /** The none-default navigation menu start node key */
    menuNodeKey?: string;
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
}
