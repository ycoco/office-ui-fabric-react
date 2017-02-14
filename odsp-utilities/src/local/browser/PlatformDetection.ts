// OneDrive:IgnoreCodeCoverage

/**
 * Use PlatformDetection to evaluate which user experience makes sense for the user's
 * platform. NOTE: This class is NOT COMPLETE! Meaning not all values are parsed out of
 * the user agent. If something is missing that you need, add it and add unit tests.
 * WARNING: Avoid using browser checks when you can use detection techniques for caps checking.
 */

export default class PlatformDetection {
    // Do not initialize properties here. All assignments should be in the constructor to avoid code duplication.

    // Browser boolean checks
    public readonly isChrome: boolean;
    public readonly isEdge: boolean;
    public readonly isFirefox: boolean;
    public readonly isIE: boolean;
    public readonly isIE9: boolean;
    public readonly isSafari: boolean;

    // Add new entries to this type if more browsers become explicitly supported
    public readonly browserName: 'IE' | 'Edge' | 'Firefox' | 'Chrome' | 'Safari' | 'NA';
    public readonly browserMajor: number;
    public readonly browserMinor: string;

    // OS checks
    public readonly isAndroid: boolean;
    public readonly isIOS: boolean;
    public readonly isMac: boolean;
    public readonly isWindows: boolean;
    public readonly isWinPhone: boolean;

    public readonly osName: 'Windows' | 'Windows Phone' | 'OSX' | 'IOS' | 'Android' | 'NA';
    public readonly osVersion: string;

    // Specific OS versions
    public readonly isWindows10: boolean;
    public readonly isWindows81: boolean;
    public readonly isWindows7: boolean;

    // Check to see if we are definitely on a mobile device.
    public readonly isMobile: boolean;

    // Device information
    public readonly isIPad: boolean;

    // Capabilities
    public readonly areCSS3TransitionsSupported: boolean;
    public readonly areTouchEventsSupported: boolean;
    public readonly isFolderUploadSupported: boolean;
    public readonly isHtml5FileUploadSupported: boolean;
    public readonly isRetinaSupported: boolean;
    public readonly isUnlimitedStyleSheetsSupported: boolean;
    public readonly isWebDavSupported: boolean;

    // Raw user agent
    public readonly userAgent: string;

