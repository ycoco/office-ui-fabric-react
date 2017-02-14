// OneDrive:IgnoreCodeCoverage
/* tslint:disable:ban-native-functions */
// Add a redirect delay to hopefully allow logging to post
const REDIRECT_DELAY = 10000;
let hasLogged = false;
let session: string = '';
let cookieDomain: string = '';
let requireJsDeps: string[] = [];
let errorHandler: (name: string, err: any) => void;
let setDependencies: () => { domain: string, requireJsDepsArray: string[] };

declare const window: Window & {
    requirejs?: {
        onError(error: any): void;
    };
    require?(paths: string[], onLoad: () => void): void;
};

// Helper function to set a cookie value
function _setCookie(name: string, value: string, isExpired: boolean) {
    let cookie = name + '=' + value + ';path=/;domain=' + cookieDomain + ';';
    if (isExpired) {
        cookie += 'expires=' + new Date(0).toUTCString() + ';';
    }
    document.cookie = cookie;
}

function setCookie(value: string | number, isExpired: boolean) {
    _setCookie('sr', value + 'requireDeps', isExpired);

    _setCookie('failedsession', session, isExpired);
}
function refresh() {
    (<any>window.top).location = document.location.href;
}

function handleRequireJSError(err: any) {
    if (!hasLogged) {
        // Only refresh in non debug mode
        if (!DEBUG) {
            // Error callback function that is invoked during the first require call when loading
            // critical entry points such as SkyDriveApp
            // Err may contain a list of modules that failed
            hasLogged = true;
            const cookie = document.cookie;

            if (/(?:^|; )sr=3/.test(cookie)) {
                // We are on the final retry
                // Swallow error, expire the cookie, and give up at this point
                setCookie(0, true);
            } else if (/(?:^|; )sr=2/.test(cookie)) {
                // Failed the refresh and the reload attempts.
                // Refresh one more time so we can show the error page.
                setCookie(3, false);

                setTimeout(refresh, REDIRECT_DELAY);
            } else if (/(?:^|; )sr=/.test(cookie)) {
                // Failed the first page and the refresh.
                // There is a chance that the file has a bad js file in their cache.
                // We are going to call location.reload(true) this time since that tells
                // the browser to not use the cache (even for css/js/img requests) in
                // one last attempt.

                setCookie(2, false);
                setTimeout(function () {
                    location.reload(true);
                }, REDIRECT_DELAY);
            } else {
                // The main request failed which might just be a networking issue so try again.
                setCookie(1, false);
                setTimeout(refresh, REDIRECT_DELAY);
            }
        } else {
            // Log the error so we can debug it
            console.log(err);
        }

        errorHandler('requireJSDownloadFailure', err);
    }
}

export function init(sessionStr: string, setDeps: () => { domain: string, requireJsDepsArray: string[] }, errorHandlerCallback: (name: string, err: any) => void) {
    session = sessionStr;
    setDependencies = setDeps;
    errorHandler = errorHandlerCallback;
}

// The main function to invoke require on a list of deps, or entry points, on the page
export default function requireDeps() {
    const data = setDependencies();
    cookieDomain = data.domain;
    requireJsDeps = data.requireJsDepsArray;
    const requirejs = window.requirejs;
    if (requirejs) {
        requirejs.onError = handleRequireJSError;

        // We don't need an error handler because we have attached an error handler using Log.addHandler
        // Note: error handler does not fire when nested dependencies fail to load, hence we are attaching to the global error handler
        window.require(requireJsDeps,
            // The success handler
            function () {
                // Expire the cookie
                setCookie(0, true);
                // Set success to true
                hasLogged = true;
            });
    } else {
        handleRequireJSError(new Error("requirejs failed to download"));
    }
};