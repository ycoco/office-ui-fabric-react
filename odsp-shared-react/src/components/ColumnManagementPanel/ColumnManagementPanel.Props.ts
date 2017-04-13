import * as React from 'react';
import { IPanelProps } from 'office-ui-fabric-react/lib/Panel';
import { IFieldSchema } from '@ms/odsp-datasources/lib/List';
import { IColumnManagementPanelStrings } from '../../containers/columnManagementPanel/index';

export interface IColumnManagementPanelProps extends React.HTMLAttributes<HTMLElement> {
  /** Properties to pass through for panel. Must include onDismiss function. */
  panelProps: IPanelProps;

  /** Properties to pass through for the content of the create column panel. */
  columnManagementPanelContentProps: IColumnManagementPanelContentProps;

  /** Event handler for when the panel is closed, or the cancel button is pressed. */
  onDismiss: () => void;

  /** Event handler for when Save button is clicked. */
  onSave: (fieldSchema: IFieldSchema) => void;

  /** Whether or not the save button is disabled. */
  saveDisabled?: boolean;

  /** Error message to display, if any.  */
  errorMessage?: string;
}

export interface IColumnManagementPanelContentProps extends React.HTMLAttributes<HTMLElement> {
  /** Collection of localized strings to show in the create column panel UI. */
  strings: IColumnManagementPanelStrings;

  /** Language ID, like 1033 */
  currentLanguage: number;

  /** Callback to clear the duplicate name error once name is changed. */
  onClearError?: () => void;

  /** Callback to update whether the save button is enabled or disabled */
  updateSaveDisabled?: (name: string) => void;

  /** Whether or not the name for the new column is a duplicate. */
  duplicateColumnName?: boolean;
}