export interface IColumnManagementPanelStrings {
    /** Text used as column creation panel title. */
    title: string;
    /** Text used as column creation panel title. {0} is the type of column to create. */
    titleFormat: string;
    /** Text used as the edit column panel title. */
    editPanelTitle: string;
    /** Text used as the edit column panel title. {0} is the type of column to edit. */
    editPanelTitleFormat: string;
    /** Text that is shown if we fail to load the column data needed for the edit panel. */
    failureToLoadEditPanel: string;
    /** Learn more link text for the column creation panel. */
    titleLearnMore: string;
    /** Learn more link text for the edit column panel. */
    editPanelTitleLearnMore: string;
    /** Label for name field component. */
    nameLabel: string;
    /** Error message when a column with this name already exists in the list. In this interface not error strings because it is displayed under the name field directly. */
    duplicateColumnNameError?: string;
    /** Label for description field component. */
    descriptionLabel: string;
    /** Label for choices entry field component. */
    choicesLabel: string;
    /** Placeholder value for the choices entry field componenent. */
    choicesPlaceholder: string;
    /** Aria label for the choices entry field componenent. */
    choicesAriaLabel: string;
    /** Label for the use calculated default value checkbox. */
    useCalculatedValue: string;
    /** Content text for the teaching bubble about the use calculated value option. */
    useCalculatedValueTeachingBubble: string;
    /** Header for default value components. */
    defaultValueHeader: string;
    /** Placeholder text for the default value formula entry field. */
    defaultFormulaPlaceholder: string;
    /** Aria label for the default value formula entry field. */
    defaultFormulaAriaLabel: string;
    /** Aria label for the default value dropdown. */
    defaultValueDropdownAriaLabel: string;
    /** Default selected value for the default choice value dropdown. */
    choiceDefaultValue: string;
    /** Label for checkbox component asking if users can manually add values. */
    manuallyAddValuesCheckbox: string;
    /** Label for checkbox component asking if users can select groups. */
    allowSelectionOfGroupsCheckbox: string;
    /** Aria label for the info button that opens the teaching bubble. */
    infoButtonAriaLabel: string;
    /** Aria label for the button that opens the teaching bubble. {0} is the name of the component the information is about. */
    infoButtonAriaLabelFormat: string;
    /** Content text for the teaching bubble about the manually add values option. */
    manuallyAddValuesTeachingBubble: string;
    /** Text for the show more options button. */
    moreOptionsButtonText: string;
    /** Text for the save button. */
    saveButtonText: string;
    /** Text for the cancel button. */
    cancelButtonText: string;
    /** Text for the delete button. */
    deleteButtonText: string;
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
    /** Text for link to more formula information. */
    formulaLearnMoreLink: string;
    /** Label for formula text component. */
    formulaLabel: string;
    /** Text used as guide instructions for the user message explaining column validation. */
    userMessageGuideText: string;
    /** Label for user message text component. */
    userMessageLabel: string;
    /** Title for the confirm delete column dialog. */
    confirmDeleteDialogTitle: string;
    /** Text for the confirm delete column dialog. */
    confirmDeleteDialogText: string;
    /** Aria label for the panel or dialog close button. */
    closeButtonAriaLabel: string;
    /** Friendly name for a choice column. */
    friendlyNameChoice: string;
    /** Friendly name for a user column. */
    friendlyNameUser: string;
    /** Friendly name for a number column. */
    friendlyNameNumber: string;
    /** Friendly name for a boolean column. */
    friendlyNameBoolean: string;
    /** Friendly name for a hyperlink column. */
    friendlyNameHyperlink: string;
    /** Friendly name for a picture column. */
    friendlyNamePicture: string;
    /** Friendly name for a text column. */
    friendlyNameText: string;
    /** Label for the number of decimal places dropdown. */
    decimalPlacesDropdownLabel: string;
    /** Aria label for the number of decimal places dropdown. */
    decimalPlacesDropdownAriaLabel: string;
    /** Text for automatic number of decimal places. */
    decimalPlacesAutomatic: string;
    /** Label for the show as percentage checkbox. */
    showAsPercentageCheckbox: string;
    /** Placeholder text for a number value entry field. */
    enterNumberPlaceholder: string;
    /** Aria label for the default number value entry field. */
    defaultNumberAriaLabel: string;
    /** Error message if the default value is not a number. */
    defaultNumberNotValid: string;
    /** Label for the minimum number value entry field. */
    minimumValueLabel: string;
    /** Aria label for the minimum number value entry field. */
    minimumValueAriaLabel: string;
    /** Error message if the minimum value is not a valid number. */
    minimumValueNotValid: string;
    /** Error message if the user enters a minimum value larger than the maximum value. */
    minimumLargerThanMaximum: string;
    /** Label for the maximum number value entry field. */
    maximumValueLabel: string;
    /** Aria label for the maximum number value entry field. */
    maximumValueAriaLabel: string;
    /** Error message if the maximum value is not a valid number. */
    maximumValueNotValid: string;
    /**Label for the maximum number of characters for an entry field. */
    maximumLengthLabel: string;
    /** Error message if the maximum number of characters is not a valid number. */
    maximumLengthNotValid: string;
    /** Placeholder text for a string value entry field. */
    defaultValuePlaceholder: string;
    /** Aria label for the default value entry field. */
    defaultValueAriaLabel: string;
}

