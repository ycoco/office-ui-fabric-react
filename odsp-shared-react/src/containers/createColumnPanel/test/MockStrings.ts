import { ICreateColumnPanelStrings } from '../index';

/** Empty strings object */
export const strings: ICreateColumnPanelStrings = {
    title: null,
    titleLearnMore: null,
    nameLabel: null,
    descriptionLabel: null,
    choicesLabel: null,
    choicesPlaceholder: null,
    choicesAriaLabel: null,
    defaultValueHeader: null,
    defaultValuePlaceholder: null,
    useCalculatedValue: null,
    useCalculatedValueTeachingBubble: null,
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
    userMessageLabel: null,
    duplicateColumnNameError: null,
    genericError: null
};

/** Function to populate the strings object with values */
export function stringFactory(strings: ICreateColumnPanelStrings): ICreateColumnPanelStrings {
    for (let key in strings) {
        strings[key] = key;
    }
    return strings;
}
