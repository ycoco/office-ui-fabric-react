
/**
 * Options for a navigate action.
 */
interface INavigateToOptions {
    /**
     * The URL to which to direct the browser.
     */
    url: string;

    /**
     * This value will be used by Navigation to perform hash navigation. 
     * It only accepts hash value starting with #, other value will be ignored.
     * If this property is provided for hash navigation, url value will be used to update browser location for displace only and will not cause url state change. 
     */
    viewParams?: string;

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
