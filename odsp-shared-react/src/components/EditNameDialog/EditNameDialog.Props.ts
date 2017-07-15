
/**
 * The properties to pass into the edit name dialog component.
 */
export interface IEditNameDialogProps {
    /**
     * Strings to use in the dialog
     */
    strings: IEditNameDialogStrings;

    /**
     * Function to call when user clicks the done button.
     * The current value of the name will be passed in.
     */
    onDone: (name: string) => void

    /**
     * Boolean indicating whether the cancel button should be rendered.
     */
    showCancelButton?: boolean;

    /**
     * Function to call when user closes the dialog either with
     * the cancel button, X button in the top corner, or by clicking
     * away.
     */
    onClose?: () => void

    /**
     * Whether or not the dialog is hidden
     */
    hidden?: boolean;
}

export interface IEditNameDialogStrings {
    /**
     * The dialog title
     */
    title?: string;

    /**
     * The text to display in the input box as a placeholder, if desired.
     */
    placeholderText?: string;

    /**
     * The intial value of the text field, if desired.
     */
    initialValue?: string;

    /**
     * The file extension to display to the right of the input box, if desired.
     */
    fileExtensionText?: string;

    /**
     * The text for the done button
     */
    doneButtonText?: string;

    /**
     * The text for the cancel button
     */
    cancelButtonText?: string;

    /**
     * Aria label for the dialog close button (X)
     */
    closeButtonAriaLabel?: string;
}