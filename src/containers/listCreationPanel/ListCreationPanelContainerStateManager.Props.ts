import * as React from 'react';
import ISpPageContext from '@ms/odsp-datasources/lib/interfaces/ISpPageContext';
import { PanelType } from 'office-ui-fabric-react/lib/Panel';
import { ListTemplateType } from '@ms/odsp-datasources/lib/dataSources/listCollection/ListTemplateType';

/**
 * Holds the params of the manager that controls the state
 * of the ListCreationPanelContainer.
 */
export interface IListCreationPanelContainerState {
    /**
     * The URL for the newly created list.
     */
    listUrl?: string;
    /**
     * The error message from list creation.
     */
    errorMessage?: string;
     /**
      * Weather or not to open the panel
      */
    isPanelOpen?: boolean;
}

export interface IListCreationPanelContainerStateManagerParams {
    /** The SiteHeaderContainer object */
    listCreationPanel: React.Component<any, IListCreationPanelContainerState>;
    /** Context information */
    pageContext: ISpPageContext;
    /** List creation panel type */
    panelType: PanelType;
    /** List template type */
    listTemplateType: ListTemplateType;
    /** The callback for create button */
    onCreateClick?: (ev: React.MouseEvent<HTMLElement>) => void;
    /** The callback for cancel button */
    onCancelClick?: (ev: React.MouseEvent<HTMLElement>) => void;
    /** The callback for successful list creation */
    onSuccess: (ev: React.MouseEvent<HTMLElement>, listUrl: string) => void;
    /** Weather or not to check Show in navigation by default */
    showInQuickLaunchDefault?: boolean;
    /** Collection of localized strings to show in the list creation panel UI. */
    strings: IListCreationPanelContainerStateManagerStrings;
}

export interface IListCreationPanelContainerStateManagerStrings {
    /** List creation panel header text */
    panelHeaderText: string;
    /** String for Create button */
    onCreateString: string;
    /** String for Cancel button */
    onCancelString: string;
    /** The description for the panel */
    panelDescription?: string;
    /** Label string for name text field */
    nameFieldLabel?: string;
    /** Placeholder string for name text field */
    nameFieldPlaceHolder?: string;
    /** Label string for description text field */
    descriptionFieldLabel?: string;
    /** Placeholder string for description text field */
    descriptionFieldPlaceHolder?: string;
    /** String for Show in quick launch */
    showInQuickLaunchString?: string;
    /** String for loading spinner */
    spinnerString?: string;
}
