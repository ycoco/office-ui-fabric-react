import * as React from 'react';
import { PanelType } from 'office-ui-fabric-react/lib/Panel';
import ISpPageContext from '@ms/odsp-datasources/lib/interfaces/ISpPageContext';
import { IListDataSource, IField } from '@ms/odsp-datasources/lib/List';
import { ICreateColumnPanelStrings } from './index';
import Promise from '@ms/odsp-utilities/lib/async/Promise';

export interface ICreateColumnPanelContainerState {
    /** Whether or not the panel is open. */
    isPanelOpen?: boolean;
    /** Whether or not the name for the new column is a duplicate. */
    duplicateColumnName?: boolean;
    /** Whether we were unable to get the other columns in the list. */
    listColumnsUnknown?: boolean;
    /** Whether we are currently saving the column information. */
    savingColumn?: boolean;
    /** Whether or not the save button is disabled. */
    saveDisabled?: boolean;
}

 /*
  * The params of the manager that controls the state
  * of the CreateColumnPanel.
 . */
export interface ICreateColumnPanelContainerStateManagerParams {
    /** The CreateColumnPanelContainer object. */
    createColumnPanelContainer: React.Component<any, ICreateColumnPanelContainerState>;
    /** Contextual information for the current host. */
    pageContext: ISpPageContext;
    /** The callback for the save button. This function should add the column to the view and handle errors. */
    onSave: (displayName: string, createFieldPromise: Promise<string>) => void;
    /** Collection of localized strings to show in the list creation panel UI. */
    strings: ICreateColumnPanelStrings;
    /** Optional promise for existing list fields to prevent duplicate column names. */
    listFieldsPromise?: Promise<IField[]>;
    /** Create column panel type. If not specified, default is smallFixedFar. */
    panelType?: PanelType;
    /** Optional callback for when the panel is closed. */
    onDismiss?: () => void;
    /** Creates list data source. This is for testing purposes. If not passed, it will initialize data source itself. */
    getListDataSource?: () => IListDataSource;
}