    constructor(agent?: string) {
        if (!agent) {
            agent = (window && window.navigator && navigator.userAgent) || '';
        }
        const userAgent = agent;
        agent = agent.toLowerCase();

        // We want to figure out which ONE browser the user is most likely on.
        // The order of the checks is important so we're not deceived by (for example)
        // Chrome saying that it's Safari.
        // (Each regular expression captures the version number so we can parse it later.)
        let match: RegExpExecArray;

        let isIE: boolean;
        let isIE9: boolean;
        let isEdge: boolean;
        let isFirefox: boolean;
        let isChrome: boolean;
        let isSafari: boolean;

        function testBrowserVersion(pattern: string): RegExpExecArray {
            return match = RegExp(`${pattern}(\\d+)([\\d.]*)`).exec(agent);
        }

        if (testBrowserVersion('msie ')) {
            // IE <= 10 has something like "MSIE 9" in the user agent.
            // This is also what newer versions do in compatibility mode.
            isIE = true;
            isIE9 = match[1] === '9';
        } else if (testBrowserVersion('trident.*rv:')) {
            // This is IE 11. Sample user agent contains:
            // Trident/7.0; other stuff... rv:11.0
            isIE = true;
        } else if (testBrowserVersion('edge/')) {
            // This is Edge (it pretends to be Chrome and Safari).
            isEdge = true;
        } else if (testBrowserVersion('fxios|firefox/')) {
            isFirefox = true;
        } else if (testBrowserVersion('(?:chrome|crios)/')) {
            // Note: lots of random browsers say they're Chrome and will end up in this bucket
            isChrome = true;
        } else if (/safari\/(\d+)/.test(agent)) {
            isSafari = true;
            testBrowserVersion('version/');
        }

        // Some other browser categories:
        //   IE Mobile: /iemobile\/(\d+)/
        //   IE Mobile in desktop mode: contains WPDesktop; get version from Trident version
        //   Opera (currently goes into Chrome bucket): /opr\/(\d+)/

        // Parse the captured version number for user's browser.
        const browserMajor = match && parseInt(match[1], 10) || 0;
        const browserMinor: string = match && match[2] && match[2].substr(1) || '0';

        // Parse device which gives hints about os / mobile state.
        // Windows Phone IE sometimes pretends to be Android, so explicitly check for Windows Phone first.
        // (wpdesktop is used by Windows Phone in desktop mode.)

        const isWinPhone = /windows phone|wpdesktop/.test(agent);
        const deviceMatch = isWinPhone || /ipad|iphone|ipod|android/.exec(agent);
        const device = deviceMatch && deviceMatch[0];

        const isAndroid = device === 'android';
        const isIPad = device === 'ipad';
        const isIOS = !!device && !isAndroid;

        const isMac = !deviceMatch && agent.indexOf('macintosh') > -1;
        const isWindows = !deviceMatch && agent.indexOf('windows nt') > -1;

        // Other operating systems:
        //   Chrome OS: /cros/
        //   Linux: /linux/ (Android can also say it's Linux, so check for Android first)

        // WARNING: Avoid using browser checks when you can use detection techniques for caps checking.

        const input = document.createElement("input");
        input.type = "file";
        const file = window['File'];
        const fileProto = file && file.prototype;

        /**
         * Checks to see if styleSheet exists as a property off of a style element.
         * This will determine if style registration should be done via cssText (<= IE9) or not
         */
        const emptyStyle = document.createElement("style");
        emptyStyle.type = "text/css";

        const osVersionMatch = /[\s\(](os|os x|windows (?:phone|nt)|android) ([\d._]+)/.exec(agent);

        return {
            // Browser identification
            isChrome: !!isChrome,
            isEdge: !!isEdge,
            isFirefox: !!isFirefox,
            isIE: !!isIE,
            isIE9: !!isIE9,
            isSafari: !!isSafari,

            browserName: isIE ? 'IE' : isEdge ? 'Edge' : isChrome ? 'Chrome' : isFirefox ? 'Firefox' : isSafari ? 'Safari' : 'NA',
            browserMajor: browserMajor,
            browserMinor: browserMinor,

            // OS Identification
            isAndroid: isAndroid,
            isIOS: isIOS,
            isMac: isMac,
            isWindows: isWindows,
            isWinPhone: isWinPhone,

            osVersion: osVersionMatch ? osVersionMatch[2] : "NA",
            osName: isWindows ? 'Windows' : isWinPhone ? 'Windows Phone' : isMac ? 'OSX' : isIOS ? 'IOS' : isAndroid ? 'Android' : 'NA',

            isWindows81: !deviceMatch && /windows (?:8\.1|nt 6\.3)/.test(agent),
            isWindows10: !deviceMatch && agent.indexOf('windows nt 10') > -1,
            isWindows7: !deviceMatch && agent.indexOf('windows nt 6.1') > -1,

            // Device identification
            isMobile: !!deviceMatch,
            isIPad: isIPad,

            // Capabilities
            areCSS3TransitionsSupported: !isIE || browserMajor > 9,
            areTouchEventsSupported: 'ontouchstart' in window,
            isFolderUploadSupported: "webkitdirectory" in input,
            isHtml5FileUploadSupported: !!(fileProto && (fileProto.slice || fileProto.mozSlice || fileProto.webkitSlice)),
            isRetinaSupported: window.devicePixelRatio > 1,
            isUnlimitedStyleSheetsSupported: !emptyStyle["styleSheet"],
            isWebDavSupported: 'addBehavior' in document.createElement('div'),

            // Raw user agent
            userAgent: userAgent
        };
    }
}
