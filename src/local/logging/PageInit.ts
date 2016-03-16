// OneDrive:IgnoreCodeCoverage

import './ManagerExtended';
import { PageInit as PageInitEvent } from './events/PageInit.event';

let event: PageInitEvent;

export default class PageInit {
    public static init() {
        if (!event) {
            event = PageInitEvent.logData({
                screenWidth: window.screen.width,
                screenHeight: window.screen.availHeight,
                availableScreenWidth: window.screen.availWidth,
                availableScreenHeight: window.screen.availHeight,
                renderWidth: window.innerWidth,
                renderHeight: window.innerHeight,
                browserWidth: window.outerWidth,
                browserHeight: window.outerHeight,
                devicePixelRatio: window.devicePixelRatio ? window.devicePixelRatio : 0,
                referrer: document.referrer
            });
        }

        return event;
    }
}