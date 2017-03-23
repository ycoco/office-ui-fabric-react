export interface ICreateColumnPanelStrings {
    /** Text used as column creation panel title. */
    title: string;
    /** Learn more link for the column creation panel. */
    titleLearnMore: string;
    /** Label for name field component. */
    nameLabel: string;
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
    /** Label for the default value formula entry field. */
    defaultValuePlaceholder: string;
    /** Header for default value components. */
    defaultValueHeader: string;
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
    /** Error message that appears if the column name already exists in the list. */
    duplicateColumnNameError?: string;
    /** Error message when we cannot get the other column names in the list. */
    genericError?: string;
}

export default ICreateColumnPanelStrings;