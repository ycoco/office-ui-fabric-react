/// <reference path="../../../chai/chai.d.ts" />
/// <reference path="../../../mocha/mocha.d.ts" />

import chai = require("chai");
import PlatformDetection = require('odsp-utilities/browser/PlatformDetection');

/* tslint:disable:ban-native-functions */
var expect = chai.expect;

describe('PlatformDetection', () => {
    it('can detect Chrome 41, Vista', () => {
        evaluateAgent('Mozilla/5.0 (Windows NT 6.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36', {
            isChrome: true,
            browserMajor: 41,
            isWindows: true
        });
    });

    it('can detect IE 8 Windows 7', () => {
        evaluateAgent('Mozilla/5.0 (compatible; MSIE 8.0; Windows NT 6.1; Trident/4.0; InfoPath.1; SV1; .NET CLR 3.8.36217; WOW64; en-US)', {
            isIE: true,
            browserMajor: 8,
            isWindows: true
        });
    });

    it('can detect IE 9 Windows 7', () => {
        evaluateAgent('Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; Win64; x64; Trident/5.0; .NET CLR 2.0.50727; SLCC2; .NET CLR 3.5.30729; .NET CLR 3.0.30729; Media Center PC 6.0; Zune 4.0; Tablet PC 2.0; InfoPath.3; .NET4.0C; .NET4.0E)', {
            isIE: true,
            browserMajor: 9,
            isWindows: true
        });
    });

    it('can detect IE 10 Windows 7', () => {
        evaluateAgent('Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.1; Trident/4.0; InfoPath.2; SV1; .NET CLR 2.0.50727; WOW64)', {
            isIE: true,
            browserMajor: 10,
            isWindows: true
        });
    });

    it('can detect IE 11 Windows 8.1', () => {
        evaluateAgent('Mozilla/5.0 (compatible, MSIE 11, Windows NT 6.3; Trident/7.0; rv:11.0) like Gecko', {
            isIE: true,
            browserMajor: 11,
            isWindows: true
        });
    });

    it('can detect IE 12 Edge, Windows 10', () => {
        evaluateAgent('Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.71 Safari/537.36 Edge/12.0', {
            isIE: true,
            browserMajor: 12,
            isWindows: true
        });
    });

    it('can detect Firefox 36, Windows 8.1', () => {
        evaluateAgent('Mozilla/5.0 (Windows NT 6.3; rv:36.0) Gecko/20100101 Firefox/36.0', {
            isFirefox: true,
            browserMajor: 36,
            isWindows: true
        });
    });

    it('can detect Safari 7.0.3, OSX 10.9.3', () => {
        evaluateAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_3) AppleWebKit/537.75.14 (KHTML, like Gecko) Version/7.0.3 Safari/7046A194A', {
            isSafari: true,
            browserMajor: 7,
            isMac: true
        });
    });

    it('can detect IOS IPhone 6', () => {
        evaluateAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 8_0_2 like Mac OS X) AppleWebKit/600.1.4 (KHTML, like Gecko) Version/8.0 Mobile/12A366 Safari/600.1.4', {
            isMobile: true,
            isSafari: true,
            browserMajor: 8,
            isIOS: true
        });
    });

    it('can detect IOS IPad Air', () => {
        evaluateAgent('Mozilla/5.0 (iPad; CPU OS 6_0 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Version/6.0 Mobile/10A5355d Safari/8536.25', {
            isMobile: true,
            isSafari: true,
            browserMajor: 6,
            isIOS: true
        });
    });

    it('can detect Android Webkit browser HTC Phone', () => {
        evaluateAgent('Mozilla/5.0 (Linux; U; Android 4.0.3; de-ch; HTC Sensation Build/IML74K) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30', {
            isMobile: true,
            isSafari: true,
            browserMajor: 4,
            isAndroid: true
        });
    });

    it ('can detect Windows Phone 7.5', () => {
        evaluateAgent('Mozilla/5.0 (compatible; MSIE 9.0; Windows Phone OS 7.5; Trident/5.0; IEMobile/9.0)', {
            isMobile: true,
            isIE: true,
            browserMajor: 9,
            isWinPhone: true
        });
    });

    it ('can detect Windows Phone 8', () => {
        evaluateAgent('Mozilla/5.0 (compatible; MSIE 10.0; Windows Phone 8.0; Trident/6.0; IEMobile/10.0; ARM; Touch; NOKIA; Lumia 920)', {
            isMobile: true,
            isIE: true,
            browserMajor: 10,
            isWinPhone: true
        });
    });

    it ('can detect Mobile for WebView in Facebook iOS App', () => {
        evaluateAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 8_4 like Mac OS X) AppleWebKit/600.1.4 (KHTML, like Gecko) Mobile/12H143 [FBAN/FBIOS;FBAV/36.0.0.40.231;FBBV/13431455;FBDV/iPhone7,2;FBMD/iPhone;FBSN/iPhone OS;FBSV/8.4;FBSS/2; FBCR/Sprint;FBID/phone;FBLC/en_US;FBOP/5]', {
            isMobile: true,
            isIOS: true
        });
    });
});


function evaluateAgent(agent: string, expectedResult: any) {
    'use strict';

    var platform = new PlatformDetection(agent);

    expect(platform).to.contain(expectedResult);
}