export interface IColumnManagementPanelErrorStrings {
    /** Error message when a user enters an invalid formula when creating a column. */
    formulaSyntaxError: string;
    /** Error message when a user enters a formula with an invalid column name reference. */
    formulaInvalidColumnName: string;
    /** Error message when a user enters a formula referencing a column with an ineligible type. */
    formulaColumnNameIneligible: string;
    /** Error message when a user enters a calculated column formula that refers to the column the formula applies to. */
    formulaSelfReference: string;
    /** Error message when a user enters an empty formula on a calculated column. */
    formulaEmptyError: string;
    /** Error message when a user enters a validation formula referring to another column. */
    validationFormulaInvalidColumnName: string;
    /** Error message when the default value formula contains a reference to a field and should not. */
    referenceToFieldFound: string;
    /** Error message when a calculated column has a formula value containing Today or Me. */
    referenceToSemiValueFound: string;
    /** Error message when the user tries to change the column type while it is being indexed. */
    columnIsBeingIndexed: string;
    /** Fallback error message if we try to create the column and get an unknown error. */
    genericCreateColumnError: string;
    /** Fallback error message if we try to edit the column and get an unkown error. */
    genericEditColumnError: string;
}

/** Mock create column panel strings object to check for missing string values and fill them in */
export const MockColumnManagementPanelStrings: IColumnManagementPanelStrings = {
    title: null,
    titleFormat: null,
    editPanelTitle: null,
    editPanelTitleFormat: null,
    failureToLoadEditPanel: null,
    titleLearnMore: null,
    editPanelTitleLearnMore: null,
    nameLabel: null,
    duplicateColumnNameError: null,
    descriptionLabel: null,
    choicesLabel: null,
    choicesPlaceholder: null,
    choicesAriaLabel: null,
    useCalculatedValue: null,
    useCalculatedValueTeachingBubble: null,
    defaultValueHeader: null,
    defaultFormulaPlaceholder: null,
    defaultFormulaAriaLabel: null,
    defaultValueDropdownAriaLabel: null,
    choiceDefaultValue: null,
    manuallyAddValuesCheckbox: null,
    allowSelectionOfGroupsCheckbox: null,
    infoButtonAriaLabel: null,
    infoButtonAriaLabelFormat: null,
    manuallyAddValuesTeachingBubble: null,
    moreOptionsButtonText: null,
    saveButtonText: null,
    cancelButtonText: null,
    deleteButtonText: null,
    allowMultipleSelectionToggle: null,
    requiredToggle: null,
    enforceUniqueValuesToggle: null,
    addToAllContentTypesToggle: null,
    toggleOnText: null,
    toggleOffText: null,
    columnValidationButtonText: null,
    columnValidationGuideText: null,
    formulaLearnMoreLink: null,
    formulaLabel: null,
    userMessageGuideText: null,
    userMessageLabel: null,
    confirmDeleteDialogTitle: null,
    confirmDeleteDialogText: null,
    closeButtonAriaLabel: null,
    friendlyNameChoice: null,
    friendlyNameUser: null,
    friendlyNameNumber: null,
    friendlyNameBoolean: null,
    friendlyNameHyperlink: null,
    friendlyNamePicture: null,
    friendlyNameText: null,
    decimalPlacesDropdownLabel: null,
    decimalPlacesDropdownAriaLabel: null,
    decimalPlacesAutomatic: null,
    showAsPercentageCheckbox: null,
    enterNumberPlaceholder: null,
    defaultNumberAriaLabel: null,
    defaultNumberNotValid: null,
    minimumValueLabel: null,
    minimumValueAriaLabel: null,
    minimumValueNotValid: null,
    minimumLargerThanMaximum: null,
    maximumValueLabel: null,
    maximumValueAriaLabel: null,
    maximumValueNotValid: null,
    maximumLengthLabel: null,
    maximumLengthNotValid: null,
    defaultValuePlaceholder: null,
    defaultValueAriaLabel: null
};

/** Mock create column panel error strings object to check for missing string values and fill them in */
export const MockColumnManagementPanelErrorStrings: IColumnManagementPanelErrorStrings = {
    formulaSyntaxError: null,
    formulaInvalidColumnName: null,
    formulaColumnNameIneligible: null,
    formulaSelfReference: null,
    formulaEmptyError: null,
    validationFormulaInvalidColumnName: null,
    referenceToFieldFound: null,
    referenceToSemiValueFound: null,
    columnIsBeingIndexed: null,
    genericCreateColumnError: null,
    genericEditColumnError: null
};

/**
 * Goes through the strings the user passed and compares them with the strings we expect to exist in IColumnManagementPanelStrings.
 * Fills in any missing key value pairs using the key. E.g. "toggleOnText": "toggleOnText".
 */
export function fillInColumnManagementPanelStrings(strings: { [index: string]: string }): IColumnManagementPanelStrings {
    let completeStrings: IColumnManagementPanelStrings = { ...MockColumnManagementPanelStrings };
    for (let key in MockColumnManagementPanelStrings) {
        completeStrings[key] = strings[key] || key.indexOf('Format') !== -1 ? strings[key] : key;
    }
    return completeStrings;
}

/**
 * Goes through the strings the user passed and compares them with the strings we expect to exist in IColumnManagementPanelErrorStrings.
 * Fills in any missing key value pairs using the key. E.g. "genericCreateColumnError": "genericCreateColumnError".
 */
export function fillInColumnManagementPanelErrorStrings(strings: { [index: string]: string }): IColumnManagementPanelErrorStrings {
    let completeStrings: IColumnManagementPanelErrorStrings = { ...MockColumnManagementPanelErrorStrings };
    for (let key in MockColumnManagementPanelErrorStrings) {
        completeStrings[key] = strings[key] ? strings[key] : key;
    }
    return completeStrings;
}
