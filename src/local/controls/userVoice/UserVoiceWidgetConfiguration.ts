/**
 * @file UserVoiceWidgetConfiguration.tsx
 * @Copyright (c) Microsoft Corporation.  All rights reserved.
 */

import UserVoiceButtonConfiguration from "./UserVoiceButtonConfiguration";
import UserVoiceStringsOverride from "./UserVoiceStringsOverride";

export class UserVoiceWidgetConfiguration {
    /// parameters to be passed to the UV widget
    public target: string = "self"; // "none"" for toaster popups; #id for a specific element on the page
    public position: string = "automatic"; // Popover position
    public height: string = "400px"; // Widget height
    public width: string = "100%"; // Widget width
    public accentColor: string = "#458dd6"; // Widget accent color
    public locale: string = "en"; // Defaults to your account’s localization
    public forumId: string; // Defaults to your account’s default forum
    public smartvoteEnabled: boolean = false;
    public postSuggestionEnabled: boolean = false;
    public screenshotEnabled: boolean = true;
    public buttons: Array<UserVoiceButtonConfiguration> = [];

    /// workload Id should be obtained from UserVoice administration site (a part of the URL to the widget library)
    public workloadId: string = "workloadId_undefined";
    public forumUrl: string = ""; // For Video portal - https://office365video.uservoice.com

    /// callback functions for logging of UV load
    /// first parameter is UV Widget mode; second parameter is the error
    public onUserVoiceStart: (T: string) => void;
    public onUserVoiceSuccess: (T: string) => void;
    public onUserVoiceFailure: (T: string, T2: string) => void;

    public userEmail: string;

    public configuation(userVoiceStrings: UserVoiceStringsOverride): {[index: string]: any} {

        return {
            "target": this.target,
            "position": this.position,
            "height": this.height,
            "width": this.width,
            "accent_color": this.accentColor,
            "locale": this.getSupportedLocale(this.locale),
            "forum_id": this.forumId,
            "smartvote_enabled": this.smartvoteEnabled,
            "post_suggestion_enabled": this.postSuggestionEnabled,
            "screenshot_enabled": this.screenshotEnabled,
            "strings": userVoiceStrings.strings(),
            "buttons": this.buttons,
            "workloadId": this.workloadId,
            "onUserVoiceStart": this.onUserVoiceStart,
            "onUserVoiceSuccess": this.onUserVoiceSuccess,
            "onUserVoiceFailure": this.onUserVoiceFailure,
            "userEmail": this.userEmail
        };
    }

    ///
    /// get locale, supported by UserVoice widget
    /// fall back to English if not available
    /// list of the languages is obtained from https://translate.uservoice.com/;
    /// all the End-user languages not marked as "DRAFT" are incluced
    /// the list need to be updated periodically to ensure it is still valid and complete
    ///
    private getSupportedLocale(locale: string): string {
        var supportedLocales: Array<string> = [
            "az-AZ",
            "bg",
            "ca",
            "cn",
            "zh-CN",
            "zh-TW",
            "hr",
            "cs",
            "da",
            "nl",
            "nl-informal",
            "en-GB",
            "et",
            "fi",
            "fr",
            "fr-CA",
            "de",
            "de-AT",
            "de-CH",
            "de-informal",
            "el",
            "hu",
            "id",
            "it",
            "ja",
            "ko",
            "lv",
            "lt",
            "mk",
            "nb",
            "pl",
            "pt-PT",
            "pt",
            "pt-BR",
            "ro",
            "ru",
            "sr",
            "sr-Latn",
            "sk",
            "sl",
            "es",
            "es-AR",
            "es-MX",
            "sv-SE",
            "tr",
            "vi",
            "cy"
        ];

        var supportedLocale = this.locale;

        // If current locale is found in the list of supported languages, we are good to use it
        if (!supportedLocales.some((l: string) => l.toLowerCase().localeCompare(this.locale.toLowerCase()) === 0)) {
            // If the current locale is NOT found in the list of supported languages, try to match on the major language
            // Since UV supports a bunch of those without specifying a minor one
            if (supportedLocales.some((l: string) => l.toLowerCase().localeCompare(this.locale.toLowerCase().substr(0, 2)) === 0)) {
                // If found - use the major version and pass it down to the UV
                supportedLocale = this.locale.substr(0, 2);
            } else {
                // If still not found, fallback to English since the current language is not supported by UserVoice
                supportedLocale = "en";
            }
        }

        // Special case for Chinese. Name of the locale supported by UserVoice does not match the locale string used in O365.
        if (supportedLocale.toLowerCase().localeCompare("zh-cn") === 0) {
            supportedLocale = "cn";
        }

        return supportedLocale;
    }
}

export default UserVoiceWidgetConfiguration;