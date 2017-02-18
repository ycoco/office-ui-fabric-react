
import IViewParams from '@ms/odsp-utilities/lib/navigation/IViewParams';
import IQueryParams from './IQueryParams';
import BeforeUnload from '@ms/odsp-utilities/lib/beforeUnload/BeforeUnload';

/**
 * Options for a navigate action.
 */
export interface INavigateToOptions {
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

/**
 * Options for updateViewParams()
 */
export interface IUpdateViewParamsOptions {
    /**
     * Optional switch. If set, avoids adding an entry to the browser history.
     */
    ignoreHistory?: boolean;

    /**
     * Optional switch. If set, this function does NOT preserve other view parameters that may be set
     */
    clearOtherParams?: boolean;

    /**
     * Optional switch.  If set, this function does NOT preserve the current path.
     */
    clearPath?: boolean;
}

/**
 * An interface for navigation.
 * @exports INavigation
 */
export interface INavigation {
    /**
     * The current view parameters as extracted from the URL or page hash.
     */
    viewParams: IViewParams;

    /**
     * A subsystem to register callback before navigation.
     */
    beforeUnload: BeforeUnload;

    /**
     * Navigates the browser to the given URL, with additional options.
     * @param options {string | INavigateToOptions} - The URL to which to navigate, or options for navigation.
     */
    navigateTo(options: INavigateToOptions | string): void;

    /**
     * Modifies the view parameters and "navigates" accordingly. Default behavior is to preserve other view parameters that may be present.
     * @param newParams {IQueryParams} - Either an object defining key-value pairs for the new view parameters, or a string in standard query string format
     * @param options {IUpdateViewParamsOptions} - Optional property bag of options
     */
    updateViewParams(newParams: IQueryParams | string, options?: IUpdateViewParamsOptions): void;

    /**
     * Reloads the browser window.
     */
    reload(): void;
}

export default INavigation;
