import chai = require("chai");
import PlatformDetection from '../../../odsp-utilities/browser/PlatformDetection';

/* tslint:disable:ban-native-functions */
var expect = chai.expect;

describe('PlatformDetection', () => {
    it('can detect Chrome 41, Vista', () => {
        evaluateAgent('Mozilla/5.0 (Windows NT 6.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36', {
            isChrome: true,
            isSafari: false,
            browserMajor: 41,
            browserMinor: '0.2228.0',
            isWindows: true,
            browserName: "Chrome",
            osName: "Windows",
            osVersion: "6.0"
        });
    });

    it('can detect IE 8 Windows 7', () => {
        evaluateAgent('Mozilla/5.0 (compatible; MSIE 8.0; Windows NT 6.1; Trident/4.0; InfoPath.1; SV1; .NET CLR 3.8.36217; WOW64; en-US)', {
            isIE: true,
            browserMajor: 8,
            browserMinor: '0',
            isWindows: true,
            isWindows7: true,
            browserName: "IE",
            osName: "Windows",
            osVersion: "6.1"
        });
    });

    it('can detect IE 9 Windows 7', () => {
        evaluateAgent('Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; Win64; x64; Trident/5.0; .NET CLR 2.0.50727; SLCC2; .NET CLR 3.5.30729; .NET CLR 3.0.30729; Media Center PC 6.0; Zune 4.0; Tablet PC 2.0; InfoPath.3; .NET4.0C; .NET4.0E)', {
            isIE: true,
            isIE9: true,
            browserMajor: 9,
            browserMinor: '0',
            isWindows: true,
            isWindows7: true,
            browserName: "IE",
            osName: "Windows",
            osVersion: "6.1"
        });
    });

    it('can detect IE 10 Windows 7', () => {
        evaluateAgent('Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.1; Trident/4.0; InfoPath.2; SV1; .NET CLR 2.0.50727; WOW64)', {
            isIE: true,
            browserMajor: 10,
            browserMinor: '0',
            isWindows: true,
            isWindows7: true,
            browserName: "IE",
            osName: "Windows",
            osVersion: "6.1"
        });
    });

    it('can detect IE 11 Windows 8.1', () => {
        evaluateAgent('Mozilla/5.0 (Windows NT 6.3; WOW64; Trident/7.0; Touch; rv:11.0) like Gecko', {
            isIE: true,
            browserMajor: 11,
            browserMinor: '0',
            isWindows: true,
            isWindows81: true,
            browserName: "IE",
            osName: "Windows",
            osVersion: "6.3"
        });
    });

    it('can detect Edge, Windows 10', () => {
        evaluateAgent('Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.71 Safari/537.36 Edge/12.0', {
            isEdge: true,
            isIE: false,
            isChrome: false,
            isSafari: false,
            isMobile: false,
            browserMajor: 12,
            browserMinor: '0',
            isWindows: true,
            browserName: "Edge",
            osName: "Windows",
            osVersion: "10.0"
        });
    });

    it('can detect Edge 13, Windows 10', () => {
        evaluateAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2486.0 Safari/537.36 Edge/13.10586', {
            isEdge: true,
            isIE: false,
            isChrome: false,
            isSafari: false,
            isMobile: false,
            browserMajor: 13,
            browserMinor: '10586',
            isWindows: true,
            browserName: "Edge",
            osName: "Windows",
            osVersion: "10.0"
        });
    });

    it('can detect mobile Edge 13, Windows 10', () => {
        evaluateAgent('Mozilla/5.0 (Windows Phone 10.0; Android 4.2.1; Microsoft; Lumia 950 XL Dual SIM) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2486.0 Mobile Safari/537.36 Edge/13.10586', {
            isEdge: true,
            isIE: false,
            isChrome: false,
            isSafari: false,
            isMobile: true,
            browserMajor: 13,
            browserMinor: '10586',
            isWindows: false,
            isWinPhone: true,
            browserName: "Edge",
            osName: "Windows Phone",
            osVersion: "10.0"
        });
    });

    it('can detect Firefox 36, Windows 8.1', () => {
        evaluateAgent('Mozilla/5.0 (Windows NT 6.3; rv:36.0) Gecko/20100101 Firefox/36.0', {
            isFirefox: true,
            browserMajor: 36,
            browserMinor: '0',
            isWindows: true,
            browserName: "Firefox",
            osName: "Windows",
            osVersion: "6.3"
        });
    });

    it('can detect Safari 7.0.3, OSX 10.9.3', () => {
        evaluateAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_3) AppleWebKit/537.75.14 (KHTML, like Gecko) Version/7.0.3 Safari/7046A194A', {
            isSafari: true,
            browserMajor: 7,
            browserMinor: '0.3',
            isMac: true,
            browserName: "Safari",
            osName: "OSX",
            osVersion: "10_9_3"
        });
    });

    it('can detect IOS IPhone 6', () => {
        evaluateAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 8_0_2 like Mac OS X) AppleWebKit/600.1.4 (KHTML, like Gecko) Version/8.0 Mobile/12A366 Safari/600.1.4', {
            isMobile: true,
            isSafari: true,
            browserMajor: 8,
            browserMinor: '0',
            isIOS: true,
            browserName: "Safari",
            osName: "IOS",
            osVersion: "8_0_2"
        });
    });

    it('can detect IOS IPad Air', () => {
        evaluateAgent('Mozilla/5.0 (iPad; CPU OS 6_0 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Version/6.0 Mobile/10A5355d Safari/8536.25', {
            isMobile: true,
            isSafari: true,
            browserMajor: 6,
            browserMinor: '0',
            isIOS: true,
            browserName: "Safari",
            osName: "IOS",
            osVersion: "6_0"
        });
    });

    it('can detect Android Webkit browser HTC Phone', () => {
        evaluateAgent('Mozilla/5.0 (Linux; U; Android 4.0.3; de-ch; HTC Sensation Build/IML74K) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30', {
            isMobile: true,
            isSafari: true,
            browserMajor: 4,
            browserMinor: '0',
            isAndroid: true,
            browserName: "Safari",
            osName: "Android",
            osVersion: "4.0.3"
        });
    });

    it('can detect Windows Phone 7.5', () => {
        evaluateAgent('Mozilla/5.0 (compatible; MSIE 9.0; Windows Phone OS 7.5; Trident/5.0; IEMobile/9.0)', {
            isMobile: true,
            isIE: true,
            isIE9: true,
            browserMajor: 9,
            browserMinor: '0',
            isWinPhone: true,
            browserName: "IE",
            osName: "Windows Phone",
            osVersion: "7.5"
        });
    });

    it('can detect Windows Phone 8', () => {
        evaluateAgent('Mozilla/5.0 (compatible; MSIE 10.0; Windows Phone 8.0; Trident/6.0; IEMobile/10.0; ARM; Touch; NOKIA; Lumia 920)', {
            isMobile: true,
            isIE: true,
            browserMajor: 10,
            browserMinor: '0',
            isWinPhone: true,
            browserName: "IE",
            osName: "Windows Phone",
            osVersion: "8.0"
        });
    });

    it('can handle weird browser version', () => {
        evaluateAgent('Mozilla/5.0 (compatible; MSIE 10.; Windows Phone 8.0; Trident/6.0; IEMobile/10.0; ARM; Touch; NOKIA; Lumia 920)', {
            isMobile: true,
            isIE: true,
            browserMajor: 10,
            browserMinor: '0',
            isWinPhone: true,
            browserName: "IE",
            osName: "Windows Phone",
            osVersion: "8.0"
        });
    });

    it('can detect Mobile for WebView in Facebook iOS App', () => {
        evaluateAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 8_4 like Mac OS X) AppleWebKit/600.1.4 (KHTML, like Gecko) Mobile/12H143 [FBAN/FBIOS;FBAV/36.0.0.40.231;FBBV/13431455;FBDV/iPhone7,2;FBMD/iPhone;FBSN/iPhone OS;FBSV/8.4;FBSS/2; FBCR/Sprint;FBID/phone;FBLC/en_US;FBOP/5]', {
            isMobile: true,
            isIOS: true,
            browserName: "NA",
            osName: "IOS",
            osVersion: "8_4"
        });
    });

    it('can detect Firefox Mobile on iOS', () => {
        evaluateAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 10_1_1 like Mac OS X) AppleWebKit/602.2.14 (KHTML, like Gecko) FxiOS/5.3 Mobile/14B100 Safari/602.2.14', {
            isMobile: true,
            isIOS: true,
            browserName: "Firefox",
            osName: "IOS",
            osVersion: "10_1_1"
        });
    });
});

function evaluateAgent(agent: string, expectedResult: any) {
    'use strict';

    var platform = new PlatformDetection(agent);

    expect(platform).to.contain(expectedResult);
}
