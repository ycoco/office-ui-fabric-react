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

    public osName: string;
    public osVersion: string;
    public userAgent: string;

    constructor(agent?: string) {
        // We want to figure out which ONE browser the user is most likely on.
        // The order of the checks is important so we're not deceived by (for example)
        // Chrome saying that it's Safari.
        // (Each regular expression captures the version number so we can parse it later.)
        var match;

        if (!agent) {
            var navigator = window ? window.navigator : null;

            agent = navigator ? navigator.userAgent : '';
        }

        this.userAgent = agent;

        agent = agent.toLowerCase();

        if (match = /msie (\d+)([0-9\.]+)?/.exec(agent)) {
            // IE <= 10 has something like "MSIE 9" in the user agent.
            this.isIE = true;
            if (/msie 9/.exec(agent)) {
                this.isIE9 = true;
            }
        } else if (match = /trident.*rv:(\d+)([0-9\.]+)?/.exec(agent)) {
            // This is IE 11. Sample user agent contains:
            // Trident/7.0; other stuff... rv:11.0
            this.isIE = true;
        } else if (match = /edge\/(\d+)([0-9\.]+)?/.exec(agent)) {
            // This is IE 12.
            this.isIE = true;
        } else if (match = /firefox\/(\d+)([0-9\.]+)?/.exec(agent)) {
            this.isFirefox = true;
        } else if (match = /(?:chrome|crios)\/(\d+)([0-9\.]+)?/.exec(agent)) {
            this.isChrome = true;
        } else if (match = /safari\/(\d+)/.exec(agent)) {
            this.isSafari = true;
            match = /version\/(\d+)([0-9\.]+)?/.exec(agent);
        } else if (match = /(iphone|ipad)/.exec(agent)) {
            // unknown browser, but we should set mobile flags below
        }

        // Parse the captured version number for user's browser.
        if (match) {
            this.browserMajor = parseInt(match[1], 10);
            let browserMinorVersion: string = match[2];
            if (browserMinorVersion) {
                let minorStart = browserMinorVersion.indexOf('.');
                if (minorStart >= 0 && minorStart < browserMinorVersion.length - 1) {
                    this.browserMinor = browserMinorVersion.substr(minorStart + 1);
                }
            }

            // Parse device which gives hints about os / mobile state.
            var deviceRegex = new RegExp('ipad|iphone|ipod|android|windows phone', "i");
            var deviceMatch: string[] = agent.match(deviceRegex);

            if (deviceMatch && deviceMatch.length > 0) {
                var device = deviceMatch[0];

                this.isWinPhone = device === 'windows phone';
                this.isAndroid = device === 'android';
                this.isIOS = device === 'ipad' || device === 'ipod' || device === 'iphone';
                this.isIPad = device === 'ipad';
                this.isMobile = this.isWinPhone || this.isAndroid || this.isIOS;
            }

            var osMatch = agent.match(new RegExp('windows nt|macintosh'));

            if (osMatch) {
                var os = osMatch[0];

                this.isWindows = os === 'windows nt';
                this.isMac = os === 'macintosh';
            }

            this.isWindows81 = !!agent.match(new RegExp('(windows 8.1|windows nt 6.3)'));
        }

        // WARNING: Avoid using browser checks when you can use detection techniques for caps checking.

        this.isRetinaSupported = !!(window['devicePixelRatio'] && window.devicePixelRatio > 1);

        var input = document.createElement("input");

        input.type = "file";
        this.isFolderUploadSupported = "webkitdirectory" in input;
        this.isHtml5FileUploadSupported = window['File'] && (window['File'].prototype.slice || window['File'].prototype.mozSlice || window['File'].prototype.webkitSlice);

        this.isUnlimitedStyleSheetsSupported = !this._shouldUseCssText();
        this.areTouchEventsSupported = 'ontouchstart' in window;

        if (this.isIE && this.browserMajor <= 9) {
            this.areCSS3TransitionsSupported = false;
        }

        let osVersionRegex = /[\s|\(](os|os\sx|windows\sphone|windows\snt|android)\s([0-9\.\_]+)/g;
        let osVersionMatch: string[] = osVersionRegex.exec(agent);

        if (osVersionMatch && osVersionMatch.length > 2) {
            this.osVersion = osVersionMatch[2];
        } else {
            this.osVersion = "NA";
        }

        // Set browser version
        if (this.isIE) {
            this.browserName = "IE";
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
