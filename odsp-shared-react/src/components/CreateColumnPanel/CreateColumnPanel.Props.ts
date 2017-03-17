import * as React from 'react';
import { IPanelProps } from 'office-ui-fabric-react/lib/Panel';
import { CreateColumnPanel, CreateColumnPanelContent } from './index';
import { ICreateFieldOptions } from '@ms/odsp-datasources/lib/List';

export interface ICreateColumnPanelProps extends React.Props<CreateColumnPanel> {
  /** Properties to pass through for panel. Must include onDismiss function. */
  panelProps: IPanelProps;

  /** Properties to pass through for the content of the create column panel. */
  createColumnPanelContentProps: ICreateColumnPanelContentProps;
}

export interface ICreateColumnPanelContentProps extends React.Props<CreateColumnPanelContent> {
  /** Collection of localized strings to show in the create column panel UI. */
  strings: {
    /** Text used as column creation panel title. */
    title: string;
    /** Text used as guide instructions for column creation. */
    guideText: string;
    /** Label for name text component. */
    nameLabel: string;
    /** Label for description text component. */
    descriptionLabel: string;
    /** Label for choices text component. */
    choicesLabel: string;
    /** Placeholder value for the choices text componenent. */
    choicesPlaceholder: string;
    /** Aria label for the choices entry field componenent. */
    choicesAriaLabel: string;
    /** Label for default choice value dropdown component. */
    defaultValueDropdown: string;
    /** Default selected value for the default choice value dropdown. */
    choiceDefaultValue: string;
    /** Label for checkbox component asking if users can manually add values. */
    manuallyAddValuesCheckbox: string;
    /** Aria label for the button that opens the teaching bubble about the manually add values option. */
    infoButtonAriaLabel: string;
    /** Content text for the teaching bubble about the manually add values option. */
    manuallyAddValuesTeachingBubble: string;
    /** Text for the show more options button. */
    moreOptionsButtonText: string;
    /** Text for the save button. */
    saveButtonText: string;
    /** Text for the cancel button. */
    cancelButtonText: string;
    /** Label for multiple selection toggle. */
    allowMultipleSelectionToggle: string;
    /** Label for required field toggle. */
    requiredToggle: string;
    /** Label for enforce unique values toggle. */
    enforceUniqueValuesToggle: string;
    /** Label for add to all content types toggle. */
    addToAllContentTypesToggle: string;
    /** Display text for when a toggle is on. */
    toggleOnText: string;
    /** Display text for when a toggle is off. */
    toggleOffText: string;
    /** Text for the show column validation button. */
    columnValidationButtonText: string;
    /** Text used as guide instructions for column validation formulas. */
    columnValidationGuideText: string;
    /** Text for link to more formula column validation information. */
    columnValidationLearnMoreLink: string;
    /** Label for formula text component. */
    formulaLabel: string;
    /** Text used as guide instructions for the user message explaining column validation. */
    userMessageGuideText: string;
    /** Label for user message text component. */
    userMessageLabel: string;
    /** Error message that appears if the column name already exists in the list. */
    duplicateColumnNameError?: string;
    /** Error message when we cannot get the other column names in the list. */
    genericError?: string;
  }

  /** Event handler for when the panel is closed, or the cancel button is pressed. */
  onDismiss: () => void;

  /** Event handler for when Save button is clicked. */
  onSave: (options: ICreateFieldOptions) => void;

  /** Callback to clear the duplicate name error once name is changed. */
  onClearError: () => void;

  /** Whether or not the name for the new column is a duplicate. */
  duplicateColumnName?: boolean;

  /** Whether we were unable to get the other columns in the list. */
  listColumnsUnknown?: boolean;
}