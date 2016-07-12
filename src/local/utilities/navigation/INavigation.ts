import INavigateToOptions = require('./INavigateToOptions');
import IUpdateViewParamsOptions = require('./IUpdateViewParamsOptions');
import IViewParams from '@ms/odsp-utilities/lib/navigation/IViewParams';
import IQueryParams from './IQueryParams';
import BeforeUnload from '@ms/odsp-utilities/lib/beforeUnload/BeforeUnload';

/**
 * An interface for navigation.
 * @exports INavigation
 */
interface INavigation {
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

export = INavigation;
