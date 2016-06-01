
/**
 * Options for a navigate action.
 */
interface INavigateToOptions {
    /**
     * The URL to which to direct the browser.
     */
    url: string;

    /**
     * The id of the frame which should perform the navigation.
     */
    frameId?: string;

    /**
     * Whether or not to avoid adding an entry to the browser history.
     */
    ignoreHistory?: boolean;
}

export = INavigateToOptions;
