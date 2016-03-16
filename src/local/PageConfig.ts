// OneDrive:IgnoreCodeCoverage
/// <reference path='../cookies-js/cookies.d.ts' />
import Cookies = require('cookies');

declare var FilesConfig: any;
declare var $Config: any;

export default class PageConfig {
    public static ANON_ID_COOKIE_KEY = "ANON";

    /**
     * @inheritdoc
     */
    public static getAnid(): string {
        var cookieVal = Cookies.get(PageConfig.ANON_ID_COOKIE_KEY);
        var anid = "";

        if (cookieVal) {
            var anonCookies = cookieVal.split("&");
            for (var x = 0; x < anonCookies.length; x++) {
                var subCookie = anonCookies[x];
                if (subCookie.indexOf("A=") === 0 && subCookie.length > 2) {
                    anid = subCookie.substr(2, subCookie.length);
                }
            }
        }

        return anid;
    }

    /**
     * @inheritdoc
     */
    public static getMarket(): string {
        return $Config.mkt;
    }

    /**
     * @inheritdoc
     */
    public static getLanguage(): string {
        return $Config.lang;
    }

    /**
     * @inheritdoc
     */
    public static isNewUser(): boolean {
        return FilesConfig.freRenderIndex === 0;
    }

    /**
     * @inheritdoc
     */
    public static isAuthenticated(): boolean {
        return !FilesConfig.si;
    }
}