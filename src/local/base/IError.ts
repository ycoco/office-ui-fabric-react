// OneDrive:IgnoreCodeCoverage
/**
 * An interface for errors.
 */
interface IError {
    /** Specifies errorcode */
    errorCode: any;

    /** Specifies title */
    errorTitle: string;

    /** Specifies detailed text */
    errorDetailedText?: string;

    /** Specifies the action button text */
    actionText?: string;

    /** Specifies the action Url */
    actionUrl?: string;
}

export = IError;