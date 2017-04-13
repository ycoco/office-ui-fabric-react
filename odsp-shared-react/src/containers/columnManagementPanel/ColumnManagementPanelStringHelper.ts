export interface IColumnManagementPanelStrings {
    /** Text used as column creation panel title. */
    title: string;
    /** Learn more link for the column creation panel. */
    titleLearnMore: string;
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
    /** Text for link to more formula information. */
    formulaLearnMoreLink: string;
    /** Label for formula text component. */
    formulaLabel: string;
    /** Text used as guide instructions for the user message explaining column validation. */
    userMessageGuideText: string;
    /** Label for user message text component. */
    userMessageLabel: string;
}

export interface IColumnManagementPanelErrorStrings {
    /** Error message when a user enters an invalid formula when creating a column. */
    formulaSyntaxError: string;
    /** Error message when a user enters a formula with an invalid column name reference. */
    formulaInvalidColumnName: string;
    /** Error message when a user enters a formula referencing a column with an ineligible type. */
    formulaColumnNameIneligible: string;
    /** Error message when a user enters a formula that refers to the column the formula applies to. */
    formulaSelfReference: string;
    /** Error message when a user enters an empty formula on a calculated column. */
    formulaEmptyError: string;
    /** Error message when a user enters a validation formula referring to another column. */
    validationFormulaInvalidColumnName: string;
    /** Error message when a formula contains a reference to a field and should not. */
    referenceToFieldFound: string;
    /** Error message when a calculated column has a formula value containing Today or Me. */
    referenceToSemiValueFound: string;
    /** Fallback error message if we try to create the column and get an unknown error. */
    genericCreateColumnError: string;
}

/** Mock create column panel strings object to check for missing string values and fill them in */
export const MockColumnManagementPanelStrings: IColumnManagementPanelStrings = {
    title: null,
    titleLearnMore: null,
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
    infoButtonAriaLabel: null,
    manuallyAddValuesTeachingBubble: null,
    moreOptionsButtonText: null,
    saveButtonText: null,
    cancelButtonText: null,
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
    userMessageLabel: null
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
    genericCreateColumnError: null
};

/**
 * Goes through the strings the user passed and compares them with the strings we expect to exist in IColumnManagementPanelStrings.
 * Fills in any missing key value pairs using the key. E.g. "toggleOnText": "toggleOnText".
 */
export function fillInColumnManagementPanelStrings(strings: { [index: string]: string }): IColumnManagementPanelStrings {
    let completeStrings: IColumnManagementPanelStrings = { ...MockColumnManagementPanelStrings };
    for (let key in MockColumnManagementPanelStrings) {
        completeStrings[key] = strings[key] ? strings[key] : key;
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
