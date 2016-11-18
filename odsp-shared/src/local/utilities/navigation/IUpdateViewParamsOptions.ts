/**
 * Options for updateViewParams()
 */
interface IUpdateViewParamsOptions {
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

export = IUpdateViewParamsOptions;
