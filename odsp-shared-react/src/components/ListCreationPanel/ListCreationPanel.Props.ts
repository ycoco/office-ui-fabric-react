import * as React from 'react';
import { IPanelProps } from 'office-ui-fabric-react/lib/Panel';
import { IBaseProps } from 'office-ui-fabric-react';
import { ListCreationPanel, ListCreationPanelContent } from './index';

export interface IListCreationPanelProps extends React.Props<ListCreationPanel> {
  /** Properties to pass through for panel */
  panelProps: IPanelProps;
  /** Properties to pass through for the detail content of list creation panel */
  listCreationPanelContentProps: IListCreationPanelContentProps;
}

export interface IListCreationPanelContentProps extends React.Props<ListCreationPanelContent>, IBaseProps {
  /** Description for panel */
  panelDescription?: string;
  /** Label string for name text field */
  nameFieldLabel?: string;
  /** Placeholder string for name text field */
  nameFieldPlaceHolder?: string;
  /** Label string for description text field */
  descriptionFieldLabel?: string;
  /** Placeholder string for description text field */
  descriptionFieldPlaceHolder?: string;
  /** The error message from list creation */
  errorMessage?: string;
  /** String for loading spinner */
  spinnerString?: string;
  /** Properties for Create button */
  onCreate: IListCreationPanelCreateProps;
  /** Properties for Cancel button */
  onCancel: IListCreationPanelCancelProps;
  /** Weather or not to check Show in quick launch by default */
  showInQuickLaunchDefault?: boolean;
  /** String for Show in quick launch */
  showInQuickLaunchString?: string;
}

export interface IListCreationPanelCreateProps {
  /** String for Create button */
  onCreateString: string;
  /** What happens when you click create */
  onCreateAction?: (listTitle: string, listDescription: string, showInQuickLaunch: boolean, ev: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>) => void;
}

export interface IListCreationPanelCancelProps {
  /** String for Cancel button */
  onCancelString: string;
  /** What happens when you click create */
  onCancelAction?: (ev: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>) => void;
}
