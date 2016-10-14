// OneDrive:IgnoreCodeCoverage

import { Engagement } from './events/Engagement.event';

const LOGGING_ID_ATTRIBUTE = 'data-logging-id';
const LOGGING_ID_CLICK_POSTFIX = '.Click';

interface IDictionaryBoolean {
    [index: string]: boolean;
}

export class EngagementHelpers {
    private static _appDictionary: IDictionaryBoolean = {};

    /**
     * registerClicks should be called once during application initialization.
     * @appName specifies the application name for the application.
     * From then on, any element that has the attribute data-logging-id on it will
     * be logged if it's clicked on. For example, if we have an element that looks like the following
     * <a href='foo' data-logging-id='SPHeader.Title' />
     * When an end user clicks on this element, we will log ApplicationName.SPHeader.Title.Click
     * That is, the app name will be automatically prepended, and "Click" will be appended to the data-logging-id 
     * make up the complete name of what is  logged.
     */
    public static registerClicks(appName: string) {
        if (!appName || EngagementHelpers._appDictionary[appName]) {
            //if no appName is specified, or if we've already been called
            //with this appName (we're already registered), just return now....
            return;
        }
        //Register the appName in our dictionary so that we only register an app once
        EngagementHelpers._appDictionary[appName] = true;

        if (document && document.body) {
            /* tslint:disable:ban-native-functions */
            document.body.addEventListener('click', function(e: Event) {
            /* tslint:enable:ban-native-functions */

                // capture all clicks on the body at the capture phase
                let elmClicked: HTMLElement = <HTMLElement>e.target;
                if (elmClicked) {
                    let clickId: string = elmClicked.getAttribute(LOGGING_ID_ATTRIBUTE);
                    // If the element that was clicked on has a data-logging-id attribute
                    // let's log it
                    if (clickId) {
                        Engagement.logData({name: clickId + LOGGING_ID_CLICK_POSTFIX});
                    }
                }
            }, true /* listen during capture phase */);
        }
    }

}