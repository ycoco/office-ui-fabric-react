import * as React from 'react';
import { IPanelProps } from 'office-ui-fabric-react/lib/Panel';
import { IFieldSchema, IServerField, FieldType } from '@ms/odsp-datasources/lib/List';
import { IColumnManagementPanelStrings } from '../../containers/columnManagementPanel/index';
import { IUniqueFieldsComponentRequiredValues } from './HelperComponents/index';
import { IColumnManagementPanelCurrentValues } from './index';
import Promise from '@ms/odsp-utilities/lib/async/Promise';

export interface IColumnManagementPanelProps extends React.HTMLAttributes<HTMLElement> {
  /** Properties to pass through for panel. Must include onDismiss function. */
  panelProps: IPanelProps;

  /** Properties to pass through for the content of the create column panel. */
  columnManagementPanelContentProps: IColumnManagementPanelContentProps;

  /** Event handler for when the panel is closed, or the cancel button is pressed. */
  onDismiss: () => void;

  /** Event handler for when Save button is clicked. */
  onSave: (fieldSchema: IFieldSchema) => void;

  /** Event handler when Delete button is clicked. */
  onDelete: () => void;

  /** Whether or not the save button is disabled. */
  saveDisabled?: boolean;

  /** Error message to display, if any.  */
  errorMessage?: string;

  /** Whether or not the panel content is loading. */
  isContentLoading?: boolean;

  /** Whether or not to show the panel. Used to delay rendering slightly for the edit panel. */
  showPanel?: boolean;

  /** Whether this is a panel to edit a column rather than create one. */
  isEditPanel?: boolean;

  /** Whether or not the confirm delete dialog is open. */
  confirmDeleteDialogIsOpen?: boolean;

  /** Function to open or close the confirm delete dialog. */
  showHideConfirmDeleteDialog?: () => void;
}

export interface IColumnManagementPanelContentProps extends React.HTMLAttributes<HTMLElement> {
  /** Collection of localized strings to show in the create column panel UI. */
  strings: IColumnManagementPanelStrings;

  /** Language ID, like 1033 */
  currentLanguage: number;

  /** What type of field to create. Required for creating columns, not for editing them. */
  fieldType?: FieldType;

  /** Promise used to get the current values to use as defaults for the components. This is only defined for edit panels. */
  currentValuesPromise?: Promise<IServerField>;

  /** Callback to clear the duplicate name error once name is changed. */
  onClearError?: () => void;

  /** Callback to update whether the save button is enabled or disabled. */
  updateSaveDisabled?: (name: string, requiredValues: IUniqueFieldsComponentRequiredValues) => void;

  /** Callback to update the state of the panel once we have the current default values.  */
  updateParentStateWithCurrentValues?: (currentValues: IColumnManagementPanelCurrentValues) => void;

  /** Whether or not the name for the column is a duplicate. */
  duplicateColumnName?: boolean;

 /** Whether this is a panel to edit a column rather than create one. */
  isEditPanel?: boolean;
}