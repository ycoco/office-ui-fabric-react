// OneDrive:IgnoreCodeCoverage

/**
 * Navigation type from window.performance.navigation.type.
 * See:
 *   https://developer.mozilla.org/en-US/docs/Navigation_timing
 *   http://caniuse.com/#feat=nav-timing
 */
enum NavigationType {
    navigateNext = 0,
    reload = 1,
    backForward = 2,
    undefined = 255
};

export = NavigationType;