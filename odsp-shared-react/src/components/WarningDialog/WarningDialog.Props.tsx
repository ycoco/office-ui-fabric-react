/**
 * The properties to pass into the warning dialog component.
 */
export interface IWarningDialogProps {
    /**
     * Strings to use in the dialog
     */
    strings: IWarningDialogStrings;

    /**
     * Whether or not the dialog is hidden. Defaults to true.
     */
    hidden?: boolean;

    /**
     * Function to call when user closes the dialog either with
     * the close button, X button in the top corner, or by clicking
     * away.
     */
    onClose?: () => void
}

export interface IWarningDialogStrings {
    /**
     * The dialog title
     */
    title?: string;

    /**
     * The dialog subtext
     */
    subtext?: string;

    /**
     * The text for the close button in the dialog footer
     */
    closeButtonText?: string;

    /**
     * Aria label for the dialog close button (X)
     */
    closeButtonAriaLabel?: string;
}
