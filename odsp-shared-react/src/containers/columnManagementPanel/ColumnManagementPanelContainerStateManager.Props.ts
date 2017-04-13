import * as React from 'react';
import { PanelType } from 'office-ui-fabric-react/lib/Panel';
import ISpPageContext from '@ms/odsp-datasources/lib/interfaces/ISpPageContext';
import { IListDataSource, IField, FieldType } from '@ms/odsp-datasources/lib/List';
import Promise from '@ms/odsp-utilities/lib/async/Promise';

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
}

 /*
  * The params of the manager that controls the state of the ColumnManagementPanel.
 . */
export interface IColumnManagementPanelContainerStateManagerParams {
    /** The ColumnManagementPanelContainer object. */
    columnManagementPanelContainer: React.Component<any, IColumnManagementPanelContainerState>;
    /** Contextual information for the current host. */
    pageContext: ISpPageContext;
    /** The callback for when a column was successfully created. This function should add the column to the view. */
    onSuccess: (displayName: string, internalFieldName: string) => void;
    /** Most errors are handled in the panel, but this is a callback for "fatal" errors, meaning errors that have no hope of being
     * fixed on retry. This function should handle displaying fatal errors to the user. */
    onError: (displayName: string, error: any) => void;
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
        /** Right now the panel only creates choice fields, but this will eventually control which type of column the panel is creating. */
        fieldType?: FieldType;
    };
    /** Parameters for field editing. This and createField are mutually exclusive. Specify one or the other. */
    editField?: {
        /** Internal name or title of the field to edit */
        fieldName: string;
    };
    /** Optional promise for existing list fields to prevent duplicate column names. */
    listFieldsPromise?: Promise<IField[]>;
    /** Column panel size type. If not specified, default is smallFixedFar. */
    panelType?: PanelType;
    /** Optional callback for when the panel is closed. */
    onDismiss?: () => void;
    /** Creates list data source. This is for testing purposes. If not passed, it will initialize data source itself. */
    getListDataSource?: () => IListDataSource;
}

