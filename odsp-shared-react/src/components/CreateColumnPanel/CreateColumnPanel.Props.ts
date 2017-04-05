import * as React from 'react';
import { IPanelProps } from 'office-ui-fabric-react/lib/Panel';
import { CreateColumnPanel, CreateColumnPanelContent } from './index';
import { ICreateFieldOptions } from '@ms/odsp-datasources/lib/List';
import { ICreateColumnPanelStrings } from '../../containers/createColumnPanel/index';

export interface ICreateColumnPanelProps extends React.Props<CreateColumnPanel> {
  /** Properties to pass through for panel. Must include onDismiss function. */
  panelProps: IPanelProps;

  /** Properties to pass through for the content of the create column panel. */
  createColumnPanelContentProps: ICreateColumnPanelContentProps;

  /** Event handler for when the panel is closed, or the cancel button is pressed. */
  onDismiss: () => void;

  /** Event handler for when Save button is clicked. */
  onSave: (options: ICreateFieldOptions) => void;

  /** Whether or not the save button is disabled. */
  saveDisabled: boolean;

  /** Whether we were unable to get the other columns in the list. */
  listColumnsUnknown?: boolean;
}

export interface ICreateColumnPanelContentProps extends React.Props<CreateColumnPanelContent> {
  /** Collection of localized strings to show in the create column panel UI. */
  strings: ICreateColumnPanelStrings

  /** Callback to clear the duplicate name error once name is changed. */
  onClearError: () => void;

  /** Callback to update whether the save button is enabled or disabled */
  updateSaveDisabled: (name: string) => void;

  /** Whether or not the name for the new column is a duplicate. */
  duplicateColumnName?: boolean;

  /** Language ID, like 1033 */
  currentLanguage: number;
}