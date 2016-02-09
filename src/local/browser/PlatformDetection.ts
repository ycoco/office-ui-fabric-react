// OneDrive:IgnoreCodeCoverage

/**
 * Use PlatformDetection to evaluate which user experience makes sense for the user's
 * platform. NOTE: This class is NOT COMPLETE! Meaning not all values are parsed out of
 * the user agent. If something is missing that you need, add it and add unit tests.
 * WARNING: Avoid using browser checks when you can use detection techniques for caps checking.
 */

class PlatformDetection {

    // OS checks
    public isWindows: boolean = false;
    public isWinPhone: boolean = false;
    public isMac: boolean = false;
    public isIOS: boolean = false;
    public isAndroid: boolean = false;
    public isWindows81: boolean = false;

    // Check to see if we are definitely on a mobile device.
    public isMobile: boolean = false;

    // Browser boolean checks
    public isChrome: boolean = false;
    public isIE: boolean = false;
    public isIE9: boolean = false;
    public isEdge: boolean = false;
    public isFirefox: boolean = false;
    public isSafari: boolean = false;

    // Device information
    public isIPad: boolean = false;

    public browserMinor: string = '0';
    public browserMajor: number = 0;
    public browserName: string;

    public areCSS3TransitionsSupported: boolean = true;
    public isHtml5FileUploadSupported: boolean = false;
    public isFolderUploadSupported: boolean = false;
    public isRetinaSupported: boolean = false;
    public isUnlimitedStyleSheetsSupported: boolean = false;
    public areTouchEventsSupported: boolean = false;
    public isWebDavSupported: boolean = false;

    public osName: string;
    public osVersion: string;
    public userAgent: string;

    constructor(agent?: string) {
        agent = agent || (window && window.navigator && navigator.userAgent) || '';
        this.userAgent = agent;
        agent = agent.toLowerCase();

        // We want to figure out which ONE browser the user is most likely on.
        // The order of the checks is important so we're not deceived by (for example)
        // Chrome saying that it's Safari.
        // (Each regular expression captures the version number so we can parse it later.)
        var match;

        if (match = /msie (\d+)([\d.]*)/.exec(agent)) {
            // IE <= 10 has something like "MSIE 9" in the user agent.
            // This is also what newer versions do in compatibility mode.
            this.isIE = true;
            if (/msie 9/.exec(agent)) {
                this.isIE9 = true;
            }
        } else if (match = /trident.*rv:(\d+)([\d.]*)/.exec(agent)) {
            // This is IE 11. Sample user agent contains:
            // Trident/7.0; other stuff... rv:11.0
            this.isIE = true;
        } else if (match = /edge\/(\d+)([\d.]*)/.exec(agent)) {
            // This is Edge (it pretends to be Chrome and Safari).
            this.isEdge = true;
            // For compatibility with existing code: say Edge is also IE
            this.isIE = true;
        } else if (match = /firefox\/(\d+)([\d.]*)/.exec(agent)) {
            this.isFirefox = true;
        } else if (match = /(?:chrome|crios)\/(\d+)([\d.]*)/.exec(agent)) {
            // Note: lots of random browsers say they're Chrome and will end up in this bucket
            this.isChrome = true;
        } else if (match = /safari\/(\d+)/.exec(agent)) {
            this.isSafari = true;
            match = /version\/(\d+)([\d.]*)/.exec(agent);
        }

        // Some other browser categories:
        //   IE Mobile: /iemobile\/(\d+)/
        //   IE Mobile in desktop mode: contains WPDesktop; get version from Trident version
        //   Opera (currently goes into Chrome bucket): /opr\/(\d+)/

        // Parse the captured version number for user's browser.
        if (match) {
            this.browserMajor = parseInt(match[1], 10) || 0;
            let browserMinorVersion: string = match[2];
            if (browserMinorVersion) {
                let minorStart = browserMinorVersion.indexOf('.');
                if (minorStart >= 0 && minorStart < browserMinorVersion.length - 1) {
                    this.browserMinor = browserMinorVersion.substr(minorStart + 1);
                }
            }
        }

        // Parse device which gives hints about os / mobile state.
        // Windows Phone IE sometimes pretends to be Android, so explicitly check for Windows Phone first.
        // (wpdesktop is used by Windows Phone in desktop mode.)
        var deviceMatch = agent.match(/windows phone|wpdesktop/) || agent.match(/ipad|iphone|ipod|android/);
        if (deviceMatch) {
            var device = deviceMatch[0];

            this.isWinPhone = device === 'windows phone' || device === 'wpdesktop';
            this.isAndroid = device === 'android';
            this.isIOS = device === 'ipad' || device === 'ipod' || device === 'iphone';
            this.isIPad = device === 'ipad';
            this.isMobile = this.isWinPhone || this.isAndroid || this.isIOS;
        } else {
            this.isMac = agent.indexOf('macintosh') !== -1;
            this.isWindows = agent.indexOf('windows nt') !== -1;
            this.isWindows81 = /(windows 8\.1|windows nt 6\.3)/.test(agent) && !this.isWinPhone;
        }
        // Other operating systems:
        //   Chrome OS: /cros/
        //   Linux: /linux/ (Android can also say it's Linux, so check for Android first)

        // WARNING: Avoid using browser checks when you can use detection techniques for caps checking.

        this.isRetinaSupported = !!(window['devicePixelRatio'] && window.devicePixelRatio > 1);

        var input = document.createElement("input");
        input.type = "file";
        this.isFolderUploadSupported = "webkitdirectory" in input;
        this.isHtml5FileUploadSupported = !!(window['File'] && (window['File'].prototype.slice || window['File'].prototype.mozSlice || window['File'].prototype.webkitSlice));

        this.isUnlimitedStyleSheetsSupported = !this._shouldUseCssText();
        this.areTouchEventsSupported = 'ontouchstart' in window;
        this.isWebDavSupported = 'addBehavior' in document.createElement('div');

        if (this.isIE && this.browserMajor <= 9) {
            this.areCSS3TransitionsSupported = false;
        }

        let osVersionMatch = /[\s\(](os|os x|windows phone|windows nt|android) ([\d._]+)/.exec(agent);
        this.osVersion = osVersionMatch ? osVersionMatch[2] : "NA";

        // Set browser name
        if (this.isIE) {
            this.browserName = "IE";
        } else if (this.isEdge) {
            this.browserName = "Edge";
        } else if (this.isChrome) {
            this.browserName = "Chrome";
        } else if (this.isFirefox) {
            this.browserName = "Firefox";
        } else if (this.isSafari) {
            this.browserName = "Safari";
        } else {
            this.browserName = "NA";
        }

        if (this.isWindows) {
            this.osName = "Windows";
        } else if (this.isWinPhone) {
            this.osName = "Windows Phone";
        } else if (this.isMac) {
            this.osName = "OSX";
        } else if (this.isIOS) {
            this.osName = "IOS";
        } else if (this.isAndroid) {
            this.osName = "Android";
        } else {
            this.osName = "NA";
        }
    }

    /**
     * Checks to see if styleSheet exists as a property off of a style element.
     * This will determine if style registration should be done via cssText (<= IE9) or not
     */
    private _shouldUseCssText(): boolean {
        var emptyStyle = document.createElement("style");
        emptyStyle.type = "text/css";

        return !!emptyStyle["styleSheet"];
    }
}

export = PlatformDetection;
