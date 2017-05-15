import * as React from 'react';
import { PanelType } from 'office-ui-fabric-react/lib/Panel';
import ISpPageContext from '@ms/odsp-datasources/lib/interfaces/ISpPageContext';
import { IListDataSource, FieldType } from '@ms/odsp-datasources/lib/List';

export type ColumnActionType = 'Create' | 'Edit' | 'Delete';

export interface IColumnManagementPanelContainerState {
    /** Whether or not the panel is open. */
    isPanelOpen?: boolean;
    /** Whether or not the name for the new column is a duplicate. */
    duplicateColumnName?: boolean;
    /** Whether we are currently saving the column information. */
    savingColumn?: boolean;
    /** Whether or not the save button is disabled. */
    saveDisabled?: boolean;
    /** Error message to display, if any. */
    errorMessage?: string;
    /** Whether or not to show the panel. Used to delay rendering slightly. */
    showPanel?: boolean;
    /** Whether or not the panel content is loading. */
    isContentLoading?: boolean;
    /** Whether or not to show the confirm delete dialog. */
    confirmDeleteDialogIsOpen?: boolean;
}

 /*
  * The params of the manager that controls the state of the ColumnManagementPanel.
 . */
export interface IColumnManagementPanelContainerStateManagerParams {
    /** The ColumnManagementPanelContainer object. */
    columnManagementPanelContainer: React.Component<any, IColumnManagementPanelContainerState>;
    /** Contextual information for the current host. */
    pageContext: ISpPageContext;
    /** The callback for when a column was successfully created, edited or deleted. This function should update the view. */
    onSuccess: (displayName: string, internalFieldName: string, actionType: ColumnActionType) => void;
    /** Most create and edit column errors are handled in the panel, but this is a callback for "fatal" errors, meaning errors that have
     * no hope of being fixed on retry. This function should handle displaying fatal errors and delete column errors to the user. */
    onError: (displayName: string, error: any, actionType: ColumnActionType) => void;
    /**
     * Collection of localized strings to show in the create column panel UI. This is not strongly typed because the feature is
     * under active development, but this is expected to match IColumnManagementPanelStrings in ./ColumnManagementPanelStringHelper.
     */
    strings: { [key: string]: string };
    /**
     * Collection of localized error strings to show when column creation fails in the UI. This is not strongly typed because the feature is
     * under active development, but this is expected to match IColumnManagementPanelErrorStrings in ./ColumnManagementPanelStringHelper.
     */
    errorStrings: { [key: string]: string };
    /** Parameters for field creation. This and editField are mutually exclusive. Specify one or the other. */
    createField?: {
        /** Which type of field to create. */
        fieldType?: FieldType;
    };
    /** Parameters for field editing. This and createField are mutually exclusive. Specify one or the other. */
    editField?: {
        /** Internal name of the field to edit */
        fieldName: string;
        /** Type of field to edit. If specified, the panel title will include the type. */
        fieldType?: FieldType;
    };
    /** Internally hyperlink and picture are stored as the same type, so we need this for the panel title. */
    isHyperlink?: boolean;
    /** Optional full list url from the current item. If not specified, the list url from the page context will be used for all ListDataSource calls. */
    listFullUrl?: string;
    /** Column panel size type. If not specified, default is smallFixedFar. */
    panelType?: PanelType;
    /** Optional callback for when the panel is closed. */
    onDismiss?: () => void;
    /** Creates list data source. This is for testing purposes. If not passed, the state manager will initialize data source itself. */
    getListDataSource?: () => IListDataSource;
}
